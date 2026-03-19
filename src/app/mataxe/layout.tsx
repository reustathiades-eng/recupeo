import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Taxe foncière trop élevée ? Vérifiez gratuitement | RÉCUPÉO',
  description: '40% des avis de taxe foncière contiennent une erreur. Vérifiez en 2 minutes si vous payez trop et récupérez jusqu\'à 4 ans de trop-perçu.',
  keywords: 'taxe foncière trop élevée, erreur taxe foncière, contester taxe foncière, coefficient d\'entretien taxe foncière, valeur locative cadastrale, formulaire 6675-M, réduction taxe foncière, calcul taxe foncière, réclamation taxe foncière',
  openGraph: {
    title: 'MATAXE — Votre taxe foncière est-elle trop élevée ?',
    description: '40% des avis contiennent une erreur de base cadastrale. Vérifiez gratuitement et récupérez jusqu\'à 4 ans de trop-perçu.',
    url: 'https://recupeo.fr/mataxe',
    siteName: 'RÉCUPÉO',
    locale: 'fr_FR',
    type: 'website',
      images: [{ url: '/api/og', width: 1200, height: 630, alt: 'RÉCUPÉO' }],
  },
  alternates: {
    canonical: 'https://recupeo.fr/mataxe',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Comment savoir si ma taxe foncière est trop élevée ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La taxe foncière est calculée sur la base de la valeur locative cadastrale (VLC). Si cette VLC est surévaluée, votre taxe est mécaniquement trop élevée. Notre outil compare les données de votre bien avec les paramètres probables de l\'administration.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment obtenir ma fiche d\'évaluation cadastrale (formulaire 6675-M) ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vous pouvez demander ce document gratuitement en ligne sur impots.gouv.fr via la messagerie sécurisée, au guichet du centre des impôts fonciers, ou par courrier. Délai de réponse : 2 à 4 semaines.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quel est le délai pour réclamer un remboursement de taxe foncière ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vous avez jusqu\'au 31 décembre de l\'année suivant la mise en recouvrement. La réclamation peut porter sur l\'année en cours et jusqu\'à 4 années antérieures.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quelles sont les exonérations de taxe foncière ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les exonérations totales concernent les personnes de plus de 75 ans, les bénéficiaires de l\'ASPA, AAH ou ASI (sous conditions de revenus et de résidence principale). Les 65-74 ans bénéficient d\'un dégrèvement de 100€.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment est calculée la surface pondérée ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La surface pondérée est la surface habitable réelle augmentée de m² fictifs pour les équipements (baignoire +3m², chauffage central +2m² par pièce...) et de m² pondérés pour les dépendances (garage, cave, balcon).',
      },
    },
  ],
}

export default function MataxeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  )
}
