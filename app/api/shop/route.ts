import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper to search Google CSE - finds first result WITH an image
async function searchGoogleCSE(query: string, maxRetries: number = 2): Promise<any> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;

  if (!apiKey || !cx) {
    console.warn("Google CSE not configured, skipping search");
    return null;
  }

  // Try different search variations
  const searchVariations = [
    query + " acheter",
    query + " prix",
    query // simple search as fallback
  ];

  for (let attempt = 0; attempt < Math.min(maxRetries, searchVariations.length); attempt++) {
    const searchQuery = searchVariations[attempt];
    
    try {
      // Request multiple results to find one with an image
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(searchQuery)}&num=5&lr=lang_fr&gl=fr`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        console.error(`Google CSE error for "${searchQuery}":`, response.status);
        continue;
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        continue;
      }

      // Find first result with an image
      for (const item of data.items) {
        let image = null;
        
        // Try multiple image sources (prefer product-specific images)
        if (item.pagemap?.product?.[0]?.image) {
          image = item.pagemap.product[0].image;
        } else if (item.pagemap?.cse_image?.[0]?.src) {
          image = item.pagemap.cse_image[0].src;
        } else if (item.pagemap?.metatags?.[0]?.["og:image"]) {
          image = item.pagemap.metatags[0]["og:image"];
        } else if (item.pagemap?.cse_thumbnail?.[0]?.src) {
          image = item.pagemap.cse_thumbnail[0].src;
        }

        // Filter out bad images (logos, icons, SVGs, etc.)
        if (image) {
          const lowerImage = image.toLowerCase();
          const isBadImage = 
            lowerImage.includes("logo") ||
            lowerImage.includes("icon") ||
            lowerImage.includes("favicon") ||
            lowerImage.includes("social_share") ||
            lowerImage.endsWith(".svg") ||
            lowerImage.includes("/assets/") ||
            lowerImage.includes("range-categorisation") ||
            lowerImage.includes("placeholder");
          
          if (!isBadImage) {
            console.log(`✅ Found product with image: "${item.title}"`);
            return {
              title: item.title,
              link: item.link,
              snippet: item.snippet,
              image: image
            };
          }
        }
      }

      console.log(`⚠️ No image found in ${data.items.length} results for "${searchQuery}", trying next variation...`);
      
    } catch (e) {
      console.error(`Google CSE error for "${searchQuery}":`, e);
    }
  }

  console.log(`❌ Could not find product with image for: "${query}"`);
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { roomType, style, furnitureList, budget } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: { responseMimeType: "application/json" }
    });

    let budgetContext = "";
    if (budget && budget !== "unlimited") {
      budgetContext = `Keep the total cost around ${budget}€. Select items that are affordable but good quality.`;
    } else {
      budgetContext = "Select premium, high-quality items. Budget is flexible.";
    }

    // Step 1: Generate product categories/types with Gemini
    let prompt = "";

    if (furnitureList && furnitureList.length > 0) {
      const itemsStr = furnitureList.map((i: any) => `${i.item} (${i.reason})`).join(", ");
      prompt = `
        You are an expert interior designer. For this "${style}" style room, suggest specific product search terms for:
        ${itemsStr}
        
        ${budgetContext}
        
        For EACH item, provide:
        1. "category": The type of item
        2. "searchTerm": A precise French search query to find this product (e.g., "canapé 3 places lin beige Maison du Monde")
        3. "visual_description": Detailed visual description for AI image generation
        
        Return a JSON array of objects.
      `;
    } else {
      let categoryFocus = "furniture, lighting, and decor";
      if (roomType === "kitchen") categoryFocus = "bar stools, lighting, appliances, and decor";
      if (roomType === "bedroom") categoryFocus = "bed frame, nightstands, lighting, and rugs";
      if (roomType === "bathroom") categoryFocus = "vanity accessories, mirrors, lighting, and storage";
      if (roomType === "office") categoryFocus = "desk, office chair, lighting, and organization";

      prompt = `
        You are an expert interior designer. Suggest 6 product search terms for a "${style}" style "${roomType}".
        
        Focus on: ${categoryFocus}.
        ${budgetContext}
        
        For EACH item, provide:
        1. "category": The type of item (e.g., "Sofa", "Lamp", "Rug")
        2. "searchTerm": A precise French search query (e.g., "fauteuil velours vert La Redoute")
        3. "visual_description": Detailed visual description for AI image generation
        
        Return a JSON array of objects.
      `;
    }

    console.log("Generating product categories with Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let productCategories;
    try {
      const { parseAIResponse } = await import("@/lib/utils");
      const parsed = parseAIResponse(text);
      productCategories = Array.isArray(parsed) ? parsed : parsed.products || [];
    } catch (e) {
      console.error("JSON Parse Error:", e);
      throw new Error("Invalid JSON response from AI");
    }

    console.log(`Generated ${productCategories.length} product categories`);

    // Step 2: Search Google CSE for each product
    const hasGoogleCSE = process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_CX;
    
    const products = await Promise.all(
      productCategories.map(async (cat: any) => {
        let googleResult = null;
        
        if (hasGoogleCSE) {
          console.log(`Searching Google for: "${cat.searchTerm}"`);
          googleResult = await searchGoogleCSE(cat.searchTerm);
        }

        if (googleResult) {
          return {
            name: googleResult.title.split(" - ")[0].split(" | ")[0], // Clean title
            category: cat.category,
            description: googleResult.snippet,
            visual_description: cat.visual_description,
            searchTerm: cat.searchTerm,
            imageUrl: googleResult.image,
            productUrl: googleResult.link // Real link!
          };
        } else {
          // Fallback if Google CSE not configured or no results
          return {
            name: cat.searchTerm,
            category: cat.category,
            description: `Produit style ${style}`,
            visual_description: cat.visual_description,
            searchTerm: cat.searchTerm,
            imageUrl: null,
            productUrl: null
          };
        }
      })
    );

    console.log(`Enriched ${products.filter((p: any) => p.productUrl).length}/${products.length} products with real links`);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Shopping agent error:", error);
    return NextResponse.json({ error: "Failed to select products", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
