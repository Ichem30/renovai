"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image_generation";
  timestamp: number;
}

interface ChatInterfaceProps {
  projectId: string;
  initialAnalysis?: any;
  onGenerateImage?: (prompt: string) => void;
}

const THEMES = [
  { id: "japandi", label: "Japandi", prompt: "Style Japandi, mélange japonais et scandinave, minimaliste, zen, bois et pierre" },
  { id: "haussmanien", label: "Haussmannien", prompt: "Style Haussmannien, moulures, parquet point de hongrie, cheminée marbre, élégant" },
  { id: "vintage", label: "Vintage", prompt: "Style Vintage, rétro, mobilier chiné, années 70, couleurs chaudes, nostalgique" },
  { id: "mid_century_modern", label: "Mid-Century", prompt: "Style Mid-Century Modern, années 50, bois teck, lignes organiques, pieds compas" },
  { id: "scandinavian", label: "Scandinave", prompt: "Style scandinave, bois clair, couleurs pastel, cosy, lumineux, hygge" },
  { id: "minimalist", label: "Minimaliste", prompt: "Style minimaliste, épuré, essentiel, monochrome, calme, peu de meubles" },
  { id: "industrial", label: "Industriel", prompt: "Style industriel, loft, briques apparentes, métal noir, béton, bois brut" },
  { id: "bohemian", label: "Bohème", prompt: "Style bohème, plantes, macramé, textures naturelles, ethnique, décontracté" },
  { id: "art_deco", label: "Art Déco", prompt: "Style Art Déco, géométrique, laiton, velours, motifs graphiques, luxe, années 20" },
  { id: "farmhouse", label: "Farmhouse", prompt: "Style Farmhouse, campagne chic, bois rustique, blanc, poutres apparentes, chaleureux" },
  { id: "baroque", label: "Baroque", prompt: "Style Baroque, classique, riche, ornements, doré, lustres, théâtral" },
  { id: "contemporary", label: "Contemporain", prompt: "Style contemporain, design actuel, audacieux, lignes nettes, sophistiqué" },
  { id: "wabisabi", label: "Wabi-Sabi", prompt: "Style Wabi-Sabi, beauté de l'imperfection, matériaux bruts, terreux, artisanal" },
  { id: "mediterranean", label: "Méditerranéen", prompt: "Style méditerranéen, sud, terre cuite, murs à la chaux, bleu azur, olivier" },
  { id: "colonial", label: "Colonial", prompt: "Style colonial, exotique, bois sombre, rotin, lin, voyage, plantes tropicales" },
  { id: "shabby_chic", label: "Shabby Chic", prompt: "Style Shabby Chic, romantique, patiné, floral, blanc cassé, douceur" },
  { id: "maximalist", label: "Maximaliste", prompt: "Style maximaliste, audacieux, mélange de motifs, couleurs vives, collectionneur" },
  { id: "cottagecore", label: "Cottagecore", prompt: "Style Cottagecore, champêtre, floral, nostalgique, nature, doux" },
  { id: "modern_glam", label: "Modern Glam", prompt: "Style Modern Glam, chic, brillant, miroir, velours, sophistiqué, féminin" },
  { id: "brutalist", label: "Brutalist", prompt: "Style Brutalist, béton brut, formes géométriques massives, architectural, gris" },
];

export function ChatInterface({ projectId, initialAnalysis, onGenerateImage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Bonjour ! Je suis votre assistant RenovAI. J'ai analysé votre pièce (${initialAnalysis?.roomType || "pièce"}). Comment souhaitez-vous la transformer ?`,
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [includeShoppingSearch, setIncludeShoppingSearch] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Call API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          messages: [...messages, userMsg],
          context: { ...initialAnalysis, includeShoppingSearch }
        }),
      });

      const data = await response.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Check if image generation was triggered
      if (data.action === "generate_image" && onGenerateImage) {
        onGenerateImage(data.imagePrompt);
      }

    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeClick = (themePrompt: string) => {
    setInput(`Applique un ${themePrompt}`);
    // Optional: auto-send
  };

  return (
    <div className="flex h-full flex-col bg-gray-900/50 backdrop-blur-sm">
      {/* Header with Shopping Toggle */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-white">
            <Sparkles className="h-4 w-4 text-purple-400" />
            Assistant Déco
          </h3>
          
          {/* Shopping Search Toggle */}
          <button 
            onClick={() => setIncludeShoppingSearch(!includeShoppingSearch)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              includeShoppingSearch 
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                : "bg-white/5 text-gray-400 border border-white/10"
            )}
          >
            <span className="text-sm">🛍️</span>
            Recherche produits
            <span className={cn(
              "h-2 w-2 rounded-full transition-colors",
              includeShoppingSearch ? "bg-green-400" : "bg-gray-500"
            )} />
          </button>
        </div>
        {includeShoppingSearch && (
          <p className="mt-2 text-[10px] text-gray-500">
            Les suggestions de meubles incluront des liens d&apos;achat
          </p>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-max max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-3 text-sm",
              msg.role === "user"
                ? "ml-auto bg-purple-600 text-white"
                : "bg-white/10 text-gray-200"
            )}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="flex w-max max-w-[85%] items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm text-gray-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            RenovAI réfléchit...
          </div>
        )}
      </div>

      {/* Quick Actions (Themes) */}
      <div className="border-t border-white/10 p-2">
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeClick(theme.prompt)}
              className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Décrivez vos envies..."
            className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="h-11 w-11 rounded-xl bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
