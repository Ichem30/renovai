"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Upload } from "lucide-react";
import Link from "next/link";
import { BeforeAfterSlider } from "@/components/ui/before-after";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black pt-16">
      {/* Background Gradients */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      
      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mx-auto max-w-4xl bg-gradient-to-b from-white to-gray-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
            Réinventez votre intérieur avec l'Intelligence Artificielle
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Transformez une simple photo en un projet de rénovation complet.
            Design, estimation des coûts et visualisation 3D instantanée.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/app">
              <Button size="lg" className="h-12 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-lg hover:from-purple-700 hover:to-pink-700">
                <Upload className="h-5 w-5" />
                Commencer un projet
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Floating UI Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-20 max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm"
        >
          <div className="relative aspect-video w-full bg-gray-900/50">
             <BeforeAfterSlider 
                beforeImage="/demo/after.jpg"
                afterImage="/demo/before.jpg"
                className="h-full w-full"
             />
             
             {/* Cost Estimation Badge (Desktop) */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 1, duration: 0.5 }}
               className="hidden md:block absolute bottom-6 right-6 z-20 max-w-xs rounded-xl border border-white/20 bg-black/80 p-5 backdrop-blur-md shadow-2xl"
             >
               <div className="flex items-center justify-between mb-2">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estimation Travaux</p>
                 <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
               </div>
               
               <div className="flex items-baseline gap-2 mb-3">
                 <span className="text-3xl font-bold text-white">12 500 €</span>
                 <span className="text-sm font-medium text-gray-400">TTC</span>
               </div>

               <div className="space-y-2 border-t border-white/10 pt-3">
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-300">Sols (Parquet Chêne)</span>
                   <span className="font-mono text-gray-500">4 200 €</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-300">Peinture & Finitions</span>
                   <span className="font-mono text-gray-500">3 800 €</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-300">Mobilier & Déco</span>
                   <span className="font-mono text-gray-500">4 500 €</span>
                 </div>
               </div>
               
               <p className="mt-3 text-[10px] text-gray-500 leading-tight">
                 *Estimation basée sur les prix moyens du marché en France (2025).
               </p>
             </motion.div>

             {/* Cost Estimation Badge (Mobile) */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1, duration: 0.5 }}
               className="md:hidden absolute bottom-4 right-4 z-20 rounded-lg border border-white/20 bg-black/80 px-3 py-2 backdrop-blur-md shadow-xl"
             >
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimation</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-lg font-bold text-white">12 500 €</span>
               </div>
             </motion.div>
          </div>
          <p className="py-3 text-center text-sm text-gray-400 italic">
            *Glissez pour voir la transformation générée par l'IA
          </p>
        </motion.div>
      </div>
    </section>
  );
}
