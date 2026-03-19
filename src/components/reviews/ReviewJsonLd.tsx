'use client'
// ============================================================
// JSON-LD AggregateRating — pour Rich Snippets Google
// ============================================================

import { useState, useEffect } from 'react'

interface Props {
  brique?: string
  briqueName?: string
}

export function ReviewJsonLd({ brique, briqueName }: Props) {
  const [jsonLd, setJsonLd] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/reviews/stats')
      .then(r => r.ok ? r.json() : null)
      .then(stats => {
        if (!stats || stats.totalReviews < 3) return

        const note = brique && stats.byBrique[brique]
          ? stats.byBrique[brique].averageNote
          : stats.averageNote
        const count = brique && stats.byBrique[brique]
          ? stats.byBrique[brique].count
          : stats.totalReviews

        if (count < 3) return

        const ld = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: briqueName || 'RECUPEO',
          description: brique
            ? `Service d'audit ${briqueName || brique} par RECUPEO`
            : "L'IA qui recupere ce qu'on vous doit",
          brand: { '@type': 'Brand', name: 'RECUPEO' },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(note),
            bestRating: '5',
            worstRating: '1',
            reviewCount: String(count),
          },
        }
        setJsonLd(JSON.stringify(ld))
      })
      .catch(() => {})
  }, [brique, briqueName])

  if (!jsonLd) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  )
}
