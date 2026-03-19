'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BRIQUES } from '@/lib/constants'
export function BriquesGrid() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.08 }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect() }, [])
  return (
    <section id="services" ref={ref} className="bg-slate-bg py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald bg-emerald/[0.12] border border-emerald/25 rounded-full">14 domaines d&apos;audit</span>
          <h2 className={`font-heading text-[clamp(28px,4vw,44px)] font-extrabold text-navy mt-4 tracking-tight transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>Tout ce qu&apos;on peut vérifier pour vous</h2>
          <p className={`text-slate-muted text-[17px] max-w-[560px] mx-auto mt-4 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>Chaque brique est un expert IA spécialisé dans un domaine du droit français.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[18px]">
          {BRIQUES.map((b, i) => {
            const Card = (
              <div className={`brique-card transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'} ${!b.available ? 'opacity-60' : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'}`} style={{ transitionDelay: `${Math.min(i * 60, 600)}ms` }}>
                <div className="flex justify-between items-start mb-3.5">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center shrink-0"><Image src={b.icon} alt={b.name} width={80} height={80} className="object-cover scale-125" unoptimized /></div>
                  <span className={`px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-wider rounded-full ${b.tag === 'Gratuit' ? 'text-emerald bg-emerald/[0.12] border border-emerald/25' : b.available ? 'text-blue-600 bg-blue-600/10 border border-blue-600/20' : 'text-slate-muted bg-slate-100 border border-slate-border'}`}>{b.tag}</span>
                </div>
                <h4 className="font-heading text-[13px] font-bold text-emerald uppercase tracking-widest">{b.name}</h4>
                <h3 className="font-heading text-lg font-bold text-navy mt-1">{b.label}</h3>
                <p className="text-[13.5px] text-slate-muted mt-2 leading-snug">{b.desc}</p>
                <div className="mt-3.5 pt-3.5 border-t border-slate-border flex items-center justify-between">
                  <span className="text-xs text-slate-muted">Enjeu moyen</span>
                  <span className="font-heading text-[15px] font-bold text-navy">{b.enjeu}</span>
                </div>
              </div>
            )
            return b.available ? (
              <Link key={b.id} href={b.url}>{Card}</Link>
            ) : (
              <div key={b.id}>{Card}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
