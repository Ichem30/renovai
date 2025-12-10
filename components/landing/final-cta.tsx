"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-black py-32 text-white">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[150px]" />
      
      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-200">Gratuit pour commencer</span>
          </div>
          
          <h2 className="font-outfit text-4xl font-medium md:text-6xl max-w-4xl mx-auto">
            Prêt à transformer{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              votre intérieur
            </span>{" "}
            ?
          </h2>
          
          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui réinventent leur espace avec l'IA
          </p>
          
          <div className="mt-12">
            <Link href="/app">
              <Button size="lg" className="h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-10 text-lg font-medium text-white hover:opacity-90 shadow-[0_0_40px_-5px_rgba(168,85,247,0.4)] transition-all hover:scale-105">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            Aucune carte bancaire requise • 3 projets gratuits
          </p>
        </motion.div>
      </div>
    </section>
  );
}
