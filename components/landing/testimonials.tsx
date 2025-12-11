"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sophie Martin",
    role: "Propriétaire, Lyon",
    avatar: "S",
    rating: 5,
    text: "Incroyable ! J'ai pu visualiser ma cuisine rénovée avant même de contacter un artisan. Les produits recommandés étaient parfaits.",
  },
  {
    name: "Thomas Dubois",
    role: "Architecte d'intérieur",
    avatar: "T",
    rating: 5,
    text: "J'utilise RenovAI pour montrer des concepts à mes clients. Ça me fait gagner des heures de travail sur Photoshop.",
  },
  {
    name: "Marie Leroy",
    role: "Décoratrice, Paris",
    avatar: "M",
    rating: 5,
    text: "La shopping list avec les vrais liens est géniale. Mes clients peuvent commander directement les meubles que je leur propose.",
  },
]

export function Testimonials() {
  return (
    <section className="relative py-32 px-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-fuchsia-600/10 blur-[150px]" />

      <div className="container relative z-10 mx-auto">
        <div className="mb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block text-sm font-bold text-pink-400 uppercase tracking-wider mb-4 px-4 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
              Témoignages
            </span>
            <h2 className="font-sans text-5xl font-bold text-white md:text-6xl">Ils adorent RenovAI</h2>
            <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
              Découvrez ce que nos utilisateurs pensent de notre plateforme
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-950/30 to-transparent p-8 transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.25)] hover:-translate-y-1"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed mb-8 text-lg">&quot;{testimonial.text}&quot;</p>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white font-bold text-lg shadow-lg shadow-purple-500/30">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
