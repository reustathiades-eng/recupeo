import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Erreur sur votre fiche de paie ? 33% des salariés concernés | RÉCUPÉO',
  description: '33% des salariés ont une erreur sur leur bulletin de paie. Détectez les anomalies en 2 minutes et récupérez jusqu\'à 3 ans de rappels de salaire.',
  keywords: 'erreur bulletin de paie, rappel salaire, heures supplémentaires non payées, minimum conventionnel, audit fiche de paie, réclamer salaire employeur, prud\'hommes salaire 2026',
  alternates: { canonical: 'https://recupeo.fr/mapaie' },
}

export default function MapaieLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: 'Comment savoir si j\'ai des erreurs sur ma fiche de paie ?', acceptedAnswer: { '@type': 'Answer', text: "Vérifiez que votre salaire brut est au moins égal au SMIC (1 801,80 € brut/mois en 2026 pour un temps plein), que les heures supplémentaires sont majorées (25 % pour les 8 premières, 50 % au-delà), et que le net correspond au brut après déduction des cotisations légales (env. 22 %)." }},
              { '@type': 'Question', name: 'Sur combien d\'années peut-on réclamer un rappel de salaire ?', acceptedAnswer: { '@type': 'Answer', text: "3 ans. La prescription des salaires est fixée à 3 ans par l'article L.3245-1 du Code du travail, à compter de la date à laquelle le salaire aurait dû être versé." }},
              { '@type': 'Question', name: 'Qu\'est-ce qu\'un minimum conventionnel ?', acceptedAnswer: { '@type': 'Answer', text: "Le salaire minimum prévu par votre convention collective, souvent supérieur au SMIC. Si votre employeur vous paie en dessous de ce minimum, il vous doit un rappel de salaire pour chaque mois sous-payé." }},
              { '@type': 'Question', name: 'Comment réclamer des heures supplémentaires non payées ?', acceptedAnswer: { '@type': 'Answer', text: "Envoyez une LRAR à votre employeur en réclamant le paiement majoré (25 % pour les 8 premières heures, 50 % au-delà). En cas de refus, saisissez le Conseil de prud'hommes. La prescription est de 3 ans." }},
              { '@type': 'Question', name: 'Puis-je réclamer même si je suis encore en poste ?', acceptedAnswer: { '@type': 'Answer', text: "Oui. La réclamation de salaires impayés est un droit fondamental. Votre employeur ne peut pas vous licencier pour avoir exercé ce droit. La procédure est protégée par le Code du travail." }},
              { '@type': 'Question', name: 'C\'est quoi le délai pour saisir les prud\'hommes ?', acceptedAnswer: { '@type': 'Answer', text: "2 ans pour les litiges relatifs à l'exécution du contrat de travail (art. L.1471-1 du Code du travail). Pour les rappels de salaire spécifiquement, la prescription est de 3 ans." }},
            ],
          }),
        }}
      />
      {children}
    </>
  )
}
