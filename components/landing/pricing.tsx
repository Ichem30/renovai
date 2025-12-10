"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    description: "Parfait pour découvrir RenovAI",
    features: [
      "3 projets par mois",
      "Styles de base",
      "Shopping list basique",
      "Support communauté",
    ],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Pro",
    price: "19€",
    period: "par mois",
    description: "Pour les passionnés de design",
    features: [
      "Projets illimités",
      "Tous les styles premium",
      "Shopping list avec liens directs",
      "Export HD",
      "Support prioritaire",
      "Accès aux nouvelles fonctionnalités",
    ],
    cta: "Essayer Pro",
    popular: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-black py-32 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-purple-400 uppercase tracking-wider">Tarifs</span>
            <h2 className="font-outfit text-4xl font-medium md:text-5xl mt-4">
              Simple et transparent
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Commencez gratuitement, passez Pro quand vous êtes prêt
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 ${
                plan.popular 
                  ? "border-purple-500/50 bg-gradient-to-b from-purple-900/20 to-transparent shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)]" 
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-6 right-6 flex items-center gap-1 rounded-full bg-purple-500 px-3 py-1 text-xs font-medium text-white">
                  <Sparkles className="h-3 w-3" />
                  Populaire
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-2 text-gray-400">{plan.description}</p>
              
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-outfit font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${plan.popular ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-gray-400"}`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/app" className="block mt-8">
                <Button 
                  size="lg" 
                  className={`w-full h-12 rounded-xl font-medium transition-all ${
                    plan.popular 
                      ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25" 
                      : "bg-white/10 hover:bg-white/20 text-white"
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
  );
}
