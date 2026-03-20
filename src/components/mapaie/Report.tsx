'use client'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'
import { useState } from 'react'

interface MapaieReportProps {
  report: any
  letters: any | null
  diagnosticId: string
}

const LETTER_TABS = [
  { key: 'lrar_employeur', label: '📨 LRAR Employeur' },
  { key: 'saisine_cph', label: '⚖️ Saisine Prud\u2019hommes' },
]

export function MapaieReport({ report, letters, diagnosticId }: MapaieReportProps) {
  const [loadingLetters, setLoadingLetters] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null)
  const [lettersData, setLettersData] = useState<any>(letters)
  const [activeTab, setActiveTab] = useState<'report' | 'letters'>('report')
  const [activeLetter, setActiveLetter] = useState('lrar_employeur')

  const handleGenerateLetters = async () => {
    setLoadingLetters(true)
    track({ event: 'mapaie_reclamation_generated', brique: 'mapaie' })
    try {
      const res = await fetch('/api/mapaie/generate-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosticId }),
      })
      const data = await res.json()
      if (data.success) { setLettersData(data.letters); setActiveTab('letters') }
    } catch { alert('Erreur lors de la génération des courriers') }
    finally { setLoadingLetters(false) }
  }

  const handleDownloadPdf = async (type: 'report' | 'letters') => {
    setLoadingPdf(type)
    track({ event: 'mapaie_pdf_downloaded', brique: 'mapaie', type })
    try {
      const res = await fetch('/api/mapaie/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosticId, type }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `RECUPEO-${type === 'report' ? 'rapport' : 'courriers'}-mapaie.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Erreur lors du téléchargement') }
    finally { setLoadingPdf(null) }
  }

  const fs = report?.financial_summary

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald/10 text-emerald text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-emerald rounded-full" />
            Rapport complet
          </div>
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text">
            {report?.title || "Audit bulletin de paie — Ce qu'on vous doit"}
          </h2>
          <p className="text-sm text-slate-muted mt-2">
            Référence : {report?.reference || '—'} · Généré le {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {fs && (
          <div className="bg-emerald/5 border border-emerald/20 rounded-2xl p-6 mb-8">
            <h3 className="font-heading font-bold text-slate-text text-base mb-4">💰 Rappel de salaire récupérable</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-slate-muted">Anomalies détectées</div>
                <div className="font-bold text-slate-text">{fs.nb_anomalies ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-muted">Période analysée</div>
                <div className="font-bold text-slate-text">{fs.periode ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-muted">Prescrit / récupérable</div>
                <div className="font-bold text-slate-text">{fmt(fs.montant_prescrit ?? 0)}€ / {fmt(fs.montant_recuperable ?? 0)}€</div>
              </div>
            </div>
            <div className="border-t border-emerald/20 pt-4 flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-slate-text">Total à récupérer (3 ans)</span>
              <span className="font-heading text-[28px] font-extrabold text-emerald">
                {fmt(fs.montant_total ?? 0)}€
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setActiveTab('report')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'report' ? 'bg-navy text-white' : 'bg-slate-bg text-slate-muted hover:bg-slate-border'}`}>
            📄 Rapport détaillé
          </button>
          <button onClick={() => lettersData ? setActiveTab('letters') : handleGenerateLetters()}
            disabled={loadingLetters}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'letters' ? 'bg-navy text-white' : 'bg-slate-bg text-slate-muted hover:bg-slate-border'}`}>
            {loadingLetters ? '⏳ Génération...' : '✉️ Courriers de réclamation'}
          </button>
        </div>

        {activeTab === 'report' && report?.sections && (
          <div className="space-y-6">
            {report.sections.map((s: any, i: number) => (
              <div key={i} className="bg-slate-bg rounded-xl border border-slate-border p-6">
                <h3 className="font-heading font-bold text-slate-text text-base mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-emerald rounded-full flex-shrink-0" />{s.title}
                </h3>
                <div className="text-sm text-slate-text leading-relaxed whitespace-pre-line">{s.content}</div>
              </div>
            ))}
            {report.next_steps?.length > 0 && (
              <div className="bg-navy/[0.03] rounded-xl p-6 border border-navy/10">
                <h3 className="font-heading font-bold text-slate-text text-base mb-4">🎯 Prochaines étapes</h3>
                <div className="space-y-4">
                  {report.next_steps.map((step: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald/10 text-emerald font-bold text-sm flex items-center justify-center flex-shrink-0">{step.step}</div>
                      <div>
                        <div className="font-semibold text-slate-text text-sm">{step.action}</div>
                        <div className="text-xs text-slate-muted mt-1">{step.detail}</div>
                        {step.deadline && <div className="text-xs text-emerald mt-1">⏰ {step.deadline}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => handleDownloadPdf('report')} disabled={loadingPdf === 'report'} className="cta-primary w-full justify-center">
              {loadingPdf === 'report' ? '⏳ Génération PDF...' : '📥 Télécharger le rapport PDF'}
            </button>
          </div>
        )}

        {activeTab === 'letters' && lettersData && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {LETTER_TABS.map(t => (
                <button key={t.key} onClick={() => setActiveLetter(t.key)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeLetter === t.key ? 'bg-emerald/10 text-emerald border border-emerald/20' : 'bg-slate-bg text-slate-muted'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            {lettersData[activeLetter] && (
              <div className="bg-white border-2 border-slate-border rounded-xl p-8">
                <div className="text-xs text-slate-muted mb-1">{lettersData[activeLetter].type}</div>
                <h4 className="font-heading font-bold text-slate-text text-base mb-6">{lettersData[activeLetter].title}</h4>
                <div className="text-sm text-slate-text leading-relaxed whitespace-pre-line" style={{ fontFamily: 'serif' }}>
                  {(lettersData[activeLetter].content || '').replace(/\\n/g, '\n')}
                </div>
              </div>
            )}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              ⚠️ Complétez les champs entre [crochets] avant envoi. Conservez une copie de chaque courrier envoyé.
            </div>
            <button onClick={() => handleDownloadPdf('letters')} disabled={loadingPdf === 'letters'} className="cta-primary w-full justify-center mt-4">
              {loadingPdf === 'letters' ? '⏳ Génération...' : '📥 Télécharger les courriers PDF'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
