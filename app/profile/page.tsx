"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { useAuth } from "@/components/auth-provider";
import { getUserProjects, ProjectData } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calendar, Loader2 } from "lucide-react";

export default function ProfilePage() {
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
      getUserProjects(user.uid).then((data) => {
        setProjects(data);
        setLoading(false);
      });
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mes Projets</h1>
          <Link 
            href="/app"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
          >
            Nouveau projet
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-20 text-center">
            <p className="mb-4 text-gray-400">Vous n'avez pas encore de projets sauvegardés.</p>
            <Link 
              href="/app"
              className="text-purple-400 hover:text-purple-300 hover:underline"
            >
              Commencer ma première rénovation
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link 
                key={project.id} 
                href={`/project/${project.id}`}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-purple-500/50 hover:bg-white/10"
              >
                <div className="aspect-video w-full overflow-hidden bg-gray-900">
                  <img 
                    src={project.generatedImageUrl || project.originalImageUrl} 
                    alt="Aperçu du projet" 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {project.createdAt?.seconds 
                      ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() 
                      : "Date inconnue"}
                  </div>
                  <h3 className="font-medium text-white group-hover:text-purple-400">
                    {project.analysis?.roomType || "Pièce inconnue"}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-green-400">
                      {project.costEstimate || "N/A"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
