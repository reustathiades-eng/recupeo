'use client'
import { ReviewMiniProof } from '@/components/reviews/ReviewMiniProof'
import { useState, useEffect } from 'react'
import { track } from '@/lib/analytics'
import { fmt } from '@/lib/format'

interface Props {
  totalRecoverable: number
  diagnosticId: string
}

export function MonloyerUpsell({ totalRecoverable, diagnosticId }: Props) {
  const [loading, setLoading] = useState(false)
  useEffect(() => { track({ event: 'paywall_viewed', brique: 'monloyer', total_recoverable: totalRecoverable }) }, [])

  const handlePurchase = async () => {
    track({ event: 'purchase_clicked', brique: 'monloyer' })
    setLoading(true)
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brique: 'monloyer', plan: 'courriers', diagnosticId, email: '' }),
      })
      const data = await res.json()
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert('Le paiement sera disponible très prochainement. Contactez contact@recupeo.fr')
      }
    } catch {
      alert('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="font-heading text-[clamp(22px,3.5vw,30px)] font-bold text-slate-text mb-2">
            Récupérez vos {fmt(totalRecoverable)}&nbsp;&euro;
          </h2>
          <p className="text-slate-muted text-sm">
            3 courriers juridiques prêts à envoyer, rédigés par notre IA spécialisée en droit du logement
          </p>
        </div>

        <div className="pricing-featured rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald/10 text-emerald text-xs font-semibold mb-3">
              &#9889; ROI : x{Math.round(totalRecoverable / 29)}
            </div>
            <div className="font-heading text-[48px] font-extrabold text-slate-text leading-none">
              29&euro;
            </div>
            <div className="text-sm text-slate-muted mt-1">paiement unique, sans abonnement</div>
          </div>

          <div className="space-y-3 mb-8">
            {[
              { icon: '&#9993;', title: 'Mise en demeure au bailleur', desc: 'Lettre recommandée avec AR demandant la mise en conformité du loyer et le remboursement du trop-perçu. Délai de 15 jours.' },
              { icon: '&#9878;', title: 'Saisine de la Commission de Conciliation', desc: 'Courrier à la CDC (Commission Départementale de Conciliation). Procédure gratuite et obligatoire avant le tribunal.' },
              { icon: '&#128680;', title: 'Signalement à la préfecture', desc: 'Signalement pour sanction administrative. Amende de 5 000&euro; (particulier) ou 15 000&euro; (personne morale) pour le bailleur.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/50 rounded-xl p-4">
                <span className="text-xl flex-shrink-0" dangerouslySetInnerHTML={{ __html: item.icon }} />
                <div>
                  <div className="text-sm font-semibold text-slate-text">{item.title}</div>
                  <p className="text-xs text-slate-muted mt-0.5" dangerouslySetInnerHTML={{ __html: item.desc }} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-xs text-slate-muted">
            <ReviewMiniProof brique="monloyer" />
            <span>&#128274; Paiement sécurisé Stripe</span>
            <span className="text-slate-border">&middot;</span>
            <span>&#128260; Satisfait ou remboursé 14j</span>
            <span className="text-slate-border">&middot;</span>
            <span>&#128196; PDF prêt à imprimer</span>
          </div>

          <button onClick={handlePurchase} disabled={loading} className="cta-primary w-full !text-[17px] !py-[18px] disabled:opacity-60">
            {loading ? 'Redirection vers le paiement...' : 'Obtenir mes 3 courriers pour 29\u20AC'}
          </button>

          <p className="text-xs text-slate-muted text-center mt-3">
            Courriers personnalisés avec vos données, prêts à envoyer en LRAR
          </p>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <a href="/macaution" className="block bg-slate-bg rounded-xl p-5 border border-slate-border hover:border-emerald/30 transition-colors">
            <div className="text-sm font-semibold text-slate-text mb-1">&#127968; MACAUTION</div>
            <p className="text-xs text-slate-muted">Votre dépôt de garantie non restitué ? Récupérez jusqu&apos;à 1 500&euro;.</p>
          </a>
          <a href="/retraitia" className="block bg-slate-bg rounded-xl p-5 border border-slate-border hover:border-emerald/30 transition-colors">
            <div className="text-sm font-semibold text-slate-text mb-1">&#128176; RETRAITIA</div>
            <p className="text-xs text-slate-muted">1 pension sur 7 contient une erreur. Vérifiez la vôtre gratuitement.</p>
          </a>
        </div>
      </div>
    </section>
  )
}
