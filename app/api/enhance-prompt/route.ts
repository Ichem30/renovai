import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini";

/**
 * API pour améliorer et enrichir le prompt utilisateur
 * Valide la qualité du prompt et suggère des améliorations
 */
export async function POST(req: NextRequest) {
  try {
    const { userPrompt, roomType, context } = await req.json();

    if (!userPrompt || userPrompt.length < 10) {
      return NextResponse.json({ 
        valid: false, 
        error: "Le prompt est trop court",
        suggestions: [
          "Ajoutez des couleurs (ex: tons terracotta, bleu pétrole)",
          "Mentionnez des matériaux (bois clair, marbre, béton)",
          "Décrivez l'ambiance souhaitée (chaleureuse, minimaliste)"
        ]
      });
    }

    const systemPrompt = `Tu es un expert en design d'intérieur. Ton rôle est d'analyser et d'améliorer les descriptions de projets de rénovation.

CONTEXTE:
- Type de pièce: ${roomType || "pièce"}
- Description utilisateur: "${userPrompt}"

ANALYSE le prompt utilisateur et retourne un JSON avec:
1. "isComplete" (boolean): true si le prompt contient assez de détails (couleurs, matériaux, ambiance)
2. "score" (1-10): qualité de la description
3. "missingElements" (array): éléments manquants parmi [couleurs, matériaux, ambiance, style, éclairage, meubles]
4. "enhancedPrompt" (string): version améliorée et professionnelle du prompt pour la génération d'image
5. "suggestions" (array): 2-3 questions ou suggestions pour améliorer si score < 7

Le "enhancedPrompt" doit:
- Être en anglais (pour le modèle de génération)
- Être très détaillé et professionnel
- Inclure des termes techniques de design d'intérieur
- Mentionner des marques ou styles de meubles reconnaissables si pertinent
- Décrire précisément les textures, couleurs et matériaux
- Maximum 200 mots

Réponds UNIQUEMENT en JSON valide, sans markdown.`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (e) {
      console.error("Failed to parse enhance response:", e);
      // Fallback: create enhanced prompt manually
      parsed = {
        isComplete: userPrompt.length > 50,
        score: Math.min(Math.floor(userPrompt.length / 20), 10),
        missingElements: [],
        enhancedPrompt: `Interior design renovation for a ${roomType}. ${userPrompt}. Professional interior photography, photorealistic, high quality, natural lighting.`,
        suggestions: []
      };
    }

    return NextResponse.json({
      valid: parsed.isComplete || parsed.score >= 5,
      score: parsed.score,
      missingElements: parsed.missingElements || [],
      enhancedPrompt: parsed.enhancedPrompt,
      suggestions: parsed.suggestions || [],
      originalPrompt: userPrompt
    });

  } catch (error) {
    console.error("Enhance Prompt Error:", error);
    return NextResponse.json({ 
      valid: true,
      enhancedPrompt: `Interior design renovation. ${req.body}. High quality, photorealistic.`,
      error: "Enhancement failed, using original" 
    }, { status: 200 });
  }
}
