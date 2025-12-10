import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { defineSecret } from "firebase-functions/params";

// Initialize Firebase Admin
admin.initializeApp();
const storage = admin.storage();

// Define secrets
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const googleCseApiKey = defineSecret("GOOGLE_CSE_API_KEY");
const googleCseCx = defineSecret("GOOGLE_CSE_CX");

// Global options
setGlobalOptions({ 
  maxInstances: 10,
  region: "europe-west1",
  timeoutSeconds: 300, // 5 minutes max
  memory: "1GiB"
});

// Helper to search Google CSE
async function searchGoogleCSE(query: string, apiKey: string, cx: string): Promise<any> {
  const searchVariations = [query + " acheter", query + " prix", query];

  for (const searchQuery of searchVariations.slice(0, 2)) {
    try {
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(searchQuery)}&num=5&lr=lang_fr&gl=fr`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) continue;
      const data = await response.json();
      if (!data.items?.length) continue;

      for (const item of data.items) {
        let image = item.pagemap?.cse_image?.[0]?.src ||
                    item.pagemap?.cse_thumbnail?.[0]?.src ||
                    item.pagemap?.metatags?.[0]?.["og:image"] ||
                    item.pagemap?.product?.[0]?.image;

        if (image) {
          return { title: item.title, link: item.link, snippet: item.snippet, image };
        }
      }
    } catch (e) {
      console.error(`CSE error for "${searchQuery}":`, e);
    }
  }
  return null;
}

/**
 * Cloud Function triggered when a new project is created with status "pending"
 */
export const generateProject = onDocumentCreated(
  { 
    document: "projects/{projectId}",
    secrets: [geminiApiKey, googleCseApiKey, googleCseCx]
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data in snapshot");
      return;
    }

    const projectData = snapshot.data();
    const projectId = event.params.projectId;

    // Only process pending projects
    if (projectData.status !== "pending") {
      console.log(`Project ${projectId} status is ${projectData.status}, skipping`);
      return;
    }

    console.log(`Starting generation for project ${projectId}`);

    try {
      // Update status to generating
      await snapshot.ref.update({ status: "generating" });

      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      
      // Step 1: Generate shopping list
      console.log("Generating shopping list...");
      const shopperModel = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: { responseMimeType: "application/json" }
      });

      const style = projectData.style || "moderne";
      const roomType = projectData.roomType || "living room";
      
      const shopperPrompt = `
        You are an expert interior designer. Suggest 6 product search terms for a "${style}" style "${roomType}".
        For EACH item, provide:
        1. "category": The type of item
        2. "searchTerm": A precise French search query
        3. "visual_description": Detailed visual description for AI image generation
        Return a JSON array of objects.
      `;

      const shopperResult = await shopperModel.generateContent(shopperPrompt);
      const shopperText = shopperResult.response.text();
      
      let productCategories: any[] = [];
      try {
        const parsed = JSON.parse(shopperText.replace(/```json\n?|\n?```/g, "").trim());
        productCategories = Array.isArray(parsed) ? parsed : parsed.products || [];
      } catch (e) {
        console.error("JSON parse error:", e);
        productCategories = [];
      }

      // Step 2: Enrich with Google CSE
      console.log(`Enriching ${productCategories.length} products with Google CSE...`);
      const products = await Promise.all(
        productCategories.map(async (cat: any) => {
          const googleResult = await searchGoogleCSE(
            cat.searchTerm, 
            googleCseApiKey.value(), 
            googleCseCx.value()
          );

          if (googleResult) {
            return {
              name: googleResult.title.split(" - ")[0].split(" | ")[0],
              category: cat.category,
              description: googleResult.snippet,
              visual_description: cat.visual_description,
              searchTerm: cat.searchTerm,
              imageUrl: googleResult.image,
              productUrl: googleResult.link
            };
          }
          return {
            name: cat.searchTerm,
            category: cat.category,
            description: `Produit style ${style}`,
            visual_description: cat.visual_description,
            searchTerm: cat.searchTerm,
            imageUrl: null,
            productUrl: null
          };
        })
      );

      // Step 3: Generate image
      console.log("Generating image...");
      const imageModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const productContext = products
        .map((p: any) => p.visual_description || p.name)
        .join(", ");

      const contents: any[] = [];
      
      // Add original image if exists
      if (projectData.originalImageUrl) {
        try {
          const imgResp = await fetch(projectData.originalImageUrl);
          if (imgResp.ok) {
            const arrayBuffer = await imgResp.arrayBuffer();
            const base64Image = Buffer.from(arrayBuffer).toString("base64");
            contents.push({
              inlineData: {
                data: base64Image,
                mimeType: imgResp.headers.get("content-type") || "image/jpeg"
              }
            });
          }
        } catch (e) {
          console.error("Failed to fetch original image:", e);
        }
      }

      // Add product images
      for (const product of products) {
        if (product.imageUrl) {
          try {
            const imgResp = await fetch(product.imageUrl, {
              headers: { "User-Agent": "Mozilla/5.0 Chrome/91.0" }
            });
            if (imgResp.ok) {
              const arrayBuffer = await imgResp.arrayBuffer();
              contents.push({
                inlineData: {
                  data: Buffer.from(arrayBuffer).toString("base64"),
                  mimeType: imgResp.headers.get("content-type") || "image/jpeg"
                }
              });
            }
          } catch (e) {
            console.error("Failed to fetch product image:", e);
          }
        }
      }

      const imagePrompt = projectData.originalImageUrl
        ? `Transform this room into a ${roomType} with ${style} style. Include: ${productContext}. Keep original perspective. Photorealistic, interior design magazine quality.`
        : `Generate a photorealistic ${roomType} with ${style} style. Include: ${productContext}. 8k quality, interior design magazine style.`;

      contents.push({ text: imagePrompt });

      const imageResult = await imageModel.generateContent({
        contents: [{ role: "user", parts: contents }],
        generationConfig: { responseMimeType: "image/png" } as any
      });

      // Extract and upload generated image
      let generatedImageUrl = "";
      const response = imageResult.response;
      
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if ((part as any).inlineData) {
            const imageData = (part as any).inlineData.data;
            const bucket = storage.bucket();
            const fileName = `generated/${projectId}_${Date.now()}.png`;
            const file = bucket.file(fileName);
            
            await file.save(Buffer.from(imageData, "base64"), {
              metadata: { contentType: "image/png" }
            });
            
            await file.makePublic();
            generatedImageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            break;
          }
        }
      }

      // Update project with results
      await snapshot.ref.update({
        status: "completed",
        products: products,
        generations: [{
          id: `gen_${Date.now()}`,
          imageUrl: generatedImageUrl,
          prompt: imagePrompt,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        }],
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Project ${projectId} completed successfully!`);

    } catch (error) {
      console.error(`Error generating project ${projectId}:`, error);
      await snapshot.ref.update({
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);
