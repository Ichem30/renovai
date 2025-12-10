import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  console.log("=== Generate API Called ===");
  
  try {
    const { prompt, image, analysis, productImages } = await req.json();
    console.log("Step 1: Request parsed", { hasImage: !!image, productImagesCount: productImages?.length || 0 });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const roomType = analysis?.roomType || "room";
    const style = analysis?.style || "";
    
    // Build a STRICT enhanced prompt that enforces room type
    let enhancedPrompt = "";
    if (image) {
      enhancedPrompt = `IMPORTANT: Generate a ${roomType.toUpperCase()} interior design. 
      
Transform this room into a ${roomType} with ${style} style. ${prompt}.

CRITICAL REQUIREMENTS:
- The final image MUST be a ${roomType} - not any other type of room
- Include appropriate ${roomType} furniture and fixtures
- Keep the original perspective and lighting from the reference image
- Use the product reference images as visual inspiration for furniture style and colors
- Make it photorealistic, high quality, interior design magazine style

DO NOT mix with other room types. This is ONLY a ${roomType}.`;
    } else {
      enhancedPrompt = `Generate a photorealistic ${roomType} interior with ${style} style. ${prompt}. 
      
CRITICAL: This must be a ${roomType} only. High quality, 8k, interior design magazine style.`;
    }

    // Build contents array - TEXT FIRST, then images
    const contents: any[] = [{ text: enhancedPrompt }];

    // Add original room image if provided
    if (image) {
      try {
        const imageResp = await fetch(image);
        if (imageResp.ok) {
          const arrayBuffer = await imageResp.arrayBuffer();
          const base64Image = Buffer.from(arrayBuffer).toString("base64");
          const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

          contents.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          });
        }
      } catch (e) {
        console.error("Failed to fetch original image:", e);
      }
    }

    // Add product reference images (limit to 5 as per doc example)
    if (productImages && Array.isArray(productImages)) {
      const limitedImages = productImages.slice(0, 5);
      console.log(`Generator received ${productImages.length} product images, using ${limitedImages.length}.`);
      
      for (const imgUrl of limitedImages) {
        if (!imgUrl) continue;
        try {
          console.log(`Fetching product image: ${imgUrl}`);
          const imgResp = await fetch(imgUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          });
          
          if (!imgResp.ok) {
            console.error(`Failed to fetch product image ${imgUrl}: ${imgResp.status}`);
            continue;
          }
          
          const arrayBuffer = await imgResp.arrayBuffer();
          const base64Image = Buffer.from(arrayBuffer).toString("base64");
          const mimeType = imgResp.headers.get("content-type") || "image/jpeg";

          contents.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          });
          console.log(`Successfully added product image: ${imgUrl}`);
        } catch (e) {
          console.error("Failed to fetch product image:", imgUrl, e);
        }
      }
    }

    console.log(`Step 2: Sending ${contents.length} content parts to Gemini...`);
    console.log(`Step 3: Calling gemini-3-pro-image-preview...`);
    
    const startTime = Date.now();

    // Call Gemini 3 Pro Image Preview with correct format
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: contents,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "2K",
        },
      },
    });
    
    console.log(`Step 4: Gemini responded in ${Date.now() - startTime}ms`);

    // Extract generated image
    let generatedImageBase64 = null;

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if ((part as any).inlineData) {
          generatedImageBase64 = (part as any).inlineData.data;
          break;
        }
      }
    }

    if (!generatedImageBase64) {
      // Try to get text response for debugging
      const textPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
      console.error("No image generated. Response:", textPart?.text || "No text either");
      return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
    }

    return NextResponse.json({ imageBase64: generatedImageBase64 });

  } catch (error) {
    console.error("Image Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
