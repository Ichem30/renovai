"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, Loader2, ShoppingBag } from "lucide-react";
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
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2.5 text-base font-semibold">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-lg shadow-purple-500/30">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-200 via-fuchsia-200 to-pink-200 bg-clip-text text-transparent">
              Assistant Déco
            </span>
          </h3>
        </div>
        
        {/* Shopping Toggle */}
        <button 
          onClick={() => setIncludeShoppingSearch(!includeShoppingSearch)}
          className={cn(
            "w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300",
            includeShoppingSearch 
              ? "bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-purple-200 border border-purple-400/40" 
              : "bg-white/5 text-gray-400 border border-white/10"
          )}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Recherche produits</span>
          </div>
          <span className={cn(
            "h-2 w-2 rounded-full transition-all duration-300",
            includeShoppingSearch ? "bg-green-400 animate-pulse" : "bg-gray-600"
          )} />
        </button>

        {includeShoppingSearch && (
          <p className="mt-2 text-[10px] text-purple-300/60">
            Les suggestions de meubles incluront des liens d&apos;achat
          </p>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-max max-w-[90%] flex-col gap-2 rounded-xl px-4 py-2.5 text-xs leading-relaxed shadow-lg backdrop-blur-sm transition-all duration-300",
              msg.role === "user"
                ? "ml-auto bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white border border-purple-400/30"
                : "bg-white/10 text-gray-100 border border-white/10"
            )}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="flex w-max items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2.5 text-xs text-purple-300">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>RenovAI réfléchit...</span>
          </div>
        )}
      </div>

      {/* Theme Buttons */}
      <div className="border-t border-white/10 bg-white/5 p-3">
        <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1 scrollbar-purple">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeClick(theme.prompt)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 backdrop-blur-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-fuchsia-500/20 hover:text-purple-200 hover:border-purple-400/40 text-left truncate"
              title={theme.label}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Décrivez vos envies..."
            className="flex-1 rounded-lg border border-white/20 bg-black/30 backdrop-blur-sm px-3 py-2.5 text-xs text-white placeholder-gray-400 transition-all duration-300 focus:border-purple-400/60 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 shadow-lg shadow-purple-500/30 transition-all duration-300"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
