'use client'
import { useEffect, useRef, useState } from 'react'

const POINTS = [
  {
    icon: '\uD83D\uDD12',
    title: 'Vos données sont anonymisées',
    desc: "Avant chaque analyse, toutes vos informations personnelles (nom, adresse, numéros) sont remplacées par des tokens. L\u0027IA ne voit jamais vos données réelles.",
  },
  {
    icon: '\u2696\uFE0F',
    title: "Elle cite ses sources juridiques",
    desc: "Chaque anomalie détectée est liée à un article de loi précis (Code civil, CGI, Code de la sécurité sociale). Pas d\u0027affirmation sans fondement légal.",
  },
  {
    icon: '\u2753',
    title: 'Elle dit ce qu\u0027elle ne sait pas',
    desc: "Chaque rapport inclut une section \u00ab\u00a0Limites de l\u0027analyse\u00a0\u00bb. Nous préférons être honnêtes plutôt que de promettre l\u0027impossible.",
  },
  {
    icon: '\uD83C\uDDEB\uD83C\uDDF7',
    title: 'Spécialisée droit français',
    desc: "Notre IA est configurée avec les textes de loi, barèmes officiels, indices INSEE et jurisprudence française à jour. Pas un chatbot généraliste.",
  },
]

export function AITransparency() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-24 px-6 bg-slate-bg border-t border-slate-border">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-600/10 border border-blue-600/20 rounded-full">
            Transparence totale
          </span>
          <h2 className={`font-heading text-[clamp(28px,4vw,44px)] font-extrabold text-navy mt-4 tracking-tight transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            Comment fonctionne notre IA
          </h2>
          <p className={`text-slate-muted text-[17px] max-w-[560px] mx-auto mt-4 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            Nos concurrents font des promesses opaques. Nous, on vous explique exactement comment ça marche — et quelles sont les limites.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {POINTS.map((p, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border border-slate-border p-7 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-2xl mb-3">{p.icon}</div>
              <h3 className="font-heading text-base font-bold text-navy mb-2">{p.title}</h3>
              <p className="text-sm text-slate-muted leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
