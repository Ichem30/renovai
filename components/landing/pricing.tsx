"use client"

import { motion } from "framer-motion"
import { Check, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "0€",
    period: "pour toujours",
    description: "Découvrez la puissance de l'IA",
    features: ["2 projets par mois", "Transformation IA de base", "5 styles disponibles", "Assistant déco IA"],
    limitations: ["Sans shopping list"],
    cta: "Commencer gratuit",
    popular: false,
  },
  {
    name: "Creator",
    price: "19€",
    period: "par mois",
    yearlyPrice: "15€",
    description: "Pour transformer votre intérieur",
    features: [
      "20 projets par mois",
      "Transformation IA haute qualité",
      "20+ styles de design",
      "Mode prompt personnalisé",
      "Shopping list avec liens d'achat",
      "Assistant déco illimité",
      "Historique des projets",
    ],
    cta: "Commencer maintenant",
    popular: true,
  },
  {
    name: "Studio",
    price: "49€",
    period: "par mois",
    yearlyPrice: "39€",
    description: "Pour les professionnels du design",
    features: [
      "Projets illimités",
      "Transformation IA ultra-réaliste",
      "Tous les styles + personnalisés",
      "Shopping list premium",
      "Suggestions produits avec prix",
      "Support prioritaire",
      "Accès anticipé aux nouveautés",
    ],
    cta: "Passer à Studio",
    popular: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32 px-4">
      <div className="container relative z-10 mx-auto">
        <div className="mb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block text-sm font-bold text-purple-400 uppercase tracking-wider mb-4 px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              Tarifs
            </span>
            <h2 className="font-sans text-5xl font-bold text-white md:text-6xl">
              Transformez votre intérieur dès aujourd&apos;hui
            </h2>
            <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
              Choisissez le plan adapté à vos besoins. Annulez à tout moment.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 px-5 py-2.5 text-sm font-semibold text-green-300">
              <Zap className="h-4 w-4 fill-green-400 text-green-400" />
              Économisez 20% avec l&apos;abonnement annuel
            </div>
          </motion.div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 flex flex-col ${
                plan.popular
                  ? "border-purple-500/50 bg-gradient-to-b from-purple-950/60 via-fuchsia-950/30 to-transparent shadow-[0_0_80px_-10px_rgba(168,85,247,0.5)] scale-105 md:scale-110 z-10"
                  : "border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-transparent hover:border-purple-500/30 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 rounded-bl-3xl px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Le plus populaire
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-sans font-black text-white">{plan.price}</span>
                <span className="text-gray-400 font-medium">/{plan.period.replace("par ", "")}</span>
              </div>

              {plan.yearlyPrice && (
                <p className="text-sm font-semibold text-green-400 mb-6">
                  ou {plan.yearlyPrice}/mois facturé annuellement
                </p>
              )}

              <ul className="mt-8 space-y-4 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${
                        plan.popular ? "bg-purple-500/30 text-purple-300" : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-gray-200 text-sm font-medium">{feature}</span>
                  </li>
                ))}
                {plan.limitations?.map((limit, i) => (
                  <li key={`limit-${i}`} className="flex items-start gap-3 opacity-40">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full shrink-0 bg-gray-800 text-gray-600">
                      <span className="text-xs">✕</span>
                    </div>
                    <span className="text-gray-500 text-sm">{limit}</span>
                  </li>
                ))}
              </ul>

              <Link href="/app" className="block mt-8">
                <Button
                  size="lg"
                  className={`w-full h-14 rounded-2xl font-semibold text-base transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90 text-white shadow-lg shadow-purple-500/30 hover:scale-105 hover:shadow-purple-500/50"
                      : "bg-purple-500/10 hover:bg-purple-500/20 text-white border-2 border-purple-500/30 hover:border-purple-500/50"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
