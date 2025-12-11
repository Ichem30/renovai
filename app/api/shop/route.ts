import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper to persist image to Firebase Storage
async function persistImageToStorage(imageUrl: string, productId: string): Promise<string | null> {
  try {
    console.log(`📦 Persisting image: ${imageUrl.substring(0, 50)}...`);
    
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status}`);
      return null;
    }
    
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Determine file extension
    let ext = "jpg";
    if (contentType.includes("png")) ext = "png";
    if (contentType.includes("webp")) ext = "webp";
    
    // Upload to Firebase Storage
    const fileName = `products/${productId}_${Date.now()}.${ext}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, buffer, { contentType });
    const downloadUrl = await getDownloadURL(storageRef);
    
    console.log(`✅ Image persisted: ${fileName}`);
    return downloadUrl;
  } catch (e) {
    console.error("Failed to persist image:", e);
    return null;
  }
}

// Helper to validate a URL is accessible
async function validateUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Helper to extract price from Google CSE data
function extractPrice(item: any): { price: number | null; currency: string } {
  // Try product structured data
  if (item.pagemap?.product?.[0]?.price) {
    const priceStr = item.pagemap.product[0].price;
    const match = priceStr.match(/[\d.,]+/);
    if (match) {
      return { price: parseFloat(match[0].replace(",", ".")), currency: "EUR" };
    }
  }
  
  // Try offer price
  if (item.pagemap?.offer?.[0]?.price) {
    const priceStr = item.pagemap.offer[0].price;
    const match = priceStr.match(/[\d.,]+/);
    if (match) {
      return { price: parseFloat(match[0].replace(",", ".")), currency: "EUR" };
    }
  }
  
  // Try metatags
  if (item.pagemap?.metatags?.[0]?.["product:price:amount"]) {
    return { 
      price: parseFloat(item.pagemap.metatags[0]["product:price:amount"]), 
      currency: item.pagemap.metatags[0]["product:price:currency"] || "EUR" 
    };
  }
  
  // Try to extract from snippet
  const snippet = item.snippet || "";
  const priceMatch = snippet.match(/(\d+[.,]?\d*)\s*€/);
  if (priceMatch) {
    return { price: parseFloat(priceMatch[1].replace(",", ".")), currency: "EUR" };
  }
  
  return { price: null, currency: "EUR" };
}

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
    query + " acheter prix",
    query + " prix €",
    query // simple search as fallback
  ];

  for (let attempt = 0; attempt < Math.min(maxRetries, searchVariations.length); attempt++) {
    const searchQuery = searchVariations[attempt];
    
    try {
      // Request multiple results to find one with an image
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(searchQuery)}&num=10&lr=lang_fr&gl=fr`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        console.error(`Google CSE error for "${searchQuery}":`, response.status);
        continue;
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        continue;
      }

      // Find first result with a valid product image
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
            lowerImage.includes("placeholder") ||
            lowerImage.includes("default") ||
            lowerImage.includes("no-image");
          
          if (!isBadImage) {
            // Extract price
            const priceData = extractPrice(item);
            
            console.log(`✅ Found product: "${item.title}" ${priceData.price ? `- ${priceData.price}€` : "(no price)"}`);
            
            return {
              title: item.title,
              link: item.link,
              snippet: item.snippet,
              image: image,
              price: priceData.price,
              currency: priceData.currency,
              source: new URL(item.link).hostname.replace("www.", "")
            };
          }
        }
      }

      console.log(`⚠️ No valid product found in ${data.items.length} results for "${searchQuery}"`);
      
    } catch (e) {
      console.error(`Google CSE error for "${searchQuery}":`, e);
    }
  }

  console.log(`❌ Could not find product with image for: "${query}"`);
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { roomType, style, furnitureList, budget, persistImages = true } = await req.json();

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

    // Room-specific priority categories (most important items first)
    const ROOM_PRIORITIES: Record<string, string[]> = {
      bedroom: ["lit", "table de chevet", "commode", "lampe de chevet", "tapis"],
      living_room: ["canapé", "table basse", "luminaire", "tapis", "fauteuil"],
      kitchen: ["tabouret de bar", "suspension", "rangement", "accessoires cuisine", "plantes"],
      bathroom: ["miroir", "rangement", "luminaire", "accessoires bain", "panier"],
      office: ["bureau", "chaise de bureau", "lampe de bureau", "rangement", "décoration"],
      dining_room: ["table à manger", "chaises", "suspension", "buffet", "vaisselle déco"],
      terrace: ["salon de jardin", "parasol", "luminaire extérieur", "plantes", "tapis extérieur"],
      garden: ["mobilier jardin", "luminaire extérieur", "pot de fleurs", "fontaine", "décoration"],
    };

    const priorities = ROOM_PRIORITIES[roomType] || ROOM_PRIORITIES.living_room;
    const priorityList = priorities.slice(0, 5).join(", ");

    let prompt = "";

    if (furnitureList && furnitureList.length > 0) {
      const itemsStr = furnitureList.map((i: any) => `${i.item} (${i.reason})`).join(", ");
      prompt = `
        You are an expert interior designer. For this "${style}" style room, suggest specific product search terms for:
        ${itemsStr}
        
        ${budgetContext}
        
        For EACH item, provide:
        1. "category": The type of item
        2. "searchTerm": A precise French search query to find this product on e-commerce sites (include brand name if relevant)
        3. "visual_description": Detailed visual description for AI image generation
        4. "priority": A number 1-5 (1 = most important for the room)
        
        Return a JSON array of objects.
      `;
    } else {
      prompt = `
        You are an expert interior designer. Suggest exactly 5 products for a "${style}" style "${roomType}".
        
        IMPORTANT: Focus on these priority items (most important first):
        ${priorityList}
        
        ${budgetContext}
        
        For EACH item, provide:
        1. "category": The type of item (e.g., "Canapé", "Lampe", "Tapis")
        2. "searchTerm": A precise French search query with brand name (e.g., "canapé velours vert La Redoute", "lampadaire design Maisons du Monde")
        3. "visual_description": Detailed visual description for AI image generation
        4. "priority": A number 1-5 (1 = most important)
        
        Return a JSON array of 5 objects, ordered by priority (1 first).
      `;
    }

    console.log("🔍 Generating product categories with Gemini...");
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

    console.log(`📋 Generated ${productCategories.length} product categories`);

    // Step 2: Search Google CSE for each product and enrich
    const hasGoogleCSE = process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_CX;
    
    const products = await Promise.all(
      productCategories.map(async (cat: any, index: number) => {
        let googleResult = null;
        
        if (hasGoogleCSE) {
          console.log(`🔎 Searching for: "${cat.searchTerm}"`);
          googleResult = await searchGoogleCSE(cat.searchTerm);
        }

        if (googleResult) {
          // Validate the product URL
          const isLinkValid = await validateUrl(googleResult.link);
          
          // Persist image to Firebase Storage
          let storedImageUrl = null;
          if (persistImages && googleResult.image) {
            const productId = `${cat.category.toLowerCase().replace(/\s+/g, "_")}_${index}`;
            storedImageUrl = await persistImageToStorage(googleResult.image, productId);
          }
          
          return {
            id: `product_${Date.now()}_${index}`,
            name: googleResult.title.split(" - ")[0].split(" | ")[0].substring(0, 60), // Clean title
            category: cat.category,
            description: googleResult.snippet?.substring(0, 150) || `Produit style ${style}`,
            visual_description: cat.visual_description,
            searchTerm: cat.searchTerm,
            // Images
            originalImageUrl: googleResult.image,
            storedImageUrl: storedImageUrl, // Firebase persisted URL
            imageUrl: storedImageUrl || googleResult.image, // Use stored if available
            // Link
            productUrl: googleResult.link,
            verified: isLinkValid,
            // Price
            price: googleResult.price,
            currency: googleResult.currency || "EUR",
            // Metadata
            source: googleResult.source,
            fetchedAt: new Date().toISOString()
          };
        } else {
          // Fallback if Google CSE not configured or no results
          return {
            id: `product_${Date.now()}_${index}`,
            name: cat.searchTerm,
            category: cat.category,
            description: `Produit style ${style}`,
            visual_description: cat.visual_description,
            searchTerm: cat.searchTerm,
            originalImageUrl: null,
            storedImageUrl: null,
            imageUrl: null,
            productUrl: null,
            verified: false,
            price: null,
            currency: "EUR",
            source: null,
            fetchedAt: new Date().toISOString()
          };
        }
      })
    );

    // Filter: Only keep products WITH images (most important requirement)
    const productsWithImages = products.filter((p: any) => p.imageUrl !== null);
    
    // Sort by priority (1 = most important)
    productsWithImages.sort((a: any, b: any) => (a.priority || 5) - (b.priority || 5));
    
    const enrichedCount = productsWithImages.filter((p: any) => p.productUrl).length;
    const verifiedCount = productsWithImages.filter((p: any) => p.verified).length;
    const withPriceCount = productsWithImages.filter((p: any) => p.price).length;
    
    console.log(`📊 Results: ${productsWithImages.length}/${products.length} with images, ${verifiedCount} verified, ${withPriceCount} with prices`);

    return NextResponse.json({ 
      products: productsWithImages, // Only return products WITH images
      stats: {
        total: productsWithImages.length,
        searched: products.length,
        withLinks: enrichedCount,
        verified: verifiedCount,
        withPrices: withPriceCount
      }
    });
  } catch (error) {
    console.error("Shopping agent error:", error);
    return NextResponse.json({ error: "Failed to select products", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
