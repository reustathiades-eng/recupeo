import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Avis clients — RÉCUPÉO',
  description: 'Avis vérifiés de clients qui ont récupéré leur argent grâce à RÉCUPÉO. Notes, témoignages et montants récupérés.',
  openGraph: {
    title: 'Avis clients — RÉCUPÉO',
    description: 'Des centaines de Français ont déjà récupéré leur argent. Découvrez leurs avis.',
    url: 'https://recupeo.fr/avis',
      images: [{ url: '/api/og', width: 1200, height: 630, alt: 'RÉCUPÉO' }],
  },
}

export default function AvisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
