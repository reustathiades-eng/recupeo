import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Votre loyer est-il trop cher ? Vérifiez gratuitement | RÉCUPÉO',
  description: 'Vérifiez en 30 secondes si votre loyer dépasse le plafond légal. 69 villes concernées. Calcul gratuit du trop-perçu récupérable.',
  keywords: 'encadrement des loyers, vérifier loyer trop cher, simulateur encadrement loyers, loyer de référence majoré, contester loyer, trop-perçu loyer, encadrement loyers Paris, encadrement loyers Lyon, encadrement loyers Lille',
  openGraph: {
    title: 'MONLOYER — Votre loyer est-il trop cher ?',
    description: '30 à 37% des annonces ne respectent pas l\'encadrement des loyers. Vérifiez gratuitement et calculez le montant récupérable.',
    url: 'https://recupeo.fr/monloyer',
    siteName: 'RÉCUPÉO',
    locale: 'fr_FR',
    type: 'website',
      images: [{ url: '/api/og', width: 1200, height: 630, alt: 'RÉCUPÉO' }],
  },
  alternates: {
    canonical: 'https://recupeo.fr/monloyer',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quelles villes sont concernées par l\'encadrement des loyers en 2026 ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '69 communes réparties sur 9 territoires : Paris, Lille, Plaine Commune, Lyon et Villeurbanne, Est Ensemble, Montpellier, Bordeaux, Pays Basque (24 communes) et Grenoble Métropole (21 communes).',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment savoir si mon loyer est trop cher ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le loyer hors charges ne doit pas dépasser le loyer de référence majoré fixé par arrêté préfectoral. Ce plafond dépend de la localisation, du nombre de pièces, de l\'époque de construction, du type de location et du type de bien.',
      },
    },
    {
      '@type': 'Question',
      name: 'Combien puis-je récupérer si mon loyer dépasse le plafond ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vous pouvez récupérer la différence entre votre loyer et le plafond, multipliée par le nombre de mois depuis la signature du bail. La prescription est de 3 ans maximum.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment contester un loyer trop élevé ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La procédure comporte 3 étapes : mise en demeure du bailleur par lettre recommandée, saisine de la Commission Départementale de Conciliation (gratuite), puis signalement à la préfecture en dernier recours.',
      },
    },
    {
      '@type': 'Question',
      name: 'Puis-je contester mon loyer même si j\'ai signé le bail ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui. L\'encadrement des loyers est d\'ordre public : le bailleur ne peut pas y déroger, même avec l\'accord du locataire. La prescription pour le remboursement du trop-perçu est de 3 ans.',
      },
    },
  ],
}

export default function MonloyerLayout({ children }: { children: React.ReactNode }) {
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
