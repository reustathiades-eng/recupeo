'use client'
import { useState } from 'react'

const FAQ_ITEMS = [
  {
    q: 'Quel est le délai légal pour rendre un dépôt de garantie ?',
    a: "Le bailleur dispose d'1 mois si l'état des lieux de sortie est conforme à celui d'entrée, ou de 2 mois si des différences sont constatées. Ce délai court à compter de la remise des clés (art. 22 loi 89-462).",
  },
  {
    q: 'Mon bailleur peut-il retenir mon dépôt pour de la peinture ?',
    a: "Pas en totalité ! La peinture est soumise à la vétusté (usure normale). Avec une durée de vie de 7 à 10 ans et un taux de 14-15% par an après 2 ans de franchise, la part du locataire diminue fortement avec le temps. Par exemple, après 8 ans, la vétusté est de 90% : sur 600€ de travaux, le locataire ne doit que 60€.",
  },
  {
    q: 'Comment calculer les pénalités de retard ?',
    a: "C'est 10% du loyer mensuel hors charges par mois de retard commencé (art. 22 al. 7). Exemple : loyer 800€ HC, 4 mois de retard = 4 × 80€ = 320€ de pénalités. Ces pénalités sont de plein droit, sans mise en demeure préalable.",
  },
  {
    q: 'Que faire si mon bailleur ne rend pas ma caution ?',
    a: "3 étapes : 1) Envoyez une lettre de mise en demeure en recommandé avec accusé de réception. 2) Si pas de réponse sous 8 jours, saisissez la Commission Départementale de Conciliation (CDC) — c'est gratuit. 3) En dernier recours, saisissez le tribunal judiciaire (sans avocat jusqu'à 5 000€).",
  },
  {
    q: "Qu'est-ce que la grille de vétusté ?",
    a: "C'est un barème qui détermine l'usure normale des équipements du logement. Chaque élément (peinture, sol, sanitaires...) a une durée de vie et un taux d'usure annuel. Plus vous avez occupé le logement longtemps, plus la vétusté est élevée, et moins le bailleur peut retenir.",
  },
  {
    q: 'Puis-je saisir la CDC sans avocat ?',
    a: "Oui, la saisine de la Commission Départementale de Conciliation est gratuite et ne nécessite pas d'avocat. C'est une procédure amiable qui aboutit dans environ 50% des cas. Notre pack courriers à 49€ inclut le courrier de saisine pré-rempli.",
  },
  {
    q: 'Ce pré-diagnostic est-il un avis juridique ?',
    a: "Non. Ce pré-diagnostic est un outil d'aide basé sur le droit français en vigueur. Il ne constitue pas un avis juridique ni un conseil personnalisé d'avocat. Pour les cas complexes, nous vous recommandons de consulter un professionnel du droit.",
  },
]

export function MacautionFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text mb-3">
            Questions fréquentes
          </h2>
          <p className="text-slate-muted text-base">
            Tout savoir sur le dépôt de garantie et vos droits
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
