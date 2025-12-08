"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { UploadZone } from "@/components/app/upload-zone";
import { AnalysisResult } from "@/components/app/analysis-result";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { uploadImage } from "@/lib/storage";
import { saveProject } from "@/lib/firestore";
import { useRouter } from "next/navigation";

export default function AppPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "redirecting">("idle");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleCreateProject = async () => {
    if (!selectedImage) return;
    if (!projectName.trim()) {
      setError("Veuillez donner un nom à votre projet.");
      return;
    }
    
    if (!user) {
      if (!confirm("Vous n'êtes pas connecté. Votre projet ne sera pas sauvegardé. Continuer ?")) {
        router.push("/login");
        return;
      }
    }

    setStatus("uploading");
    setError(null);

    try {
      // 1. Upload Image
      let imageUrl = "";
      if (user) {
        imageUrl = await uploadImage(selectedImage, user.uid);
      }

      setStatus("saving");

      // 2. Create Project in Firestore (Instant)
      if (user && imageUrl) {
        const projectId = await saveProject({
          userId: user.uid,
          name: projectName,
          originalImageUrl: imageUrl,
          generations: [], // Empty initially
          createdAt: new Date(), // Client-side timestamp for immediate feedback
        });
        
        setStatus("redirecting");
        // 3. Redirect immediately
        router.push(`/project/${projectId}?new=true`); // Add flag to trigger auto-analysis
      }

    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Vérifiez votre connexion.");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-3xl font-bold text-center">Nouveau Projet</h1>
          
          <div className="mb-8 space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Nom du projet
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ex: Rénovation Salon, Cuisine Été..."
                className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <UploadZone onImageSelected={setSelectedImage} />

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-4 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              onClick={handleCreateProject}
              disabled={!selectedImage || status !== "idle"}
              className="h-14 w-full max-w-md gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-lg hover:from-purple-700 hover:to-pink-700"
            >
              {status === "uploading" && (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" />
                  Téléchargement de l'image...
                </>
              )}
              {status === "saving" && (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" />
                  Création du projet...
                </>
              )}
              {status === "redirecting" && (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" />
                  Ouverture de l'atelier...
                </>
              )}
              {status === "idle" && (
                <>
                  <Sparkles className="h-5 w-5" />
                  Créer le projet
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
