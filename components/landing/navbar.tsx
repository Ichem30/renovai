"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Menu, User, LogOut, LayoutDashboard } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <div className="w-full max-w-7xl rounded-2xl border border-purple-500/20 bg-gray-950/80 px-6 py-3 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold text-white tracking-tight group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/70 transition-shadow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-sans">RenovAI</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Fonctionnalités
          </Link>
          <Link href="/#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Tarifs
          </Link>
          <Link href="/#faq" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            FAQ
          </Link>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded-lg bg-white/10" />
            ) : user ? (
              // Logged in state
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-sm text-gray-300 hover:text-white hover:bg-white/5 gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleLogout}
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                    title="Déconnexion"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              // Logged out state
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm text-gray-300 hover:text-white hover:bg-white/5">
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 text-sm text-white hover:opacity-90 shadow-lg shadow-purple-500/25 transition-all hover:scale-105">
                    Commencer
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-4 right-4 md:hidden rounded-2xl border border-purple-500/20 bg-gray-950/95 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            <Link href="/#features" className="text-sm font-medium text-gray-300 hover:text-white">
              Fonctionnalités
            </Link>
            <Link href="/#pricing" className="text-sm font-medium text-gray-300 hover:text-white">
              Tarifs
            </Link>
            <Link href="/#faq" className="text-sm font-medium text-gray-300 hover:text-white">
              FAQ
            </Link>
            <div className="h-px bg-white/10 my-2" />
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button className="w-full justify-start gap-2" variant="ghost">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-2 text-red-400">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="w-full">Connexion</Button>
                </Link>
                <Link href="/signup">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600">Commencer</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
