import { Navbar } from "@/components/landing/navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 pt-32 pb-20">
        <h1 className="mb-8 text-4xl font-bold">Conditions Générales d'Utilisation</h1>
        <div className="prose prose-invert max-w-none">
          <p>Dernière mise à jour : 08 Décembre 2025</p>
          
          <h2>1. Acceptation des conditions</h2>
          <p>En utilisant RenovAI, vous acceptez ces conditions dans leur intégralité.</p>

          <h2>2. Service</h2>
          <p>RenovAI fournit des suggestions de rénovation générées par IA. Ces suggestions sont à titre indicatif et ne remplacent pas l'avis d'un professionnel du bâtiment.</p>

          <h2>3. Responsabilité</h2>
          <p>RenovAI ne peut être tenu responsable des travaux réalisés sur la base de ses suggestions. Les estimations de coûts sont indicatives.</p>
        </div>
      </div>
    </div>
  );
}
