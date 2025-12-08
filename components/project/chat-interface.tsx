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
  { id: "modern", label: "Moderne", prompt: "Style moderne, épuré, lignes simples, couleurs neutres" },
  { id: "industrial", label: "Industriel", prompt: "Style industriel, briques apparentes, métal noir, bois brut" },
  { id: "scandinavian", label: "Scandinave", prompt: "Style scandinave, bois clair, couleurs pastel, cosy, lumineux" },
  { id: "bohemian", label: "Bohème", prompt: "Style bohème, plantes, textures naturelles, couleurs chaudes, éclectique" },
  { id: "japandi", label: "Japandi", prompt: "Style Japandi, mélange japonais et scandinave, minimaliste, zen, bois et pierre" },
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
          context: initialAnalysis
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
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-white">
          <Sparkles className="h-4 w-4 text-purple-400" />
          Assistant Déco
        </h3>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
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
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
