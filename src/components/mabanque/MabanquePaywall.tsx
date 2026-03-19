'use client'
import { useState } from 'react'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'
import { ReviewMiniProof } from '@/components/reviews/ReviewMiniProof'

interface Props {
  diagnosticId: string
  tropPercuAnnuel: number
}

export function MabanquePaywall({ diagnosticId, tropPercuAnnuel }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (plan: 'rapport' | 'rapport_courriers') => {
    setLoading(plan)
    track({ event: 'purchase_clicked', brique: 'mabanque', plan })
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brique: 'mabanque',
          plan,
          diagnosticId,
          amount: plan === 'rapport' ? 1900 : 2900,
          label: plan === 'rapport' ? 'MABANQUE Rapport' : 'MABANQUE Rapport + Réclamation',
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
            Obtenez le rapport détaillé + courriers de réclamation
          </h2>
          <p className="text-slate-muted text-sm">
            {tropPercuAnnuel > 0 && <>Trop-perçu estimé : <strong className="text-navy">{fmt(tropPercuAnnuel)}€/an</strong> · </>}
            70% des médiations aboutissent en faveur du client
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Rapport 19€ */}
          <div className="pricing-card p-6">
            <div className="text-center mb-4">
              <p className="text-xs text-slate-muted font-medium uppercase tracking-wider mb-1">Rapport</p>
              <p className="text-3xl font-bold text-slate-text">19€</p>
              <p className="text-xs text-slate-muted">paiement unique</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-text mb-6">
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Analyse détaillée de chaque frais</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Vérification des plafonds légaux</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Calcul du trop-perçu (mois, an, 5 ans)</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Éligibilité au statut client fragile</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Références juridiques précises</li>
            </ul>
            <button onClick={() => handlePurchase('rapport')} disabled={loading === 'rapport'}
              className="w-full cta-primary justify-center">
              {loading === 'rapport' ? 'Redirection...' : 'Choisir Rapport — 19€'}
            </button>
          </div>

          {/* Complet 29€ */}
          <div className="pricing-featured p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald text-white text-[10px] font-bold rounded-full uppercase">
              Recommandé
            </div>
            <div className="text-center mb-4">
              <p className="text-xs text-slate-muted font-medium uppercase tracking-wider mb-1">Rapport + Réclamation</p>
              <p className="text-3xl font-bold text-slate-text">29€</p>
              <p className="text-xs text-slate-muted">paiement unique</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-text mb-6">
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Tout le Rapport</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Courrier de réclamation pré-rempli</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Saisine du médiateur bancaire</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Guide SignalConso (DGCCRF)</li>
              <li className="flex items-start gap-2"><span className="text-emerald mt-0.5">✓</span>Guide de procédure complet</li>
            </ul>
            <button onClick={() => handlePurchase('rapport_courriers')} disabled={loading === 'rapport_courriers'}
              className="w-full cta-primary justify-center">
              {loading === 'rapport_courriers' ? 'Redirection...' : 'Choisir Complet — 29€'}
            </button>
          </div>
        </div>

        {/* Réassurance */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-slate-muted">
          <ReviewMiniProof brique="mabanque" />

          <span>🔒 Paiement sécurisé Stripe</span>
          <span>⚡ Rapport instantané</span>
          <span>📄 Courriers prêts à envoyer</span>
        </div>
      </div>
    </section>
  )
}
