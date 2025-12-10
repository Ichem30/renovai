"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Check, ArrowRight, Loader2, Sparkles, Home, Utensils, Bath, Bed, Sofa, Monitor, Trees, Building, Wand2 } from "lucide-react";
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
  designMode: "style" | "custom"; // Choose between preset style or custom prompt
  customPrompt: string; // User's detailed custom prompt
  style: string;
  budget: string;
  name: string;
  includeShoppingList: boolean;
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
  { id: "japandi", label: "Japandi", description: "Zen, minimaliste, naturel", image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80" },
  { id: "haussmanien", label: "Haussmannien", description: "Moulures, parquet, élégance", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" },
  { id: "vintage", label: "Vintage", description: "Rétro, nostalgique, unique", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80" },
  { id: "mid_century_modern", label: "Mid-Century Modern", description: "Années 50, bois, organique", image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80" },
  { id: "scandinavian", label: "Scandinave", description: "Bois clair, cosy, lumineux", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80" },
  { id: "minimalist", label: "Minimaliste", description: "Épuré, essentiel, calme", image: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=800&q=80" },
  { id: "industrial", label: "Industriel", description: "Briques, métal, brut", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80" },
  { id: "bohemian", label: "Bohème", description: "Plantes, textures, voyage", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80" },
  { id: "art_deco", label: "Art Déco", description: "Géométrique, doré, luxe", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80" },
  { id: "farmhouse", label: "Rustique Farmhouse", description: "Campagne, bois, chaleureux", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80" },
  { id: "baroque", label: "Classique Baroque", description: "Ornements, riche, théâtral", image: "https://images.unsplash.com/photo-1551516594-56cb78394645?auto=format&fit=crop&w=800&q=80" },
  { id: "contemporary", label: "Contemporain", description: "Actuel, audacieux, design", image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=800&q=80" },
  { id: "wabisabi", label: "Wabi-Sabi", description: "Imparfait, brut, serein", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80" },
  { id: "mediterranean", label: "Méditerranéen", description: "Soleil, terre cuite, bleu", image: "https://images.unsplash.com/photo-1600566752547-33a6b00e24b6?auto=format&fit=crop&w=800&q=80" },
  { id: "colonial", label: "Colonial", description: "Exotique, bois sombre, voyage", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
  { id: "shabby_chic", label: "Shabby Chic", description: "Romantique, patiné, doux", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80" },
  { id: "maximalist", label: "Maximaliste", description: "Audacieux, coloré, riche", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80" },
  { id: "cottagecore", label: "Cottagecore", description: "Nature, floral, nostalgie", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80" },
  { id: "modern_glam", label: "Modern Glam", description: "Chic, brillant, sophistiqué", image: "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=800&q=80" },
  { id: "brutalist", label: "Brutalist", description: "Béton, formes, architectural", image: "https://images.unsplash.com/photo-1600607687126-8a55e32e0d63?auto=format&fit=crop&w=800&q=80" },
];

const EXTERIOR_STYLES = [
  { id: "modern_exterior", label: "Moderne", description: "Lignes épurées, béton, verre", image: "https://images.unsplash.com/photo-1600596542815-6ad4c7213aa5?auto=format&fit=crop&w=800&q=80" },
  { id: "traditional", label: "Traditionnel", description: "Classique, intemporel, brique", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
  { id: "mediterranean", label: "Méditerranéen", description: "Terre cuite, chaleureux, sud", image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80" },
  { id: "christmas", label: "Décoration de Noël", description: "Féerique, lumières, hivernal", image: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=80" },
  { id: "halloween", label: "Halloween", description: "Automnal, citrouilles, mystérieux", image: "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?auto=format&fit=crop&w=800&q=80" },
  { id: "zen_garden", label: "Jardin Zen", description: "Japonais, minéral, apaisant", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80" },
  { id: "cottage", label: "Cottage", description: "Charme, fleurs, bois", image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80" },
  { id: "industrial_exterior", label: "Industriel", description: "Métal, brut, contemporain", image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80" },
  { id: "tropical", label: "Tropical", description: "Exotique, palmiers, vacances", image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80" },
  { id: "scandinavian_exterior", label: "Scandinave", description: "Bois, nature, simple", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" },
  { id: "provencal", label: "Provençal", description: "Pierre, lavande, rustique chic", image: "https://images.unsplash.com/photo-1599809275671-b5942cabc7ad?auto=format&fit=crop&w=800&q=80" },
  { id: "minimalist_exterior", label: "Minimaliste", description: "Monochrome, cubique, net", image: "https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=800&q=80" },
];

// --- Components ---

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    projectType: "interior",
    image: null,
    roomType: "",
    designMode: "style",
    customPrompt: "",
    style: "",
    budget: "2000",
    name: "",
    includeShoppingList: true,
  });
  const { user } = useAuth();
  const router = useRouter();

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 8));
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
        <span className="font-outfit tracking-wider uppercase">Étape {step} / 8</span>
        <div className="h-1.5 flex-1 mx-6 overflow-hidden rounded-full bg-white/5 border border-white/5">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 8) * 100}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
        <span className="font-outfit tracking-wider uppercase text-white">{
          step === 1 ? "Type" :
          step === 2 ? "Photo" :
          step === 3 ? "Vérification" :
          step === 4 ? "Pièce" :
          step === 5 ? "Mode" :
          step === 6 ? "Design" :
          step === 7 ? "Options" : "Création"
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
            <StepDesignMode 
              key="step5" 
              selected={data.designMode}
              onSelect={(mode) => {
                updateData("designMode", mode);
                nextStep();
              }}
              onBack={prevStep}
            />
          )}
          {step === 6 && data.designMode === "style" && (
            <StepStyle 
              key="step6style" 
              projectType={data.projectType}
              roomType={data.roomType}
              selected={data.style}
              onSelect={(style) => updateData("style", style)}
              onBack={prevStep}
              onNext={nextStep}
            />
          )}
          {step === 6 && data.designMode === "custom" && (
            <StepCustomPrompt 
              key="step6custom" 
              value={data.customPrompt}
              roomType={data.roomType}
              onChange={(prompt) => updateData("customPrompt", prompt)}
              onBack={prevStep}
              onNext={nextStep}
            />
          )}
          {step === 7 && (
            <StepBudget 
              key="step7" 
              selected={data.budget}
              onSelect={(budget) => updateData("budget", budget)}
              includeShoppingList={data.includeShoppingList}
              onToggleShoppingList={(val) => updateData("includeShoppingList", val)}
              onBack={prevStep}
              onNext={nextStep}
            />
          )}
          {step === 8 && (
            <StepAnalysis 
              key="step8" 
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

// --- Step 5: Design Mode Selection ---
function StepDesignMode({ selected, onSelect, onBack }: { 
  selected: "style" | "custom", 
  onSelect: (mode: "style" | "custom") => void, 
  onBack: () => void 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center"
    >
      <h2 className="mb-3 font-outfit text-3xl font-bold text-white">Comment voulez-vous designer ?</h2>
      <p className="mb-12 text-gray-400">Choisissez votre méthode de création</p>

      <div className="grid gap-6 md:grid-cols-2 max-w-3xl w-full">
        {/* Option 1: Style Preset */}
        <button
          onClick={() => onSelect("style")}
          className={cn(
            "group relative overflow-hidden rounded-3xl border p-8 text-left transition-all duration-300",
            selected === "style" 
              ? "border-purple-500/50 bg-purple-500/10 shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]" 
              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
          )}
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-3xl shadow-lg shadow-purple-500/25">
            🎨
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Choisir un style</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Sélectionnez parmi nos 20+ styles prédéfinis : Japandi, Scandinave, Industriel, Bohème...
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-purple-400">
            <Sparkles className="h-4 w-4" />
            Recommandé pour débuter
          </div>
          {selected === "style" && (
            <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white">
              <Check className="h-4 w-4" />
            </div>
          )}
        </button>

        {/* Option 2: Custom Prompt */}
        <button
          onClick={() => onSelect("custom")}
          className={cn(
            "group relative overflow-hidden rounded-3xl border p-8 text-left transition-all duration-300",
            selected === "custom" 
              ? "border-purple-500/50 bg-purple-500/10 shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]" 
              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
          )}
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-3xl shadow-lg shadow-blue-500/25">
            ✍️
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Écrire mon idée</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Décrivez librement votre vision : couleurs, ambiance, matériaux, inspirations...
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-400">
            <Wand2 className="h-4 w-4" />
            Pour les créatifs
          </div>
          {selected === "custom" && (
            <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white">
              <Check className="h-4 w-4" />
            </div>
          )}
        </button>
      </div>

      <div className="mt-12 flex w-full max-w-4xl justify-start">
        <Button variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white rounded-full px-6">
          Retour
        </Button>
      </div>
    </motion.div>
  );
}

// --- Step 5b: Custom Prompt (with AI Enhancement) ---
function StepCustomPrompt({ value, roomType, onChange, onBack, onNext }: { 
  value: string, 
  roomType: string,
  onChange: (prompt: string) => void, 
  onBack: () => void, 
  onNext: () => void 
}) {
  const [charCount, setCharCount] = useState(value.length);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    score: number;
    missingElements: string[];
    suggestions: string[];
  } | null>(null);
  
  const examples = [
    "Un intérieur chaleureux avec des tons terracotta, du bois naturel et beaucoup de plantes vertes. Ambiance cosy et lumineuse.",
    "Style loft new-yorkais avec briques apparentes, métal noir mat, béton ciré au sol et grandes fenêtres industrielles.",
    "Ambiance zen japonaise minimaliste avec du bambou, des couleurs neutres beige et blanc, éclairage tamisé et mobilier bas.",
    "Décoration bohème avec tapis berbères colorés, macramé mural, coussins ethniques et suspension en rotin.",
    "Design scandinave épuré avec bois clair de chêne, blanc immaculé, touches de vert sauge et textiles en lin.",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);
    setCharCount(text.length);
    setAnalysis(null); // Reset analysis when text changes
  };

  const applyExample = (example: string) => {
    onChange(example);
    setCharCount(example.length);
    setAnalysis(null);
  };

  const analyzePrompt = async () => {
    if (value.length < 20) return;
    
    setAnalyzing(true);
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userPrompt: value, 
          roomType 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysis({
          score: data.score || 5,
          missingElements: data.missingElements || [],
          suggestions: data.suggestions || [],
        });
      }
    } catch (e) {
      console.error("Failed to analyze prompt:", e);
    } finally {
      setAnalyzing(false);
    }
  };

  // Debounced analysis
  useEffect(() => {
    if (value.length >= 30) {
      const timer = setTimeout(analyzePrompt, 1000);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent !";
    if (score >= 6) return "Bon";
    if (score >= 4) return "Peut être amélioré";
    return "Trop vague";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center w-full"
    >
      <h2 className="mb-3 font-outfit text-3xl font-bold text-white">Décrivez votre vision</h2>
      <p className="mb-8 text-gray-400">Plus vous êtes précis, meilleur sera le résultat</p>

      <div className="w-full max-w-2xl space-y-6">
        {/* Main textarea */}
        <div className="relative">
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={`Décrivez votre ${roomType} idéal : couleurs, matériaux, ambiance, style de meubles...`}
            className="h-44 w-full resize-none rounded-2xl border border-white/10 bg-black/50 p-6 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
            {analyzing && (
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            )}
            <span className={cn(
              "text-xs",
              charCount < 20 ? "text-red-400" : charCount < 50 ? "text-yellow-400" : "text-green-400"
            )}>
              {charCount} caractères
            </span>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Qualité de la description</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "h-2 w-2 rounded-full",
                        i < analysis.score ? "bg-purple-500" : "bg-white/10"
                      )}
                    />
                  ))}
                </div>
                <span className={cn("text-sm font-medium", getScoreColor(analysis.score))}>
                  {getScoreLabel(analysis.score)}
                </span>
              </div>
            </div>
            
            {analysis.missingElements.length > 0 && (
              <div className="text-xs text-gray-400">
                <span className="text-yellow-400">💡 Éléments à ajouter : </span>
                {analysis.missingElements.join(", ")}
              </div>
            )}
            
            {analysis.suggestions.length > 0 && analysis.score < 7 && (
              <div className="space-y-1">
                {analysis.suggestions.slice(0, 2).map((suggestion, i) => (
                  <p key={i} className="text-xs text-gray-500">• {suggestion}</p>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Quick elements to add */}
        <div>
          <p className="text-sm text-gray-400 mb-3">✨ Cliquez pour ajouter à votre description</p>
          <div className="flex flex-wrap gap-2">
            {["tons chauds", "bois naturel", "lumière douce", "minimaliste", "plantes vertes", "touches dorées", "textures naturelles", "ambiance cosy"].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  const newValue = value + (value.endsWith(" ") || value === "" ? "" : ", ") + tag;
                  onChange(newValue);
                  setCharCount(newValue.length);
                }}
                className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-300 hover:bg-purple-500/20 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div>
          <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-purple-400" />
            Ou utilisez un exemple comme base
          </p>
          <div className="space-y-2">
            {examples.slice(0, 3).map((example, i) => (
              <button
                key={i}
                onClick={() => applyExample(example)}
                className="w-full text-left rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 flex w-full max-w-4xl justify-between">
        <Button variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white rounded-full px-6">
          Retour
        </Button>
        <Button 
          onClick={onNext}
          disabled={value.length < 30 || (analysis && analysis.score < 3)}
          className="h-12 gap-2 rounded-full bg-white text-black px-8 hover:bg-gray-200 shadow-lg shadow-white/10 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {analysis && analysis.score >= 7 ? "Parfait ! Continuer" : "Continuer"} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// --- Step 6: Style Selection ---
function StepStyle({ projectType, roomType, selected, onSelect, onBack, onNext }: { projectType: "interior" | "exterior", roomType: string, selected: string, onSelect: (id: string) => void, onBack: () => void, onNext: () => void }) {
  const currentStyles = projectType === "exterior" ? EXTERIOR_STYLES : STYLES;

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
        {currentStyles.map((style) => (
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
function StepBudget({ selected, onSelect, includeShoppingList, onToggleShoppingList, onBack, onNext }: { 
  selected: string, 
  onSelect: (budget: string) => void, 
  includeShoppingList: boolean,
  onToggleShoppingList: (val: boolean) => void,
  onBack: () => void, 
  onNext: () => void 
}) {
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
      <h2 className="mb-3 font-outfit text-3xl font-bold text-white">Préférences du projet</h2>
      <p className="mb-12 text-gray-400">Configurez votre budget et vos options.</p>

      <div className="w-full max-w-lg space-y-8 rounded-[2rem] border border-white/10 bg-black/40 p-10 backdrop-blur-md shadow-2xl">
        
        {/* Shopping List Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 border border-purple-500/30">
              <span className="text-xl">🛍️</span>
            </div>
            <div>
              <span className="font-medium text-white">Liste de shopping</span>
              <p className="text-xs text-gray-400">Produits recommandés avec liens d&apos;achat</p>
            </div>
          </div>
          <button 
            onClick={() => onToggleShoppingList(!includeShoppingList)}
            className={cn(
              "relative h-8 w-14 rounded-full transition-all duration-300",
              includeShoppingList ? "bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "bg-gray-700"
            )}
          >
            <span className={cn(
              "absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform duration-300 shadow-sm",
              includeShoppingList ? "translate-x-6" : "translate-x-0"
            )} />
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5" />

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

        // 3. Shopping Agent (Source) - Only if user opted in
        let selectedProducts: any[] = [];
        if (data.includeShoppingList) {
          setStatus(`Le Shopper cherche vos meubles ${data.style}...`);
          setProgress(50);
          
          try {
            const shopResponse = await fetch("/api/shop", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                  roomType: data.roomType, 
                  style: data.style,
                  furnitureList: furniturePlan,
                  budget: data.budget,
                  persistImages: true
              }),
            });
            if (shopResponse.ok) {
              const shopData = await shopResponse.json();
              selectedProducts = shopData.products || [];
              console.log(`Shopping: ${shopData.stats?.withLinks || 0} products with links, ${shopData.stats?.withPrices || 0} with prices`);
            }
          } catch (e) {
            console.error("Shopping agent failed", e);
          }
        } else {
          setStatus("Préparation de la génération...");
          setProgress(50);
        }

        // 4. Generate Initial Concept with Products
        setStatus(`Génération de votre espace complet...`);
        setProgress(75);

        let generatedImageUrl = null;
        try {
            let productContext = "";
            let productImages: string[] = [];

            if (selectedProducts.length > 0) {
              // Use the detailed visual_description for better realism
              productContext = "Featuring these specific real-world items: " + selectedProducts.map((p: any) => {
                const desc = p.visual_description || p.description || p.name;
                return `${p.name} (${desc})`;
              }).join(", ") + ".";

              // Collect product images
              productImages = selectedProducts
                .map((p: any) => p.imageUrl)
                .filter((url: string) => url && url.startsWith("http"));
              
              console.log(`Wizard collected ${productImages.length} product images for generation.`);
            }

            // Build prompt based on design mode
            const designDescription = data.designMode === "custom" 
              ? data.customPrompt 
              : `style ${data.style}`;
            
            const prompt = `Rénovation complète: ${designDescription}. Pièce: ${data.roomType}. ${productContext} Lumineux, moderne, photoréaliste.`;
            
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    prompt,
                    image: imageUrl,
                    analysis: { 
                      roomType: data.roomType, 
                      style: data.designMode === "custom" ? data.customPrompt : data.style 
                    },
                    productImages // Pass the images to the generator
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
