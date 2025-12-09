"use client";

import { Navbar } from "@/components/landing/navbar";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AppPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] h-[400px] w-[400px] rounded-full bg-pink-900/10 blur-[100px]" />
      </div>

      <main className="relative z-10 container mx-auto flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-10">
        <OnboardingWizard />
      </main>
    </div>
  );
}
