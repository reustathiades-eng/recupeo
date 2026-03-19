'use client'
import { useState, useEffect } from 'react'
import { track } from '@/lib/analytics'
import { fmt } from '@/lib/format'
import { ReviewMiniProof } from '@/components/reviews/ReviewMiniProof'

interface MacautionPaywallProps {
  diagnosticId: string
  estimatedAmount: number
}

const CHECK = (
  <svg className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
)

export function MacautionPaywall({ diagnosticId, estimatedAmount }: MacautionPaywallProps) {
  const [loading, setLoading] = useState<string | null>(null)
  useEffect(() => { track({ event: 'paywall_viewed', brique: 'macaution', estimated_amount: estimatedAmount }) }, [])

  const handlePurchase = async (plan: 'rapport' | 'rapport_courriers') => {
    track({ event: 'purchase_clicked', brique: 'macaution', plan })
    setLoading(plan)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brique: 'macaution', plan, diagnosticId, email: '' }),
      })
      const data = await res.json()
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        window.location.href = `/macaution/rapport?id=${diagnosticId}&plan=${plan}`
      }
    } catch {
      window.location.href = `/macaution/rapport?id=${diagnosticId}&plan=${plan}`
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="py-16 bg-slate-bg">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-3">
            Obtenez votre rapport complet
          </h2>
          <p className="text-slate-muted text-base max-w-[460px] mx-auto">
            Récupérez jusqu&apos;à <strong className="text-emerald font-bold">~{fmt(estimatedAmount)}€</strong> grâce à notre analyse détaillée et nos courriers pré-remplis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Offre Rapport — 29€ */}
          <div className="pricing-card">
            <div className="text-sm text-slate-muted font-semibold uppercase tracking-wider mb-2">Rapport complet</div>
            <div className="font-heading text-[42px] font-extrabold text-slate-text mb-1">29€</div>
            <div className="text-sm text-slate-muted mb-6">Paiement unique</div>
            <ul className="space-y-3 mb-8">
              {['Analyse détaillée de chaque retenue', 'Calcul de vétusté poste par poste', 'Montant exact récupérable ventilé', 'Références juridiques précises', 'Guide de procédure complet'].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-text">{CHECK}{f}</li>
              ))}
            </ul>
            <button onClick={() => handlePurchase('rapport')} disabled={!!loading} className="w-full py-3.5 rounded-xl border-2 border-emerald text-emerald font-bold text-sm hover:bg-emerald/5 transition-all disabled:opacity-60">
              {loading === 'rapport' ? 'Redirection...' : 'Obtenir le rapport — 29€'}
            </button>
          </div>

          {/* Offre Rapport + Courriers — 49€ */}
          <div className="pricing-card pricing-featured">
            <div className="absolute top-0 right-0 bg-emerald text-navy-dark text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
              RECOMMANDÉ
            </div>
            <div className="text-sm text-emerald font-semibold uppercase tracking-wider mb-2">Rapport + Pack courriers</div>
            <div className="font-heading text-[42px] font-extrabold text-slate-text mb-1">49€</div>
            <div className="text-sm text-slate-muted mb-6">Paiement unique</div>
            <ul className="space-y-3 mb-8">
              {['Tout le rapport complet (29€)', 'Lettre de mise en demeure pré-remplie (LRAR)', 'Lettre de saisine CDC pré-remplie', 'Modèle de requête tribunal', 'Tous les courriers en PDF prêts à envoyer'].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-text">{CHECK}{f}</li>
              ))}
            </ul>
            <button onClick={() => handlePurchase('rapport_courriers')} disabled={!!loading} className="cta-primary w-full justify-center !text-sm disabled:opacity-60">
              {loading === 'rapport_courriers' ? 'Redirection...' : 'Obtenir tout — 49€'}
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-slate-muted">
          <ReviewMiniProof brique="macaution" />

            🔒 Paiement sécurisé Stripe · Satisfait ou remboursé sous 14 jours · Facture disponible
          </p>
        </div>
      </div>
    </section>
  )
}
