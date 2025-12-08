"use client";

import { Navbar } from "@/components/landing/navbar";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { User, LogOut, Shield, Bell } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-24">
        <h1 className="mb-8 text-3xl font-bold">Réglages</h1>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-2xl font-bold">
                {user.displayName?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.displayName || "Utilisateur"}</h2>
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>
            <div className="mt-6">
              <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                Modifier le profil
              </Button>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5" /> Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Emails marketing</span>
                <div className="h-6 w-11 rounded-full bg-purple-600 p-1">
                  <div className="h-4 w-4 rounded-full bg-white shadow-sm translate-x-5" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Notifications push</span>
                <div className="h-6 w-11 rounded-full bg-gray-600 p-1">
                  <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" /> Sécurité
            </h3>
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              className="w-full gap-2"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
          
          <div className="text-center text-xs text-gray-500">
            Version 1.0.0 • RenovAI Inc.
          </div>
        </div>
      </div>
    </div>
  );
}
