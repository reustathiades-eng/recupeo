import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Votre pension contient-elle une erreur ? Test gratuit 30 secondes | RÉCUPÉO",
  description: "1 pension sur 7 contient une erreur. Répondez à 4 questions et découvrez votre niveau de risque. Gratuit, sans engagement, résultat immédiat.",
  keywords: "test pension retraite, erreur pension, vérifier pension retraite gratuit, trimestres manquants, majoration enfants retraite",
  openGraph: {
    title: "Votre pension est-elle correcte ? Test gratuit en 30 secondes",
    description: "1 pension sur 7 contient une erreur au détriment du retraité. Testez gratuitement.",
    url: "https://recupeo.fr/retraitia/test",
    siteName: "RÉCUPÉO",
    locale: "fr_FR",
    type: "website",
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'RÉCUPÉO — Test pension de retraite' }],
  },
  alternates: { canonical: "https://recupeo.fr/retraitia/test" },
}

export default function FlashLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
