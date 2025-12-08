"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, User } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 hidden border-b border-white/10 bg-black/50 backdrop-blur-md md:block">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          RenovAI
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/#features" className="text-sm font-medium text-gray-300 hover:text-white">
            Fonctionnalités
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
               <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white">
                 Dashboard
               </Link>
               <span className="text-sm text-gray-300">Bonjour, {user.displayName?.split(' ')[0]}</span>
               <Button 
                 variant="outline" 
                 onClick={() => signOut(auth)}
                 className="border-white/10 bg-white/5 text-white hover:bg-white/10"
               >
                 Déconnexion
               </Button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white">
                Connexion
              </Link>
              <Link href="/signup">
                <Button className="bg-white text-black hover:bg-gray-200">
                  S'inscrire
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
