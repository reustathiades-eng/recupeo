'use client'
import { useState } from 'react'

interface DossierSummary {
  id: string
  clientName: string
  scoreGlobal?: string
  nbAnomalies?: number
  status: string
}

interface SelecteurCoupleProps {
  dossiers: DossierSummary[]
  activeDossierId: string
  onSwitch: (dossierId: string) => void
}

export function SelecteurCouple({ dossiers, activeDossierId, onSwitch }: SelecteurCoupleProps) {
  if (dossiers.length < 2) return null

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4 flex items-center gap-2">
      <span className="text-xs font-medium text-slate-500 mr-1">Dossier :</span>
      {dossiers.map((d) => (
        <button
          key={d.id}
          onClick={() => onSwitch(d.id)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            d.id === activeDossierId
              ? 'bg-emerald/10 text-emerald-dark border border-emerald/20'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          {d.clientName || 'Dossier'}
          {d.nbAnomalies !== undefined && d.nbAnomalies > 0 && (
            <span className="ml-1.5 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
              {d.nbAnomalies}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

interface VueResumeCoupleProps {
  dossiers: DossierSummary[]
  onOpen: (dossierId: string) => void
}

const SCORE_COLORS: Record<string, string> = {
  BRONZE: 'text-amber-700 bg-amber-50',
  ARGENT: 'text-slate-500 bg-slate-100',
  OR: 'text-yellow-600 bg-yellow-50',
  PLATINE: 'text-emerald bg-emerald/10',
}

export function VueResumeCouple({ dossiers, onOpen }: VueResumeCoupleProps) {
  if (dossiers.length < 2) return null

  const totalAnomalies = dossiers.reduce((s, d) => s + (d.nbAnomalies || 0), 0)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">Pack Couple — 2 dossiers</h3>
        <span className="text-xs text-slate-400">{totalAnomalies} anomalie(s) au total</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {dossiers.map((d) => (
          <button
            key={d.id}
            onClick={() => onOpen(d.id)}
            className="text-left p-3 rounded-lg border border-slate-100 hover:border-emerald/30 hover:bg-emerald/5 transition-colors"
          >
            <p className="text-sm font-semibold text-slate-800 truncate">{d.clientName || 'À renseigner'}</p>
            <p className="text-xs text-slate-400 mt-1 capitalize">{d.status.replace(/_/g, ' ')}</p>
            {d.scoreGlobal && (
              <span className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${SCORE_COLORS[d.scoreGlobal] || 'text-slate-500 bg-slate-100'}`}>
                {d.scoreGlobal}
              </span>
            )}
            {d.nbAnomalies !== undefined && d.nbAnomalies > 0 && (
              <p className="text-xs text-red-500 mt-1">{d.nbAnomalies} anomalie(s)</p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
