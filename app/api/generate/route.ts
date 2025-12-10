import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { prompt, image, analysis } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Use Gemini 2.0 Flash Exp (supports Imagen 3)
    // The user's key is valid for this model (verified via chat), but not for gemini-3-pro-image-preview
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

    let contents: any[] = [];
    
    // Add the text prompt
    let enhancedPrompt = "";
    if (image) {
      // Editing Mode: Instruction to modify the provided image
      enhancedPrompt = `Transform the provided image into a ${analysis?.roomType || "room"}. ${prompt}. Keep the original perspective and lighting, but fully adapt the furniture, fixtures, and layout to match the requested room type and style. Ensure the room function is clearly recognizable as a ${analysis?.roomType || "room"}.`;
    } else {
      // Generation Mode: Create new image
      enhancedPrompt = `Generate a photorealistic image of a ${analysis?.roomType || "room"}. ${prompt}. High quality, 8k, interior design magazine style.`;
    }
    
    // If we have an original image, fetch it and add it for img2img
    if (image) {
      try {
        const imageResp = await fetch(image);
        const arrayBuffer = await imageResp.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

        contents.push({
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        });
      } catch (e) {
        console.error("Failed to fetch original image:", e);
        // Continue without image if fetch fails
      }
    }

    // Add prompt after image (best practice for some models, but order in array matters less than content)
    contents.push({ text: enhancedPrompt });

    // Generate content
    const result = await model.generateContent(contents);
    const response = await result.response;
    
    // Check for inline image data in the response
    let generatedImageBase64 = null;
    
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!generatedImageBase64) {
      console.error("No image generated. Response text:", response.text());
      return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
    }
    
    return NextResponse.json({ imageBase64: generatedImageBase64 });

  } catch (error) {
    console.error("Image Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
