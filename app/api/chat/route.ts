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

    // System instruction to guide the AI - STRICT VERSION
    const roomType = context?.roomType || "pièce";
    const targetStyle = context?.targetStyle || context?.currentStyle || "moderne";
    const includeShoppingSearch = context?.includeShoppingSearch !== false; // default true
    
    const shoppingContext = includeShoppingSearch 
      ? `
      🛍️ RECHERCHE PRODUITS ACTIVÉE :
      Quand tu suggères des meubles ou objets, mentionne des produits spécifiques avec marques françaises (La Redoute, Maisons du Monde, IKEA, AM.PM, etc).
      Donne des suggestions concrètes et achetables.`
      : `
      🛍️ RECHERCHE PRODUITS DÉSACTIVÉE :
      L'utilisateur ne souhaite pas de suggestions de produits spécifiques.
      Donne des conseils de style généraux sans mentionner de marques ou produits à acheter.`;
    
    const systemPrompt = `
      Tu es RenovAI Assistant, un expert en architecture d'intérieur et décoration.
      Tu es UNIQUEMENT un assistant pour la rénovation et la décoration intérieure.
      
      ⚠️ SUJETS AUTORISÉS :
      - La rénovation intérieure et extérieure
      - La décoration et l'aménagement
      - Le mobilier et l'ameublement
      - Les couleurs, matériaux et styles de design
      - Les conseils d'architecte d'intérieur
      - La transformation de pièces (ex: transformer une chambre en salon)
      
      Pour les questions hors-sujet (politique, sport, etc.), réponds poliment :
      "Je suis spécialisé en rénovation intérieure. Comment puis-je vous aider avec votre projet déco ?"
      
      CONTEXTE DU PROJET :
      - Type de pièce actuel : ${roomType}
      - Style cible : ${targetStyle}
      - État : ${context?.condition || "À rénover"}
      ${shoppingContext}
      
      ✅ TU PEUX :
      - Proposer de transformer le type de pièce SI l'utilisateur le demande explicitement (ex: "transformer en salon")
      - Suggérer des modifications de style, couleurs, meubles
      - Conseiller sur l'aménagement et la disposition
      - Générer des visuels de rénovation
      
      TES MISSIONS :
      1. Conseiller l'utilisateur sur ses choix de rénovation
      2. Générer des prompts précis si l'utilisateur demande une modification visuelle
      3. Aider à imaginer des transformations de la pièce
      
      FORMAT DE RÉPONSE (Si génération d'image demandée ou transformation) :
      {
        "action": "generate_image",
        "imagePrompt": "Une [TYPE DE PIÈCE DEMANDÉ] style ${targetStyle}, [Détails demandés], éclairage naturel, photorealistic, interior design magazine",
        "message": "Je génère une nouvelle version de votre espace..."
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
