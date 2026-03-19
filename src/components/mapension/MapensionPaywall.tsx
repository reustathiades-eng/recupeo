'use client'
import { useState } from 'react'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'
import { ReviewMiniProof } from '@/components/reviews/ReviewMiniProof'

interface Props {
  diagnosticId: string
  totalArrears: number
}

export function MapensionPaywall({ diagnosticId, totalArrears }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (plan: 'rapport' | 'rapport_courriers') => {
    setLoading(plan)
    track({ event: 'purchase_clicked', brique: 'mapension', plan })
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brique: 'mapension',
          plan,
          diagnosticId,
          amount: plan === 'rapport' ? 2900 : 4900,
          label: plan === 'rapport' ? 'MAPENSION Standard' : 'MAPENSION Multi-enfants',
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setLoading(null)
    } catch { setLoading(null) }
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="font-heading text-[clamp(20px,3vw,28px)] font-bold text-slate-text mb-2">
            Obtenez le calcul détaillé + courrier de réclamation
          </h2>
          <p className="text-slate-muted text-sm">
            {totalArrears > 0 && <>Arriérés estimés : <strong className="text-navy">{fmt(totalArrears)}€</strong> · </>}
            Le rapport se rentabilise dès le 1er mois
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Standard 29€ */}
          <div className="pricing-card p-6">
            <div className="text-center mb-4">
              <p className="text-xs text-slate-muted font-medium uppercase tracking-wider mb-1">Standard</p>
              <p className="text-3xl font-bold text-slate-text">29€</p>
              <p className="text-xs text-slate-muted">paiement unique</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-text mb-6">
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Tableau des arriérés année par année</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Montant exact avec indice officiel</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Courrier de réclamation amiable</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Modèle de mise en demeure</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Guide de procédure</li>
            </ul>
            <button onClick={() => handlePurchase('rapport')} disabled={loading === 'rapport'}
              className="w-full cta-primary justify-center">
              {loading === 'rapport' ? 'Redirection...' : 'Choisir Standard — 29€'}
            </button>
          </div>

          {/* Multi 49€ */}
          <div className="pricing-featured p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald text-white text-[10px] font-bold rounded-full uppercase">
              Recommandé
            </div>
            <div className="text-center mb-4">
              <p className="text-xs text-slate-muted font-medium uppercase tracking-wider mb-1">Multi-enfants</p>
              <p className="text-3xl font-bold text-slate-text">49€</p>
              <p className="text-xs text-slate-muted">paiement unique</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-text mb-6">
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Tout le pack Standard</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Calcul pour plusieurs pensions</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Modèle de saisine ARIPA</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Modèle de requête huissier</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>PDF téléchargeable</li>
            </ul>
            <button onClick={() => handlePurchase('rapport_courriers')} disabled={loading === 'rapport_courriers'}
              className="w-full cta-primary justify-center">
              {loading === 'rapport_courriers' ? 'Redirection...' : 'Choisir Multi-enfants — 49€'}
            </button>
          </div>
        </div>

        {/* Réassurance */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-slate-muted">
          <ReviewMiniProof brique="mapension" />

          <span>🔒 Paiement sécurisé Stripe</span>
          <span>⚡ Rapport instantané</span>
          <span>📄 PDF téléchargeable</span>
        </div>
      </div>
    </section>
  )
}
