"use client"

import { motion } from "framer-motion"
import { Upload, Wand2, ShoppingBag } from "lucide-react"

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Uploadez votre photo",
    description: "Prenez une photo de votre pièce actuelle. Notre IA l'analyse instantanément.",
  },
  {
    icon: Wand2,
    step: "02",
    title: "Choisissez votre style",
    description: "Sélectionnez parmi 20+ styles de design. L'IA génère votre nouvelle pièce.",
  },
  {
    icon: ShoppingBag,
    step: "03",
    title: "Achetez les produits",
    description: "Recevez une liste d'achats avec liens directs vers les vrais produits.",
  },
]

export function HowItWorks() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[120px]" />

      <div className="container relative z-10 mx-auto">
        <div className="mb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block text-sm font-bold text-purple-400 uppercase tracking-wider mb-4 px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              Simple & Rapide
            </span>
            <h2 className="font-sans text-5xl font-bold text-white md:text-6xl mt-6">Comment ça marche ?</h2>
            <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
              Transformez votre intérieur en 3 étapes simples
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-purple-500/50 via-fuchsia-500/30 to-transparent" />
              )}

              <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-950/30 to-transparent p-8 transition-all duration-500 hover:border-purple-500/40 hover:shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)] hover:-translate-y-1">
                <div className="absolute top-6 right-6 text-7xl font-sans font-black text-purple-500/5 group-hover:text-purple-500/10 transition-colors">
                  {item.step}
                </div>

                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:shadow-purple-500/50 transition-all duration-300">
                  <item.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="mb-4 text-2xl font-bold text-white">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
