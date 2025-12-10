"use client";

import { motion } from "framer-motion";
import { Upload, Wand2, ShoppingBag } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Uploadez votre photo",
    description: "Prenez une photo de votre pièce actuelle. Notre IA l'analyse en quelques secondes.",
  },
  {
    icon: Wand2,
    step: "02",
    title: "Choisissez votre style",
    description: "Sélectionnez parmi 15+ styles de design. L'IA génère votre nouvelle pièce.",
  },
  {
    icon: ShoppingBag,
    step: "03",
    title: "Achetez les produits",
    description: "Recevez une shopping list avec liens directs vers les vrais produits.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-black py-32 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-purple-400 uppercase tracking-wider">Simple & Rapide</span>
            <h2 className="font-outfit text-4xl font-medium md:text-5xl mt-4">
              Comment ça marche ?
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Transformez votre intérieur en 3 étapes simples
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-purple-500/50 to-transparent" />
              )}
              
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 transition-all duration-500 hover:border-purple-500/30 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]">
                {/* Step Number */}
                <div className="absolute top-6 right-6 text-6xl font-outfit font-bold text-white/5 group-hover:text-purple-500/10 transition-colors">
                  {item.step}
                </div>
                
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="mb-3 text-xl font-bold text-white">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
