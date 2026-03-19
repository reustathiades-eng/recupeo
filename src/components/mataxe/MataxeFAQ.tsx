'use client'
import { useState } from 'react'

const FAQ_ITEMS = [
  {
    q: 'Comment savoir si ma taxe foncière est trop élevée ?',
    a: 'La taxe foncière est calculée sur la base de la valeur locative cadastrale (VLC) de votre bien. Si cette VLC est surévaluée (catégorie trop élevée, surface pondérée incorrecte, coefficient d\'entretien surestimé), votre taxe est mécaniquement trop élevée. Notre outil compare les données de votre bien avec les paramètres de calcul probables de l\'administration pour détecter ces écarts.',
  },
  {
    q: 'Comment obtenir ma fiche d\'évaluation cadastrale (formulaire 6675-M) ?',
    a: 'Vous pouvez demander ce document gratuitement : 1) En ligne sur impots.gouv.fr → Messagerie sécurisée → "Je souhaite obtenir la fiche d\'évaluation de mon bien". 2) Au guichet du centre des impôts fonciers de votre commune. 3) Par courrier au Service des Impôts des Particuliers. Le délai de réponse est de 2 à 4 semaines.',
  },
  {
    q: 'Qu\'est-ce que la valeur locative cadastrale (VLC) ?',
    a: 'La VLC est le loyer théorique annuel que pourrait produire votre bien s\'il était loué dans des conditions normales, selon les critères de l\'administration. Elle est calculée à partir de la surface pondérée, de la catégorie cadastrale, du coefficient d\'entretien et du coefficient de situation. Ces bases datent de 1970 et n\'ont jamais été révisées, d\'où les nombreuses erreurs.',
  },
  {
    q: 'Comment contester sa taxe foncière ?',
    a: 'La procédure se fait en 3 étapes : 1) Obtenir le formulaire 6675-M pour connaître les paramètres retenus par l\'administration. 2) Identifier les erreurs (surface, catégorie, entretien, équipements). 3) Adresser une réclamation en ligne via impots.gouv.fr (messagerie sécurisée) ou par courrier recommandé au centre des impôts fonciers. Notre rapport génère cette réclamation automatiquement.',
  },
  {
    q: 'Quel est le délai pour réclamer un remboursement ?',
    a: 'Vous avez jusqu\'au 31 décembre de l\'année suivant la mise en recouvrement de l\'avis. La réclamation peut porter sur l\'année en cours et jusqu\'à 4 années antérieures. Par exemple, en 2026, vous pouvez contester les avis de 2022 à 2026.',
  },
  {
    q: 'Qu\'est-ce que le coefficient d\'entretien ?',
    a: 'Le coefficient d\'entretien traduit l\'état de conservation du bien. Il varie de 0,80 (mauvais état) à 1,20 (très bon état). L\'administration utilise souvent un coefficient de 1,10 (bon) par défaut, même pour des logements en état passable ou médiocre. Cette surévaluation gonfle la VLC de 10 à 20%.',
  },
  {
    q: 'Peut-on être remboursé sur les années passées ?',
    a: 'Oui. Si votre réclamation aboutit, le remboursement est rétroactif sur l\'année en cours plus les années antérieures (jusqu\'à 4 ans au total). Si l\'administration reconnaît une erreur de 500€/an, vous pouvez récupérer jusqu\'à 2 000€ sur 4 ans.',
  },
  {
    q: 'Quelles sont les exonérations de taxe foncière ?',
    a: 'Les exonérations totales concernent les personnes de plus de 75 ans, les bénéficiaires de l\'ASPA, AAH ou ASI (sous conditions de revenus et de résidence principale). Les dégrèvements partiels (100€) s\'appliquent aux 65-74 ans. Les constructions neuves bénéficient d\'une exonération de 2 ans. Les rénovations énergétiques peuvent aussi ouvrir droit à des exonérations temporaires selon la commune.',
  },
  {
    q: 'Comment est calculée la surface pondérée ?',
    a: 'La surface pondérée est la surface habitable réelle augmentée de m² fictifs pour les équipements (baignoire +3m², douche +2m², WC +1m², chauffage central +2m² par pièce...) et de m² pondérés pour les dépendances (garage, cave, balcon). C\'est cette surface pondérée, et non la surface habitable, qui sert de base au calcul de la VLC.',
  },
  {
    q: 'La suppression d\'une salle de bain réduit-elle la taxe foncière ?',
    a: 'Oui, en théorie. Chaque équipement supprimé devrait réduire les m² fictifs de la surface pondérée (baignoire = -3m², douche = -2m², lavabo = -1m²). Mais l\'administration ne met jamais à jour ces données automatiquement : il faut déclarer la modification via le formulaire de mise à jour cadastrale. Tant que ce n\'est pas fait, les m² fictifs restent comptés.',
  },
]

export function MataxeFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text mb-3">
            Questions fréquentes
          </h2>
          <p className="text-slate-muted text-base">
            Tout savoir sur la taxe foncière et comment vérifier votre avis
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-slate-bg rounded-xl border border-slate-border overflow-hidden transition-all">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
              >
                <span className="font-semibold text-slate-text text-sm leading-relaxed">{item.q}</span>
                <svg
                  className={`w-5 h-5 text-slate-muted flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-sm text-slate-muted leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
