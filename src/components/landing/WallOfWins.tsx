'use client'
// ============================================================
// RÉCUPÉO — Wall of Wins (vrais chiffres MongoDB)
// ============================================================
// Remplace les stats statiques par des vraies données
// Affiché sur la home page dans la section SocialProof
// ============================================================

import { useState, useEffect } from 'react'
import { fmt } from '@/lib/format'

interface Stats {
  totalDiagnostics: number
  totalDetected: number
  totalLettersGenerated: number
  averageNote: number
  totalReviews: number
}

export function WallOfWins() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats/aggregate')
      .then(r => r.ok ? r.json() : null)
      .then(setStats)
      .catch(() => {})
  }, [])

  // Fallback si pas encore de données
  const data = stats || {
    totalDiagnostics: 0,
    totalDetected: 0,
    totalLettersGenerated: 0,
    averageNote: 0,
    totalReviews: 0,
  }

  // Ne pas afficher si aucune donnée
  if (data.totalDiagnostics === 0 && !stats) return null

  const items = [
    {
      value: data.totalDiagnostics > 0 ? fmt(data.totalDiagnostics) : '—',
      label: 'diagnostics réalisés',
      icon: '📊',
    },
    {
      value: data.totalDetected > 0 ? `${fmt(data.totalDetected)} €` : '—',
      label: 'de trop-perçu détectés',
      icon: '🔍',
    },
    {
      value: data.totalLettersGenerated > 0 ? fmt(data.totalLettersGenerated) : '—',
      label: 'réclamations générées',
      icon: '✉️',
    },
    {
      value: data.averageNote > 0 ? `${data.averageNote}/5` : '—',
      label: `de satisfaction (${data.totalReviews} avis)`,
      icon: '⭐',
    },
  ]

  return (
    <section className="py-16 bg-navy">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-center text-white/40 text-xs font-semibold uppercase tracking-wider mb-8">
          Les chiffres RÉCUPÉO en temps réel
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item.label} className="text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-heading text-2xl md:text-3xl font-bold text-emerald mb-1">
                {item.value}
              </div>
              <div className="text-white/50 text-xs">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
