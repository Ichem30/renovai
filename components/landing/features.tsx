"use client";

import { motion } from "framer-motion";
import { Camera, Wand2, Banknote, Clock } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Analyse Visuelle",
    description: "Notre IA analyse la structure, la luminosité et le style de votre pièce en quelques secondes.",
  },
  {
    icon: Wand2,
    title: "Design Génératif",
    description: "Obtenez des propositions de réaménagement photoréalistes basées sur vos goûts.",
  },
  {
    icon: Banknote,
    title: "Estimation des Coûts",
    description: "Recevez une estimation détaillée du budget travaux (matériaux et main d'œuvre).",
  },
  {
    icon: Clock,
    title: "Gain de Temps",
    description: "Ce qui prenait des semaines avec un architecte ne prend plus que quelques minutes.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-black py-32 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-20 text-center">
          <h2 className="font-outfit text-4xl font-medium md:text-5xl">Comment ça marche ?</h2>
          <p className="mt-4 text-lg text-gray-400">Une technologie de pointe au service de votre intérieur.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-purple-500/30 hover:bg-white/10 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.15)]"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-7 w-7 text-purple-300" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white group-hover:text-purple-200 transition-colors">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              
              {/* Hover Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
