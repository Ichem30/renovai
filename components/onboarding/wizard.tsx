"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Check, ArrowRight, Loader2, Sparkles, Home, Utensils, Bath, Bed, Sofa, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { uploadImage } from "@/lib/storage";
import { saveProject } from "@/lib/firestore";
import { useRouter } from "next/navigation";

// --- Types ---
type WizardData = {
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
    image: null,
    roomType: "",
    style: "",
    budget: "2000",
    name: "",
  });
  const { user } = useAuth();
  const router = useRouter();

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const updateData = (key: keyof WizardData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex min-h-[600px] w-full max-w-5xl flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/50 p-8 backdrop-blur-xl shadow-2xl">
      {/* Progress Bar */}
      <div className="mb-8 flex w-full max-w-md items-center justify-between text-xs font-medium text-gray-500">
        <span>Etape {step} / 6</span>
        <div className="h-1 flex-1 mx-4 overflow-hidden rounded-full bg-white/10">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 6) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="relative w-full flex-1">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepUpload 
              key="step1" 
              onNext={(file) => {
                updateData("image", file);
                nextStep();
              }} 
            />
          )}
          {step === 2 && data.image && (
            <StepVerify 
              key="step2" 
              image={data.image} 
              onBack={prevStep}
              onNext={nextStep}
            />
          )}
          {step === 3 && (
            <StepRoom 
              key="step3" 
              selected={data.roomType}
              onSelect={(room) => updateData("roomType", room)}
              onBack={prevStep}
              onNext={nextStep}
            />
          )}
          {step === 4 && (
            <StepStyle 
              key="step4" 
              selected={data.style}
              onSelect={(style) => updateData("style", style)}
              onBack={prevStep}
              onNext={nextStep}
            />
          )}
          {step === 5 && (
            <StepBudget 
              key="step5" 
              selected={data.budget}
              onSelect={(budget) => updateData("budget", budget)}
              onBack={prevStep}
              onNext={nextStep}
            />
          )}
          {step === 6 && (
            <StepAnalysis 
              key="step6" 
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

// --- Step 1: Upload ---
function StepUpload({ onNext }: { onNext: (file: File) => void }) {
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
      <div className="mb-6 rounded-2xl bg-white/5 p-4">
        <Home className="h-8 w-8 text-purple-400" />
      </div>
      <h2 className="mb-2 text-3xl font-bold text-white">Commencez par votre pièce</h2>
      <p className="mb-8 max-w-lg text-gray-400">
        Importez une photo de votre salon, chambre ou cuisine. Nous l'analysons pour comprendre la lumière et les volumes.
      </p>

      <div 
        className={cn(
          "relative flex aspect-video w-full max-w-2xl cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all",
          isDragging ? "border-purple-500 bg-purple-500/10" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
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
        
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-black/50 p-4 shadow-xl">
            <Upload className="h-8 w-8 text-gray-300" />
          </div>
          <div className="text-sm font-medium text-gray-300">
            Cliquez ou glissez votre photo ici
          </div>
          <div className="text-xs text-gray-500">
            JPG, PNG ou WEBP • Max 10 Mo
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Step 2: Verify ---
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
      className="flex h-full gap-8"
    >
      {/* Left: Image Preview */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-gray-900 border border-white/10">
        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className="text-sm font-medium text-white">{image.name}</span>
          <Button variant="outline" size="sm" onClick={onBack} className="h-8 border-white/20 bg-black/50 text-xs hover:bg-white/10">
            Modifier
          </Button>
        </div>
      </div>

      {/* Right: Checklist */}
      <div className="flex w-80 flex-col justify-center">
        <h3 className="mb-6 text-xl font-bold text-white">Ce que nous vérifions</h3>
        <div className="space-y-4">
          {[
            "Formats JPG, PNG ou WEBP uniquement",
            "Taille maximale 10 Mo",
            "Dimensions min 512x512 px",
            "Bonne luminosité recommandée"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                <Check className="h-3 w-3" />
              </div>
              {item}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-yellow-200">
            <Sparkles className="h-4 w-4" />
            Conseil Pro
          </h4>
          <p className="text-xs text-yellow-200/80">
            Privilégiez une photo prise de jour avec un angle large pour un meilleur résultat.
          </p>
        </div>

        <Button onClick={onNext} className="mt-8 w-full gap-2 bg-white text-black hover:bg-gray-200">
          Continuer <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// --- Step 3: Room Selection ---
function StepRoom({ selected, onSelect, onBack, onNext }: { selected: string, onSelect: (id: string) => void, onBack: () => void, onNext: () => void }) {
  const [customRoom, setCustomRoom] = useState("");
  const isCustom = !ROOM_TYPES.some(r => r.id === selected) && selected !== "";

  // If selected is a custom value (not in ROOM_TYPES and not empty), we treat it as 'other' for UI highlighting
  const effectiveSelection = isCustom ? "other" : selected;

  const handleSelect = (id: string) => {
    if (id === "other") {
      onSelect("other"); // Set to 'other' initially to show input
    } else {
      onSelect(id);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomRoom(val);
    onSelect(val); // Update parent with custom value immediately
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center"
    >
      <h2 className="mb-2 text-3xl font-bold text-white">Quelle pièce souhaitez-vous relooker ?</h2>
      <p className="mb-12 text-gray-400">Nous adaptons nos recommandations selon le type de pièce.</p>

      <div className="grid w-full max-w-4xl grid-cols-3 gap-4">
        {ROOM_TYPES.map((room) => (
          <button
            key={room.id}
            onClick={() => handleSelect(room.id)}
            className={cn(
              "group flex flex-col items-center justify-center gap-4 rounded-2xl border p-8 transition-all",
              effectiveSelection === room.id 
                ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20" 
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
            )}
          >
            <room.icon className={cn("h-8 w-8 transition-colors", effectiveSelection === room.id ? "text-purple-400" : "text-gray-400 group-hover:text-white")} />
            <span className={cn("font-medium", effectiveSelection === room.id ? "text-white" : "text-gray-300 group-hover:text-white")}>
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
            className="mt-6 w-full max-w-md"
          >
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Précisez la pièce :
            </label>
            <input
              type="text"
              value={customRoom || (isCustom ? selected : "")}
              onChange={handleCustomChange}
              placeholder="Ex: Véranda, Salle de jeux..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 flex w-full max-w-4xl justify-between">
        <Button variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white">
          Retour
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selected || (effectiveSelection === "other" && !customRoom && !isCustom)}
          className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-8 hover:from-purple-700 hover:to-pink-700"
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
      <h2 className="mb-2 text-3xl font-bold text-white">Quel style vous inspire ?</h2>
      <p className="mb-12 text-gray-400">Choisissez l'univers qui correspond à votre vision.</p>

      <div className="flex w-full gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={cn(
              "relative h-80 w-64 flex-shrink-0 overflow-hidden rounded-2xl border transition-all",
              selected === style.id 
                ? "border-purple-500 ring-2 ring-purple-500/50" 
                : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <img src={style.image} alt={style.label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
              <h3 className="text-xl font-bold text-white">{style.label}</h3>
              <p className="mt-1 text-xs text-gray-300">{style.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 flex w-full max-w-4xl justify-between">
        <Button variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white">
          Retour
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selected}
          className="gap-2 bg-white text-black px-8 hover:bg-gray-200"
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
      <h2 className="mb-2 text-3xl font-bold text-white">Quel est votre budget ?</h2>
      <p className="mb-12 text-gray-400">Nous sélectionnerons des meubles adaptés à votre enveloppe.</p>

      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8">
        
        {/* Unlimited Toggle */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">Budget illimité</span>
          <button 
            onClick={toggleUnlimited}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              isUnlimited ? "bg-purple-500" : "bg-gray-600"
            )}
          >
            <span className={cn(
              "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform",
              isUnlimited ? "translate-x-5" : "translate-x-0"
            )} />
          </button>
        </div>

        {/* Slider & Input */}
        <div className={cn("space-y-6 transition-opacity", isUnlimited ? "opacity-30 pointer-events-none" : "opacity-100")}>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-400">Montant estimé</span>
            <div className="relative">
              <input
                type="number"
                value={value}
                onChange={handleInputChange}
                className="w-32 rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-right text-white focus:border-purple-500 focus:outline-none"
              />
              <span className="absolute right-8 top-2 text-gray-500">€</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="20000"
            step="100"
            value={Math.min(value, 20000)}
            onChange={handleSliderChange}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-purple-500"
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0 €</span>
            <span>20 000 €+</span>
          </div>
        </div>
      </div>

      <div className="mt-12 flex w-full max-w-4xl justify-between">
        <Button variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white">
          Retour
        </Button>
        <Button 
          onClick={onNext} 
          className="gap-2 bg-white text-black px-8 hover:bg-gray-200"
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
                    budget: data.budget // Pass budget to planner
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
                budget: data.budget // Pass budget to shopper
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
            // Construct prompt with specific products
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
                    // Convert Base64 to File
                    const byteCharacters = atob(imageBase64);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: "image/png" });
                    const file = new File([blob], "generated-concept.png", { type: "image/png" });
                    
                    // Upload Generated Image
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
      <div className="relative mb-8 h-32 w-32">
        <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-purple-500/30 bg-black/50 backdrop-blur-md">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        </div>
      </div>

      <h2 className="mb-2 text-2xl font-bold text-white">{status}</h2>
      <p className="mb-8 text-gray-400">Veuillez ne pas fermer cette fenêtre.</p>

      <div className="h-2 w-64 overflow-hidden rounded-full bg-white/10">
        <motion.div 
          className="h-full bg-purple-500"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
