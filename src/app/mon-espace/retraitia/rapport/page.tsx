'use client'
import { useState } from 'react'

export default function RapportPage() {
  const [loading, setLoading] = useState(false)
  // TODO: get dossierId from context/auth
  const dossierId = ''

  const downloadPDF = async () => {
    if (!dossierId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/retraitia/report?dossierId=${dossierId}`)
      if (!res.ok) throw new Error('Erreur')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'rapport-retraitia.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors du telechargement. Veuillez reessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-slate-text mb-2">Rapport PDF</h1>
      <p className="text-sm text-slate-muted mb-6">
        Votre rapport complet en 10 sections, telechargeable et imprimable.
      </p>

      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">📄</div>
        <h2 className="font-heading text-lg font-bold text-slate-text mb-2">
          Rapport d'audit RETRAITIA
        </h2>
        <p className="text-sm text-slate-muted mb-6 max-w-md mx-auto">
          Couverture, resume executif, anomalies detaillees, recalcul de pension,
          guide d'action, barometre de fiabilite, mentions legales.
        </p>

        <button
          onClick={downloadPDF}
          disabled={loading || !dossierId}
          className="bg-emerald text-[#060D1B] font-bold text-base py-3 px-8 rounded-xl hover:bg-emerald-light transition-colors disabled:opacity-50"
        >
          {loading ? 'Generation en cours...' : '📥 Telecharger le rapport PDF'}
        </button>

        <p className="text-xs text-slate-muted mt-4">
          Le rapport est regenere automatiquement si vous ajoutez de nouveaux documents.
        </p>
      </div>
    </div>
  )
}
