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
    <section id="features" className="bg-black py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-5xl">Comment ça marche ?</h2>
          <p className="mt-4 text-gray-400">Une technologie de pointe au service de votre intérieur.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
