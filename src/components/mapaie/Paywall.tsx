'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'
import { fmt } from '@/lib/format'

interface PaywallProps {
  onSelect?: (plan: 'trimestre' | 'annuel') => void
  defaultPlan?: 'trimestre' | 'annuel'
}

const PLANS = {
  trimestre: {
    id: 'trimestre' as const,
    label: '3 mois',
    price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_3M ?? '',
    badge: null,
    features: [
      'Analyse de 3 bulletins de paie',
      'Détection des 8 erreurs fréquentes',
      'Rapport PDF détaillé',
      'Calcul des rappels de salaire',
      'Références légales et jurisprudence',
    ],
    missing: ['Audit 12 mois complet', 'Courrier de réclamation prêt à envoyer'],
  },
  annuel: {
    id: 'annuel' as const,
    label: '12 mois',
    price: 129,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_12M ?? '',
    badge: 'Recommandé',
    features: [
      'Analyse de 12 bulletins de paie',
      'Détection des 8 erreurs fréquentes',
      'Rapport PDF détaillé',
      'Calcul des rappels de salaire',
      'Références légales et jurisprudence',
      'Courrier de réclamation prêt à envoyer',
      'Couverture prescription 3 ans maximisée',
    ],
    missing: [],
  },
}

export default function Paywall({ onSelect, defaultPlan = 'annuel' }: PaywallProps) {
  const [selected, setSelected] = useState<'trimestre' | 'annuel'>(defaultPlan)
  const [loading, setLoading] = useState(false)

  const handleSelect = (plan: 'trimestre' | 'annuel') => {
    setSelected(plan)
    track({ event: 'mapaie_plan_select', brique: 'mapaie', plan })
  }

  const handlePay = async () => {
    setLoading(true)
    track({ event: 'mapaie_checkout_start', brique: 'mapaie', plan: selected, price: PLANS[selected].price })
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: PLANS[selected].priceId, plan: selected }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
    onSelect?.(selected)
  }

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="font-body text-sm font-semibold uppercase tracking-widest text-[#00D68F] mb-3">Récupérez ce qui vous est dû</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1426] mb-4">
          En moyenne, <span className="text-[#00D68F]">{fmt(1800)}&nbsp;€ à {fmt(7200)}&nbsp;€</span> récupérables
        </h2>
        <p className="font-body text-[#64748B] max-w-xl mx-auto">
          33&nbsp;% des salariés ont une erreur sur leur fiche de paie. Choisissez votre audit — votre investissement est couvert dès la première anomalie détectée.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
        {(Object.values(PLANS) as typeof PLANS[keyof typeof PLANS][]).map((plan) => {
          const active = selected === plan.id
          return (
            <button
              key={plan.id}
              onClick={() => handleSelect(plan.id)}
              className={`relative text-left rounded-2xl border-2 p-6 transition-all focus:outline-none ${active ? 'border-[#00D68F] bg-white shadow-lg' : 'border-[#E2E8F0] bg-[#F7F9FC] hover:border-[#00D68F]/50'}`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-6 bg-[#00D68F] text-[#0B1426] text-xs font-bold font-body px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-end gap-2 mb-1">
                <span className="font-heading text-4xl font-bold text-[#0B1426]">{plan.price}&nbsp;€</span>
                <span className="font-body text-[#64748B] mb-1">/ {plan.label}</span>
              </div>
              <p className="font-body text-xs text-[#64748B] mb-5">
                {plan.id === 'annuel' ? `soit ${fmt(Math.round(plan.price / 12 * 100) / 100)}&nbsp;€/mois` : `audit ponctuel`}
              </p>
              <ul className="space-y-2 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 font-body text-sm text-[#1E293B]">
                    <span className="text-[#00D68F] mt-0.5 shrink-0">✓</span>{f}
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2 font-body text-sm text-[#94A3B8] line-through">
                    <span className="mt-0.5 shrink-0">✗</span>{f}
                  </li>
                ))}
              </ul>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-[#00D68F] bg-[#00D68F]' : 'border-[#CBD5E1]'}`}>
                {active && <span className="w-2 h-2 rounded-full bg-white block" />}
              </div>
            </button>
          )
        })}
      </div>

      <div className="max-w-3xl mx-auto">
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-[#00D68F] hover:bg-[#00C07E] disabled:opacity-60 text-[#0B1426] font-heading font-bold text-lg rounded-xl py-4 px-8 transition-colors shadow-md"
        >
          {loading ? 'Redirection…' : `Commencer mon audit — ${PLANS[selected].price}\u00a0€`}
        </button>
        <p className="font-body text-xs text-[#64748B] text-center mt-3">
          Paiement sécurisé par Stripe · Satisfait ou remboursé 14 jours · Aucun abonnement
        </p>
      </div>
    </section>
  )
}