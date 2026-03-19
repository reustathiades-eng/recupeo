import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Erreur pension retraite ? Vérifiez gratuitement | RÉCUPÉO",
  description: "1 pension sur 7 contient une erreur. Notre IA analyse votre profil retraite en 2 minutes et détecte les trimestres oubliés, majorations manquantes et erreurs de calcul.",
  keywords: "erreur pension retraite, trimestres manquants retraite, vérifier pension retraite, majoration enfants retraite, décote retraite, relevé carrière RIS, contester pension CARSAT, service militaire trimestres, minimum contributif, 25 meilleures années retraite",
  openGraph: {
    title: "RETRAITIA — Votre pension est-elle correcte ?",
    description: "1 pension sur 7 contient une erreur au détriment du retraité. Vérifiez la vôtre gratuitement.",
    url: "https://recupeo.fr/retraitia",
    siteName: "RÉCUPÉO",
    locale: "fr_FR",
    type: "website",
      images: [{ url: '/api/og', width: 1200, height: 630, alt: 'RÉCUPÉO' }],
  },
  alternates: {
    canonical: "https://recupeo.fr/retraitia",
  },
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Comment savoir si ma pension est bien calculée ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le meilleur moyen est de vérifier votre Relevé Individuel de Situation (RIS) sur info-retraite.fr. Ce document récapitule tous vos trimestres et salaires déclarés. Notre outil analyse ces données pour détecter les anomalies fréquentes.",
      },
    },
    {
      "@type": "Question",
      name: "Quelles sont les erreurs les plus fréquentes sur les pensions ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "D'après la Cour des Comptes, les erreurs les plus courantes sont : les trimestres cotisés non reportés, le service militaire non comptabilisé, les périodes de chômage ou maladie oubliées, la majoration pour enfants non appliquée (+10% pour 3 enfants ou plus), et le minimum contributif non versé.",
      },
    },
    {
      "@type": "Question",
      name: "Le service militaire compte-t-il pour la retraite ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui. Chaque période de 90 jours de service national donne droit à 1 trimestre assimilé. Un service de 12 mois équivaut à 4 trimestres. Mais ces trimestres ne sont pas toujours reportés automatiquement : il faut souvent en faire la demande.",
      },
    },
    {
      "@type": "Question",
      name: "Qu'est-ce que la majoration pour enfants ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Si vous avez élevé au moins 3 enfants, votre pension de base CNAV est majorée de 10%. L'Agirc-Arrco accorde aussi une majoration de 10% pour 3 enfants (plafonné). Cette majoration n'est pas toujours appliquée automatiquement.",
      },
    },
    {
      "@type": "Question",
      name: "Quel est le délai pour contester ma pension ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vous pouvez demander une révision de votre pension à tout moment pour une erreur de calcul ou un trimestre manquant. Il n'y a pas de prescription pour les erreurs matérielles de la caisse. Pour les rappels d'arrérages, le délai est de 2 ans.",
      },
    },
  ],
}

export default function RetraitiaLayout({ children }: { children: React.ReactNode }) {
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
