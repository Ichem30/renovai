"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Comment fonctionne l'IA de RenovAI ?",
    answer:
      "Notre IA analyse votre photo pour comprendre la structure de la pièce (murs, fenêtres, proportions) puis génère une version rénovée en appliquant le style choisi tout en conservant la perspective originale.",
  },
  {
    question: "Les produits recommandés sont-ils réels ?",
    answer:
      "Oui ! Nous utilisons Google Shopping pour trouver des produits réels disponibles chez des enseignes comme Maison du Monde, IKEA, La Redoute. Chaque produit a un lien direct vers sa page d'achat.",
  },
  {
    question: "Puis-je utiliser mes propres photos ?",
    answer:
      "Absolument ! Prenez simplement une photo de votre pièce actuelle avec votre smartphone. L'IA s'adapte à n'importe quel angle et luminosité.",
  },
  {
    question: "Combien de temps prend une génération ?",
    answer:
      "En général, 20 à 40 secondes. L'IA analyse votre photo, trouve les produits adaptés, et génère l'image finale en haute qualité.",
  },
  {
    question: "Puis-je annuler mon abonnement ?",
    answer:
      "Oui, vous pouvez annuler à tout moment depuis votre tableau de bord. Vous garderez l'accès jusqu'à la fin de votre période de facturation.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="relative py-32 px-4">
      <div className="container relative z-10 mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block text-sm font-bold text-purple-400 uppercase tracking-wider mb-4 px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              FAQ
            </span>
            <h2 className="font-sans text-5xl font-bold text-white md:text-6xl">Questions fréquentes</h2>
          </motion.div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-transparent hover:border-purple-500/30 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-purple-500/5"
              >
                <span className="font-semibold text-white text-lg pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-purple-400 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96 pb-6" : "max-h-0"
                }`}
              >
                <p className="px-6 text-gray-400 leading-relaxed text-base">{faq.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
