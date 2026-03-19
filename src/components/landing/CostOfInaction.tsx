'use client'
import { useEffect, useRef, useState } from 'react'

const CASES = [
  {
    icon: '🏠',
    situation: 'Locataire à Lyon',
    problem: 'Loyer au-dessus du plafond de 200\u00a0\u20ac/mois',
    loss: '4\u00a0800\u00a0\u20ac',
    period: 'perdus en 2 ans sans action',
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  {
    icon: '\uD83D\uDC74',
    situation: 'Retraité, 3 trimestres manquants',
    problem: '180\u00a0\u20ac/mois en moins sur la pension',
    loss: '43\u00a0200\u00a0\u20ac',
    period: 'perdus sur 20 ans de retraite',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    icon: '\uD83D\uDCB0',
    situation: 'Caution non restituée',
    problem: 'Bailleur hors délai depuis 4 mois',
    loss: '1\u00a0260\u00a0\u20ac',
    period: 'récupérables (caution + pénalités 10%/mois)',
    color: 'text-emerald',
    bg: 'bg-emerald/5',
    border: 'border-emerald/20',
  },
]

export function CostOfInaction() {
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
        <div className="text-center mb-14">
          <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-red-500 bg-red-50 border border-red-200 rounded-full">
            Chaque mois compte
          </span>
          <h2 className={`font-heading text-[clamp(28px,4vw,44px)] font-extrabold text-navy mt-4 tracking-tight transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            Ce que ça coûte de ne rien faire
          </h2>
          <p className={`text-slate-muted text-[17px] max-w-[520px] mx-auto mt-4 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            La prescription court. Chaque mois sans vérification, c&apos;est de l&apos;argent perdu pour de bon.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {CASES.map((c, i) => (
            <div
              key={i}
              className={`rounded-2xl ${c.bg} border ${c.border} p-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="text-2xl mb-3">{c.icon}</div>
              <div className="text-sm font-bold text-slate-text mb-1">{c.situation}</div>
              <p className="text-xs text-slate-muted leading-relaxed mb-4">{c.problem}</p>
              <div className={`font-heading text-[32px] font-extrabold ${c.color} tracking-tight leading-none`}>
                {c.loss}
              </div>
              <div className="text-xs text-slate-muted mt-1">{c.period}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-muted mt-10 max-w-[480px] mx-auto">
          Ces montants sont calculés sur des situations réelles, avec les barèmes légaux en vigueur.
          <a href="#diagnostic" className="text-emerald font-semibold ml-1 hover:underline">
            Vérifiez votre situation gratuitement →
          </a>
        </p>
      </div>
    </section>
  )
}
