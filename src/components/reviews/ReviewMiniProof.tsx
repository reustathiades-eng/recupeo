'use client'
// ============================================================
// Mini-proof pour les Paywalls
// "⭐ 4.9/5 (87 avis) • 💰 Montant moyen récupéré : 612€"
// ============================================================

import { useState, useEffect } from 'react'
import { fmt } from '@/lib/format'

interface Stats {
  averageNote: number
  totalReviews: number
  averageRecovered: number
  byBrique: Record<string, { averageNote: number; count: number; averageRecovered: number }>
}

interface ReviewMiniProofProps {
  brique: string
}

export function ReviewMiniProof({ brique }: ReviewMiniProofProps) {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/reviews/stats')
      .then(r => r.ok ? r.json() : null)
      .then(setStats)
      .catch(() => {})
  }, [])

  if (!stats || stats.totalReviews < 3) return null

  const briqueStats = stats.byBrique[brique]
  const note = briqueStats?.averageNote || stats.averageNote
  const count = briqueStats?.count || stats.totalReviews
  const avgRecovered = briqueStats?.averageRecovered || stats.averageRecovered

  return (
    <div className="flex items-center justify-center gap-3 text-xs text-slate-muted py-2 flex-wrap">
      <span className="flex items-center gap-1">
        <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="font-semibold text-navy">{note}/5</span>
        <span>({count} avis)</span>
      </span>
      {avgRecovered > 0 && (
        <>
          <span className="text-slate-300">•</span>
          <span>💰 Montant moyen récupéré : <strong className="text-navy">{fmt(avgRecovered)} €</strong></span>
        </>
      )}
    </div>
  )
}
