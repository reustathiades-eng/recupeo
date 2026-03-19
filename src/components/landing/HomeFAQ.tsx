'use client'
import { useState } from 'react'

const FAQ_ITEMS = [
  {
    q: "C\u0027est vraiment gratuit au début ?",
    a: "Oui. Le pré-diagnostic est toujours gratuit, sur toutes nos briques. Vous voyez immédiatement s\u0027il y a un montant récupérable. Le rapport complet avec les courriers est payant uniquement si des anomalies sont détectées.",
  },
  {
    q: "Qu\u0027est-ce que je reçois dans le rapport payant ?",
    a: "Un dossier complet : analyse détaillée de chaque anomalie avec l\u0027article de loi applicable, le montant exact récupérable à l\u0027euro près, et 2 à 3 courriers juridiques préremplis (mise en demeure, réclamation, médiateur) prêts à signer et envoyer.",
  },
  {
    q: "Mes données sont-elles en sécurité ?",
    a: "Toutes vos données personnelles sont anonymisées avant d\u0027être envoyées à l\u0027IA. Le serveur est hébergé chez OVH en France, soumis au RGPD. Aucune donnée n\u0027est revendue à des tiers. Suppression sur simple demande.",
  },
  {
    q: "L\u0027IA est-elle fiable ?",
    a: "Notre IA (Claude, Anthropic) est spécialisée en droit français. Elle cite systématiquement ses sources juridiques. Et surtout, chaque rapport inclut une section \u00ab\u00a0limites de l\u0027analyse\u00a0\u00bb : on vous dit ce qu\u0027on sait et ce qu\u0027on ne peut pas vérifier.",
  },
  {
    q: "RÉCUPÉO remplace-t-il un avocat ?",
    a: "Non. RÉCUPÉO est un outil d\u0027aide qui détecte les anomalies et prépare votre dossier. Dans la majorité des cas, les courriers suffisent. Si votre situation nécessite un avocat, notre rapport vous donne tous les éléments pour le consulter efficacement.",
  },
  {
    q: "Comment fonctionne le remboursement ?",
    a: "Satisfait ou remboursé 14 jours, sans justification. Il vous suffit d\u0027envoyer un email à contact@recupeo.fr avec votre numéro de commande.",
  },
  {
    q: "Qui est derrière RÉCUPÉO ?",
    a: "RÉCUPÉO est un service français basé à Riom (Puy-de-Dôme). Micro-entreprise enregistrée. Toutes les informations légales sont disponibles sur notre page Mentions légales.",
  },
  {
    q: "Quels domaines couvrez-vous ?",
    a: "Aujourd\u0027hui : dépôt de garantie (MACAUTION), pension retraite (RETRAITIA), encadrement des loyers (MONLOYER), taxe foncière (MATAXE) et pension alimentaire (MAPENSION). D\u0027autres briques arrivent prochainement.",
  },
]

export function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-24 px-6 bg-slate-bg border-t border-slate-border" id="faq-home">
      {/* JSON-LD FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_ITEMS.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }),
        }}
      />

      <div className="max-w-[760px] mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-muted bg-white border border-slate-border rounded-full">
            Questions fréquentes
          </span>
          <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-extrabold text-navy mt-4 tracking-tight">
            Vos questions, nos réponses
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i} className="bg-white rounded-xl border border-slate-border overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-bg/50 transition-colors"
                >
                  <span className="font-heading text-[15px] font-bold text-navy pr-4">{item.q}</span>
                  <svg
                    className={`w-5 h-5 text-slate-muted shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="px-5 pb-5 text-sm text-slate-muted leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
