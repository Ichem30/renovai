"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { useAuth } from "@/components/auth-provider";
import { getUserProjects, ProjectData, deleteProject } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Clock, Layout, Loader2, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      const fetchProjects = async () => {
        const data = await getUserProjects(user.uid);
        setProjects(data);
        setLoading(false);
      };
      fetchProjects();
    }
  }, [user, authLoading, router]);

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) {
      try {
        await deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <Navbar />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[1000px] bg-purple-900/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-purple-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Espace Créatif</span>
            </div>
            <h1 className="font-outfit text-4xl font-bold text-white md:text-5xl">Mes Projets</h1>
            <p className="mt-2 text-lg text-gray-400">Gérez et retrouvez toutes vos rénovations.</p>
          </div>
          <Link href="/app">
            <Button className="h-12 gap-2 rounded-full bg-white px-6 text-black hover:bg-gray-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
              <Plus className="h-5 w-5" />
              Nouveau Projet
            </Button>
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 py-32 text-center backdrop-blur-sm"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-xl">
              <Layout className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mb-2 font-outfit text-2xl font-bold text-white">C'est un peu vide ici</h3>
            <p className="mb-8 max-w-md text-gray-400">Commencez par créer votre première rénovation pour voir la magie opérer.</p>
            <Link href="/app">
              <Button className="h-12 gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20">
                <Plus className="h-5 w-5" />
                Créer un projet
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <Link 
                    href={`/project/${project.id}`}
                    className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-gray-900/50 transition-all duration-500 hover:border-purple-500/30 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.15)]"
                  >
                    {/* Image */}
                    <div className="aspect-[4/3] w-full overflow-hidden bg-gray-800">
                      <img 
                        src={project.originalImageUrl} 
                        alt={project.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-40" />
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                          {project.analysis?.roomType || "Projet"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-medium text-gray-300 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                          <Clock className="h-3 w-3" />
                          {project.createdAt?.seconds 
                            ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() 
                            : "Récemment"}
                        </span>
                      </div>
                      <h3 className="font-outfit text-xl font-bold text-white transition-colors group-hover:text-purple-300">
                        {project.name}
                      </h3>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(e, project.id!)}
                      className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-gray-400 opacity-0 backdrop-blur-md transition-all hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 group-hover:opacity-100"
                      title="Supprimer le projet"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
