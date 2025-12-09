import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { roomType, style, furnitureList, budget } = await req.json();

    // Use a specialized model instance with Google Search Grounding enabled
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      tools: [{ googleSearch: {} } as any], // Enable Grounding
      generationConfig: { responseMimeType: "application/json" }
    });

    let budgetContext = "";
    if (budget && budget !== "unlimited") {
      budgetContext = `Keep the total cost around ${budget}€. Select items that are affordable but good quality.`;
    } else {
      budgetContext = "Select premium, high-quality items. Budget is flexible.";
    }

    let prompt = "";

    if (furnitureList && furnitureList.length > 0) {
      // Mode 1: Sourcing from Plan (Deep Planning)
      const itemsStr = furnitureList.map((i: any) => `${i.item} (${i.reason})`).join(", ");
      prompt = `
        You are an expert personal shopper.
        Find real, currently available Amazon products for this specific furniture plan in "${style}" style:
        ${itemsStr}
        
        ${budgetContext}
        
        IMPORTANT: Use Google Search to verify that each product exists and is available on Amazon.
        
        For EACH item in the list, find the best matching real product.
        
        For each item, provide:
        1. "name": Specific product name (e.g., "Stone & Beam Bradbury Chesterfield Sofa").
        2. "category": Item category.
        3. "description": Visual description.
        4. "searchTerm": A highly specific Amazon search query including brand, model, and color to find this exact item (e.g. "Stone & Beam Bradbury Chesterfield Sofa Grey").
        
        Return a JSON array of objects.
      `;
    } else {
      // Mode 2: Fallback / Quick Mode (Category based)
      let categoryFocus = "furniture, lighting, and decor";
      if (roomType === "kitchen") categoryFocus = "bar stools, lighting, appliances, and decor";
      if (roomType === "bedroom") categoryFocus = "bed frame, nightstands, lighting, and rugs";
      if (roomType === "bathroom") categoryFocus = "vanity accessories, mirrors, lighting, and storage";
      if (roomType === "office") categoryFocus = "desk, office chair, lighting, and organization";

      prompt = `
        You are an expert interior designer and personal shopper.
        Select 6 real, popular, and highly-rated products available on Amazon that would perfectly create a "${style}" style "${roomType}".
        
        Focus on: ${categoryFocus}.
        Ensure a cohesive look. Do not select discontinued items.
        
        IMPORTANT: Use Google Search to verify that each product exists and is available on Amazon.
        
        For each item, provide:
        1. "name": A specific, searchable product name (e.g., "Rivet Revolve Modern Sofa").
        2. "category": The type of item (e.g., "Furniture", "Lighting", "Decor").
        3. "description": A short visual description for the image generator.
        4. "searchTerm": A highly specific Amazon search query including brand, model, and color (e.g. "Rivet Revolve Modern Sofa Grey").
        
        Return a JSON array of objects.
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Shop API Raw Response:", text);

    console.log("Shop API Raw Response:", text);

    let products;
    try {
        const { parseAIResponse } = await import("@/lib/utils");
        const parsed = parseAIResponse(text);
        products = Array.isArray(parsed) ? parsed : parsed.products || [];
    } catch (e) {
        console.error("JSON Parse Error in Shop API:", e);
        throw new Error("Invalid JSON response from AI");
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Shopping agent error:", error);
    return NextResponse.json({ error: "Failed to select products", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
