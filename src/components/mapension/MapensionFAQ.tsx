'use client'
import { useState } from 'react'

const FAQS = [
  { q: 'Comment revaloriser une pension alimentaire ?', a: "La plupart des jugements prévoient une clause d'indexation sur un indice INSEE. La formule est : Nouveau montant = Ancien montant × (Nouvel indice / Ancien indice). C'est au débiteur (celui qui paie) de l'appliquer chaque année." },
  { q: 'Quel indice INSEE utiliser ?', a: "Le jugement précise l'indice. En cas de doute, c'est l'indice des prix à la consommation « Ensemble des ménages — Hors tabac » (série 001763852) qui s'applique par défaut. C'est celui utilisé par l'ARIPA." },
  { q: 'Mon ex ne revalorise pas la pension, que faire ?', a: "Envoyez d'abord un courrier amiable avec le calcul détaillé. Sans réponse sous 15 jours, envoyez une mise en demeure en LRAR. En dernier recours, un commissaire de justice peut procéder à un paiement direct (saisie sur salaire)." },
  { q: "Combien d'années d'arriérés puis-je récupérer ?", a: "Les arriérés sont récupérables sur 5 ans (prescription quinquennale, article 2224 du Code civil). Au-delà, les sommes sont prescrites." },
  { q: 'Faut-il un nouveau jugement pour la revalorisation ?', a: "Non. L'indexation est automatique dès lors qu'elle est prévue dans le jugement initial. Vous n'avez pas besoin de repasser devant le juge. Le débiteur doit l'appliquer de lui-même." },
  { q: "Qu'est-ce que l'ARIPA ?", a: "L'ARIPA (Agence de Recouvrement et d'Intermédiation des Pensions Alimentaires) est un service de la CAF. Depuis 2023, elle peut gérer le versement de la pension et applique automatiquement la revalorisation. Vous pouvez la saisir gratuitement sur caf.fr." },
  { q: 'La pension peut-elle baisser avec la revalorisation ?', a: "En théorie, si l'indice INSEE baissait, le montant pourrait diminuer. En pratique, l'indice des prix n'a jamais baissé sur une longue période. La pension ne fait qu'augmenter." },
  { q: 'Le commissaire de justice (huissier), combien ça coûte ?', a: "Les frais de la procédure de paiement direct sont à la charge du débiteur (celui qui ne paie pas). Vous n'avez rien à avancer. Le commissaire de justice prélève directement sur le salaire ou le compte bancaire." },
]

export function MapensionFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-16 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        <h2 className="font-heading text-[clamp(22px,3.5vw,28px)] font-bold text-slate-text text-center mb-8">
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-border overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-text">{faq.q}</span>
                <span className={`text-slate-muted transition-transform ${open === i ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {open === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-slate-muted leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
