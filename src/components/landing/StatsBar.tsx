'use client'
import { useEffect, useRef, useState } from 'react'
import { STATS } from '@/lib/constants'
export function StatsBar() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.2 }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect() }, [])
  return (
    <section ref={ref} className="bg-slate-bg border-b border-slate-border">
      <div className="max-w-[1200px] mx-auto px-6"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <div key={i} className={`text-center py-7 px-4 transition-all duration-500 ${i < STATS.length - 1 ? 'lg:border-r border-slate-border' : ''} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: `${i * 120}ms` }}>
            <div className="font-heading text-[32px] font-extrabold text-navy tracking-tight">{stat.value}</div>
            <div className="text-sm text-slate-muted mt-1.5 leading-snug">{stat.label}</div>
            <div className="text-[11px] text-emerald font-semibold mt-2 uppercase tracking-wider">{stat.source}</div>
          </div>
        ))}
      </div></div>
    </section>
  )
}
