'use client'
import { fmt } from '@/lib/format'
import { useEffect, useRef, useState } from 'react'

function useCountUp(end: number, duration = 2500) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!started) return
    const steps = 60; const inc = end / steps; let step = 0
    const t = setInterval(() => { step++; if (step >= steps) { setCount(end); clearInterval(t) } else setCount(Math.round(inc * step)) }, duration / steps)
    return () => clearInterval(t)
  }, [started, end, duration])
  return [count, ref] as const
}

export function Hero() {
  const [heroCount, heroRef] = useCountUp(2400)
  return (
    <section
      className="relative overflow-hidden pt-[140px] pb-[100px] min-h-[90vh] flex items-center"
      style={{
        background: 'linear-gradient(165deg, #060D1B 0%, #0B1426 40%, #0F2847 100%)',
        backgroundImage: `linear-gradient(165deg, #060D1B 0%, #0B1426 40%, #0F2847 100%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '100% 100%, 60px 60px, 60px 60px',
      }}
    >
      <div className="absolute top-[-40%] right-[-20%] w-[80%] h-[120%] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(0,214,143,0.07) 0%, transparent 65%)' }} />
      <div className="absolute bottom-[-30%] left-[-10%] w-[60%] h-[80%] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.05) 0%, transparent 60%)' }} />
      <div className="max-w-[1200px] mx-auto px-6 w-full relative z-10">
        <div className="flex items-center gap-12">
          <div className="flex-1 max-w-[640px]">
            <div className="flex items-center gap-2.5 mb-7">
              <div className="w-2 h-2 bg-emerald rounded-full animate-pulse-dot" />
              <span className="text-emerald text-sm font-semibold uppercase tracking-wider">Intelligence Artificielle × Droit français</span>
            </div>
            <h1 className="font-heading text-[clamp(36px,5.5vw,64px)] font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              L&apos;IA qui récupère<br />
              <span className="bg-gradient-to-r from-emerald to-emerald-light bg-clip-text text-transparent">ce qu&apos;on vous doit</span>
            </h1>
            <p className="text-[19px] text-white/[0.65] leading-relaxed max-w-[540px] mb-10">Uploadez vos documents. Notre IA détecte les erreurs, calcule ce qu&apos;on vous doit, et génère les courriers pour récupérer votre argent.</p>
            <div className="flex gap-3.5 flex-wrap mb-14">
              <a href="#diagnostic" className="cta-primary !text-[17px] !py-[18px] !px-9">Lancer mon diagnostic gratuit →</a>
              <a href="#comment" className="cta-outline !text-[17px] !py-[18px] !px-9">Comment ça marche</a>
            </div>
            <div ref={heroRef} className="flex gap-10 flex-wrap">
              <div><div className="font-heading text-[40px] font-extrabold text-emerald tracking-tight">~{fmt(heroCount)}&euro;</div><div className="text-[13px] text-white/[0.45] mt-1">Récupéré en moyenne</div></div>
              <div className="w-px bg-white/10" />
              <div><div className="font-heading text-[40px] font-extrabold text-white tracking-tight">14</div><div className="text-[13px] text-white/[0.45] mt-1">Domaines d&apos;audit</div></div>
              <div className="w-px bg-white/10" />
              <div><div className="font-heading text-[40px] font-extrabold text-white tracking-tight">30s</div><div className="text-[13px] text-white/[0.45] mt-1">Pour votre pré-diagnostic</div></div>
            </div>
          </div>

          {/* Mock plateforme (desktop only) */}
          <div className="hidden lg:block flex-shrink-0 w-[300px]">
            <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-5 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-navy flex items-center justify-center">
                    <span className="text-emerald text-[10px] font-extrabold">R</span>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-text">RÉCUPÉO</div>
                    <div className="text-[6px] text-slate-muted">Vos diagnostics en cours</div>
                  </div>
                </div>
                {/* Mini cards */}
                <div className="space-y-2">
                  <div className="bg-red-50 rounded-lg p-2.5 border border-red-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[7px] font-bold text-slate-text">Dépôt de garantie</span>
                      <span className="text-[6px] text-red-500 font-bold px-1.5 py-0.5 bg-red-100 rounded-full">3 anomalies</span>
                    </div>
                    <div className="text-red-600 font-heading font-extrabold text-sm leading-none">652&euro; récupérables</div>
                  </div>
                  <div className="bg-emerald/5 rounded-lg p-2.5 border border-emerald/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[7px] font-bold text-slate-text">Encadrement loyer</span>
                      <span className="text-[6px] text-emerald font-bold px-1.5 py-0.5 bg-emerald/10 rounded-full">Dépassement</span>
                    </div>
                    <div className="text-emerald font-heading font-extrabold text-sm leading-none">+250&euro;/mois</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[7px] font-bold text-slate-text">Pension alimentaire</span>
                      <span className="text-[6px] text-amber-600 font-bold px-1.5 py-0.5 bg-amber-100 rounded-full">Non revalorisée</span>
                    </div>
                    <div className="text-amber-600 font-heading font-extrabold text-sm leading-none">3 060&euro; d&apos;arriérés</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 text-center">
                  <div className="text-[7px] text-slate-muted">Total récupérable estimé</div>
                  <div className="font-heading font-extrabold text-emerald text-lg leading-none mt-0.5">11 712&euro;</div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="text-[9px] text-white/50">Exemple de tableau de bord</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
