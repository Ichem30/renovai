"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Découverte",
    price: "0€",
    period: "pour toujours",
    description: "Testez RenovAI sans engagement",
    icon: "✨",
    features: [
      "3 projets par mois",
      "Génération IA standard",
      "5 styles de base",
      "Shopping list (sans liens)",
      "Support communauté",
    ],
    limitations: [
      "Filigrane sur les exports",
    ],
    cta: "Commencer gratuitement",
    popular: false,
    badge: null,
  },
  {
    name: "Particulier",
    price: "9€",
    period: "par mois",
    yearlyPrice: "7€",
    description: "Pour vos projets de rénovation personnels",
    icon: "🏠",
    features: [
      "15 projets par mois",
      "Génération IA haute qualité",
      "Tous les styles (20+)",
      "Shopping list avec liens directs",
      "Export HD sans filigrane",
      "Historique des versions",
      "Support email",
    ],
    cta: "Essayer 7 jours gratuits",
    popular: true,
    badge: "Le plus populaire",
  },
  {
    name: "Pro",
    price: "29€",
    period: "par mois",
    yearlyPrice: "24€",
    description: "Pour les designers et décorateurs",
    icon: "⭐",
    features: [
      "Projets illimités",
      "Génération IA ultra-réaliste",
      "Styles personnalisables",
      "Shopping list premium avec prix",
      "Export 4K + PDF client",
      "Marque blanche (votre logo)",
      "API access (bientôt)",
      "Support prioritaire",
    ],
    cta: "Commencer l'essai Pro",
    popular: false,
    badge: "Pour les pros",
  },
];

const enterprise = {
  name: "Entreprise",
  description: "Pour les agences immobilières, promoteurs et chaînes d'ameublement",
  features: [
    "Volume personnalisé",
    "Intégration API complète",
    "SSO & gestion équipe",
    "SLA garanti",
    "Account manager dédié",
    "Formation personnalisée",
  ],
};

export function Pricing() {
  return (
    <section id="pricing" className="bg-black py-32 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-purple-400 uppercase tracking-wider">Tarifs</span>
            <h2 className="font-outfit text-4xl font-medium md:text-5xl mt-4">
              Un prix pour chaque besoin
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Commencez gratuitement, évoluez selon vos besoins. Annulez à tout moment.
            </p>
            
            {/* Annual toggle hint */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-4 py-2 text-sm text-green-400">
              <Zap className="h-4 w-4" />
              -17% avec l&apos;abonnement annuel
            </div>
          </motion.div>
        </div>

        {/* Pricing Cards */}
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
                  ? "border-purple-500/50 bg-gradient-to-b from-purple-900/30 to-transparent shadow-[0_0_60px_-10px_rgba(168,85,247,0.4)] scale-105 z-10" 
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              {plan.badge && (
                <div className={`absolute top-0 right-0 rounded-bl-2xl px-4 py-2 text-xs font-semibold ${
                  plan.popular ? "bg-purple-500 text-white" : "bg-white/10 text-gray-300"
                }`}>
                  <span className="flex items-center gap-1">
                    {plan.popular && <Sparkles className="h-3 w-3" />}
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{plan.icon}</span>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              </div>
              
              <p className="text-gray-400 text-sm">{plan.description}</p>
              
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-outfit font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">/{plan.period.replace("par ", "")}</span>
              </div>
              
              {plan.yearlyPrice && (
                <p className="mt-1 text-sm text-green-400">
                  ou {plan.yearlyPrice}/mois facturé annuellement
                </p>
              )}
              
              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full shrink-0 mt-0.5 ${
                      plan.popular ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-gray-400"
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
                {plan.limitations?.map((limit, i) => (
                  <li key={`limit-${i}`} className="flex items-start gap-3 opacity-50">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full shrink-0 mt-0.5 bg-white/5 text-gray-500">
                      <span className="text-xs">-</span>
                    </div>
                    <span className="text-gray-500 text-sm line-through">{limit}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/app" className="block mt-8">
                <Button 
                  size="lg" 
                  className={`w-full h-12 rounded-xl font-medium transition-all ${
                    plan.popular 
                      ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25 hover:scale-105" 
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{enterprise.name}</h3>
                    <p className="text-gray-400 text-sm">{enterprise.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {enterprise.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="h-4 w-4 text-purple-400" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="shrink-0">
                <Link href="mailto:contact@renovai.fr">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 rounded-xl bg-white text-black hover:bg-gray-200 font-medium"
                  >
                    Contactez-nous
                  </Button>
                </Link>
                <p className="mt-3 text-center text-xs text-gray-500">
                  Réponse sous 24h
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            🔒 Paiement sécurisé par Stripe • Annulation en 1 clic • Sans engagement
          </p>
        </div>
      </div>
    </section>
  );
}
