'use client'
import { useState } from 'react'

const FAQ_ITEMS = [
  {
    q: 'Quelles villes sont concernées par l\'encadrement des loyers en 2026 ?',
    a: '69 communes réparties sur 9 territoires : Paris (depuis 2019), Lille/Hellemmes/Lomme, Plaine Commune (9 communes), Lyon et Villeurbanne, Est Ensemble (9 communes), Montpellier, Bordeaux, Pays Basque (24 communes depuis 2024) et Grenoble Métropole (21 communes depuis 2025).',
  },
  {
    q: 'Comment savoir si mon loyer est trop cher ?',
    a: 'Le loyer hors charges ne doit pas dépasser le "loyer de référence majoré" fixé par arrêté préfectoral. Ce plafond dépend de 5 critères : localisation (quartier), nombre de pièces, époque de construction, type de location (vide ou meublé) et type de bien. Notre outil compare votre loyer à ce plafond.',
  },
  {
    q: 'Qu\'est-ce que le loyer de référence majoré ?',
    a: 'Le loyer de référence majoré est le plafond légal. Il correspond au loyer médian du quartier (loyer de référence) majoré de 20%. Il est fixé chaque année par arrêté préfectoral. Vous pouvez le trouver sur le simulateur officiel de votre ville.',
  },
  {
    q: 'Combien puis-je récupérer si mon loyer dépasse le plafond ?',
    a: 'Vous pouvez récupérer la différence entre votre loyer et le plafond, multipliée par le nombre de mois depuis la signature du bail. La prescription est de 3 ans. Par exemple : un dépassement de 200 euros/mois sur 24 mois = 4 800 euros récupérables.',
  },
  {
    q: 'Comment contester un loyer trop élevé ?',
    a: 'La procédure comporte 3 étapes : 1) Mise en demeure du bailleur par lettre recommandée (délai 15 jours). 2) Saisine de la Commission Départementale de Conciliation (CDC), procédure gratuite. 3) En dernier recours, signalement à la préfecture (amende de 5 000 ou 15 000 euros pour le bailleur).',
  },
  {
    q: 'Qu\'est-ce qu\'un complément de loyer ? Est-ce légal ?',
    a: 'Le bailleur peut appliquer un complément de loyer SI le logement présente des caractéristiques exceptionnelles (terrasse, vue, prestations luxueuses) ET si le loyer de base est fixé au loyer de référence majoré. C\'est interdit pour les logements DPE F ou G. En pratique, beaucoup de compléments sont abusifs et contestables.',
  },
  {
    q: 'Quelle est l\'amende pour un propriétaire qui ne respecte pas l\'encadrement ?',
    a: 'Le propriétaire qui refuse de se conformer risque une amende administrative de 5 000 euros (personne physique) ou 15 000 euros (personne morale). Cette amende est prononcée par le préfet après signalement.',
  },
  {
    q: 'Puis-je contester mon loyer même si j\'ai signé le bail ?',
    a: 'Oui ! La signature du bail ne vous empêche pas de contester un loyer qui dépasse le plafond légal. L\'encadrement des loyers est d\'ordre public : le bailleur ne peut pas y déroger, même avec votre accord.',
  },
  {
    q: 'Quel est le délai pour contester un loyer excessif ?',
    a: 'La prescription est de 3 ans pour le remboursement du trop-perçu. Vous pouvez donc réclamer le remboursement des 36 derniers mois de trop-perçu. Plus vous agissez tôt, plus le montant récupérable est important.',
  },
  {
    q: 'L\'encadrement des loyers s\'applique-t-il aux meublés ?',
    a: 'Oui, l\'encadrement s\'applique aux locations meublées comme aux locations vides. Les loyers de référence sont même généralement plus élevés pour les meublés. Vérifiez en sélectionnant "Meublé" dans notre formulaire.',
  },
]

export function MonloyerFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text mb-3">
            Questions fréquentes
          </h2>
          <p className="text-slate-muted text-base">
            Tout savoir sur l&apos;encadrement des loyers et vos droits
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
