'use client'
// ============================================================
// /mon-espace/tableau-de-bord — Dashboard principal
// ============================================================

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/useAuth'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'

interface DashboardData {
  stats: {
    totalDiagnostics: number
    totalDetected: number
    totalRecovered: number
    inProgress: number
  }
  recentDiagnostics: Array<{
    id: string
    brique: string
    createdAt: string
    estimatedAmount?: number
    paid: boolean
    status: string
  }>
  recommendations: Array<{
    slug: string
    brique: string
    reason: string
  }>
}

const BRIQUE_LABELS: Record<string, string> = {
  macaution: 'MACAUTION',
  monloyer: 'MONLOYER',
  retraitia: 'RETRAITIA',
  mataxe: 'MATAXE',
  mapension: 'MAPENSION',
  mabanque: 'MABANQUE',
  monchomage: 'MONCHOMAGE',
}

const BRIQUE_COLORS: Record<string, string> = {
  macaution: 'bg-blue-100 text-blue-700',
  monloyer: 'bg-green-100 text-green-700',
  retraitia: 'bg-purple-100 text-purple-700',
  mataxe: 'bg-amber-100 text-amber-700',
  mapension: 'bg-pink-100 text-pink-700',
  mabanque: 'bg-cyan-100 text-cyan-700',
  monchomage: 'bg-orange-100 text-orange-700',
}

export default function TableauDeBordPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    track({ event: 'dashboard_viewed', brique: 'mon-espace' })
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/auth/dashboard')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      // Silencieux
    } finally {
      setLoading(false)
    }
  }

  const displayName = user?.firstName || 'là'

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-navy">
          Bonjour {displayName} 👋
        </h1>
        <p className="text-slate-muted mt-1">
          Voici le résumé de votre espace RÉCUPÉO.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Diagnostics', value: data?.stats.totalDiagnostics ?? 0, icon: '📊', color: 'border-blue-200' },
          { label: 'Trop-perçu détecté', value: data?.stats.totalDetected ?? 0, format: true, icon: '🔍', color: 'border-amber-200' },
          { label: 'Montant récupéré', value: data?.stats.totalRecovered ?? 0, format: true, icon: '💰', color: 'border-emerald-200' },
          { label: 'En cours', value: data?.stats.inProgress ?? 0, icon: '⏳', color: 'border-purple-200' },
        ].map(stat => (
          <div key={stat.label} className={`bg-white rounded-xl border-l-4 ${stat.color} p-5 shadow-sm`}>
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className="font-heading text-2xl font-bold text-navy">
              {loading ? '—' : stat.format ? `${fmt(stat.value)} €` : stat.value}
            </div>
            <div className="text-xs text-slate-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Diagnostics récents */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-heading text-lg font-bold text-navy">Diagnostics récents</h2>
          <Link href="/mon-espace/mes-diagnostics" className="text-emerald text-sm font-medium hover:underline">
            Tout voir →
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="px-6 py-8 text-center text-slate-muted">Chargement...</div>
          ) : !data?.recentDiagnostics?.length ? (
            <div className="px-6 py-8 text-center">
              <p className="text-slate-muted mb-4">Aucun diagnostic pour le moment.</p>
              <Link href="/#services" className="cta-primary !py-2.5 !px-5 !text-sm !rounded-lg inline-flex">
                Lancer mon premier diagnostic →
              </Link>
            </div>
          ) : (
            data.recentDiagnostics.slice(0, 5).map(diag => (
              <div key={diag.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${BRIQUE_COLORS[diag.brique] || 'bg-slate-100 text-slate-600'}`}>
                    {BRIQUE_LABELS[diag.brique] || diag.brique}
                  </span>
                  <span className="text-sm text-slate-muted">
                    {new Date(diag.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {diag.estimatedAmount ? (
                    <span className="text-sm font-semibold text-navy">{fmt(diag.estimatedAmount)} €</span>
                  ) : null}
                  <Link
                    href={diag.paid ? `/${diag.brique}/rapport?id=${diag.id}` : `/${diag.brique}`}
                    className="text-emerald text-sm font-medium hover:underline"
                  >
                    {diag.paid ? 'Voir le rapport' : 'Compléter'}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommandations */}
      {data?.recommendations && data.recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-heading text-lg font-bold text-navy">Recommandé pour vous</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.recommendations.map(rec => (
              <Link
                key={rec.slug}
                href={`/${rec.slug}`}
                className="block p-4 rounded-xl border border-slate-100 hover:border-emerald/30 hover:shadow-sm transition-all no-underline"
              >
                <div className="font-heading text-sm font-bold text-navy mb-1">
                  {BRIQUE_LABELS[rec.slug] || rec.slug}
                </div>
                <p className="text-xs text-slate-muted">{rec.reason}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
