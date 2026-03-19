'use client'
// ============================================================
// /mon-espace/parrainage — Code parrain + crédits
// ============================================================

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/useAuth'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'

interface ReferralData {
  referralCode: string
  referralCredits: number
  referralsCount: number
}

export default function ParrainagePage() {
  const { user } = useAuth()
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    track({ event: 'parrainage_viewed', brique: 'mon-espace' })
    fetchReferral()
  }, [])

  async function fetchReferral() {
    try {
      const res = await fetch('/api/auth/referral')
      if (res.ok) setData(await res.json())
    } catch { /* silencieux */ }
    finally { setLoading(false) }
  }

  const shareUrl = data?.referralCode
    ? `https://recupeo.fr?ref=${data.referralCode}`
    : 'https://recupeo.fr'

  const shareMessage = `J'ai découvert RÉCUPÉO, un service qui détecte les erreurs sur vos factures et impôts. Essaie avec mon lien : ${shareUrl}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      track({ event: 'referral_link_copied', brique: 'mon-espace' })
      setTimeout(() => setCopied(false), 2000)
    } catch { /* silencieux */ }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy mb-2">Parrainage</h1>
      <p className="text-slate-muted text-sm mb-8">
        Parrainez vos proches et gagnez des crédits sur vos prochains diagnostics.
      </p>

      {loading ? (
        <div className="text-center py-12 text-slate-muted">Chargement...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-heading font-bold text-navy">{data?.referralsCount ?? 0}</p>
              <p className="text-xs text-slate-muted mt-1">Filleuls</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-heading font-bold text-emerald">{fmt(data?.referralCredits ?? 0)} €</p>
              <p className="text-xs text-slate-muted mt-1">Crédits accumulés</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-heading font-bold text-navy">50 €</p>
              <p className="text-xs text-slate-muted mt-1">Maximum cumulable</p>
            </div>
          </div>

          {/* Code parrain */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-8">
            <h2 className="font-heading text-lg font-bold text-navy mb-4">Votre code parrain</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 bg-slate-bg rounded-xl px-5 py-3.5 font-mono text-lg font-bold text-navy tracking-wider text-center">
                {data?.referralCode || '—'}
              </div>
              <button
                onClick={copyLink}
                className="px-5 py-3.5 bg-navy text-white text-sm font-medium rounded-xl hover:bg-navy/90 transition-colors whitespace-nowrap"
              >
                {copied ? '✓ Copié !' : 'Copier le lien'}
              </button>
            </div>

            {/* Boutons de partage */}
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors no-underline"
                onClick={() => track({ event: 'referral_shared', brique: 'whatsapp' })}
              >
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors no-underline"
                onClick={() => track({ event: 'referral_shared', brique: 'facebook' })}
              >
                Facebook
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent('Découvre RÉCUPÉO')}&body=${encodeURIComponent(shareMessage)}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors no-underline"
                onClick={() => track({ event: 'referral_shared', brique: 'email' })}
              >
                Email
              </a>
            </div>
          </div>

          {/* Comment ça marche */}
          <div className="bg-emerald/5 rounded-xl p-6">
            <h3 className="font-heading text-base font-bold text-navy mb-4">Comment ça marche ?</h3>
            <div className="space-y-3 text-sm text-slate-text">
              <p><strong className="text-navy">1.</strong> Partagez votre lien avec vos proches</p>
              <p><strong className="text-navy">2.</strong> Votre filleul bénéficie de <strong>-5€</strong> sur son premier achat</p>
              <p><strong className="text-navy">3.</strong> Vous recevez <strong>+5€</strong> de crédit à son premier achat, puis +3€ au 2e, +2€ par la suite</p>
              <p><strong className="text-navy">4.</strong> Vos crédits sont appliqués automatiquement à votre prochain diagnostic</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
