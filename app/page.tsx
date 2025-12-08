import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <Features />
      
      {/* Footer simple */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-500">
        <p>© 2025 RenovAI. Tous droits réservés.</p>
      </footer>
    </main>
  );
}
