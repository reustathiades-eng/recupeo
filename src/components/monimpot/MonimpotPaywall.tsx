'use client'
import { useState, useEffect } from 'react'
import { track } from '@/lib/analytics'
import { getFourchette } from '@/lib/monimpot/utils'
import { ReviewMiniProof } from '@/components/reviews/ReviewMiniProof'

interface Props {
  sensitiveData?: any
  diagnosticId: string
  economie3ans: number
  economieAnnuelle: number
  totalOptimisations: number
}

const PLANS = [
  {
    id: 'monimpot_express',
    label: 'Express',
    price: 1900,
    priceLabel: '19€',
    badge: null,
    features: [
      { text: 'Chaque optimisation chiffrée en détail', included: true },
      { text: 'Cases exactes à modifier sur impots.gouv', included: true },
      { text: 'Rapport PDF téléchargeable', included: true },
      { text: 'Réclamation prête à envoyer (CGI)', included: false },
      { text: 'Guide pas-à-pas correction en ligne', included: false },
      { text: 'Analyse multi-années (3 ans)', included: false },
      { text: 'Accompagnement email 30 jours', included: false },
    ],
  },
  {
    id: 'monimpot_standard',
    label: 'Standard',
    price: 3900,
    priceLabel: '39€',
    badge: 'Recommandé',
    features: [
      { text: 'Chaque optimisation chiffrée en détail', included: true },
      { text: 'Cases exactes à modifier sur impots.gouv', included: true },
      { text: 'Rapport PDF téléchargeable', included: true },
      { text: 'Réclamation prête à envoyer (CGI)', included: true },
      { text: 'Guide pas-à-pas correction en ligne', included: true },
      { text: 'Analyse multi-années (3 ans)', included: false },
      { text: 'Accompagnement email 30 jours', included: false },
    ],
  },
  {
    id: 'monimpot_premium',
    label: 'Premium',
    price: 6900,
    priceLabel: '69€',
    badge: null,
    features: [
      { text: 'Chaque optimisation chiffrée en détail', included: true },
      { text: 'Cases exactes à modifier sur impots.gouv', included: true },
      { text: 'Rapport PDF téléchargeable', included: true },
      { text: 'Réclamation prête à envoyer (CGI)', included: true },
      { text: 'Guide pas-à-pas correction en ligne', included: true },
      { text: 'Analyse multi-années (3 ans)', included: true },
      { text: 'Accompagnement email 30 jours', included: true },
    ],
  },
] as const

