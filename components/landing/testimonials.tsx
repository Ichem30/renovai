"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

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
];

export function Testimonials() {
  return (
    <section className="bg-gradient-to-b from-black to-gray-950 py-32 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-purple-400 uppercase tracking-wider">Témoignages</span>
            <h2 className="font-outfit text-4xl font-medium md:text-5xl mt-4">
              Ils adorent RenovAI
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Découvrez ce que nos utilisateurs pensent de notre plateforme
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:border-purple-500/30"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-8">"{testimonial.text}"</p>
              
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
