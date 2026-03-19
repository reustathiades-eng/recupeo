import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Payez-vous trop d'impôts ? Vérification IA gratuite | RÉCUPÉO",
  description: "Uploadez votre avis d'imposition, notre IA détecte les cases oubliées en 30 secondes. Frais réels, case T, dons, emploi à domicile... Récupérez jusqu'à 3 ans de trop-payé.",
  openGraph: {
    title: "MONIMPÔT — Audit IA de votre déclaration de revenus",
    description: "Uploadez votre avis d'imposition. L'IA détecte les cases oubliées et génère votre réclamation.",
    url: 'https://recupeo.fr/monimpot',
      images: [{ url: '/api/og', width: 1200, height: 630, alt: 'RÉCUPÉO' }],
  },
}

export default function MonimpotLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
