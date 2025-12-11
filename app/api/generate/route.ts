import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Build optimized prompt for room transformation
 * Concise but effective for preserving structure
 */
function buildPrompt(roomType: string, style: string, userPrompt: string, hasImage: boolean): string {
  
  if (!hasImage) {
    return `Create photorealistic ${roomType} interior, ${style} style. ${userPrompt}. 
Professional interior photography, 8K quality, natural lighting, Architectural Digest quality.`;
  }

  // Concise but effective prompt for transformations
  return `TASK: Transform this ${roomType} into ${style} design.

USER VISION: ${userPrompt}

STRICT RULES - NEVER BREAK:
• KEEP exact room dimensions, walls, ceiling, floor positions
• KEEP same camera angle and perspective  
• KEEP all windows and doors in exact same positions
• KEEP original lighting direction

YOU CAN CHANGE:
• Wall colors and textures
• Floor materials
• All furniture (replace/restyle)
• Decor, plants, textiles
• Light fixtures (same positions)

STYLE: Apply authentic ${style} design
QUALITY: Photorealistic, 8K, professional interior photography

Generate the transformed room.`;
}

export async function POST(req: NextRequest) {
  console.log("=== Generate API Called ===");
  
  try {
    const { prompt, image, analysis, productImages, enhancedPrompt } = await req.json();
    console.log("Step 1: Request parsed", { hasImage: !!image, productImagesCount: productImages?.length || 0 });

    if (!prompt && !enhancedPrompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const roomType = analysis?.roomType || "room";
    const style = analysis?.style || "modern";
    const userPrompt = enhancedPrompt || prompt;
    
    // Build the prompt
    const masterPrompt = buildPrompt(roomType, style, userPrompt, !!image);
    console.log("Step 2: Prompt built, length:", masterPrompt.length);

    // Build contents array
    const contents: any[] = [{ text: masterPrompt }];

    // Add original room image if provided
    if (image) {
      try {
        console.log("Fetching original image...");
        const imageResp = await fetch(image, {
          signal: AbortSignal.timeout(30000) // 30s timeout
        });
        if (imageResp.ok) {
          const arrayBuffer = await imageResp.arrayBuffer();
          const base64Image = Buffer.from(arrayBuffer).toString("base64");
          const mimeType = imageResp.headers.get("content-type") || "image/jpeg";
          
          // Check image size
          const imageSizeKB = Math.round(arrayBuffer.byteLength / 1024);
          console.log(`Original image: ${imageSizeKB}KB, type: ${mimeType}`);

          contents.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          });
        } else {
          console.error("Failed to fetch original image:", imageResp.status);
        }
      } catch (e) {
        console.error("Failed to fetch original image:", e);
        return NextResponse.json({ error: "Failed to load original image" }, { status: 400 });
      }
    }

    // Add product reference images (max 5)
    if (productImages && Array.isArray(productImages)) {
      const limitedImages = productImages.slice(0, 5);
      console.log(`Adding ${limitedImages.length} product reference images...`);
      
      for (const imgUrl of limitedImages) {
        if (!imgUrl) continue;
        try {
          const imgResp = await fetch(imgUrl, {
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(10000) // 10s timeout per image
          });
          
          if (!imgResp.ok) continue;
          
          const arrayBuffer = await imgResp.arrayBuffer();
          const base64Image = Buffer.from(arrayBuffer).toString("base64");
          const mimeType = imgResp.headers.get("content-type") || "image/jpeg";

          contents.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          });
        } catch (e) {
          console.warn("Skipped product image:", imgUrl);
        }
      }
    }

    console.log(`Step 3: Calling Gemini with ${contents.length} parts...`);
    const startTime = Date.now();

    // Call Gemini 3 Pro Image (DO NOT CHANGE THIS MODEL)
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: contents,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`Step 4: Gemini responded in ${duration}s`);

    // Debug: Log full response structure
    console.log("Response structure:", JSON.stringify({
      hasCandidates: !!response.candidates,
      candidateCount: response.candidates?.length || 0,
      firstCandidateFinishReason: response.candidates?.[0]?.finishReason,
      partCount: response.candidates?.[0]?.content?.parts?.length || 0,
      partTypes: response.candidates?.[0]?.content?.parts?.map((p: any) => 
        p.text ? 'text' : p.inlineData ? 'image' : 'unknown'
      )
    }, null, 2));

    // Check for safety blocks
    if (response.candidates?.[0]?.finishReason === 'SAFETY') {
      console.error("Generation blocked by safety filter");
      return NextResponse.json({ 
        error: "La génération a été bloquée par le filtre de sécurité. Essayez avec une description différente.", 
      }, { status: 400 });
    }

    // Extract generated image
    let generatedImageBase64 = null;

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if ((part as any).inlineData) {
          generatedImageBase64 = (part as any).inlineData.data;
          console.log("Step 5: Image extracted successfully");
          break;
        }
      }
    }

    if (!generatedImageBase64) {
      const textPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
      const finishReason = response.candidates?.[0]?.finishReason;
      console.error("No image generated. Finish reason:", finishReason, "Text:", textPart?.text?.substring(0, 300) || "None");
      
      // Return more helpful error
      return NextResponse.json({ 
        error: "Échec de génération. Le modèle n'a pas retourné d'image.", 
        details: textPart?.text || `Finish reason: ${finishReason || 'unknown'}`
      }, { status: 500 });
    }

    return NextResponse.json({ imageBase64: generatedImageBase64 });

  } catch (error: any) {
    console.error("Image Generation Error:", error.message || error);
    
    // More specific error messages
    if (error.message?.includes("timeout") || error.message?.includes("ETIMEDOUT")) {
      return NextResponse.json({ error: "Request timed out. Please try again." }, { status: 504 });
    }
    if (error.message?.includes("fetch failed")) {
      return NextResponse.json({ error: "Network error. Check your connection." }, { status: 503 });
    }
    
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
