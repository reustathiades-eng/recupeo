'use client'
import { fmt } from '@/lib/format'
import { useState } from 'react'

interface MataxeReportProps {
  report: any
  reclamation: any | null
  diagnosticId: string
  calculations?: any
}

export function MataxeReport({ report, reclamation, diagnosticId, calculations }: MataxeReportProps) {
  const [loadingReclamation, setLoadingReclamation] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null)
  const [reclamationData, setReclamationData] = useState<any>(reclamation)
  const [activeTab, setActiveTab] = useState<'report' | 'reclamation' | 'guide'>('report')

  const handleGenerateReclamation = async () => {
    setLoadingReclamation(true)
    try {
      const res = await fetch('/api/mataxe/generate-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosticId }),
      })
      const data = await res.json()
      if (data.success) {
        setReclamationData(data.reclamation)
        setActiveTab('reclamation')
      }
    } catch {
      alert('Erreur lors de la génération de la réclamation')
    } finally {
      setLoadingReclamation(false)
    }
  }

  const handleDownloadPdf = async (type: 'report' | 'reclamation') => {
    setLoadingPdf(type)
    try {
      const res = await fetch('/api/mataxe/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosticId, type }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `RECUPEO-${type === 'report' ? 'rapport' : 'reclamation'}-mataxe.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors du téléchargement')
    } finally {
      setLoadingPdf(null)
    }
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[800px] mx-auto px-6">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald/10 text-emerald text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-emerald rounded-full" />
            Rapport complet
          </div>
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text">
            {report?.title || "Rapport d'audit — Taxe foncière"}
          </h2>
          <p className="text-sm text-slate-muted mt-2">
            Référence : {report?.reference || '—'} · Généré le {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Bilan financier */}
        {calculations && (
          <div className="bg-emerald/5 border border-emerald/20 rounded-2xl p-6 mb-8">
            <h3 className="font-heading font-bold text-slate-text text-base mb-4">💰 Bilan financier</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-slate-muted">Taxe payée</div>
                <div className="font-bold text-slate-text">{fmt((calculations.taxeEstimee || 0) + (calculations.ecartTaxe || 0))}€</div>
              </div>
              <div>
                <div className="text-xs text-slate-muted">Taxe estimée</div>
                <div className="font-bold text-emerald">{fmt(calculations.taxeEstimee || 0)}€</div>
              </div>
              <div>
                <div className="text-xs text-slate-muted">Écart annuel</div>
                <div className="font-bold text-red-600">+{fmt(calculations.ecartTaxe || 0)}€</div>
              </div>
            </div>
            <div className="border-t border-emerald/20 pt-4 flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-slate-text">Remboursement potentiel sur 4 ans</span>
              <span className="font-heading text-[28px] font-extrabold text-emerald">
                {fmt(calculations.remboursement4ans || 0)}€
              </span>
            </div>
          </div>
        )}

        {/* Onglets */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'report' ? 'bg-navy text-white' : 'bg-slate-bg text-slate-muted hover:bg-slate-border'}`}
          >
            📄 Rapport détaillé
          </button>
          <button
            onClick={() => reclamationData ? setActiveTab('reclamation') : handleGenerateReclamation()}
            disabled={loadingReclamation}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'reclamation' ? 'bg-navy text-white' : 'bg-slate-bg text-slate-muted hover:bg-slate-border'}`}
          >
            {loadingReclamation ? '⏳ Génération...' : '✉️ Réclamation fiscale'}
          </button>
          {reclamationData?.guide6675M && (
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'guide' ? 'bg-navy text-white' : 'bg-slate-bg text-slate-muted hover:bg-slate-border'}`}
            >
              📋 Guide 6675-M
            </button>
          )}
        </div>

        {/* CONTENU RAPPORT */}
        {activeTab === 'report' && report?.sections && (
          <div className="space-y-6">
            {report.sections.map((section: any, i: number) => (
              <div key={i} className="bg-slate-bg rounded-xl border border-slate-border p-6">
                <h3 className="font-heading font-bold text-slate-text text-base mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-emerald rounded-full flex-shrink-0" />
                  {section.title}
                </h3>
                <div className="text-sm text-slate-text leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={() => handleDownloadPdf('report')}
                disabled={loadingPdf === 'report'}
                className="cta-primary !text-sm"
              >
                {loadingPdf === 'report' ? '⏳ Génération PDF...' : '📥 Télécharger le rapport PDF'}
              </button>
            </div>
          </div>
        )}

        {/* CONTENU RÉCLAMATION */}
        {activeTab === 'reclamation' && reclamationData && (
          <div className="space-y-6">
            <div className="bg-slate-bg rounded-xl border border-slate-border p-6">
              <h3 className="font-heading font-bold text-slate-text text-base mb-1">
                ✉️ Réclamation fiscale
              </h3>
              <p className="text-xs text-slate-muted mb-4">
                Destinataire : {reclamationData.destinataire || 'Service des Impôts Fonciers'}
              </p>
              <div className="bg-white rounded-lg p-5 border border-slate-border text-sm text-slate-text leading-relaxed whitespace-pre-line font-serif">
                {reclamationData.courrier}
              </div>
            </div>

            {/* Pièces justificatives */}
            {reclamationData.piecesJustificatives && reclamationData.piecesJustificatives.length > 0 && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
                <h4 className="font-semibold text-amber-800 text-sm mb-3">📎 Pièces justificatives à joindre</h4>
                <ul className="space-y-1.5">
                  {reclamationData.piecesJustificatives.map((piece: string, i: number) => (
                    <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      {piece}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={() => handleDownloadPdf('reclamation')}
                disabled={loadingPdf === 'reclamation'}
                className="cta-primary !text-sm"
              >
                {loadingPdf === 'reclamation' ? '⏳ Génération PDF...' : '📥 Télécharger la réclamation PDF'}
              </button>
            </div>
          </div>
        )}

        {/* GUIDE 6675-M */}
        {activeTab === 'guide' && reclamationData?.guide6675M && (
          <div className="bg-slate-bg rounded-xl border border-slate-border p-6">
            <h3 className="font-heading font-bold text-slate-text text-base mb-3 flex items-center gap-2">
              📋 Comment obtenir le formulaire 6675-M
            </h3>
            <div className="text-sm text-slate-text leading-relaxed whitespace-pre-line">
              {reclamationData.guide6675M}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
