import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="text-9xl font-bold text-purple-600">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page introuvable</h2>
      <p className="mt-2 text-gray-400">Oups ! La pièce que vous cherchez n'a pas encore été construite.</p>
      <Link href="/" className="mt-8">
        <Button size="lg" className="bg-white text-black hover:bg-gray-200">
          Retour à l'accueil
        </Button>
      </Link>
    </div>
  );
}
