import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { image, roomType, style } = await req.json();

    let imagePart = null;
    if (image) {
        try {
            const imageResp = await fetch(image);
            const arrayBuffer = await imageResp.arrayBuffer();
            const base64Image = Buffer.from(arrayBuffer).toString("base64");
            const mimeType = imageResp.headers.get("content-type") || "image/jpeg";
            imagePart = {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            };
        } catch (e) {
            console.error("Failed to fetch image for planning:", e);
        }
    }

    const prompt = `
      You are an expert interior architect.
      Analyze this image of a ${roomType}.
      Create a detailed furniture and decor plan to transform it into a "${style}" style.
      
      List 8-12 specific items needed to fully furnish and decorate this space effectively.
      Include furniture, lighting, rugs, and key decor pieces.
      
      For each item, provide:
      1. "item": Generic name (e.g., "Corner Sofa", "Geometric Rug").
      2. "reason": Why this fits the space/style.
      3. "placement": Where it should go (e.g., "Center of room", "Left wall").
      
      Return a JSON array of objects under a "plan" key.
    `;

    const contents = imagePart ? [prompt, imagePart] : [prompt];

    const result = await model.generateContent(contents);
    const response = await result.response;
    const text = response.text();
    
    console.log("Plan API Raw Response:", text);

    console.log("Plan API Raw Response:", text);

    let data;
    try {
        const { parseAIResponse } = await import("@/lib/utils");
        data = parseAIResponse(text);
    } catch (e) {
        console.error("JSON Parse Error in Plan API:", e);
        throw new Error("Invalid JSON response from AI");
    }

    return NextResponse.json({ plan: data.plan || (Array.isArray(data) ? data : []) });
  } catch (error) {
    console.error("Planning agent error:", error);
    return NextResponse.json({ error: "Failed to generate plan", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
