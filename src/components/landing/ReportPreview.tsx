'use client'
import { useEffect, useRef, useState } from 'react'

const REPORT_ITEMS = [
  { icon: '\uD83D\uDD0D', text: 'Analyse ligne par ligne de votre situation' },
  { icon: '\u2696\uFE0F', text: 'Chaque anomalie citée avec l\u0027article de loi applicable' },
  { icon: '\uD83D\uDCB0', text: 'Montant exact récupérable, calculé à l\u0027euro près' },
  { icon: '\uD83D\uDCE8', text: '2-3 courriers préremplis (mise en demeure, réclamation, médiateur)' },
  { icon: '\uD83D\uDCD6', text: 'Mode d\u0027emploi : quoi envoyer, à qui, dans quel délai' },
  { icon: '\u2753', text: 'Section \u00ab\u00a0limites de l\u0027analyse\u00a0\u00bb pour une transparence totale' },
]

export function ReportPreview() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-24 px-6 bg-white">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">

          {/* Texte */}
          <div className={`flex-1 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-600 bg-purple-600/10 border border-purple-600/20 rounded-full mb-4">
              Votre rapport
            </span>
            <h2 className="font-heading text-[clamp(28px,4vw,40px)] font-extrabold text-navy tracking-tight mb-4">
              Ce que vous recevez
            </h2>
            <p className="text-slate-muted text-base leading-relaxed mb-8 max-w-[440px]">
              Pas un PDF vague de 2 pages. Un dossier complet, sourcé, avec les courriers prêts à signer et envoyer.
            </p>
            <div className="space-y-4">
              {REPORT_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 transition-all duration-500 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  style={{ transitionDelay: `${200 + i * 80}ms` }}
                >
                  <span className="text-lg mt-0.5 shrink-0">{item.icon}</span>
                  <span className="text-sm text-slate-text leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mock rapport (desktop) */}
          <div className={`hidden lg:block flex-shrink-0 w-[320px] transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            <div className="bg-slate-bg border border-slate-border rounded-2xl p-5 transform -rotate-1">
              <div className="bg-white rounded-xl p-5 shadow-lg">
                {/* Header mock */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-border">
                  <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center">
                    <span className="text-emerald text-[11px] font-extrabold">R</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-text">Rapport d&apos;audit RÉCUPÉO</div>
                    <div className="text-[7px] text-slate-muted">Généré le 16/03/2026</div>
                  </div>
                </div>
                {/* Anomalies mock */}
                <div className="text-[8px] font-bold text-slate-text uppercase tracking-wider mb-2">Anomalies détectées</div>
                <div className="space-y-2 mb-4">
                  <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[7px] font-bold text-red-600">Vétusté non appliquée</span>
                      <span className="text-[7px] font-bold text-red-600">-320\u00a0\u20ac</span>
                    </div>
                    <div className="text-[6px] text-red-400 mt-0.5">Loi 89-462, grille FNAIM</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[7px] font-bold text-red-600">Pénalité retard restitution</span>
                      <span className="text-[7px] font-bold text-red-600">-180\u00a0\u20ac</span>
                    </div>
                    <div className="text-[6px] text-red-400 mt-0.5">Art. 22 loi 89-462, loi ALUR</div>
                  </div>
                </div>
                {/* Courriers mock */}
                <div className="text-[8px] font-bold text-slate-text uppercase tracking-wider mb-2">Courriers inclus</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[7px] text-slate-muted">
                    <span className="text-emerald">\u2713</span> Mise en demeure bailleur
                  </div>
                  <div className="flex items-center gap-2 text-[7px] text-slate-muted">
                    <span className="text-emerald">\u2713</span> Saisine Commission Conciliation
                  </div>
                  <div className="flex items-center gap-2 text-[7px] text-slate-muted">
                    <span className="text-emerald">\u2713</span> Signalement préfecture
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
