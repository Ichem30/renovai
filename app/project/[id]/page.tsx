"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { useAuth } from "@/components/auth-provider";
import { getProject, updateProject, ProjectData } from "@/lib/firestore";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download, Share2, Loader2, Maximize2, ShoppingBag, X, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { ChatInterface } from "@/components/project/chat-interface";
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
      const fetchProject = async () => {
        try {
          const data = await getProject(params.id as string);
          
          if (data && data.userId === user.uid) {
            setProject(data);
            if (!data.analysis) {
              performAutoAnalysis(data);
            }
          } else {
            // Handle unauthorized or not found
          }
        } catch (err) {
          console.error("Error in fetchProject:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
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

  const currentAfterImage = activeImage || project.generations?.[project.generations.length - 1]?.imageUrl || project.originalImageUrl;

  return (
    <div className="flex h-screen flex-col bg-black text-white overflow-hidden selection:bg-purple-500/30">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden pt-20">
        {/* Left Panel - Image Visualization (70%) */}
        <div className="relative flex flex-1 flex-col bg-black/50 overflow-y-auto">
          {/* Glass Toolbar */}
          <div className="sticky top-4 z-20 mx-auto w-[95%] max-w-4xl rounded-full border border-white/10 bg-black/60 px-6 py-3 backdrop-blur-xl shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Retour</span>
              </Link>
              <div className="h-4 w-[1px] bg-white/10" />
              <h1 className="text-sm font-medium text-white flex items-center gap-2">
                <span className="font-outfit font-bold">{project.name || project.analysis?.roomType || "Projet"}</span>
                {analyzing && (
                  <span className="flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300 animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Analyse IA...
                  </span>
                )}
              </h1>
            </div>
            <div className="flex gap-2">
              {project.products && project.products.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 rounded-full bg-purple-500/10 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 border border-purple-500/20"
                  onClick={() => setShowShoppingList(true)}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden sm:inline">Shopping List</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400 hover:bg-white/10 hover:text-white">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400 hover:bg-white/10 hover:text-white">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-shrink-0 p-6 flex flex-col items-center justify-center gap-8 min-h-[600px]">
            <div className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] bg-gray-900">
              <AnimatePresence>
                {generating && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
                      <div className="relative rounded-full bg-black p-4 border border-purple-500/30">
                        <Wand2 className="h-8 w-8 animate-pulse text-purple-500" />
                      </div>
                    </div>
                    <p className="mt-6 text-lg font-medium text-white font-outfit">Création de votre design...</p>
                    <p className="text-sm text-gray-400">L'IA réinvente votre espace</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="relative h-full w-full overflow-hidden">
                <img 
                  src={currentAfterImage} 
                  alt="Design actuel" 
                  className="h-full w-full object-contain"
                />
                
                {/* Badge indicating version */}
                <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full bg-black/60 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-xl border border-white/10">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  {currentAfterImage === project.originalImageUrl ? "Photo Originale" : "Version Générée par IA"}
                </div>
              </div>
            </div>

            {/* Gallery / Carousel */}
            {project.generations && project.generations.length > 0 && (
              <div className="w-full max-w-6xl overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4 px-2">
                  {/* Original */}
                  <button
                    onClick={() => setActiveImage(project.originalImageUrl)}
                    className={`relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                      activeImage === project.originalImageUrl 
                        ? "border-purple-500 shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] scale-105" 
                        : "border-white/10 opacity-60 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <img src={project.originalImageUrl} alt="Original" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-medium text-white">Original</span>
                  </button>

                  {/* Generations */}
                  {project.generations.map((gen, idx) => (
                    <div key={gen.id} className="relative group">
                      <button
                        onClick={() => setActiveImage(gen.imageUrl)}
                        className={`relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                          activeImage === gen.imageUrl 
                            ? "border-purple-500 shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] scale-105" 
                            : "border-white/10 opacity-60 hover:opacity-100 hover:scale-105"
                        }`}
                      >
                        <img src={gen.imageUrl} alt={`Version ${idx + 1}`} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <span className="absolute bottom-2 left-2 text-[10px] font-medium text-white">Version {idx + 1}</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteImage(e, gen.id)}
                        className="absolute -top-2 -right-2 z-10 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 group-hover:flex"
                        title="Supprimer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Assistant (30%) */}
        <div className="w-[400px] flex-shrink-0 bg-black/80 border-l border-white/10 backdrop-blur-xl">
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
                      href={`https://www.amazon.fr/s?k=${encodeURIComponent(product.searchTerm)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 transition-all duration-300 hover:border-purple-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 text-2xl border border-white/5">
                          {product.category === "Sofa" ? "🛋️" : 
                           product.category === "Lamp" ? "💡" : 
                           product.category === "Rug" ? "🧶" : "📦"}
                        </div>
                        <div className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-medium text-gray-400">
                          {product.category}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="mt-2 text-sm text-gray-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-gray-500">Disponible sur Amazon</span>
                          <span className="flex items-center gap-1 text-purple-400 group-hover:translate-x-1 transition-transform">
                            Voir l'offre <ArrowRight className="h-3 w-3" />
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
