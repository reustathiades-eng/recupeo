import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frais bancaires abusifs ? Vérifiez gratuitement vos plafonds | RÉCUPÉO',
  description: '17% des banques en infraction sur les frais. Vérifiez en 2 minutes si votre banque dépasse les plafonds légaux et récupérez le trop-perçu.',
  keywords: 'frais bancaires abusifs, commission intervention plafond, contester frais bancaires, remboursement frais bancaires, médiateur bancaire, client fragile banque, plafond frais incidents bancaires 2026',
  alternates: { canonical: 'https://recupeo.fr/mabanque' },
}

export default function MabanqueLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: 'Quels sont les plafonds légaux des frais bancaires ?', acceptedAnswer: { '@type': 'Answer', text: "Commissions d'intervention : 8€/opération et 80€/mois (standard), 4€/opération et 20€/mois (client fragile). Rejets de prélèvement : 20€ max. Rejets de chèque : 30€ (≤ 50€) ou 50€ (> 50€)." }},
              { '@type': 'Question', name: 'Comment contester des frais bancaires abusifs ?', acceptedAnswer: { '@type': 'Answer', text: "Contactez d'abord votre conseiller, puis réclamation écrite au service clientèle, puis saisine du médiateur bancaire (gratuit, 70% d'issue favorable). En parallèle : signalement sur signalconso.gouv.fr." }},
              { '@type': 'Question', name: "Qu'est-ce qu'une commission d'intervention ?", acceptedAnswer: { '@type': 'Answer', text: "Frais facturé par la banque pour traiter une opération qui entraînerait un dépassement de découvert. Plafonnée à 8€/opération et 80€/mois." }},
              { '@type': 'Question', name: 'Suis-je un client fragile financièrement ?', acceptedAnswer: { '@type': 'Answer', text: "Vous êtes fragile si : inscrit au FCC depuis 3+ mois, dossier de surendettement en cours, ou 5+ incidents de paiement en un mois. La banque doit plafonner vos frais à 25€/mois." }},
              { '@type': 'Question', name: 'Les virements instantanés sont-ils gratuits ?', acceptedAnswer: { '@type': 'Answer', text: "Oui, depuis le 9 janvier 2025. Toute facturation est contraire à la réglementation européenne." }},
              { '@type': 'Question', name: 'Combien de temps ai-je pour contester des frais bancaires ?', acceptedAnswer: { '@type': 'Answer', text: "5 ans (prescription quinquennale, article 2224 du Code civil)." }},
            ],
          }),
        }}
      />
      {children}
    </>
  )
}
