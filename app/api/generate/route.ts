import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * SYSTEM PROMPT BUILDER
 * Creates a highly detailed prompt that ensures:
 * - Strict preservation of room structure and proportions
 * - Photorealistic quality
 * - Consistent perspective and lighting
 */
function buildMasterPrompt(roomType: string, style: string, userPrompt: string, hasReferenceImage: boolean): string {
  
  if (!hasReferenceImage) {
    // Generation from scratch (no reference image)
    return `Create a stunning photorealistic interior design visualization.

SCENE DESCRIPTION:
- Room type: ${roomType}
- Design style: ${style}
- User vision: ${userPrompt}

RENDERING SPECIFICATIONS:
- Photorealistic quality, indistinguishable from professional photography
- Shot with a professional wide-angle lens (24mm equivalent)
- Natural daylight flooding through windows
- Subtle ambient shadows for depth
- 8K resolution quality
- Color grading: warm and inviting tones

COMPOSITION:
- Eye-level perspective at approximately 1.5m height
- Balanced composition following rule of thirds
- Clear focal point showcasing the main design elements
- Depth of field: sharp foreground, slightly soft background

OUTPUT: A single stunning interior design photograph that would be featured in Architectural Digest or Elle Décoration.`;
  }

  // Transformation of existing room (with reference image)
  return `You are an elite interior design AI specializing in photorealistic room transformations.

═══════════════════════════════════════════════════════════════
                    MISSION BRIEFING
═══════════════════════════════════════════════════════════════

Transform the provided ${roomType} photograph into a ${style} design while maintaining ABSOLUTE STRUCTURAL FIDELITY.

USER'S DESIGN VISION:
"${userPrompt}"

═══════════════════════════════════════════════════════════════
                    IMMUTABLE CONSTRAINTS
═══════════════════════════════════════════════════════════════

These rules are ABSOLUTE and must NEVER be violated:

📐 GEOMETRIC PRESERVATION (CRITICAL):
   • Maintain EXACT room dimensions and proportions
   • Preserve ALL wall positions, angles, and intersections
   • Keep ceiling height precisely as shown
   • Floor area must remain identical
   • Room corners and edges stay in exact positions

📷 PERSPECTIVE LOCK:
   • Camera position is FIXED - do not move or rotate
   • Focal length remains unchanged
   • Vanishing points stay in identical positions
   • Lens distortion pattern must match original
   • Eye level remains constant

🏗️ ARCHITECTURAL INTEGRITY:
   • Windows: Keep exact count, size, shape, and position
   • Doors: Preserve location, size, and swing direction
   • Built-in elements: Maintain all fixed architectural features
   • Ceiling details: Preserve beams, moldings, skylights
   • Structural columns or supports: Keep exactly as is

💡 LIGHTING COHERENCE:
   • Natural light sources stay in original positions
   • Light direction and angle must match the original
   • Shadow casting must be physically accurate
   • Time of day feeling should be preserved
   • No magical light sources appearing from nowhere

═══════════════════════════════════════════════════════════════
                    TRANSFORMATION SCOPE
═══════════════════════════════════════════════════════════════

You ARE permitted to redesign:

🎨 SURFACES & FINISHES:
   • Wall colors, textures, wallpapers, or paint finishes
   • Floor materials (hardwood, tile, carpet, concrete, etc.)
   • Ceiling color and texture (within existing structure)
   • Trim and molding colors

🪑 FURNITURE & LAYOUT:
   • Replace, add, or remove furniture pieces
   • Reposition furniture within the floor space
   • Upgrade furniture style to match ${style} aesthetic
   • Scale furniture appropriately to room dimensions

🖼️ DÉCOR & STYLING:
   • Artwork, mirrors, and wall decorations
   • Plants, vases, and decorative objects
   • Textiles: rugs, curtains, cushions, throws
   • Books, candles, and styling accessories

💡 LIGHTING FIXTURES:
   • Replace existing fixtures with new designs
   • Add table lamps, floor lamps, or pendant lights
   • Maintain logical light source positions

═══════════════════════════════════════════════════════════════
                    STYLE SPECIFICATIONS: ${style.toUpperCase()}
═══════════════════════════════════════════════════════════════

Apply the ${style} design philosophy authentically:
• Use characteristic materials and textures of ${style}
• Apply the color palette typical of ${style} interiors
• Select furniture silhouettes that define ${style}
• Include signature decorative elements of ${style}
• Create the atmosphere and mood associated with ${style}

═══════════════════════════════════════════════════════════════
                    QUALITY STANDARDS
═══════════════════════════════════════════════════════════════

PHOTOREALISM REQUIREMENTS:
• Quality level: Professional architectural photography
• Resolution feeling: 8K equivalent detail
• Texture rendering: Visible fabric weaves, wood grain, stone pores
• Material accuracy: Realistic reflections, refractions, subsurface scattering
• Edge quality: Clean, natural transitions without artifacts

COMPOSITION EXCELLENCE:
• Maintain the original photo's compositional strength
• Ensure visual balance with new design elements
• Create clear depth layers (foreground, midground, background)
• Guide the eye through the space naturally

═══════════════════════════════════════════════════════════════
                    FINAL OUTPUT
═══════════════════════════════════════════════════════════════

Generate ONE photorealistic image that:
✓ Preserves the exact room structure from the input
✓ Transforms the ${roomType} with authentic ${style} design
✓ Looks indistinguishable from a professional interior photograph
✓ Would be publishable in Architectural Digest

BEGIN TRANSFORMATION.`;
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
    
    // Build the master prompt
    const masterPrompt = buildMasterPrompt(roomType, style, userPrompt, !!image);

    // Build contents array - TEXT FIRST, then images
    const contents: any[] = [{ text: masterPrompt }];

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

    // Add product reference images (limit to 3 for better focus)
    if (productImages && Array.isArray(productImages)) {
      const limitedImages = productImages.slice(0, 3);
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
