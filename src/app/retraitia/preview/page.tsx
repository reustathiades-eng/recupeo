'use client'
import { fmt } from '@/lib/format'
import { useState, useEffect } from 'react'



function PreviewContent() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const diagId = searchParams?.get('id') || null

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'prediag' | 'report' | 'letters'>('prediag')
  const [activeLetter, setActiveLetter] = useState('reclamation_carsat')
  const [pdfLoading, setPdfLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!diagId) { setLoading(false); return }
    fetch('/api/retraitia/preview?id=' + diagId)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [diagId])

  const downloadPdf = async (type: 'report' | 'letters') => {
    setPdfLoading(type)
    try {
      const res = await fetch('/api/retraitia/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosticId: diagId, type }),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'RECUPEO-' + (type === 'report' ? 'rapport' : 'courriers') + '-retraitia.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Erreur PDF') }
    finally { setPdfLoading(null) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20" style={{ background: 'linear-gradient(165deg, #060D1B 0%, #0B1426 40%, #0F2847 100%)' }}>
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-emerald border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-white/60 text-sm">Chargement du rapport...</p>
      </div>
    </div>
  )

  if (!data || data.error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-bg pt-20">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">!</div>
        <h2 className="font-heading text-xl font-bold text-slate-text mb-2">Rapport non disponible</h2>
        <p className="text-sm text-slate-muted mb-6">{data?.error || 'Diagnostic introuvable'}</p>
        <a href="/retraitia" className="cta-primary">Lancer un diagnostic</a>
      </div>
    </div>
  )

  const diag = data.diagnostic
  const analysis = diag?.aiAnalysis
  const report = data.report
  const letters = data.letters
  const fs = report?.financial_summary

  return (
    <>
      {/* Hero compact */}
      <div className="pt-[80px] pb-10" style={{ background: 'linear-gradient(165deg, #060D1B 0%, #0B1426 40%, #0F2847 100%)' }}>
        <div className="max-w-[900px] mx-auto px-6 pt-10">
          <a href="/retraitia" className="text-white/40 text-xs hover:text-white/60 transition-colors mb-4 inline-block">← Retour à RETRAITIA</a>

          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-2 h-2 bg-emerald rounded-full animate-pulse-dot" />
            <span className="text-emerald text-sm font-semibold uppercase tracking-wider">RETRAITIA</span>
          </div>
          <h1 className="font-heading text-[clamp(28px,5vw,42px)] font-extrabold text-white leading-tight mb-3">
            Rapport d&apos;audit{' '}
            <span className="bg-gradient-to-r from-emerald to-emerald-light bg-clip-text text-transparent">pension de retraite</span>
          </h1>
          <p className="text-white/50 text-sm">
            Diagnostic #{String(diag.id).slice(-8)} &middot; {diag.anomaliesCount} anomalie(s) &middot; Impact estim&eacute; : ~{fmt(diag.estimatedAmount || 0)}&euro;
          </p>

          {/* Onglets sur le hero */}
          <div className="flex gap-2 mt-8 flex-wrap">
            {[
              { key: 'prediag' as const, label: 'Pr\u00e9-diagnostic', icon: '\ud83d\udcca', show: true },
              { key: 'report' as const, label: 'Rapport complet', icon: '\ud83d\udcc4', show: !!report },
              { key: 'letters' as const, label: 'Courriers', icon: '\u2709\ufe0f', show: !!letters },
            ].filter(t => t.show).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all ${activeTab === t.key
                  ? 'bg-white text-navy shadow-lg -mb-px'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="bg-slate-bg min-h-[60vh] pb-20">
        <div className="max-w-[900px] mx-auto px-6 pt-8">

          {/* PRE-DIAGNOSTIC */}
          {activeTab === 'prediag' && analysis && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-border p-6 text-center shadow-sm">
                  <div className="text-sm text-slate-muted mb-1">Anomalies</div>
                  <div className="font-heading text-[48px] font-extrabold text-slate-text leading-none">{analysis.anomalies?.length || 0}</div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-border p-6 text-center shadow-sm">
                  <div className="text-sm text-slate-muted mb-1">Impact mensuel</div>
                  <div className="font-heading text-[28px] font-extrabold text-emerald leading-none">
                    {analysis.totalImpactMonthlyMin}&ndash;{analysis.totalImpactMonthlyMax}&euro;/mois
                  </div>
                </div>
                <div className="bg-emerald/5 border-2 border-emerald/30 rounded-2xl p-6 text-center shadow-sm">
                  <div className="text-sm text-emerald-dark font-medium mb-1">Impact esp&eacute;rance de vie</div>
                  <div className="font-heading text-[28px] font-extrabold text-emerald leading-none">
                    ~{(analysis.totalImpactLifetime || 0)}&euro;
                  </div>
                </div>
              </div>

              {(analysis.anomalies || []).map((a: any, i: number) => (
                <div key={i} className="bg-white rounded-xl border border-slate-border p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{a.severity === 'confirmed' ? '\u2705' : a.severity === 'probable' ? '\u26a0\ufe0f' : '\ud83d\udd0d'}</span>
                        <span className="font-heading font-bold text-slate-text">{a.title}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-bg text-slate-muted">{a.severity}</span>
                      </div>
                      <p className="text-sm text-slate-muted mb-2">{a.summary}</p>
                      <p className="text-xs text-slate-muted/60 leading-relaxed">{a.detail}</p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <span className="text-[10px] px-2.5 py-1 rounded-lg bg-navy/5 text-navy font-medium">{a.legalReference}</span>
                        {(a.documentsNeeded || []).map((d: string, j: number) => (
                          <span key={j} className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald/5 text-emerald-dark">{d}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap pl-4">
                      <div className="font-heading text-lg font-extrabold text-emerald">+{a.impactMonthlyMax}&euro;</div>
                      <div className="text-[10px] text-slate-muted">/mois</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-emerald/5 border border-emerald/20 rounded-xl p-5">
                <p className="text-sm text-slate-text"><strong>Recommandation :</strong> {analysis.recommendation}</p>
              </div>
            </div>
          )}

          {/* RAPPORT */}
          {activeTab === 'report' && report && (
            <div className="space-y-6">
              {fs && (
                <div className="bg-white rounded-2xl border-2 border-emerald/20 p-6 shadow-sm">
                  <h3 className="font-heading font-bold text-base mb-4 text-slate-text">Bilan financier</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                    <div><span className="text-slate-muted text-xs block">Pension d&eacute;clar&eacute;e</span><strong>{fs.pension_declared_monthly}&euro;/mois</strong></div>
                    <div><span className="text-slate-muted text-xs block">Impact mensuel</span><strong className="text-emerald">{fs.impact_monthly_min}&ndash;{fs.impact_monthly_max}&euro;</strong></div>
                    <div><span className="text-slate-muted text-xs block">Impact annuel</span><strong className="text-emerald">{fs.impact_annual_min}&ndash;{fs.impact_annual_max}&euro;</strong></div>
                    <div><span className="text-slate-muted text-xs block">Esp&eacute;rance de vie ({fs.life_expectancy_years}a)</span><strong className="text-emerald">{fmt(fs.impact_lifetime_max||0)}&euro;</strong></div>
                  </div>
                </div>
              )}

              {(report.sections || []).map((s: any, i: number) => (
                <div key={i} className="bg-white rounded-xl border border-slate-border p-6 shadow-sm">
                  <h3 className="font-heading font-bold text-base text-slate-text mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald/10 text-emerald text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                    {s.title.replace(/^\d+\.\s*/, '')}
                  </h3>
                  <div className="text-sm text-slate-muted leading-relaxed whitespace-pre-line">{s.content}</div>
                </div>
              ))}

              {report.next_steps && (
                <div className="bg-navy/[0.03] rounded-xl border border-navy/10 p-6">
                  <h3 className="font-heading font-bold text-base mb-4">Prochaines &eacute;tapes</h3>
                  {report.next_steps.map((s: any, i: number) => (
                    <div key={i} className="flex gap-3 mb-4">
                      <div className="w-7 h-7 rounded-full bg-emerald text-white font-bold text-xs flex items-center justify-center flex-shrink-0">{s.step}</div>
                      <div>
                        <div className="font-semibold text-sm text-slate-text">{s.action}</div>
                        <div className="text-xs text-slate-muted">{s.detail}</div>
                        {s.deadline && <div className="text-xs text-emerald font-medium mt-1">{s.deadline}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => downloadPdf('report')} disabled={pdfLoading === 'report'}
                className="cta-primary w-full justify-center !py-4 !text-base">
                {pdfLoading === 'report' ? 'G\u00e9n\u00e9ration en cours...' : 'T\u00e9l\u00e9charger le rapport complet en PDF'}
              </button>
            </div>
          )}

          {/* COURRIERS */}
          {activeTab === 'letters' && letters && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'reclamation_carsat', label: 'R\u00e9clamation CARSAT' },
                  { key: 'saisine_cra', label: 'Recours CRA' },
                  { key: 'saisine_mediateur', label: 'M\u00e9diateur' },
                ].map(t => (
                  <button key={t.key} onClick={() => setActiveLetter(t.key)}
                    className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all ${activeLetter === t.key
                      ? 'bg-navy text-white shadow-md' : 'bg-white text-slate-muted border border-slate-border hover:border-emerald/40'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {letters[activeLetter] && (
                <div className="bg-white rounded-xl border-2 border-slate-border p-10 shadow-sm">
                  <div className="text-xs text-red-600 font-semibold mb-4 uppercase tracking-wider">{letters[activeLetter].type}</div>
                  <h4 className="font-heading font-bold text-slate-text text-lg mb-8">{letters[activeLetter].title}</h4>
                  <div className="text-sm text-slate-text leading-relaxed whitespace-pre-line" style={{ fontFamily: 'Georgia, \"DejaVu Serif\", serif', lineHeight: '1.8' }}>
                    {(letters[activeLetter].content || '').replace(/\\n/g, '\n')}
                  </div>
                </div>
              )}

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <strong>Avant envoi :</strong> V&eacute;rifiez les informations pr&eacute;remplies et compl&eacute;tez les champs entre [crochets] si n&eacute;cessaire.
              </div>

              <button onClick={() => downloadPdf('letters')} disabled={pdfLoading === 'letters'}
                className="cta-primary w-full justify-center !py-4 !text-base">
                {pdfLoading === 'letters' ? 'G\u00e9n\u00e9ration en cours...' : 'T\u00e9l\u00e9charger les 3 courriers en PDF'}
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default function PreviewPage() {
  return <PreviewContent />
}
