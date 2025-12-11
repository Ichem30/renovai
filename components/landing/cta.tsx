"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-32 px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-fuchsia-900/20 to-pink-900/30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-purple-600/20 blur-[150px]" />

      <div className="container relative z-10 mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="mx-auto mb-8 flex w-fit items-center gap-2.5 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 px-5 py-2.5 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-purple-300 fill-purple-300" />
            <span className="text-sm font-bold text-purple-100">Gratuit pour commencer</span>
          </div>

          <h2 className="font-sans text-5xl font-bold text-white md:text-7xl max-w-4xl mx-auto leading-tight">
            Prêt à transformer{" "}
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              votre intérieur
            </span>{" "}
            ?
          </h2>

          <p className="mt-8 text-2xl text-gray-300 max-w-2xl mx-auto font-light">
            Rejoignez des milliers d&apos;utilisateurs qui réinventent leur espace avec l&apos;IA
          </p>

          <div className="mt-12">
            <Link href="/app">
              <Button
                size="lg"
                className="h-20 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-12 text-xl font-bold text-white hover:opacity-90 shadow-[0_0_60px_-5px_rgba(168,85,247,0.6)] transition-all hover:scale-105 hover:shadow-[0_0_80px_-5px_rgba(168,85,247,0.8)]"
              >
                Commencer maintenant
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500 font-medium">
            Aucune carte bancaire requise • 2 projets gratuits • Annulation en 1 clic
          </p>
        </motion.div>
      </div>
    </section>
  )
}
