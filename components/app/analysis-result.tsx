"use client";

import { motion } from "framer-motion";
import { CheckCircle, DollarSign, Paintbrush } from "lucide-react";

interface AnalysisResultProps {
  data: {
    roomType: string;
    currentStyle: string;
    condition: string;
    proposals: string[];
    estimatedCost: string;
  };
  generatedImage: string;
}

export function AnalysisResult({ data, generatedImage }: AnalysisResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 grid gap-8 lg:grid-cols-2"
    >
      {/* Left: Analysis & Proposals */}
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Analyse de la pièce
          </h3>
          <div className="space-y-2 text-gray-300">
            <p><span className="font-semibold text-white">Type :</span> {data.roomType}</p>
            <p><span className="font-semibold text-white">Style actuel :</span> {data.currentStyle}</p>
            <p><span className="font-semibold text-white">État :</span> {data.condition}</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-purple-400" />
            Propositions de Rénovation
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-300">
            {data.proposals.map((prop, i) => (
              <li key={i}>{prop}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-6">
          <h3 className="mb-2 text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            Estimation Budget
          </h3>
          <p className="text-2xl font-bold text-green-400">{data.estimatedCost}</p>
          <p className="text-sm text-gray-400 mt-1">*Estimation indicative hors imprévus.</p>
        </div>
      </div>

      {/* Right: Generated Image */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Projection "Nano Banana Pro"</h3>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-gray-900">
          <img
            src={generatedImage}
            alt="Rénovation générée"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute bottom-4 right-4 rounded-lg bg-black/70 px-3 py-1 text-xs text-white backdrop-blur-md">
            Généré par IA
          </div>
        </div>
        <p className="text-sm text-gray-400 text-center">
          Cette image est une simulation générée par l'IA pour inspiration.
        </p>
      </div>
    </motion.div>
  );
}
