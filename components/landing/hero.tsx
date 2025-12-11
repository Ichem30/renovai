"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Zap } from "lucide-react"
import Link from "next/link"
import { BeforeAfterSlider } from "@/components/ui/before-after"

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-32 pb-20 px-4">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[1200px] rounded-[100%] bg-purple-600/30 blur-[150px]" />
      <div className="absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-fuchsia-600/20 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-pink-600/15 blur-[130px]" />

      <div className="container relative z-10 mx-auto text-center max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mx-auto mb-8 flex w-fit items-center gap-2.5 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 px-5 py-2 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-purple-300 fill-purple-300" />
            <span className="text-sm font-semibold text-purple-100">IA de Nouvelle Génération</span>
          </div>

          <h1 className="mx-auto max-w-5xl font-sans text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
            Transformez votre intérieur{" "}
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              en quelques secondes
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg text-gray-300 font-light leading-relaxed">
            L&apos;intelligence artificielle qui révolutionne le design d&apos;intérieur. Visualisez, planifiez et concrétisez vos
            projets avec une précision inégalée.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/app">
              <Button
                size="lg"
                className="h-14 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-8 text-base font-semibold text-white hover:opacity-90 shadow-[0_0_40px_-5px_rgba(168,85,247,0.6)] transition-all hover:scale-105 hover:shadow-[0_0_50px_-5px_rgba(168,85,247,0.8)]"
              >
                Essayer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/#features">
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-2xl border-2 border-purple-500/30 bg-transparent px-8 text-base font-medium text-white hover:bg-purple-500/10 hover:border-purple-400/50 transition-all"
              >
                Voir les fonctionnalités
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>2 projets gratuits</span>
            </div>
            <div className="h-4 w-px bg-gray-700" />
            <span>Sans carte bancaire</span>
            <div className="h-4 w-px bg-gray-700" />
            <span>Annulation en 1 clic</span>
          </div>
        </motion.div>

        {/* Before/After Demo with Slider */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="mx-auto mt-20 max-w-5xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gray-900/50 shadow-[0_0_80px_-10px_rgba(168,85,247,0.3)] backdrop-blur-sm">
            {/* Browser Bar */}
            <div className="flex h-12 items-center gap-2 border-b border-purple-500/10 bg-gray-950/80 px-5 backdrop-blur-sm">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-4 text-xs text-gray-500 font-medium">renovai.app</span>
            </div>

            {/* Before/After Slider */}
            <BeforeAfterSlider
              beforeImage="/demo/after.jpg"
              afterImage="/demo/before.jpg"
              className="aspect-[16/9]"
            />

            {/* Budget Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute bottom-8 right-8 z-30 hidden md:block"
            >
              <div className="flex items-center gap-4 rounded-2xl border border-purple-500/20 bg-gray-950/90 p-5 backdrop-blur-xl shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/50">
                  <span className="text-2xl font-bold text-white">€</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Estimation Budget</p>
                  <p className="text-3xl font-bold text-white">12 500 €</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
