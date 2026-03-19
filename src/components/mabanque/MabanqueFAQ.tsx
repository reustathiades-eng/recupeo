'use client'
import { useState } from 'react'

const FAQS = [
  { q: 'Quels sont les plafonds légaux des frais bancaires ?', a: "Les commissions d'intervention sont plafonnées à 8€ par opération et 80€ par mois pour les clients standard. Pour les clients fragiles : 4€/opération et 20€/mois. Les rejets de prélèvement sont plafonnés à 20€ par rejet. Les rejets de chèque : 30€ (chèque ≤ 50€) ou 50€ (chèque > 50€)." },
  { q: 'Comment contester des frais bancaires abusifs ?', a: "Commencez par contacter votre conseiller bancaire. En cas de refus, envoyez une réclamation écrite au service clientèle (LRAR ou email avec AR). Si pas de réponse sous 2 mois, saisissez le médiateur bancaire (gratuit). Vous pouvez aussi signaler sur signalconso.gouv.fr. En dernier recours : tribunal judiciaire (sans avocat pour les litiges < 5 000€)." },
  { q: "Qu'est-ce qu'une commission d'intervention ?", a: "C'est un frais facturé par la banque chaque fois qu'elle doit intervenir sur votre compte pour traiter une opération qui entraînerait un dépassement de découvert autorisé. Elle est plafonnée à 8€ par opération et 80€ par mois. Attention : certaines banques la facturent même sans irrégularité réelle." },
  { q: 'Suis-je un client fragile financièrement ?', a: "Vous êtes considéré comme client fragile si : vous êtes inscrit au Fichier Central des Chèques (FCC) depuis plus de 3 mois, vous avez un dossier de surendettement en cours, ou vous avez eu 5 incidents de paiement ou plus en un mois. Votre banque doit alors automatiquement plafonner vos frais à 25€/mois." },
  { q: 'Comment saisir le médiateur bancaire ?', a: "Le médiateur bancaire est gratuit et obligatoire pour chaque banque. Vous pouvez le saisir en ligne ou par courrier si votre réclamation au service clientèle est restée sans réponse pendant 2 mois ou a été refusée. Le médiateur dispose de 90 jours pour rendre un avis. 70% des médiations aboutissent en faveur du client." },
  { q: 'Ma banque peut-elle facturer plusieurs frais pour un même incident ?', a: "C'est une pratique fréquente mais contestable. Par exemple, pour un seul prélèvement rejeté, la banque peut facturer : une commission d'intervention + des frais de rejet + des agios + une lettre d'information. Si le cumul est disproportionné, vous pouvez contester la multiplication des frais pour un même fait générateur." },
  { q: 'Les virements instantanés sont-ils gratuits ?', a: "Oui, depuis le 9 janvier 2025, les virements instantanés doivent être gratuits en zone euro. Si votre banque vous les facture encore, c'est contraire à la réglementation européenne et vous pouvez exiger le remboursement." },
  { q: 'Combien de temps ai-je pour contester des frais bancaires ?', a: "Vous disposez de 5 ans pour contester des frais bancaires abusifs (prescription quinquennale, article 2224 du Code civil). Cela signifie que vous pouvez réclamer le remboursement de frais facturés jusqu'à 5 ans en arrière." },
  { q: "Qu'est-ce que l'offre spécifique clientèle fragile ?", a: "C'est une offre que chaque banque est obligée de proposer aux clients identifiés comme fragiles. Elle coûte maximum 3€/mois et inclut les services bancaires essentiels avec un plafonnement renforcé : 20€/mois et 200€/an maximum de frais d'incidents. Si vous êtes éligible et que votre banque ne vous l'a pas proposée, c'est une anomalie." },
  { q: 'Comment signaler ma banque à la DGCCRF ?', a: "Rendez-vous sur signalconso.gouv.fr et sélectionnez « Banque / Assurance ». Décrivez les frais abusifs constatés et joignez vos relevés. Ce signalement contribue aux contrôles de la DGCCRF. En 2025, 17% des banques contrôlées présentaient des anomalies." },
]

export function MabanqueFAQ() {
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

export const MABANQUE_FAQ_DATA = FAQS
