'use client'
import { useEffect, useRef, useState } from 'react'

const ENGAGEMENTS = [
  {
    num: '01',
    title: 'Fondé sur le droit, pas sur des opinions',
    desc: "Chaque calcul cite l\u0027article de loi applicable. Nos résultats sont vérifiables, pas un avis subjectif.",
    accent: 'text-emerald',
    bg: 'bg-emerald/[0.06]',
  },
  {
    num: '02',
    title: 'Satisfait ou remboursé 14 jours',
    desc: "Si notre rapport ne vous convient pas, remboursement intégral sans justification. Zéro risque pour vous.",
    accent: 'text-blue-600',
    bg: 'bg-blue-600/[0.06]',
  },
  {
    num: '03',
    title: 'Vos données ne sont jamais revendues',
    desc: "Anonymisation avant analyse. Suppression sur demande. Zéro tracking publicitaire. Hébergement OVH en France.",
    accent: 'text-amber-500',
    bg: 'bg-amber-500/[0.06]',
  },
  {
    num: '04',
    title: 'Pré-diagnostic toujours gratuit',
    desc: "Vous ne payez que si nos résultats montrent un montant récupérable. Le diagnostic initial est gratuit, sans engagement.",
    accent: 'text-purple-500',
    bg: 'bg-purple-500/[0.06]',
  },
]

export function Commitments() {
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
          <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald bg-emerald/[0.12] border border-emerald/25 rounded-full">
            Nos engagements
          </span>
          <h2 className={`font-heading text-[clamp(28px,4vw,44px)] font-extrabold text-navy mt-4 tracking-tight transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
            Pourquoi nous faire confiance
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {ENGAGEMENTS.map((e, i) => (
            <div
              key={i}
              className={`${e.bg} rounded-2xl p-7 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`font-heading text-[13px] font-extrabold ${e.accent} uppercase tracking-widest mb-3`}>
                {e.num}
              </div>
              <h3 className="font-heading text-lg font-bold text-navy mb-2">{e.title}</h3>
              <p className="text-sm text-slate-muted leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
