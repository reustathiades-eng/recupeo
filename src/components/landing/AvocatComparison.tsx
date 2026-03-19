'use client'
import { useEffect, useRef, useState } from 'react'

const ROWS = [
  { label: 'Coût', avocat: '200-500\u00a0\u20ac/h', recupeo: '19-149\u00a0\u20ac tout compris' },
  { label: 'Délai', avocat: '2-6 semaines', recupeo: '30 secondes' },
  { label: 'Disponibilité', avocat: 'Heures de bureau', recupeo: '24/7, en ligne' },
  { label: 'Pré-diagnostic', avocat: 'Payant (consultation)', recupeo: 'Gratuit' },
  { label: 'Courriers juridiques', avocat: 'En supplément', recupeo: 'Inclus dans le rapport' },
  { label: 'Remboursement', avocat: 'Non', recupeo: '14 jours, sans justification' },
]

export function AvocatComparison() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-24 px-6 bg-slate-bg border-t border-slate-border">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-navy bg-navy/10 border border-navy/20 rounded-full">
            Positionnement
          </span>
          <h2 className={`font-heading text-[clamp(28px,4vw,44px)] font-extrabold text-navy mt-4 tracking-tight transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            Avocat vs RÉCUPÉO
          </h2>
          <p className={`text-slate-muted text-[17px] max-w-[520px] mx-auto mt-4 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            Nous ne remplaçons pas un avocat. Nous vous disons si vous avez besoin d&apos;un avocat.
          </p>
        </div>

        <div className={`bg-white rounded-2xl border border-slate-border overflow-hidden shadow-sm transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
          {/* Header */}
          <div className="grid grid-cols-3 bg-slate-bg border-b border-slate-border">
            <div className="p-4" />
            <div className="p-4 text-center border-l border-slate-border">
              <div className="text-sm font-bold text-slate-text">\u2696\uFE0F Avocat</div>
            </div>
            <div className="p-4 text-center border-l border-emerald/30 bg-emerald/[0.04]">
              <div className="text-sm font-bold text-emerald">RÉCUPÉO</div>
            </div>
          </div>
          {/* Rows */}
          {ROWS.map((row, i) => (
            <div key={i} className={`grid grid-cols-3 ${i < ROWS.length - 1 ? 'border-b border-slate-border' : ''}`}>
              <div className="p-4 text-sm font-semibold text-slate-text">
                {row.label}
              </div>
              <div className="p-4 text-sm text-slate-muted text-center border-l border-slate-border">
                {row.avocat}
              </div>
              <div className="p-4 text-sm text-emerald font-semibold text-center border-l border-emerald/30 bg-emerald/[0.02]">
                {row.recupeo}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-muted mt-8 max-w-[560px] mx-auto italic">
          &laquo;&nbsp;RÉCUPÉO ne remplace pas un avocat — il vous dit si votre situation justifie d&apos;en consulter un, et vous donne tous les éléments pour le faire.&nbsp;&raquo;
        </p>
      </div>
    </section>
  )
}
