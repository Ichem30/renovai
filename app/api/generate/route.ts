import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { prompt, image, analysis, productImages } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Build the enhanced prompt
    let enhancedPrompt = "";
    if (image) {
      enhancedPrompt = `Transform the provided room image into a ${analysis?.roomType || "room"}. ${prompt}. Keep the original perspective and lighting, but fully adapt the furniture, fixtures, and layout to match the requested room type and style. Ensure the room function is clearly recognizable as a ${analysis?.roomType || "room"}.`;
    } else {
      enhancedPrompt = `Generate a photorealistic image of a ${analysis?.roomType || "room"}. ${prompt}. High quality, 8k, interior design magazine style.`;
    }

    if (productImages && productImages.length > 0) {
      enhancedPrompt += " Use the provided product images as specific visual references for the furniture and decor in the scene.";
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

    console.log(`Sending ${contents.length} content parts to Gemini...`);

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
