import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type");
    let base64Image = "";
    let mimeType = "";

    if (contentType?.includes("application/json")) {
      // Handle URL
      const body = await req.json();
      const { imageUrl } = body;
      
      if (!imageUrl) return NextResponse.json({ error: "No image URL provided" }, { status: 400 });

      const imageResp = await fetch(imageUrl);
      const arrayBuffer = await imageResp.arrayBuffer();
      base64Image = Buffer.from(arrayBuffer).toString("base64");
      mimeType = imageResp.headers.get("content-type") || "image/jpeg";

    } else {
      // Handle File Upload
      const formData = await req.formData();
      const file = formData.get("image") as File;
  
      if (!file) {
        return NextResponse.json({ error: "No image provided" }, { status: 400 });
      }
  
      const arrayBuffer = await file.arrayBuffer();
      base64Image = Buffer.from(arrayBuffer).toString("base64");
      mimeType = file.type;
    }

    // 1. Analyze with Gemini Vision

    // 1. Analyze with Gemini Vision
    const prompt = `
      Analyse cette image d'une pièce intérieure.
      Identifie :
      1. Le type de pièce (salon, cuisine, etc.)
      2. Le style actuel (ancien, moderne, etc.)
      3. L'état général.
      4. Liste 3 propositions de rénovation concrètes pour moderniser la pièce.
      5. Estime une fourchette de prix pour ces travaux en France (en Euros).
      
      Réponds au format JSON strict :
      {
        "roomType": "string",
        "currentStyle": "string",
        "condition": "string",
        "proposals": ["string", "string", "string"],
        "estimatedCost": "string"
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean up JSON if necessary (Gemini sometimes adds markdown blocks)
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const analysis = JSON.parse(jsonString);

    // 2. Generate Image with "Nano Banana Pro" (Mock for now)
    // In a real scenario, we would call the external API here using the analysis
    const generatedImageUrl = "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1974&auto=format&fit=crop"; 

    return NextResponse.json({
      analysis,
      generatedImage: generatedImageUrl
    });

  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
