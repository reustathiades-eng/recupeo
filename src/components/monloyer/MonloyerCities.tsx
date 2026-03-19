'use client'
import { useState } from 'react'
import { TERRITORIES } from '@/lib/monloyer/cities'

export function MonloyerCities() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <section id="villes" className="py-16 bg-white">
      <div className="max-w-[900px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text mb-3">
            69 communes concernées en 2026
          </h2>
          <p className="text-slate-muted text-base">
            9 territoires appliquent l&apos;encadrement des loyers en France
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TERRITORIES.map(t => {
            const isOpen = expanded === t.id
            return (
              <div key={t.id} className="bg-slate-bg rounded-xl border border-slate-border overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : t.id)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-slate-text text-sm">{t.label}</div>
                    <div className="text-xs text-slate-muted mt-0.5">
                      {t.cities.length} commune{t.cities.length > 1 ? 's' : ''} &middot; Depuis {t.since.replace('-', '/')}
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-muted flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {t.cities.map(c => (
                        <span key={c} className="px-2.5 py-1 bg-white rounded-lg text-xs text-slate-text border border-slate-border">
                          {c}
                        </span>
                      ))}
                    </div>
                    <a
                      href={t.simulatorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-xs text-emerald font-semibold hover:underline"
                    >
                      Simulateur officiel &rarr;
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
