'use client'
import { useEffect, useRef, useState } from 'react'
import { STEPS } from '@/lib/constants'
export function HowItWorks() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect() }, [])
  const colors: Record<string, { bg: string; text: string }> = { emerald: { bg: 'bg-emerald/[0.08]', text: 'text-emerald' }, blue: { bg: 'bg-blue-600/[0.08]', text: 'text-blue-600' } }
  return (
    <section id="comment" ref={ref} className="py-24 px-6 max-w-[1200px] mx-auto">
      <div className="text-center mb-16">
        <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-600/10 border border-blue-600/20 rounded-full">Simple &amp; rapide</span>
        <h2 className={`font-heading text-[clamp(28px,4vw,44px)] font-extrabold text-navy mt-4 tracking-tight transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>Comment ça marche ?</h2>
        <p className={`text-slate-muted text-[17px] max-w-[520px] mx-auto mt-4 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>Trois étapes. Zéro jargon juridique. Résultat en 30 secondes.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STEPS.map((step, i) => { const c = colors[step.color]; return (
          <div key={i} className={`p-9 rounded-[20px] bg-white border border-slate-border transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`} style={{ transitionDelay: `${i * 150}ms` }}>
            <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center font-heading text-[22px] font-extrabold`}>{step.num}</div>
            <h3 className="font-heading text-[22px] font-bold mt-5 text-navy">{step.title}</h3>
            <p className="text-[15px] text-slate-muted mt-2.5 leading-relaxed">{step.desc}</p>
          </div>
        ) })}
      </div>
    </section>
  )
}
