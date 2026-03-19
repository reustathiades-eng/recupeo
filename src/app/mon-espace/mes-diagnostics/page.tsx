'use client'
// ============================================================
// /mon-espace/mes-diagnostics — Liste de tous les diagnostics
// ============================================================

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'

interface Diagnostic {
  id: string
  brique: string
  createdAt: string
  estimatedAmount?: number
  anomaliesCount?: number
  paid: boolean
  status: string
}

const BRIQUE_LABELS: Record<string, string> = {
  macaution: 'MACAUTION', monloyer: 'MONLOYER', retraitia: 'RETRAITIA',
  mataxe: 'MATAXE', mapension: 'MAPENSION', mabanque: 'MABANQUE', monchomage: 'MONCHOMAGE',
}

const BRIQUE_COLORS: Record<string, string> = {
  macaution: 'bg-blue-100 text-blue-700', monloyer: 'bg-green-100 text-green-700',
  retraitia: 'bg-purple-100 text-purple-700', mataxe: 'bg-amber-100 text-amber-700',
  mapension: 'bg-pink-100 text-pink-700', mabanque: 'bg-cyan-100 text-cyan-700',
  monchomage: 'bg-orange-100 text-orange-700',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'text-slate-400' },
  pre_diagnostic: { label: 'Pré-diagnostic', color: 'text-amber-500' },
  paid: { label: 'Payé', color: 'text-blue-500' },
  report_generated: { label: 'Rapport prêt', color: 'text-emerald' },
  letters_generated: { label: 'Courriers prêts', color: 'text-emerald' },
}

export default function MesDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    track({ event: 'mes_diagnostics_viewed', brique: 'mon-espace' })
    fetchDiagnostics()
  }, [])

  async function fetchDiagnostics() {
    try {
      const res = await fetch('/api/auth/diagnostics')
      if (res.ok) {
        const json = await res.json()
        setDiagnostics(json.diagnostics || [])
      }
    } catch { /* silencieux */ }
    finally { setLoading(false) }
  }

  const filtered = filter === 'all'
    ? diagnostics
    : diagnostics.filter(d => d.brique === filter)

  const uniqueBriques = [...new Set(diagnostics.map(d => d.brique))]

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="font-heading text-2xl font-bold text-navy">Mes diagnostics</h1>

        {uniqueBriques.length > 1 && (
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-navy bg-white"
          >
            <option value="all">Toutes les briques</option>
            {uniqueBriques.map(b => (
              <option key={b} value={b}>{BRIQUE_LABELS[b] || b}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-muted">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <p className="text-slate-muted mb-4">Aucun diagnostic trouvé.</p>
          <Link href="/#services" className="cta-primary !py-2.5 !px-5 !text-sm !rounded-lg inline-flex">
            Lancer un diagnostic →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(diag => {
            const statusInfo = STATUS_LABELS[diag.status] || STATUS_LABELS.pending
            return (
              <div key={diag.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap ${BRIQUE_COLORS[diag.brique] || 'bg-slate-100 text-slate-600'}`}>
                    {BRIQUE_LABELS[diag.brique] || diag.brique}
                  </span>
                  <div>
                    <span className="text-sm text-navy font-medium">
                      {new Date(diag.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {diag.anomaliesCount ? (
                      <span className="text-xs text-slate-muted ml-2">
                        {diag.anomaliesCount} anomalie{diag.anomaliesCount > 1 ? 's' : ''}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {diag.estimatedAmount ? (
                    <span className="text-sm font-bold text-navy">{fmt(diag.estimatedAmount)} €</span>
                  ) : null}
                  <span className={`text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <Link
                    href={diag.paid ? `/${diag.brique}/rapport?id=${diag.id}` : `/${diag.brique}`}
                    className="text-emerald text-sm font-medium hover:underline whitespace-nowrap"
                  >
                    {diag.paid ? 'Voir le rapport →' : 'Compléter →'}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
