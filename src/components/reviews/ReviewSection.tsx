'use client'
// ============================================================
// Section avis par brique (3 cards)
// Position : entre TransparencyBlock et CrossSellBriques
// ============================================================

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ReviewCard } from './ReviewCard'
import { BRIQUE_NAMES } from '@/lib/reviews/constants'

interface Review {
  id: string; note: number; commentaire?: string; prenom: string
  ville?: string; brique: string; montantRecupere?: number
  isVerified?: boolean; publishedAt?: string
}

interface ReviewSectionProps {
  brique: string
}

export function ReviewSection({ brique }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    fetch(`/api/reviews/list?brique=${brique}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.reviews) setReviews(data.reviews.slice(0, 3))
      })
      .catch(() => {})
  }, [brique])

  if (reviews.length < 1) return null

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="font-heading text-2xl font-bold text-navy text-center mb-2">
          Ce que nos utilisateurs disent de {BRIQUE_NAMES[brique] || brique}
        </h2>
        <p className="text-slate-muted text-sm text-center mb-8">
          Avis vérifiés de clients ayant utilisé ce service.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {reviews.map(r => (
            <ReviewCard key={r.id} {...r} />
          ))}
        </div>

        <div className="text-center">
          <Link href={`/avis?brique=${brique}`} className="text-emerald text-sm font-medium hover:underline">
            Voir tous les avis →
          </Link>
        </div>
      </div>
    </section>
  )
}
