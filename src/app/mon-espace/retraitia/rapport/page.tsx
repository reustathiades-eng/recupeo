"use client"
import { useState } from 'react'
import { useDossier } from '@/lib/retraitia/DossierContext'

export default function RapportPage() {
  const { dossier, loading } = useDossier()
  const [downloading, setDownloading] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
      </div>
    )
  }

  if (!dossier) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <p className="text-sm text-slate-muted">Aucun dossier.</p>
      </div>
    )
  }

  const pack49Paid = dossier.pack49Paid || dossier.seuilGratuit || false

  if (!pack49Paid) {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-8 text-center opacity-80">
        <div className="text-4xl mb-4">\U0001F512</div>
        <h1 className="font-heading text-xl font-bold text-slate-text mb-2">Rapport PDF</h1>
        <p className="text-sm text-slate-muted">Cette section se debloque avec le Pack Action.</p>
      </div>
    )
  }

  const dossierId = String(dossier.id)
  const rapportVersion = dossier.rapport?.version || 0
  const rapportDate = dossier.rapport?.generatedAt
    ? new Date(dossier.rapport.generatedAt).toLocaleDateString('fr-FR')
    : null

  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/retraitia/generate-pdf?dossierId=${dossierId}`)
      if (!res.ok) throw new Error('Erreur')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-retraitia-${dossierId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors du telechargement. Veuillez reessayer.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-slate-text mb-2">Rapport PDF</h1>
      <p className="text-sm text-slate-muted mb-6">
        Votre rapport complet en 10 sections, telechargeable et imprimable.
      </p>

      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">\U0001F4C4</div>
        <h2 className="font-heading text-lg font-bold text-slate-text mb-2">
          {"Rapport d'audit RETRAITIA"}
        </h2>
        <p className="text-sm text-slate-muted mb-2 max-w-md mx-auto">
          Couverture, resume executif, anomalies detaillees, recalcul de pension,
          guide d'action, barometre de fiabilite, mentions legales.
        </p>
        {rapportDate && (
          <p className="text-xs text-slate-400 mb-4">
            Version {rapportVersion} \u00B7 Genere le {rapportDate}
          </p>
        )}

        <button
          onClick={downloadPDF}
          disabled={downloading}
          className="bg-emerald text-[#060D1B] font-bold text-base py-3 px-8 rounded-xl hover:bg-emerald-light transition-colors disabled:opacity-50"
        >
          {downloading ? 'Generation en cours...' : 'Telecharger le rapport PDF'}
        </button>

        <p className="text-xs text-slate-muted mt-4">
          Le rapport est regenere automatiquement si vous ajoutez de nouveaux documents.
        </p>
      </div>
    </div>
  )
}
