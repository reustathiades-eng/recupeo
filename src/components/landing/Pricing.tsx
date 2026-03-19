'use client'
import { useEffect, useRef, useState } from 'react'
import { PRICING } from '@/lib/constants'

const tiers = [
  { key: 'free' as const, accentClass: 'text-slate-muted', checkClass: 'text-emerald', btnClass: 'bg-slate-bg text-navy border border-slate-border hover:bg-slate-100', featured: false },
  { key: 'premium' as const, accentClass: 'text-emerald', checkClass: 'text-emerald', btnClass: 'cta-primary w-full justify-center', featured: true },
  { key: 'premiumPlus' as const, accentClass: 'text-blue-600', checkClass: 'text-blue-600', btnClass: 'bg-blue-600 text-white hover:bg-blue-700 w-full justify-center', featured: false },
]

export function Pricing() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect() }, [])
  return (
    <section id="tarifs" ref={ref} className="py-24 px-6 max-w-[1200px] mx-auto">
      <div className="text-center mb-16">
        <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full">Tarifs transparents</span>
        <h2 className={`font-heading text-[clamp(28px,4vw,44px)] font-extrabold text-navy mt-4 tracking-tight transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>Un prix juste, un retour garanti</h2>
        <p className={`text-slate-muted text-[17px] max-w-[520px] mx-auto mt-4 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>Commencez gratuitement. Le rapport coûte toujours une fraction de ce que vous récupérez.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
        {tiers.map((tier, i) => { const plan = PRICING[tier.key]; return (
          <div key={tier.key} className={`pricing-card transition-all duration-700 ${tier.featured ? 'pricing-featured' : ''} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`} style={{ transitionDelay: `${i * 100}ms` }}>
            {tier.featured && <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-emerald text-navy-dark text-[11px] font-bold px-4 py-1 rounded-b-lg uppercase tracking-wider">Populaire</div>}
            <div className={`text-[13px] font-semibold uppercase tracking-wider ${tier.accentClass}`}>{plan.name}</div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-heading text-[40px] font-extrabold text-navy">{plan.price}</span>
              {plan.period && <span className="text-[15px] text-slate-muted">{plan.period}</span>}
            </div>
            {'yearlyPrice' in plan && <p className="text-sm text-slate-muted mt-1">ou {plan.yearlyPrice} <span className={`${tier.accentClass} font-semibold`}>(économisez {plan.yearlySaving})</span></p>}
            <div className="border-b border-slate-border pb-5" />
            <ul className="mt-5 flex flex-col gap-3">
              {plan.features.map((f, fi) => (<li key={fi} className="text-sm text-slate-text flex gap-2.5 items-start"><span className={`${tier.checkClass} font-bold text-base leading-[1.2]`}>✓</span>{f}</li>))}
            </ul>
            <a href="#diagnostic" className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all duration-200 mt-7 w-full justify-center ${tier.btnClass}`}>{plan.cta}</a>
          </div>
        ) })}
      </div>
      <p className="text-center text-[13px] text-slate-muted mt-8">Rapports unitaires aussi disponibles : 19€ à 149€ selon le domaine. Sans engagement.</p>
    </section>
  )
}
