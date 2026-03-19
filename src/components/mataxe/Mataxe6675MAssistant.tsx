'use client'
import { useState, useEffect } from 'react'
import { track } from '@/lib/analytics'
import { generateDemandeMessage, generateDemandeCourrier, getMethods6675M } from '@/lib/mataxe/demande-6675m'

interface Mataxe6675MAssistantProps {
  commune: string
}

export function Mataxe6675MAssistant({ commune }: Mataxe6675MAssistantProps) {
  const [activeMethod, setActiveMethod] = useState(0)
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    track({ event: 'assistant_6675m_viewed', brique: 'mataxe' })
  }, [])

  const methods = getMethods6675M(commune)
  const messageEnLigne = generateDemandeMessage(commune)
  const courrier = generateDemandeCourrier(commune)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    track({ event: 'assistant_6675m_copied', brique: 'mataxe', method: activeMethod === 0 ? 'online' : 'courrier' })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-16 bg-emerald/[0.03]">
      <div className="max-w-[720px] mx-auto px-6">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald/10 text-emerald text-sm font-semibold mb-4">
            📋 Gratuit — On vous aide
          </div>
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-3">
            Obtenez votre formulaire 6675-M
          </h2>
          <p className="text-slate-muted text-base max-w-[560px] mx-auto">
            Ce document gratuit contient les données exactes de l&apos;administration.
            Avec lui, notre diagnostic passe de ~60% à ~95% de fiabilité.
          </p>
        </div>

        {/* Pourquoi c'est important */}
        <div className="bg-white rounded-xl border border-slate-border p-5 mb-6">
          <h3 className="font-semibold text-sm text-slate-text mb-3">🔑 Pourquoi ce document est la clé</h3>
          <p className="text-sm text-slate-muted leading-relaxed mb-3">
            Le formulaire 6675-M (fiche d&apos;évaluation cadastrale) est le document interne de l&apos;administration qui détaille <strong>exactement</strong> comment votre taxe foncière est calculée :
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Surface pondérée exacte',
              'Catégorie cadastrale',
              'Coefficient d\'entretien',
              'Coefficient de situation',
              'Tarif au m²',
              'Liste des équipements comptés',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-text">
                <span className="text-emerald">✓</span> {item}
              </div>
            ))}
          </div>
          <p className="text-xs text-emerald font-medium mt-3">
            Avec ces données, nous pouvons comparer paramètre par paramètre avec notre estimation et identifier les erreurs exactes.
          </p>
        </div>

        {/* Tabs méthodes */}
        <div className="flex gap-2 mb-4">
          {methods.map((m, i) => (
            <button
              key={i}
              onClick={() => setActiveMethod(i)}
              className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-center ${
                activeMethod === i
                  ? 'bg-navy text-white'
                  : 'bg-white border border-slate-border text-slate-muted hover:bg-slate-bg'
              }`}
            >
              <span className="block text-base mb-0.5">{m.icon}</span>
              {m.title}
            </button>
          ))}
        </div>

        {/* Contenu méthode active */}
        <div className="bg-white rounded-xl border border-slate-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-slate-text text-base">
              {methods[activeMethod].icon} {methods[activeMethod].title}
            </h3>
            <span className="text-xs text-slate-muted bg-slate-bg px-2.5 py-1 rounded-full">
              ⏱ {methods[activeMethod].duration}
            </span>
          </div>

          {/* Étapes */}
          <ol className="space-y-2.5 mb-5">
            {methods[activeMethod].steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-text">
                <span className="w-5 h-5 rounded-full bg-emerald/10 text-emerald text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {/* Tip */}
          <div className="p-3 bg-emerald/5 rounded-lg border border-emerald/10 mb-5">
            <p className="text-xs text-emerald-dark">💡 {methods[activeMethod].tip}</p>
          </div>

          {/* Message pré-rédigé (méthode 1 : en ligne) */}
          {activeMethod === 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-text">Message pré-rédigé à copier-coller :</span>
                <button
                  onClick={() => copyToClipboard(messageEnLigne)}
                  className="text-xs font-medium text-emerald hover:text-emerald-dark flex items-center gap-1 transition-colors"
                >
                  {copied ? '✅ Copié !' : '📋 Copier le message'}
                </button>
              </div>
              <div className="bg-slate-bg rounded-lg p-4 border border-slate-border text-xs text-slate-text leading-relaxed whitespace-pre-line font-mono">
                {messageEnLigne}
              </div>
            </div>
          )}

          {/* Courrier LRAR (méthode 3 : courrier) */}
          {activeMethod === 2 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-text">Lettre pré-rédigée :</span>
                <button
                  onClick={() => copyToClipboard(courrier)}
                  className="text-xs font-medium text-emerald hover:text-emerald-dark flex items-center gap-1 transition-colors"
                >
                  {copied ? '✅ Copié !' : '📋 Copier la lettre'}
                </button>
              </div>
              <div className="bg-slate-bg rounded-lg p-4 border border-slate-border text-xs text-slate-text leading-relaxed whitespace-pre-line font-mono max-h-[300px] overflow-y-auto">
                {courrier}
              </div>
            </div>
          )}
        </div>

        {/* CTA retour */}
        <div className="text-center mt-8 p-5 bg-white rounded-xl border border-emerald/20">
          <p className="text-sm text-slate-text mb-2">
            <strong>Délai moyen de réponse : 2 à 4 semaines.</strong>
          </p>
          <p className="text-sm text-slate-muted">
            Revenez sur RÉCUPÉO avec votre formulaire 6675-M pour un diagnostic précis à 95%.
            Nous pourrons alors vous fournir un rapport d&apos;audit et une réclamation fiscale chiffrée au plus juste.
          </p>
        </div>
      </div>
    </section>
  )
}
