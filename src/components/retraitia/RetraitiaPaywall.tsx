'use client'
import { useState, useEffect } from 'react'
import { track } from '@/lib/analytics'
import { fmt } from '@/lib/format'
import { ReviewMiniProof } from '@/components/reviews/ReviewMiniProof'

interface RetraitiaPaywallProps {
  diagnosticId: string
  impactLifetime: number
}

const CHECK = (
  <svg className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
)

export function RetraitiaPaywall({ diagnosticId, impactLifetime }: RetraitiaPaywallProps) {
  const [loading, setLoading] = useState<string | null>(null)
  useEffect(() => { track({ event: 'paywall_viewed', brique: 'retraitia' }) }, [])

  const handlePurchase = async (plan: 'solo' | 'couple' | 'couple_suivi') => {
    track({ event: 'purchase_clicked', brique: 'retraitia', plan })
    setLoading(plan)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brique: 'retraitia', plan, diagnosticId, email: '' }),
      })
      const data = await res.json()
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        window.location.href = `/retraitia/rapport?id=${diagnosticId}&plan=${plan}`
      }
    } catch {
      window.location.href = `/retraitia/rapport?id=${diagnosticId}&plan=${plan}`
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="py-16 bg-slate-bg">
      <div className="max-w-[960px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-3">
            Obtenez votre rapport complet
          </h2>
          <p className="text-slate-muted text-base max-w-[520px] mx-auto">
            Récupérez potentiellement jusqu&apos;à <strong className="text-emerald font-bold">~{fmt(impactLifetime)}€</strong> sur votre espérance de vie grâce à notre audit détaillé.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Solo — 79€ */}
          <div className="pricing-card">
            <div className="text-sm text-slate-muted font-semibold uppercase tracking-wider mb-2">Solo</div>
            <div className="font-heading text-[42px] font-extrabold text-slate-text mb-1">79€</div>
            <div className="text-sm text-slate-muted mb-6">Paiement unique</div>
            <ul className="space-y-3 mb-8">
              {['Rapport d\'audit complet (10 sections)', 'Recalcul détaillé de votre pension', 'Impact financier chiffré', '3 courriers pré-remplis (CARSAT, CRA, Médiateur)', 'Rapport téléchargeable en PDF'].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-text">{CHECK}{f}</li>
              ))}
            </ul>
            <button onClick={() => handlePurchase('solo')} disabled={!!loading} className="w-full py-3.5 rounded-xl border-2 border-emerald text-emerald font-bold text-sm hover:bg-emerald/5 transition-all disabled:opacity-60">
              {loading === 'solo' ? 'Redirection...' : 'Choisir Solo — 79€'}
            </button>
          </div>

          {/* Couple — 149€ */}
          <div className="pricing-card pricing-featured">
            <div className="absolute top-0 right-0 bg-emerald text-navy-dark text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
              POPULAIRE
            </div>
            <div className="text-sm text-emerald font-semibold uppercase tracking-wider mb-2">Couple</div>
            <div className="font-heading text-[42px] font-extrabold text-slate-text mb-1">149€</div>
            <div className="text-sm text-slate-muted mb-6">Paiement unique · 2 personnes</div>
            <ul className="space-y-3 mb-8">
              {['Tout le pack Solo × 2 personnes', 'Analyse de la pension de réversion', 'Optimisation conjointe du couple', 'Courriers pré-remplis pour les 2', '2 rapports PDF séparés'].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-text">{CHECK}{f}</li>
              ))}
            </ul>
            <button onClick={() => handlePurchase('couple')} disabled={!!loading} className="cta-primary w-full justify-center !text-sm disabled:opacity-60">
              {loading === 'couple' ? 'Redirection...' : 'Choisir Couple — 149€'}
            </button>
          </div>

          {/* Couple + Suivi — 199€ */}
          <div className="pricing-card">
            <div className="text-sm text-slate-muted font-semibold uppercase tracking-wider mb-2">Couple + Suivi</div>
            <div className="font-heading text-[42px] font-extrabold text-slate-text mb-1">199€</div>
            <div className="text-sm text-slate-muted mb-6">Paiement unique · Suivi 3 mois</div>
            <ul className="space-y-3 mb-8">
              {['Tout le pack Couple', 'Suivi personnalisé pendant 3 mois', 'Assistance rédaction des courriers', 'Réponse aux courriers CARSAT/CRA', 'Support prioritaire par email'].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-text">{CHECK}{f}</li>
              ))}
            </ul>
            <button onClick={() => handlePurchase('couple_suivi')} disabled={!!loading} className="w-full py-3.5 rounded-xl border-2 border-emerald text-emerald font-bold text-sm hover:bg-emerald/5 transition-all disabled:opacity-60">
              {loading === 'couple_suivi' ? 'Redirection...' : 'Choisir Couple + Suivi — 199€'}
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-slate-muted">
          <ReviewMiniProof brique="retraitia" />

            🔒 Paiement sécurisé Stripe · Satisfait ou remboursé sous 14 jours · Facture disponible
          </p>
        </div>
      </div>
    </section>
  )
}
