"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Check, ArrowRight, Loader2, Sparkles, Home, Utensils, Bath, Bed, Sofa, Monitor, Trees, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { uploadImage } from "@/lib/storage";
import { saveProject } from "@/lib/firestore";
import { useRouter } from "next/navigation";

// --- Types ---
type WizardData = {
  projectType: "interior" | "exterior";
  image: File | null;
  imageUrl?: string;
  roomType: string;
  style: string;
  budget: string;
  name: string;
};

// --- Constants ---
const ROOM_TYPES = [
  { id: "living_room", label: "Salon", icon: Sofa },
  { id: "kitchen", label: "Cuisine", icon: Utensils },
  { id: "bedroom", label: "Chambre", icon: Bed },
  { id: "bathroom", label: "Salle de bain", icon: Bath },
  { id: "office", label: "Bureau", icon: Monitor },
  { id: "other", label: "Autre", icon: Home },
];

const EXTERIOR_TYPES = [
  { id: "facade", label: "Façade", icon: Building },
  { id: "garden", label: "Jardin", icon: Trees },
  { id: "terrace", label: "Terrasse", icon: Home },
  { id: "pool", label: "Piscine", icon: Sparkles },
  { id: "other", label: "Autre", icon: Home },
];

const STYLES = [
  { id: "japandi", label: "Japandi", description: "Zen, minimaliste, naturel", image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80" },
  { id: "haussmanien", label: "Haussmannien", description: "Moulures, parquet, élégance", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80" },
  { id: "vintage", label: "Vintage", description: "Rétro, nostalgique, unique", image: "https://images.unsplash.com/photo-1559599238-308793637427?auto=format&fit=crop&w=800&q=80" },
  { id: "mid_century_modern", label: "Mid-Century Modern", description: "Années 50, bois, organique", image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80" },
  { id: "scandinavian", label: "Scandinave", description: "Bois clair, cosy, lumineux", image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80" },
  { id: "minimalist", label: "Minimaliste", description: "Épuré, essentiel, calme", image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80" },
  { id: "industrial", label: "Industriel", description: "Briques, métal, brut", image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80" },
  { id: "bohemian", label: "Bohème", description: "Plantes, textures, voyage", image: "https://images.unsplash.com/photo-1522444195799-478538b28823?auto=format&fit=crop&w=800&q=80" },
  { id: "art_deco", label: "Art Déco", description: "Géométrique, doré, luxe", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80" },
  { id: "farmhouse", label: "Rustique Farmhouse", description: "Campagne, bois, chaleureux", image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80" },
  { id: "baroque", label: "Classique Baroque", description: "Ornements, riche, théâtral", image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80" },
  { id: "contemporary", label: "Contemporain", description: "Actuel, audacieux, design", image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=800&q=80" },
  { id: "wabisabi", label: "Wabi-Sabi", description: "Imparfait, brut, serein", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" },
  { id: "mediterranean", label: "Méditerranéen", description: "Soleil, terre cuite, bleu", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80" },
  { id: "colonial", label: "Colonial", description: "Exotique, bois sombre, voyage", image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=800&q=80" },
  { id: "shabby_chic", label: "Shabby Chic", description: "Romantique, patiné, doux", image: "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=800&q=80" },
  { id: "maximalist", label: "Maximaliste", description: "Audacieux, coloré, riche", image: "https://images.unsplash.com/photo-1560185009-5bf9f2849488?auto=format&fit=crop&w=800&q=80" },
  { id: "cottagecore", label: "Cottagecore", description: "Nature, floral, nostalgie", image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=800&q=80" },
  { id: "modern_glam", label: "Modern Glam", description: "Chic, brillant, sophistiqué", image: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80" },
  { id: "brutalist", label: "Brutalist", description: "Béton, formes, architectural", image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80" },
];

// --- Components ---

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    projectType: "interior",
    image: null,
    roomType: "",
    style: "",
    budget: "2000",
    name: "",
  });
  const { user } = useAuth();
  const router = useRouter();

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 7));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const updateData = (key: keyof WizardData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative flex min-h-[600px] w-full max-w-5xl flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/60 p-12 backdrop-blur-2xl shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-96 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Progress Bar */}
      <div className="relative z-10 mb-12 flex w-full max-w-lg items-center justify-between text-xs font-medium text-gray-400">
        <span className="font-outfit tracking-wider uppercase">Étape {step} / 7</span>
        <div className="h-1.5 flex-1 mx-6 overflow-hidden rounded-full bg-white/5 border border-white/5">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 7) * 100}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
        <span className="font-outfit tracking-wider uppercase text-white">{
          step === 1 ? "Type" :
          step === 2 ? "Photo" :
          step === 3 ? "Vérification" :
          step === 4 ? "Pièce" :
          step === 5 ? "Style" :
          step === 6 ? "Budget" : "Création"
        }</span>
      </div>

      {/* Step Content */}
      <div className="relative z-10 w-full flex-1">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepTypeSelection 
              key="step1"
              selected={data.projectType}
              onSelect={(type) => {
                updateData("projectType", type);
                nextStep();
              }}
            />
          )}
          {step === 2 && (
            <StepUpload 
              key="step2" 
              onNext={(file) => {
                updateData("image", file);
                nextStep();
              }} 
              onBack={prevStep}
            />
          )}
          {step === 3 && data.image && (
            <StepVerify 
              key="step3" 
              image={data.image} 
              onBack={prevStep}
              onNext={nextStep}
            />
          )}
          {step === 4 && (
            <StepRoom 
              key="step4" 
              projectType={data.projectType}
              selected={data.roomType}
              onSelect={(room) => updateData("roomType", room)}
              onBack={prevStep}
              onNext={nextStep}
            />
          )}
          {step === 5 && (
            <StepStyle 
              key="step5" 
              selected={data.style}
              onSelect={(style) => updateData("style", style)}
              onBack={prevStep}
              onNext={nextStep}
            />
          )}
          {step === 6 && (
            <StepBudget 
              key="step6" 
              selected={data.budget}
              onSelect={(budget) => updateData("budget", budget)}
              onBack={prevStep}
              onNext={nextStep}
            />
          )}
          {step === 7 && (
            <StepAnalysis 
              key="step7" 
              data={data}
              user={user}
              onComplete={(projectId) => {
                router.push(`/project/${projectId}?new=true`);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Step 1: Type Selection ---
function StepTypeSelection({ selected, onSelect }: { selected: string, onSelect: (type: "interior" | "exterior") => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center text-center"
    >
      <h2 className="mb-3 font-outfit text-4xl font-bold text-white">Que souhaitez-vous transformer ?</h2>
      <p className="mb-12 max-w-lg text-lg text-gray-400">
        Choisissez le type d'espace pour que notre IA adapte son expertise.
      </p>

      <div className="grid w-full max-w-2xl grid-cols-2 gap-8">
        <button
          onClick={() => onSelect("interior")}
          className="group relative flex aspect-square flex-col items-center justify-center gap-6 rounded-[2.5rem] border border-white/10 bg-black/40 p-8 transition-all duration-500 hover:border-purple-500 hover:bg-purple-500/10 hover:scale-105"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5 text-purple-400 shadow-lg shadow-purple-500/10 transition-all duration-500 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-purple-500/40">
            <Sofa className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="font-outfit text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">Intérieur</h3>
            <p className="text-sm text-gray-400 group-hover:text-gray-300">Salon, Cuisine, Chambre...</p>
          </div>
        </button>

        <button
          onClick={() => onSelect("exterior")}
          className="group relative flex aspect-square flex-col items-center justify-center gap-6 rounded-[2.5rem] border border-white/10 bg-black/40 p-8 transition-all duration-500 hover:border-pink-500 hover:bg-pink-500/10 hover:scale-105"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5 text-pink-400 shadow-lg shadow-pink-500/10 transition-all duration-500 group-hover:bg-pink-500 group-hover:text-white group-hover:shadow-pink-500/40">
            <Trees className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="font-outfit text-2xl font-bold text-white group-hover:text-pink-300 transition-colors">Extérieur</h3>
            <p className="text-sm text-gray-400 group-hover:text-gray-300">Façade, Jardin, Terrasse...</p>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

// --- Step 2: Upload ---
function StepUpload({ onNext, onBack }: { onNext: (file: File) => void, onBack: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      onNext(file);
    } else {
      alert("Veuillez uploader une image valide (JPG, PNG).");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center text-center"
    >
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-xl">
        <Home className="h-10 w-10 text-purple-400" />
      </div>
      <h2 className="mb-3 font-outfit text-4xl font-bold text-white">Votre espace actuel</h2>
      <p className="mb-10 max-w-lg text-lg text-gray-400">
        Importez une photo. Notre IA l'analysera pour comprendre l'espace et la lumière.
      </p>

      <div 
        className={cn(
          "group relative flex aspect-video w-full max-w-2xl cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed transition-all duration-500",
          isDragging 
            ? "border-purple-500 bg-purple-500/10 scale-[1.02]" 
            : "border-white/10 bg-black/20 hover:border-purple-500/50 hover:bg-white/5"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        
        <div className="flex flex-col items-center gap-6 transition-transform duration-300 group-hover:scale-105">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 shadow-lg shadow-purple-500/10">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <div className="text-lg font-medium text-white">
              Cliquez ou glissez votre photo ici
            </div>
            <div className="text-sm text-gray-500">
              JPG, PNG ou WEBP • Max 10 Mo
            </div>
          </div>
        </div>
      </div>
      
      <Button variant="ghost" onClick={onBack} className="mt-8 text-gray-400 hover:text-white rounded-full px-6">
        Retour
      </Button>
    </motion.div>
  );
}

// --- Step 3: Verify ---
function StepVerify({ image, onBack, onNext }: { image: File, onBack: () => void, onNext: () => void }) {
  const [preview, setPreview] = useState<string>("");

  // Create preview URL
  useState(() => {
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex h-full gap-12"
    >
      {/* Left: Image Preview */}
      <div className="relative flex-1 overflow-hidden rounded-[2rem] bg-gray-900 border border-white/10 shadow-2xl">
        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
          <span className="text-sm font-medium text-white bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">{image.name}</span>
          <Button variant="outline" size="sm" onClick={onBack} className="h-9 rounded-full border-white/20 bg-black/50 text-xs hover:bg-white/10 hover:text-white backdrop-blur-md">
            Modifier
          </Button>
        </div>
      </div>

      {/* Right: Checklist */}
      <div className="flex w-80 flex-col justify-center">
        <h3 className="mb-8 font-outfit text-2xl font-bold text-white">Vérification IA</h3>
        <div className="space-y-6">
          {[
            "Formats JPG, PNG ou WEBP",
            "Taille maximale 10 Mo",
            "Dimensions min 512x512 px",
            "Bonne luminosité"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                <Check className="h-3.5 w-3.5" />
              </div>
              {item}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 backdrop-blur-sm">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-yellow-200">
            <Sparkles className="h-4 w-4" />
            Conseil Pro
          </h4>
          <p className="text-xs leading-relaxed text-yellow-200/70">
            Privilégiez une photo prise de jour avec un angle large pour que l'IA puisse mieux analyser les volumes.
          </p>
        </div>

        <Button onClick={onNext} className="mt-10 w-full h-12 gap-2 rounded-full bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10 transition-all hover:scale-105">
          Continuer <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// --- Step 4: Room Selection ---
function StepRoom({ projectType, selected, onSelect, onBack, onNext }: { projectType: "interior" | "exterior", selected: string, onSelect: (id: string) => void, onBack: () => void, onNext: () => void }) {
  const [customRoom, setCustomRoom] = useState("");
  const currentTypes = projectType === "interior" ? ROOM_TYPES : EXTERIOR_TYPES;
  const isCustom = !currentTypes.some(r => r.id === selected) && selected !== "";
  const effectiveSelection = isCustom ? "other" : selected;

  const handleSelect = (id: string) => {
    if (id === "other") {
      onSelect("other");
    } else {
      onSelect(id);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomRoom(val);
    onSelect(val);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center"
    >
      <h2 className="mb-3 font-outfit text-3xl font-bold text-white">Quel espace souhaitez-vous relooker ?</h2>
      <p className="mb-12 text-gray-400">Nous adaptons nos recommandations selon le type d'espace.</p>

      <div className="grid w-full max-w-4xl grid-cols-3 gap-6">
        {currentTypes.map((room) => (
          <button
            key={room.id}
            onClick={() => handleSelect(room.id)}
            className={cn(
              "group flex flex-col items-center justify-center gap-4 rounded-3xl border p-8 transition-all duration-300",
              effectiveSelection === room.id 
                ? "border-purple-500 bg-purple-500/10 shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)] scale-105" 
                : "border-white/10 bg-black/40 hover:border-purple-500/30 hover:bg-white/5 hover:scale-105"
            )}
          >
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300",
              effectiveSelection === room.id ? "bg-purple-500 text-white shadow-lg" : "bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white"
            )}>
              <room.icon className="h-7 w-7" />
            </div>
            <span className={cn("font-medium transition-colors", effectiveSelection === room.id ? "text-white" : "text-gray-400 group-hover:text-white")}>
              {room.label}
            </span>
          </button>
        ))}
      </div>

      {/* Custom Input for 'Other' */}
      <AnimatePresence>
        {(effectiveSelection === "other" || isCustom) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-8 w-full max-w-md"
          >
            <label className="mb-3 block text-sm font-medium text-gray-400 ml-1">
              Précisez l'espace :
            </label>
            <input
              type="text"
              value={customRoom || (isCustom ? selected : "")}
              onChange={handleCustomChange}
              placeholder={projectType === "interior" ? "Ex: Véranda, Salle de jeux..." : "Ex: Allée de jardin, Balcon..."}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 flex w-full max-w-4xl justify-between">
        <Button variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white rounded-full px-6">
          Retour
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selected || (effectiveSelection === "other" && !customRoom && !isCustom)}
          className="h-12 gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
        >
          Continuer <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// --- Step 4: Style Selection ---
function StepStyle({ selected, onSelect, onBack, onNext }: { selected: string, onSelect: (id: string) => void, onBack: () => void, onNext: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center"
    >
      <h2 className="mb-3 font-outfit text-3xl font-bold text-white">Quel style vous inspire ?</h2>
      <p className="mb-12 text-gray-400">Choisissez l'univers qui correspond à votre vision.</p>

      <div className="grid w-full grid-cols-2 gap-4 overflow-y-auto pr-2 md:grid-cols-3 lg:grid-cols-4 max-h-[500px] custom-scrollbar">
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={cn(
              "group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border transition-all duration-300",
              selected === style.id 
                ? "border-purple-500 shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] scale-[1.02] z-10" 
                : "border-white/10 opacity-70 hover:opacity-100 hover:scale-[1.02] hover:z-10"
            )}
          >
            <img src={style.image} alt={style.label} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
              <h3 className="font-outfit text-lg font-bold text-white leading-tight">{style.label}</h3>
              
              {selected === style.id && (
                <div className="mt-2 flex items-center gap-1.5 text-purple-400 text-xs font-medium animate-in fade-in slide-in-from-bottom-1">
                  <Check className="h-3 w-3" /> Sélectionné
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 flex w-full max-w-4xl justify-between">
        <Button variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white rounded-full px-6">
          Retour
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selected}
          className="h-12 gap-2 rounded-full bg-white text-black px-8 hover:bg-gray-200 shadow-lg shadow-white/10 transition-all hover:scale-105"
        >
          Continuer <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// --- Step 5: Budget Selection ---
function StepBudget({ selected, onSelect, onBack, onNext }: { selected: string, onSelect: (budget: string) => void, onBack: () => void, onNext: () => void }) {
  const [isUnlimited, setIsUnlimited] = useState(selected === "unlimited");
  const [value, setValue] = useState(selected === "unlimited" ? 5000 : parseInt(selected) || 2000);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setValue(val);
    if (!isUnlimited) onSelect(val.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setValue(val);
      if (!isUnlimited) onSelect(val.toString());
    }
  };

  const toggleUnlimited = () => {
    const newState = !isUnlimited;
    setIsUnlimited(newState);
    onSelect(newState ? "unlimited" : value.toString());
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center"
    >
      <h2 className="mb-3 font-outfit text-3xl font-bold text-white">Quel est votre budget ?</h2>
      <p className="mb-12 text-gray-400">Nous sélectionnerons des meubles adaptés à votre enveloppe.</p>

      <div className="w-full max-w-lg space-y-10 rounded-[2rem] border border-white/10 bg-black/40 p-10 backdrop-blur-md shadow-2xl">
        
        {/* Unlimited Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </div>
            <span className="font-medium text-white text-lg">Budget illimité</span>
          </div>
          <button 
            onClick={toggleUnlimited}
            className={cn(
              "relative h-8 w-14 rounded-full transition-all duration-300",
              isUnlimited ? "bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "bg-gray-700"
            )}
          >
            <span className={cn(
              "absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform duration-300 shadow-sm",
              isUnlimited ? "translate-x-6" : "translate-x-0"
            )} />
          </button>
        </div>

        {/* Slider & Input */}
        <div className={cn("space-y-8 transition-all duration-500", isUnlimited ? "opacity-30 pointer-events-none blur-sm" : "opacity-100")}>
          <div className="flex items-center justify-between gap-6">
            <span className="text-sm text-gray-400 font-medium">Montant estimé</span>
            <div className="relative group">
              <input
                type="number"
                value={value}
                onChange={handleInputChange}
                className="w-40 rounded-xl border border-white/10 bg-black/50 px-6 py-3 text-right text-xl font-bold text-white focus:border-purple-500 focus:outline-none transition-all group-hover:border-white/20"
              />
              <span className="absolute right-10 top-3.5 text-gray-500 font-medium">€</span>
            </div>
          </div>

          <div className="relative pt-2">
            <input
              type="range"
              min="0"
              max="20000"
              step="100"
              value={Math.min(value, 20000)}
              onChange={handleSliderChange}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-purple-500 hover:accent-purple-400 transition-all"
            />
            <div className="absolute -top-1 left-0 h-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 pointer-events-none" style={{ width: `${(Math.min(value, 20000) / 20000) * 100}%` }} />
          </div>
          
          <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span>0 €</span>
            <span>20 000 €+</span>
          </div>
        </div>
      </div>

      <div className="mt-12 flex w-full max-w-4xl justify-between">
        <Button variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white rounded-full px-6">
          Retour
        </Button>
        <Button 
          onClick={onNext} 
          className="h-12 gap-2 rounded-full bg-white text-black px-8 hover:bg-gray-200 shadow-lg shadow-white/10 transition-all hover:scale-105"
        >
          Continuer <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// --- Step 6: Analysis & Creation ---
function StepAnalysis({ data, user, onComplete }: { data: WizardData, user: any, onComplete: (id: string) => void }) {
  const [status, setStatus] = useState("Préparation de l'image...");
  const [progress, setProgress] = useState(0);

  const hasRun = useRef(false);

  // Simulate analysis and creation process
  useEffect(() => {
    const process = async () => {
      if (hasRun.current) return;
      hasRun.current = true;

      try {
        // 1. Upload Original Image
        setStatus("Envoi de l'image sécurisé...");
        setProgress(10);
        const imageUrl = await uploadImage(data.image!, user.uid);
        
        // 2. Architect Agent (Plan)
        setStatus("L'Architecte analyse vos volumes...");
        setProgress(25);
        
        let furniturePlan = [];
        try {
            const planResponse = await fetch("/api/plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    image: imageUrl,
                    roomType: data.roomType, 
                    style: data.style,
                    budget: data.budget
                }),
            });
            if (planResponse.ok) {
                const planData = await planResponse.json();
                furniturePlan = planData.plan || [];
            }
        } catch (e) {
            console.error("Planning agent failed", e);
        }

        // 3. Shopping Agent (Source)
        setStatus(`Le Shopper cherche vos meubles ${data.style}...`);
        setProgress(50);
        
        let selectedProducts = [];
        try {
          const shopResponse = await fetch("/api/shop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                roomType: data.roomType, 
                style: data.style,
                furnitureList: furniturePlan,
                budget: data.budget
            }),
          });
          if (shopResponse.ok) {
            const shopData = await shopResponse.json();
            selectedProducts = shopData.products || [];
          }
        } catch (e) {
          console.error("Shopping agent failed", e);
        }

        // 4. Generate Initial Concept with Products
        setStatus(`Génération de votre espace complet...`);
        setProgress(75);

        let generatedImageUrl = null;
        try {
            let productContext = "";
            if (selectedProducts.length > 0) {
              productContext = "Featuring these specific items: " + selectedProducts.map((p: any) => `${p.name} (${p.description})`).join(", ") + ".";
            }

            const prompt = `Rénovation complète en style ${data.style}. Pièce: ${data.roomType}. ${productContext} Lumineux, moderne, photoréaliste.`;
            
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    prompt,
                    image: imageUrl,
                    analysis: { roomType: data.roomType } 
                }),
            });

            if (response.ok) {
                const { imageBase64 } = await response.json();
                if (imageBase64) {
                    const byteCharacters = atob(imageBase64);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: "image/png" });
                    const file = new File([blob], "generated-concept.png", { type: "image/png" });
                    
                    generatedImageUrl = await uploadImage(file, user.uid);
                }
            }
        } catch (genError) {
            console.error("Generation failed during onboarding:", genError);
        }

        // 5. Create Project
        setStatus("Finalisation de votre espace...");
        setProgress(95);
        
        const generations = [];
        if (generatedImageUrl) {
            const { v4: uuidv4 } = await import("uuid");
            generations.push({
                id: uuidv4(),
                imageUrl: generatedImageUrl,
                prompt: `Style ${data.style} initial`,
                createdAt: new Date().toISOString()
            });
        }

        const projectId = await saveProject({
          userId: user.uid,
          name: `${data.roomType} - ${data.style}`,
          originalImageUrl: imageUrl,
          generations: generations,
          createdAt: new Date(),
          analysis: {
            roomType: data.roomType,
            currentStyle: "Original",
            targetStyle: data.style,
            plan: furniturePlan,
            budget: data.budget
          },
          products: selectedProducts
        });

        setProgress(100);
        setStatus("Prêt !");
        setTimeout(() => onComplete(projectId), 500);

      } catch (error) {
        console.error(error);
        setStatus("Une erreur est survenue.");
        hasRun.current = false; 
      }
    };

    if (user && data.image) {
      process();
    }
  }, [user, data.image, data.style, data.roomType, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative mb-12 h-40 w-40">
        <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20 duration-1000" />
        <div className="absolute inset-4 animate-pulse rounded-full bg-pink-500/10 duration-2000" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full border border-purple-500/30 bg-black/60 backdrop-blur-xl shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)]">
          <Loader2 className="h-16 w-16 animate-spin text-purple-400" />
        </div>
      </div>

      <h2 className="mb-3 font-outfit text-3xl font-bold text-white animate-pulse">{status}</h2>
      <p className="mb-12 text-gray-400">L'IA travaille pour vous, merci de patienter...</p>

      <div className="h-2 w-80 overflow-hidden rounded-full bg-white/5 border border-white/5">
        <motion.div 
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_100%] animate-shimmer"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
