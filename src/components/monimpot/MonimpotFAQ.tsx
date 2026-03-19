'use client'
import { useState } from 'react'

const FAQS = [
  { q: "Comment savoir si je paie trop d'impôts ?", a: "Uploadez votre avis d'imposition (PDF depuis impots.gouv.fr ou photo). Notre IA extrait automatiquement vos données et détecte les cases oubliées en 30 secondes. Vous n'avez plus que 4 à 7 questions à renseigner — contre 20 auparavant." },
  { q: 'Quand est-il avantageux de déclarer les frais réels ?', a: "Les frais réels sont avantageux quand ils dépassent l'abattement forfaitaire de 10% sur les salaires. C'est souvent le cas si vous faites plus de 30 km aller pour votre travail, ou si vous avez des frais professionnels importants." },
  { q: "Qu'est-ce que la case T et à qui s'adresse-t-elle ?", a: "La case T concerne les parents isolés : si vous êtes célibataire, divorcé(e) ou séparé(e), et que vous vivez seul(e) avec au moins un enfant à charge, vous bénéficiez d'une demi-part supplémentaire. L'économie peut atteindre 1 759€/an." },
  { q: 'Peut-on récupérer des impôts payés en trop les années précédentes ?', a: "Oui ! Vous pouvez corriger votre déclaration en ligne (été-automne) ou déposer une réclamation contentieuse auprès de votre centre des impôts. Le délai est de 3 ans : en 2026, vous pouvez corriger les déclarations 2023, 2024 et 2025. En uploadant vos 3 avis, notre IA compare les années et détecte les cases perdues d'une année à l'autre." },
  { q: 'Comment corriger une erreur sur ma déclaration de revenus ?', a: "Connectez-vous sur impots.gouv.fr → \"Corriger ma déclaration\". Si le délai de correction en ligne est dépassé, vous pouvez envoyer une réclamation contentieuse par courrier recommandé. Notre service premium génère cette réclamation pré-remplie avec votre numéro fiscal et l'adresse de votre centre des impôts." },
  { q: "Le crédit d'impôt emploi à domicile : comment en bénéficier ?", a: "Si vous employez quelqu'un à domicile (ménage, garde d'enfants, aide aux personnes âgées, jardinage...), vous bénéficiez d'un crédit d'impôt de 50% des dépenses, plafonné à 12 000€/an. Il faut déclarer les sommes en case 7DB ou 7DL." },
  { q: "Qu'est-ce que la case 2OP et faut-il la cocher ?", a: "La case 2OP permet d'opter pour le barème progressif au lieu du prélèvement forfaitaire unique (PFU) de 30% sur les revenus de capitaux. Elle est avantageuse si votre taux marginal d'imposition est inférieur à 30%. Notre outil le détecte automatiquement." },
  { q: "L'abattement pour les seniors de plus de 65 ans est-il automatique ?", a: "L'abattement seniors (2 746€ ou 1 373€ selon le revenu fiscal de référence) est normalement appliqué automatiquement par l'administration. Cependant, il est parfois oublié. Notre outil utilise votre RFR réel (extrait de l'avis) pour vérifier qu'il est bien pris en compte." },
  { q: 'Comment déduire une pension alimentaire de ses impôts ?', a: "Si vous versez une pension alimentaire (suite à un jugement ou une convention), vous pouvez la déduire de votre revenu imposable. Le plafond est de 6 674€ par enfant majeur et par an. Il faut la déclarer en case 6EL ou 6EM." },
  { q: 'Quels frais professionnels puis-je déduire en frais réels ?', a: "Trajets domicile-travail (barème km), frais de repas (différence avec le forfait), frais de télétravail (2,70€/jour), frais de formation, cotisations syndicales, achats professionnels... Tous doivent être justifiés et déclarés en case 1AK." },
  { q: "Mes données sont-elles en sécurité ?", a: "Oui. Vos documents sont analysés localement (OCR), anonymisés, puis supprimés immédiatement. Votre numéro fiscal est conservé uniquement pour pré-remplir votre réclamation — il n'est jamais envoyé à l'IA. Vous pouvez supprimer toutes vos données à tout moment depuis votre espace client." },
]

export function MonimpotFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-16 bg-white">
      <div className="max-w-[800px] mx-auto px-6">
        <h2 className="font-heading text-2xl font-bold text-navy text-center mb-8">
          Questions fréquentes — Impôt sur le revenu
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
              >
                <span className="font-medium text-sm text-navy pr-4">{faq.q}</span>
                <svg className={`w-4 h-4 text-slate-muted flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 text-sm text-slate-muted leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>

        {/* JSON-LD FAQ */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map(f => ({
            '@type': 'Question', name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        })}} />
      </div>
    </section>
  )
}
