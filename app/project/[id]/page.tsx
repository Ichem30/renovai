"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { useAuth } from "@/components/auth-provider";
import { getProject, updateProject, ProjectData } from "@/lib/firestore";
import { useRouter, useParams } from "next/navigation";
// import { BeforeAfterSlider } from "@/components/ui/before-after";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download, Share2, Loader2, Maximize2, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { ChatInterface } from "@/components/project/chat-interface";
import { v4 as uuidv4 } from "uuid";

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

  // ... (keep existing functions performAutoAnalysis, useEffect, handleGenerateImage, handleDeleteImage) ...

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
      
      // Update Firestore
      await updateProject(projectData.id!, { analysis: analysisResult });
      
      // Update local state
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
        console.log("Fetching project...", params.id);
        try {
          const data = await getProject(params.id as string);
          console.log("Project data fetched:", data);
          
          if (data && data.userId === user.uid) {
            setProject(data);
            
            // Trigger Auto-Analysis if missing
            if (!data.analysis) {
              console.log("Triggering auto-analysis");
              performAutoAnalysis(data);
            }
          } else {
            console.log("Project not found or unauthorized");
            // router.push("/dashboard");
          }
        } catch (err) {
          console.error("Error in fetchProject:", err);
        } finally {
          console.log("Setting loading to false");
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [user, authLoading, params.id, router]);

  const handleGenerateImage = async (prompt: string) => {
    if (!project || !user) return;
    setGenerating(true);
    
    // Use the currently active image as the base for the new generation
    // If no active image is selected (shouldn't happen ideally), fallback to original
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

      // Convert Base64 to File
      const byteCharacters = atob(imageBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });
      const file = new File([blob], "generated-design.png", { type: "image/png" });

      // Upload to Firebase Storage
      const { uploadImage } = await import("@/lib/storage");
      const imageUrl = await uploadImage(file, user.uid);
      
      const newGeneration = {
        id: uuidv4(),
        imageUrl,
        prompt,
        createdAt: new Date().toISOString(),
      };

      // Update Firestore
      const updatedGenerations = [...(project.generations || []), newGeneration];
      await updateProject(project.id!, {
        generations: updatedGenerations
      });

      // Update Local State
      setProject(prev => prev ? ({
        ...prev,
        generations: updatedGenerations
      }) : null);
      
      // Set new image as active
      setActiveImage(imageUrl);

    } catch (error) {
      console.error("Generation failed:", error);
      alert("Erreur lors de la génération de l'image.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteImage = async (e: React.MouseEvent, generationId: string) => {
    e.stopPropagation(); // Prevent selecting the image when clicking delete
    if (!project || !confirm("Supprimer cette version ?")) return;

    try {
      const updatedGenerations = project.generations?.filter(g => g.id !== generationId) || [];
      
      // Update Firestore
      await updateProject(project.id!, {
        generations: updatedGenerations
      });

      // Update Local State
      setProject(prev => prev ? ({
        ...prev,
        generations: updatedGenerations
      }) : null);

      // If deleted image was active, switch to original
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
    console.log("Project is null. User:", user?.uid, "Params:", params.id);
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500">Projet introuvable</h2>
          <p className="text-gray-400">Impossible de charger les données du projet.</p>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4">Retour au Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentAfterImage = activeImage || project.generations?.[project.generations.length - 1]?.imageUrl || project.originalImageUrl;

  return (
    <div className="flex h-screen flex-col bg-black text-white overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Left Panel - Image Visualization (70%) */}
        <div className="relative flex flex-1 flex-col border-r border-white/10 bg-gray-900 overflow-y-auto">
          {/* Toolbar */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/80 px-6 py-3 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Link>
              <h1 className="text-sm font-medium text-white flex items-center gap-2">
                {project.name || project.analysis?.roomType || "Projet"} 
                <span className="text-gray-500">#{project.id?.slice(0, 6)}</span>
                {analyzing && (
                  <span className="flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">
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
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                  onClick={() => setShowShoppingList(true)}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden sm:inline">Shopping List</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-shrink-0 p-6 flex flex-col items-center justify-center gap-6 min-h-[500px]">
            <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 shadow-2xl">
              {generating && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
                  <p className="text-lg font-medium text-white">Création de votre design...</p>
                  <p className="text-sm text-gray-400">Cela peut prendre quelques secondes</p>
                </div>
              )}
              
              <div className="relative h-full w-full overflow-hidden rounded-xl bg-gray-900">
                <img 
                  src={currentAfterImage} 
                  alt="Design actuel" 
                  className="h-full w-full object-contain"
                />
                
                {/* Badge indicating version */}
                <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                  {currentAfterImage === project.originalImageUrl ? "Original" : "Version Générée"}
                </div>
              </div>
            </div>

            {/* Gallery / Carousel */}
            {project.generations && project.generations.length > 0 && (
              <div className="w-full max-w-5xl overflow-x-auto pb-2">
                <div className="flex gap-4 px-2">
                  {/* Original */}
                  <button
                    onClick={() => setActiveImage(project.originalImageUrl)}
                    className={`relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      activeImage === project.originalImageUrl ? "border-purple-500 ring-2 ring-purple-500/50" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={project.originalImageUrl} alt="Original" className="h-full w-full object-cover" />
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-[10px] text-white">Original</span>
                  </button>

                  {/* Generations */}
                  {project.generations.map((gen, idx) => (
                    <div key={gen.id} className="relative group">
                      <button
                        onClick={() => setActiveImage(gen.imageUrl)}
                        className={`relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          activeImage === gen.imageUrl ? "border-purple-500 ring-2 ring-purple-500/50" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={gen.imageUrl} alt={`Version ${idx + 1}`} className="h-full w-full object-cover" />
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-[10px] text-white">V{idx + 1}</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteImage(e, gen.id)}
                        className="absolute -top-2 -right-2 z-10 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 group-hover:flex"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Assistant (30%) */}
        <div className="w-[400px] flex-shrink-0 bg-black border-l border-white/10">
          <ChatInterface 
            projectId={project.id!} 
            initialAnalysis={project.analysis}
            onGenerateImage={handleGenerateImage}
          />
        </div>
      </div>

      {/* Shopping List Modal Overlay */}
      {showShoppingList && project.products && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-black/40">
              <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">🛍️</span>
                Liste de Shopping
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowShoppingList(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {project.products.map((product: any, i: number) => (
                  <a 
                    key={i}
                    href={`https://www.amazon.fr/s?k=${encodeURIComponent(product.searchTerm)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 rounded-lg border border-white/5 bg-black/20 p-4 transition-all hover:border-purple-500/50 hover:bg-purple-500/10"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-white/10 text-2xl">
                      {product.category === "Sofa" ? "🛋️" : 
                       product.category === "Lamp" ? "💡" : 
                       product.category === "Rug" ? "🧶" : "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate font-medium text-white group-hover:text-purple-300">
                        {product.name}
                      </h4>
                      <p className="line-clamp-2 text-xs text-gray-400">
                        {product.description}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs font-medium text-purple-400">
                        Voir sur Amazon <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
