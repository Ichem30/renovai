import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    const lastMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // System instruction to guide the AI
    const systemPrompt = `
      Tu es RenovAI Assistant, un expert en architecture d'intérieur et décoration.
      
      CONTEXTE DU PROJET :
      - Pièce : ${context?.roomType || "Inconnue"}
      - Style actuel : ${context?.currentStyle || "Inconnu"}
      - État : ${context?.condition || "Inconnu"}
      
      TES MISSIONS :
      1. Conseiller l'utilisateur sur ses choix de rénovation.
      2. Générer des prompts précis pour la génération d'image si l'utilisateur demande une modification visuelle.
      
      RÈGLES IMPORTANTES :
      - Si l'utilisateur demande de changer le style, la couleur, ou d'ajouter un meuble, tu DOIS répondre avec un JSON spécial pour déclencher la génération d'image.
      - Sinon, réponds simplement en texte conversationnel.
      
      FORMAT DE RÉPONSE (Si modification visuelle demandée) :
      {
        "action": "generate_image",
        "imagePrompt": "Une photo réaliste de [Pièce] style [Nouveau Style], avec [Détails demandés], éclairage naturel, 4k",
        "message": "Je vais générer une nouvelle version avec ces changements..."
      }
      
      FORMAT DE RÉPONSE (Si simple discussion) :
      {
        "action": "chat",
        "message": "Ta réponse textuelle ici..."
      }
      
      Réponds TOUJOURS en JSON strict.
    `;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: JSON.stringify({ action: "chat", message: "Compris, je suis prêt à t'aider." }) }],
        },
        ...history
      ],
    });

    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini Raw Response:", text); // Debug log

    let parsedResponse;
    try {
      // Attempt to find JSON object within the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (e) {
      console.warn("Failed to parse JSON from Gemini, falling back to text:", e);
      // Fallback: treat entire text as a message
      parsedResponse = {
        action: "chat",
        message: text.replace(/```json/g, "").replace(/```/g, "").trim()
      };
    }

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ 
      action: "chat", 
      message: "Désolé, je rencontre des difficultés techniques pour le moment." 
    }, { status: 200 }); // Return 200 with error message to avoid crashing UI
  }
}
