"use client"

import { motion } from "framer-motion"
import { Camera, Wand2, Banknote, Clock } from "lucide-react"

const features = [
  {
    icon: Camera,
    title: "Analyse Visuelle IA",
    description: "Notre IA analyse la structure, la luminosité et le style de votre pièce en quelques secondes.",
  },
  {
    icon: Wand2,
    title: "Design Génératif",
    description: "Obtenez des propositions de réaménagement photoréalistes basées sur vos préférences.",
  },
  {
    icon: Banknote,
    title: "Shopping List",
    description: "Recevez une liste de produits réels avec liens d'achat directs vers les boutiques.",
  },
  {
    icon: Clock,
    title: "Rapidité Extrême",
    description: "Ce qui prenait des semaines avec un architecte ne prend plus que quelques minutes.",
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-32 px-4">
      <div className="absolute top-1/2 left-0 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="container relative z-10 mx-auto">
        <div className="mb-20 text-center">
          <span className="inline-block text-sm font-bold text-fuchsia-400 uppercase tracking-wider mb-4 px-4 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20">
            Fonctionnalités
          </span>
          <h2 className="font-sans text-5xl font-bold text-white md:text-6xl">Technologie de pointe</h2>
          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
            Une IA révolutionnaire au service de votre intérieur
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-transparent p-8 transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.25)] hover:-translate-y-1"
            >
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 via-fuchsia-500/20 to-pink-500/20 border border-purple-500/30 group-hover:scale-110 group-hover:border-purple-400/50 transition-all duration-300">
                <feature.icon className="h-8 w-8 text-purple-300 group-hover:text-purple-200 transition-colors" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-white group-hover:text-purple-100 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>

              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-fuchsia-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
