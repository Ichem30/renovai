"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { BeforeAfterSlider } from "@/components/ui/before-after";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black pt-32 pb-20">
      {/* Cinematic Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[1000px] rounded-[100%] bg-purple-900/20 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-blue-900/10 blur-[100px]" />
      
      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-purple-400" />
            <span className="text-xs font-medium text-purple-200">Nouvelle Génération d'IA Design</span>
          </div>

          <h1 className="mx-auto max-w-5xl font-outfit text-6xl font-medium tracking-tight text-white sm:text-8xl">
            Réinventez votre intérieur <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              en une seconde.
            </span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-400 font-light leading-relaxed">
            L'alliance parfaite entre design d'intérieur et intelligence artificielle.
            Visualisez, estimez et réalisez vos projets avec une précision chirurgicale.
          </p>
          
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/app">
              <Button size="lg" className="h-14 rounded-full bg-white px-8 text-lg font-medium text-black hover:bg-gray-200 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Floating UI Mockup - Glassmorphism Masterpiece */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="perspective-1000 mx-auto mt-24 max-w-6xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 shadow-[0_0_50px_-10px_rgba(168,85,247,0.15)] backdrop-blur-sm">
             {/* Window Controls */}
             <div className="absolute top-0 left-0 right-0 z-20 flex h-10 items-center gap-2 border-b border-white/5 bg-black/40 px-4">
               <div className="h-3 w-3 rounded-full bg-red-500/20" />
               <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
               <div className="h-3 w-3 rounded-full bg-green-500/20" />
             </div>

             <div className="relative aspect-[16/9] w-full pt-10">
               <BeforeAfterSlider 
                  beforeImage="/demo/after.jpg"
                  afterImage="/demo/before.jpg"
                  className="h-full w-full"
               />
               
               {/* Floating Badge */}
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8, x: 20 }}
                 animate={{ opacity: 1, scale: 1, x: 0 }}
                 transition={{ delay: 1.2, duration: 0.5 }}
                 className="absolute bottom-8 right-8 z-30 hidden md:block"
               >
                 <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl shadow-2xl">
                   <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                     <span className="text-lg font-bold">€</span>
                   </div>
                   <div>
                     <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estimation</p>
                     <p className="text-2xl font-bold text-white">12 500 €</p>
                   </div>
                 </div>
               </motion.div>
             </div>
          </div>
          
          {/* Reflection Effect */}
          <div className="absolute -bottom-20 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent opacity-50" />
        </motion.div>
      </div>
    </section>
  );
}
