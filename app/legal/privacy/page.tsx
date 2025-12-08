import { Navbar } from "@/components/landing/navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 pt-32 pb-20">
        <h1 className="mb-8 text-4xl font-bold">Politique de Confidentialité</h1>
        <div className="prose prose-invert max-w-none">
          <p>Dernière mise à jour : 08 Décembre 2025</p>
          
          <h2>1. Collecte des données</h2>
          <p>Nous collectons les informations suivantes :</p>
          <ul>
            <li>Informations de compte (Email, Nom, Photo) via Google Auth.</li>
            <li>Images uploadées pour l'analyse.</li>
            <li>Données d'utilisation de l'application.</li>
          </ul>

          <h2>2. Utilisation des données</h2>
          <p>Vos données sont utilisées uniquement pour :</p>
          <ul>
            <li>Fournir le service de rénovation par IA.</li>
            <li>Améliorer nos algorithmes (avec votre consentement).</li>
            <li>Vous contacter concernant votre compte.</li>
          </ul>

          <h2>3. Sécurité</h2>
          <p>Nous utilisons Firebase (Google) pour sécuriser vos données. Toutes les communications sont chiffrées.</p>
        </div>
      </div>
    </div>
  );
}
