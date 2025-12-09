"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
      <div className="w-full max-w-5xl rounded-full border border-white/10 bg-black/60 px-6 py-3 backdrop-blur-xl shadow-2xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-[0_0_15px_-3px_rgba(168,85,247,0.5)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-outfit">RenovAI</span>
        </Link>
        
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Fonctionnalités
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
               <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                 Dashboard
               </Link>
               <div className="h-4 w-[1px] bg-white/10" />
               <Button 
                 variant="ghost" 
                 onClick={() => signOut(auth)}
                 className="text-xs text-gray-400 hover:text-white hover:bg-transparent"
               >
                 Déconnexion
               </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Connexion
              </Link>
              <Link href="/signup">
                <Button className="rounded-full bg-white px-6 text-black hover:bg-gray-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                  S'inscrire
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
