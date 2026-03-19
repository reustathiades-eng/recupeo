import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Dépôt de garantie non rendu ? Vérifiez gratuitement | RÉCUPÉO",
  description: "Votre bailleur retient votre caution ? Notre IA analyse votre situation en 2 minutes et calcule ce qu'on vous doit. Pré-diagnostic gratuit.",
  keywords: "dépôt de garantie non rendu, caution non restituée, récupérer caution locataire, pénalités retard dépôt de garantie, retenue abusive caution, vétusté logement, grille de vétusté, lettre mise en demeure caution, commission départementale conciliation",
  openGraph: {
    title: "MACAUTION — Récupérez votre dépôt de garantie",
    description: "Votre bailleur retient votre caution ? Notre IA détecte les retenues abusives et calcule le montant récupérable.",
    url: "https://recupeo.fr/macaution",
    siteName: "RÉCUPÉO",
    locale: "fr_FR",
    type: "website",
      images: [{ url: '/api/og', width: 1200, height: 630, alt: 'RÉCUPÉO' }],
  },
  alternates: {
    canonical: "https://recupeo.fr/macaution",
  },
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quel est le délai légal pour rendre un dépôt de garantie ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le bailleur dispose d'1 mois si l'état des lieux de sortie est conforme à celui d'entrée, ou de 2 mois si des différences sont constatées. Ce délai court à compter de la remise des clés (art. 22 loi 89-462).",
      },
    },
    {
      "@type": "Question",
      name: "Mon bailleur peut-il retenir mon dépôt pour de la peinture ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pas en totalité. La peinture est soumise à la vétusté (usure normale). Avec une durée de vie de 7 à 10 ans et un taux de 14-15% par an après 2 ans de franchise, la part du locataire diminue fortement avec le temps.",
      },
    },
    {
      "@type": "Question",
      name: "Comment calculer les pénalités de retard ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "C'est 10% du loyer mensuel hors charges par mois de retard commencé (art. 22 al. 7). Ces pénalités sont de plein droit, sans mise en demeure préalable.",
      },
    },
    {
      "@type": "Question",
      name: "Que faire si mon bailleur ne rend pas ma caution ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "3 étapes : 1) Envoyez une lettre de mise en demeure en recommandé avec accusé de réception. 2) Si pas de réponse sous 8 jours, saisissez la Commission Départementale de Conciliation (CDC) gratuitement. 3) En dernier recours, saisissez le tribunal judiciaire (sans avocat jusqu'à 5 000 euros).",
      },
    },
    {
      "@type": "Question",
      name: "Qu'est-ce que la grille de vétusté ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "C'est un barème qui détermine l'usure normale des équipements du logement. Chaque élément (peinture, sol, sanitaires) a une durée de vie et un taux d'usure annuel. Plus vous avez occupé le logement longtemps, plus la vétusté est élevée, et moins le bailleur peut retenir.",
      },
    },
  ],
}

export default function MacautionLayout({ children }: { children: React.ReactNode }) {
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
