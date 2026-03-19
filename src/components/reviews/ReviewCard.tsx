'use client'

import { ReviewStars } from './ReviewStars'
import { fmt } from '@/lib/format'
import { BRIQUE_LABELS } from '@/lib/reviews/constants'

interface ReviewCardProps {
  note: number
  commentaire?: string
  prenom: string
  ville?: string
  brique: string
  montantRecupere?: number
  isVerified?: boolean
  publishedAt?: string
  compact?: boolean
}

export function ReviewCard({
  note, commentaire, prenom, ville, brique,
  montantRecupere, isVerified, publishedAt, compact,
}: ReviewCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-sm ${compact ? 'p-4' : 'p-5'} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <ReviewStars note={note} size={compact ? 'sm' : 'md'} />
        {isVerified && (
          <span className="text-[10px] bg-emerald/10 text-emerald font-semibold px-2 py-0.5 rounded-full">
            ✓ Vérifié
          </span>
        )}
      </div>

      {/* Commentaire */}
      {commentaire && (
        <p className={`text-slate-text leading-relaxed flex-1 ${compact ? 'text-xs mb-3' : 'text-sm mb-4'}`}>
          "{commentaire}"
        </p>
      )}

      {/* Montant récupéré */}
      {montantRecupere && montantRecupere > 0 && (
        <div className="mb-3 px-3 py-2 bg-emerald/5 rounded-lg">
          <span className="text-xs text-emerald font-bold">💰 {fmt(montantRecupere)} € récupérés</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-muted pt-2 border-t border-slate-50">
        <span className="font-medium">
          {prenom}{ville ? `, ${ville}` : ''}
        </span>
        <span className="text-[10px]">
          {BRIQUE_LABELS[brique] || brique}
          {publishedAt && ` • ${new Date(publishedAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`}
        </span>
      </div>
    </div>
  )
}
