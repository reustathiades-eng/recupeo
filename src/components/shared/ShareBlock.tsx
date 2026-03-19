'use client'
// ============================================================
// RÉCUPÉO — ShareBlock (post-diagnostic, avant paywall)
// ============================================================
// Montant anonymisé, 6 canaux, animation slide-in
// Position : Form → PreDiag → ShareBlock (ICI) → Paywall
// ============================================================

import { useState, useEffect } from 'react'
import { track } from '@/lib/analytics'
import { getShareMessage, getShareUrl, anonymizeMontant, SHARE_CHANNELS, BRIQUE_SHARE_LABELS } from '@/lib/sharing/constants'

interface ShareBlockProps {
  brique: string
  montant: number
  referralCode?: string
}

export function ShareBlock({ brique, montant, referralCode }: ShareBlockProps) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  if (montant <= 0) return null

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://recupeo.fr'
  const shareUrl = referralCode
    ? `${baseUrl}/${brique}?ref=${referralCode}`
    : `${baseUrl}/${brique}`

  const ogImageUrl = `${baseUrl}/api/og?brique=${brique}&montant=${montant}${referralCode ? `&ref=${referralCode}` : ''}`
  const label = BRIQUE_SHARE_LABELS[brique] || 'mes finances'
  const anonMontant = anonymizeMontant(montant)

  const handleShare = async (channelId: string) => {
    track({ event: 'share_initiated', brique, channel: channelId })

    if (channelId === 'copy') {
      try {
        const msg = getShareMessage('copy', brique, montant, shareUrl)
        await navigator.clipboard.writeText(msg)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        track({ event: 'share_completed', brique, channel: 'copy' })
      } catch { /* silencieux */ }
      return
    }

    const message = getShareMessage(channelId as 'whatsapp', brique, montant, shareUrl)
    const url = getShareUrl(channelId, shareUrl, message)
    window.open(url, '_blank', 'noopener,noreferrer')
    track({ event: 'share_completed', brique, channel: channelId })
  }

  return (
    <section
      className={`py-8 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="max-w-[600px] mx-auto px-6">
        <div className="bg-navy rounded-2xl p-6 text-center">
          {/* Header */}
          <div className="mb-4">
            <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">
              Trop-perçu détecté sur {label}
            </p>
            <p className="text-emerald text-3xl font-heading font-bold">
              {anonMontant}
            </p>
          </div>

          {/* Message */}
          <p className="text-white/70 text-sm mb-5">
            Partagez cette info avec vos proches — ils paient peut-être trop eux aussi.
          </p>

          {/* Boutons de partage */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {SHARE_CHANNELS.map(ch => (
              <button
                key={ch.id}
                onClick={() => handleShare(ch.id)}
                className={`px-4 py-2.5 text-white text-xs font-medium rounded-lg transition-colors ${ch.color}`}
              >
                {ch.id === 'copy' && copied ? '✓ Copié !' : ch.label}
              </button>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-white/30 text-[10px]">
            Le montant partagé est arrondi pour protéger votre anonymat.
          </p>
        </div>
      </div>

      {/* Meta OG cachée pour les crawlers */}
      {typeof window !== 'undefined' && (
        <>
          <meta property="og:image" content={ogImageUrl} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
        </>
      )}
    </section>
  )
}
