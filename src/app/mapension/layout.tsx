import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pension alimentaire : calculez ce qu\'on vous doit | RÉCUPÉO',
  description: 'Votre pension alimentaire n\'a pas été indexée ? Calculez gratuitement le montant revalorisé et récupérez jusqu\'à 5 ans d\'arriérés. Formule INSEE officielle.',
  keywords: 'revalorisation pension alimentaire, calcul pension alimentaire indice INSEE, pension alimentaire non revalorisée arriérés, indexation pension alimentaire 2026, simulateur pension alimentaire, récupérer arriérés pension alimentaire',
  alternates: { canonical: 'https://recupeo.fr/mapension' },
}

export default function MapensionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: 'Comment revaloriser une pension alimentaire ?', acceptedAnswer: { '@type': 'Answer', text: "La formule est : Nouveau montant = Ancien montant × (Nouvel indice INSEE / Ancien indice). C'est au débiteur de l'appliquer chaque année." }},
              { '@type': 'Question', name: 'Quel indice INSEE utiliser ?', acceptedAnswer: { '@type': 'Answer', text: "Par défaut, l'indice « Ensemble des ménages — Hors tabac » (série 001763852). Vérifiez votre jugement." }},
              { '@type': 'Question', name: "Combien d'années d'arriérés puis-je récupérer ?", acceptedAnswer: { '@type': 'Answer', text: 'Les arriérés sont récupérables sur 5 ans (prescription quinquennale, article 2224 du Code civil).' }},
              { '@type': 'Question', name: 'Faut-il un nouveau jugement pour la revalorisation ?', acceptedAnswer: { '@type': 'Answer', text: "Non. L'indexation est automatique. Le débiteur doit l'appliquer sans nouveau jugement." }},
              { '@type': 'Question', name: "Qu'est-ce que l'ARIPA ?", acceptedAnswer: { '@type': 'Answer', text: "L'ARIPA (CAF) gère l'intermédiation des pensions alimentaires et applique automatiquement la revalorisation." }},
            ],
          }),
        }}
      />
      {children}
    </>
  )
}
