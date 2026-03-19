'use client'
import { useState } from 'react'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'
import { ReviewMiniProof } from '@/components/reviews/ReviewMiniProof'

interface Props { diagnosticId: string; ecartTotal: number }

export function MonchomagePaywall({ diagnosticId, ecartTotal }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (plan: 'rapport' | 'rapport_courriers') => {
    setLoading(plan)
    track({ event: 'purchase_clicked', brique: 'monchomage', plan })
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brique: 'monchomage', plan, diagnosticId, amount: plan === 'rapport' ? 6900 : 12900, label: plan === 'rapport' ? 'MONCHÔMAGE Rapport' : 'MONCHÔMAGE Rapport + Contestation' }),
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
          <h2 className="font-heading text-[clamp(20px,3vw,28px)] font-bold text-slate-text mb-2">Obtenez le recalcul complet + courrier de contestation</h2>
          <p className="text-slate-muted text-sm">
            {ecartTotal > 0 && <>Impact estimé : <strong className="text-navy">{fmt(ecartTotal)}€</strong> sur votre durée d&apos;indemnisation · </>}
            Le rapport se rentabilise dès le 1er mois
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="pricing-card p-6">
            <div className="text-center mb-4">
              <p className="text-xs text-slate-muted font-medium uppercase tracking-wider mb-1">Rapport</p>
              <p className="text-3xl font-bold text-slate-text">69€</p>
              <p className="text-xs text-slate-muted">paiement unique</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-text mb-6">
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Recalcul détaillé du SJR</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Comparaison poste par poste</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Allocation corrigée + impact total</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Vérification dégressivité</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Guide de procédure</li>
            </ul>
            <button onClick={() => handlePurchase('rapport')} disabled={loading === 'rapport'} className="w-full cta-primary justify-center">
              {loading === 'rapport' ? 'Redirection...' : 'Choisir Rapport — 69€'}
            </button>
          </div>
          <div className="pricing-featured p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald text-white text-[10px] font-bold rounded-full uppercase">Recommandé</div>
            <div className="text-center mb-4">
              <p className="text-xs text-slate-muted font-medium uppercase tracking-wider mb-1">Rapport + Contestation</p>
              <p className="text-3xl font-bold text-slate-text">129€</p>
              <p className="text-xs text-slate-muted">paiement unique</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-text mb-6">
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Tout le Rapport</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Courrier France Travail pré-rempli</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Saisine du médiateur</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Tableau comparatif prêt à joindre</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Check-list des pièces</li>
            </ul>
            <button onClick={() => handlePurchase('rapport_courriers')} disabled={loading === 'rapport_courriers'} className="w-full cta-primary justify-center">
              {loading === 'rapport_courriers' ? 'Redirection...' : 'Choisir Complet — 129€'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-slate-muted">
          <ReviewMiniProof brique="monchomage" />

          <span>🔒 Paiement sécurisé Stripe</span><span>⚡ Rapport instantané</span><span>📄 Courriers prêts à envoyer</span>
        </div>
      </div>
    </section>
  )
}
