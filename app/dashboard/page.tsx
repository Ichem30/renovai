"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { useAuth } from "@/components/auth-provider";
import { getUserProjects, ProjectData, deleteProject } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowRight, Clock, Layout, Search, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) {
      try {
        await deleteProject(projectId);
        // Optimistic update
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
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Projets</h1>
            <p className="mt-2 text-gray-400">Gérez et retrouvez toutes vos rénovations</p>
          </div>
          <Link href="/app">
            <Button className="gap-2 bg-white text-black hover:bg-gray-200">
              <Plus className="h-4 w-4" />
              Nouveau Projet
            </Button>
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 py-20 text-center">
            <div className="mb-4 rounded-full bg-white/10 p-4">
              <Layout className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Aucun projet pour le moment</h3>
            <p className="mb-6 text-gray-400">Commencez par créer votre première rénovation</p>
            <Link href="/app">
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-4 w-4" />
                Créer un projet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link 
                key={project.id} 
                href={`/project/${project.id}`}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gray-900 transition-all hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10"
              >
                {/* Image */}
                <div className="aspect-video w-full overflow-hidden bg-gray-800">
                  <img 
                    src={project.originalImageUrl} 
                    alt={project.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      {project.analysis?.roomType || "Projet"}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {project.createdAt?.seconds 
                        ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() 
                        : "Récemment"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-400">
                    {project.name}
                  </h3>
                </div>

                {/* Delete Button (Absolute top right) */}
                <button
                  onClick={(e) => handleDelete(e, project.id!)}
                  className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-gray-400 opacity-0 backdrop-blur-sm transition-all hover:bg-red-500 hover:text-white group-hover:opacity-100"
                  title="Supprimer le projet"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
