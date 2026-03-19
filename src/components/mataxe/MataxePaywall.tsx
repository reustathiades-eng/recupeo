'use client'
import { useEffect, useState } from 'react'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'
import { ReviewMiniProof } from '@/components/reviews/ReviewMiniProof'

interface MataxePaywallProps {
  diagnosticId: string
  impact4Years: number
}

const CHECK = (
  <svg className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
)

export function MataxePaywall({ diagnosticId, impact4Years }: MataxePaywallProps) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    track({ event: 'paywall_viewed', brique: 'mataxe', impact_4years: impact4Years })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePurchase = async () => {
    track({ event: 'purchase_clicked', brique: 'mataxe', impact_4years: impact4Years })
    setLoading(true)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brique: 'mataxe',
          plan: 'rapport',
          diagnosticId,
          email: '', // sera récupéré côté serveur depuis le diagnostic
        }),
      })
      const data = await res.json()
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        // Fallback mode démo si Stripe non configuré
        window.location.href = `/mataxe/rapport?id=${diagnosticId}`
      }
    } catch {
      window.location.href = `/mataxe/rapport?id=${diagnosticId}`
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-3">
            Obtenez votre rapport complet + réclamation
          </h2>
          <p className="text-slate-muted text-base max-w-[520px] mx-auto">
            Récupérez potentiellement <strong className="text-emerald font-bold">~{fmt(impact4Years)}€</strong> sur 4 ans grâce à notre audit détaillé et votre réclamation fiscale prête à envoyer.
          </p>
        </div>

        {/* Pricing card unique — 49€ */}
        <div className="pricing-card pricing-featured max-w-[480px] mx-auto">
          <div className="absolute top-0 right-0 bg-emerald text-navy-dark text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
            MEILLEUR RAPPORT QUALITÉ-PRIX
          </div>
          <div className="text-sm text-emerald font-semibold uppercase tracking-wider mb-2">Rapport complet</div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-heading text-[48px] font-extrabold text-slate-text">49€</span>
            <span className="text-sm text-slate-muted line-through">200-500€ cabinet fiscal</span>
          </div>
          <div className="text-sm text-slate-muted mb-6">Paiement unique</div>

          <ul className="space-y-3 mb-8">
            {[
              'Rapport d\'audit détaillé (10 sections)',
              'Calcul complet de la surface pondérée',
              'Comparaison VLC estimée vs administration',
              'Détail de chaque anomalie avec impact chiffré',
              'Réclamation fiscale pré-remplie (prête à envoyer)',
              'Guide pour obtenir le formulaire 6675-M',
              'Liste des pièces justificatives à fournir',
              'Rapport téléchargeable en PDF',
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-text">{CHECK}{f}</li>
            ))}
          </ul>

          <button onClick={handlePurchase} disabled={loading} className="cta-primary w-full justify-center !text-base !py-4 disabled:opacity-60">
            {loading ? 'Redirection vers le paiement...' : 'Obtenir le rapport — 49€'}
          </button>

          <p className="text-xs text-slate-muted text-center mt-4">
          <ReviewMiniProof brique="mataxe" />

            🔒 Paiement sécurisé Stripe · Satisfait ou remboursé 14 jours · Facture disponible
          </p>
        </div>

        {/* ROI */}
        <div className="text-center mt-8 p-4 bg-emerald/5 rounded-xl border border-emerald/20 max-w-[480px] mx-auto">
          <p className="text-sm text-slate-text">
            <strong>Retour sur investissement :</strong> pour 49€, vous pouvez récupérer jusqu&apos;à <strong className="text-emerald">{fmt(impact4Years)}€</strong> de trop-perçu sur 4 ans.
            {impact4Years > 0 && (
              <span className="text-emerald font-bold"> Soit un ROI de ×{Math.round(impact4Years / 49)}.</span>
            )}
          </p>
        </div>
      </div>
    </section>
  )
}
