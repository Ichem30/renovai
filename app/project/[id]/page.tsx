"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { useAuth } from "@/components/auth-provider";
import { getProject, updateProject, ProjectData } from "@/lib/firestore";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download, Share2, Loader2, Maximize2, ShoppingBag, X, Sparkles, Wand2, Check } from "lucide-react";
import Link from "next/link";
import { ChatInterface } from "@/components/project/chat-interface";
import { ImageGallery } from "@/components/chat/image-gallery";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const router = useRouter();
  const params = useParams();

  const performAutoAnalysis = async (projectData: ProjectData) => {
    if (analyzing || projectData.analysis) return;
    setAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: projectData.originalImageUrl }),
      });
      if (!response.ok) throw new Error("Analysis failed");
      const analysisResult = await response.json();
      
      await updateProject(projectData.id!, { analysis: analysisResult });
      setProject(prev => prev ? ({ ...prev, analysis: analysisResult }) : null);
    } catch (error) {
      console.error("Auto-analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && params.id) {
      // Import onSnapshot for real-time updates
      import("firebase/firestore").then(({ onSnapshot, doc }) => {
        import("@/lib/firebase").then(({ db }) => {
          const docRef = doc(db, "projects", params.id as string);
          
          // Set up real-time listener
          const unsubscribe = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
              const data = { id: docSnap.id, ...docSnap.data() } as ProjectData;
              
              if (data.userId === user.uid) {
                setProject(data);
                setLoading(false);
                
                // Auto-analyze if needed and completed
                if (data.status === "completed" && !data.analysis) {
                  performAutoAnalysis(data);
                }
              }
            } else {
              setLoading(false);
            }
          });
          
          // Cleanup listener on unmount
          return () => unsubscribe();
        });
      });
    }
  }, [user, authLoading, params.id, router]);

  const handleGenerateImage = async (prompt: string) => {
    if (!project || !user) return;
    setGenerating(true);
    
    const baseImage = activeImage || project.originalImageUrl;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          image: baseImage,
          analysis: project.analysis 
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const { imageBase64 } = await response.json();
      if (!imageBase64) throw new Error("No image data received");

      const byteCharacters = atob(imageBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });
      const file = new File([blob], "generated-design.png", { type: "image/png" });

      const { uploadImage } = await import("@/lib/storage");
      const imageUrl = await uploadImage(file, user.uid);
      
      const newGeneration = {
        id: uuidv4(),
        imageUrl,
        prompt,
        createdAt: new Date().toISOString(),
      };

      const updatedGenerations = [...(project.generations || []), newGeneration];
      await updateProject(project.id!, {
        generations: updatedGenerations
      });

      setProject(prev => prev ? ({
        ...prev,
        generations: updatedGenerations
      }) : null);
      
      setActiveImage(imageUrl);

    } catch (error) {
      console.error("Generation failed:", error);
      alert("Erreur lors de la génération de l'image.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteImage = async (e: React.MouseEvent, generationId: string) => {
    e.stopPropagation();
    if (!project || !confirm("Supprimer cette version ?")) return;

    try {
      const updatedGenerations = project.generations?.filter(g => g.id !== generationId) || [];
      
      await updateProject(project.id!, {
        generations: updatedGenerations
      });

      setProject(prev => prev ? ({
        ...prev,
        generations: updatedGenerations
      }) : null);

      const deletedImage = project.generations?.find(g => g.id === generationId)?.imageUrl;
      if (activeImage === deletedImage) {
        setActiveImage(project.originalImageUrl);
      }

    } catch (error) {
      console.error("Delete failed:", error);
      alert("Erreur lors de la suppression.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500">Projet introuvable</h2>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4">Retour au Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show loading UI for pending/generating projects
  if (project.status === "pending" || project.status === "generating") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="relative mb-8">
            <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse" />
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 animate-spin text-white" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">
            {project.status === "pending" ? "Préparation en cours..." : "Génération en cours..."}
          </h2>
          
          <p className="text-gray-400 mb-8">
            {project.status === "pending" 
              ? "Votre projet est en file d'attente. La génération va démarrer sous peu."
              : "Notre IA crée votre design personnalisé. Vous pouvez fermer cette page, la génération continuera en arrière-plan."}
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 text-sm text-purple-400">
              <Sparkles className="h-4 w-4" />
              <span>Recherche des produits...</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Wand2 className="h-4 w-4" />
              <span>Création de l'image...</span>
            </div>
          </div>
          
          <Link href="/dashboard" className="mt-12 inline-block">
            <Button variant="outline" className="border-white/10 hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au Dashboard
            </Button>
          </Link>
          
          <p className="mt-4 text-xs text-gray-500">
            Vous serez notifié quand votre projet sera prêt
          </p>
        </motion.div>
      </div>
    );
  }

  // Show error UI if generation failed
  if (project.status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="text-center max-w-md">
          <div className="h-24 w-24 mx-auto mb-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <X className="h-12 w-12 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-red-400">Erreur de génération</h2>
          
          <p className="text-gray-400 mb-4">
            Une erreur s'est produite lors de la génération de votre projet.
          </p>
          
          {project.error && (
            <p className="text-sm text-red-400/70 mb-8 p-3 bg-red-500/10 rounded-lg">
              {project.error}
            </p>
          )}
          
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button variant="outline" className="border-white/10 hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/app">
              <Button className="bg-purple-600 hover:bg-purple-500">
                Réessayer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  // Legacy projects without status are treated as completed
  // Only show loading UI for projects explicitly set to pending/generating
  const isProjectReady = !project.status || project.status === "completed";
  
  if (!isProjectReady) {
    // This case is already handled above (pending/generating/error)
    // but kept as safeguard
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const currentAfterImage = activeImage || project.generations?.[project.generations.length - 1]?.imageUrl || project.originalImageUrl;

  const galleryImages = project ? [
    { id: "original", label: "Original", url: project.originalImageUrl },
    ...(project.generations || []).map((gen, idx) => ({
      id: gen.id,
      label: `Version ${idx + 1}`,
      url: gen.imageUrl
    }))
  ] : [];

  return (
    <div className="h-screen bg-black overflow-hidden flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <h1 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="font-outfit font-bold">{project.name || project.analysis?.roomType || "Projet"}</span>
              {analyzing && (
                <span className="flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300 animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Analyse IA...
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {project.products && project.products.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                onClick={() => setShowShoppingList(true)}
              >
                <ShoppingBag className="h-4 w-4" />
                Shopping List
              </Button>
            )}
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Image Gallery */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ImageGallery 
            currentImage={currentAfterImage} 
            images={galleryImages} 
            onSelectImage={setActiveImage} 
          />
        </div>

        {/* Right: Chat Sidebar */}
        <div className="w-[420px] border-l border-white/10 flex-shrink-0 bg-[#050505] flex flex-col shadow-2xl z-30">
          <ChatInterface
            projectId={project.id!}
            initialAnalysis={project.analysis}
            onGenerateImage={handleGenerateImage}
          />
        </div>
      </div>

      {/* Shopping List Modal Overlay */}
      <AnimatePresence>
        {showShoppingList && project.products && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-8 py-6 bg-black/20">
                <div>
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-white font-outfit">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/20">🛍️</span>
                    Liste de Shopping
                  </h3>
                  <p className="mt-1 text-sm text-gray-400 ml-14">Produits recommandés pour votre design</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full text-gray-400 hover:bg-white/10 hover:text-white"
                  onClick={() => setShowShoppingList(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {project.products.map((product: any, i: number) => (
                    <a 
                      key={i}
                      href={product.productUrl || `https://www.google.com/search?q=${encodeURIComponent(product.searchTerm || product.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 transition-all duration-300 hover:border-purple-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/5"
                    >
                      {/* Product Image */}
                      {(product.storedImageUrl || product.imageUrl) && (
                        <div className="relative h-32 w-full overflow-hidden rounded-xl bg-black/40">
                          <img 
                            src={product.storedImageUrl || product.imageUrl} 
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                          {/* Verified Badge */}
                          {product.verified && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5 text-[10px] font-medium text-white">
                              <Check className="h-3 w-3" /> Vérifié
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 text-2xl border border-white/5">
                          {product.category === "Sofa" || product.category === "Canapé" ? "🛋️" : 
                           product.category === "Lamp" || product.category === "Lampe" ? "💡" : 
                           product.category === "Rug" || product.category === "Tapis" ? "🧶" :
                           product.category === "Table" ? "🪑" :
                           product.category === "Chair" || product.category === "Chaise" ? "💺" : "📦"}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                            {product.category}
                          </div>
                          {product.source && (
                            <span className="text-[9px] text-gray-500">{product.source}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="mt-2 text-sm text-gray-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          {/* Price */}
                          {product.price ? (
                            <span className="text-lg font-bold text-white">
                              {product.price.toLocaleString('fr-FR')} €
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">
                              {product.productUrl ? "Voir le prix" : "Rechercher"}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs font-medium text-purple-400 group-hover:translate-x-1 transition-transform">
                            Acheter <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