export function MonimpotPaywall({ diagnosticId, economie3ans, economieAnnuelle, sensitiveData, totalOptimisations }: Props) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const fourchette = getFourchette(economieAnnuelle)

  useEffect(() => {
    track({ event: 'paywall_viewed', brique: 'monimpot', offers_count: 3, economie: economieAnnuelle })
  }, [economieAnnuelle])

  const handlePurchase = async (planId: string) => {
    setLoadingPlan(planId)
    track({ event: 'purchase_clicked', brique: 'monimpot', plan: planId })
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brique: 'monimpot', plan: planId, diagnosticId }),
      })
      const data = await res.json()
      if (data.success && data.checkoutUrl) {
        if (sensitiveData) {
          try { sessionStorage.setItem(`monimpot_sensitive_${diagnosticId}`, JSON.stringify(sensitiveData)) } catch {}
        }
        window.location.href = data.checkoutUrl
      } else {
        alert(data.error || 'Erreur lors du paiement')
        setLoadingPlan(null)
      }
    } catch {
      alert('Erreur réseau')
      setLoadingPlan(null)
    }
  }

  return (
    <section className="py-12 bg-slate-bg" id="paywall">
      <div className="max-w-[900px] mx-auto px-6">
        <h2 className="font-heading text-2xl font-bold text-navy text-center mb-2">
          Débloquez votre audit personnalisé
        </h2>
        <p className="text-slate-muted text-sm text-center mb-8">
          {totalOptimisations} optimisation{totalOptimisations > 1 ? 's' : ''} détectée{totalOptimisations > 1 ? 's' : ''} · Économie estimée : <strong className="text-emerald">{fourchette}/an</strong>
        </p>

        {/* ═══ Aperçu du rapport — ce que le client va recevoir ═══ */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <p className="text-xs text-slate-muted uppercase tracking-wide font-medium mb-4">Aperçu de votre dossier</p>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <span className="text-2xl block mb-1">📊</span>
              <p className="text-xs font-semibold text-navy">Rapport détaillé</p>
              <p className="text-[10px] text-slate-muted">Synthèse IA + chaque optimisation</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <span className="text-2xl block mb-1">📋</span>
              <p className="text-xs font-semibold text-navy">Guide correction</p>
              <p className="text-[10px] text-slate-muted">Pas-à-pas sur impots.gouv.fr</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <span className="text-2xl block mb-1">✉️</span>
              <p className="text-xs font-semibold text-navy">Réclamation</p>
              <p className="text-[10px] text-slate-muted">Courrier prêt à envoyer</p>
            </div>
          </div>
          {/* Faux extrait flouté */}
          <div className="border border-slate-100 rounded-xl p-4 relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-slate-200 rounded w-48"></div>
                <div className="h-3 bg-emerald/20 rounded w-16"></div>
              </div>
              <div className="h-2 bg-slate-100 rounded w-full"></div>
              <div className="h-2 bg-slate-100 rounded w-3/4"></div>
              <div className="flex items-center justify-between mt-2">
                <div className="h-3 bg-slate-200 rounded w-40"></div>
                <div className="h-3 bg-emerald/20 rounded w-16"></div>
              </div>
              <div className="h-2 bg-slate-100 rounded w-full"></div>
              <div className="h-2 bg-slate-100 rounded w-2/3"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white flex items-end justify-center pb-2">
              <span className="text-xs text-slate-400 font-medium">🔒 {totalOptimisations} optimisation{totalOptimisations > 1 ? 's' : ''} · {fourchette}/an</span>
            </div>
          </div>
        </div>

        {/* ═══ 3 cartes offres ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {PLANS.map((plan) => {
            const isRecommended = plan.badge === 'Recommandé'
            const roi = economie3ans > 0 ? Math.round(economie3ans / (plan.price / 100)) : 0
            return (
              <div key={plan.id} className={`bg-white rounded-2xl p-6 relative flex flex-col ${
                isRecommended ? 'border-2 border-emerald ring-2 ring-emerald/20 md:-mt-2 md:mb-[-8px]' : 'border border-slate-200'
              }`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald text-navy text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                <div className="text-center mb-4">
                  <h3 className="font-heading text-lg font-bold text-navy">{plan.label}</h3>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-3xl font-heading font-bold text-emerald">{plan.priceLabel}</span>
                    <span className="text-xs text-slate-muted">unique</span>
                  </div>
                  {roi > 1 && (
                    <p className="text-[10px] text-emerald font-semibold mt-1">ROI estimé ×{roi}</p>
                  )}
                </div>
                <ul className="space-y-2 text-sm text-slate-text mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2">
                      {f.included ? (
                        <span className="text-emerald mt-0.5 flex-shrink-0 text-sm">✓</span>
                      ) : (
                        <span className="text-slate-300 mt-0.5 flex-shrink-0 text-sm">—</span>
                      )}
                      <span className={f.included ? '' : 'text-slate-400'}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${
                    isRecommended ? 'cta-primary justify-center' : 'bg-slate-100 text-navy hover:bg-slate-200'
                  }`}
                >
                  {loadingPlan === plan.id ? 'Redirection...' : `Débloquer — ${plan.priceLabel}`}
                </button>
              </div>
            )
          })}
        </div>

        <ReviewMiniProof brique="monimpot" />

        <p className="text-xs text-slate-muted text-center mt-4">
          🔒 Paiement sécurisé Stripe · Satisfait ou remboursé 14 jours
        </p>
        <p className="text-[10px] text-slate-muted text-center mt-4">
          Économie estimée sous réserve de l&apos;exactitude de vos réponses. RÉCUPÉO n&apos;est pas un cabinet comptable.
        </p>
      </div>
    </section>
  )
}
