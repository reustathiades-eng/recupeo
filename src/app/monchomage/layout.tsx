import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Allocation chômage mal calculée ? Vérifiez gratuitement | RÉCUPÉO',
  description: "Erreurs fréquentes dans le calcul de l'ARE : primes oubliées, SJR sous-estimé, dégressivité injustifiée. Vérifiez en 2 minutes et récupérez ce qu'on vous doit.",
  keywords: 'erreur calcul chômage, vérifier allocation ARE, SJR allocation chômage, contester France Travail, primes oubliées chômage, dégressivité ARE, allocation chômage mal calculée 2026',
  alternates: { canonical: 'https://recupeo.fr/monchomage' },
}

export default function MonchomageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: 'Comment vérifier le calcul de mon allocation chômage ?', acceptedAnswer: { '@type': 'Answer', text: "Comparez le SJR sur votre notification avec vos bulletins de paie. Le SJR = salaire de référence / jours calendaires. Vérifiez que primes et 13ème mois sont inclus." }},
              { '@type': 'Question', name: "Qu'est-ce que le SJR ?", acceptedAnswer: { '@type': 'Answer', text: "Le Salaire Journalier de Référence est la base du calcul de l'ARE. Il correspond au total des rémunérations brutes divisé par le nombre de jours calendaires de la période de référence." }},
              { '@type': 'Question', name: 'Les primes sont-elles prises en compte dans le calcul du chômage ?', acceptedAnswer: { '@type': 'Answer', text: "Oui. Primes, 13ème mois, gratifications et heures supplémentaires doivent être inclus. Les indemnités de licenciement et de congés payés sont exclues." }},
              { '@type': 'Question', name: 'Comment contester une notification de France Travail ?', acceptedAnswer: { '@type': 'Answer', text: "Courrier à l'agence avec bulletins de paie. Si refus sous 2 mois, saisine du médiateur (mediateur@francetravail.fr). Dernier recours : tribunal judiciaire." }},
              { '@type': 'Question', name: 'Mon allocation chômage est-elle dégressive ?', acceptedAnswer: { '@type': 'Answer', text: "La dégressivité de 30% s'applique au 7ème mois si SJR > 159,68€/jour. Les 55 ans et plus en sont exemptés." }},
              { '@type': 'Question', name: "Combien de temps ai-je pour contester ?", acceptedAnswer: { '@type': 'Answer', text: "2 ans (prescription biennale en matière de sécurité sociale)." }},
            ],
          }),
        }}
      />
      {children}
    </>
  )
}
