'use client'
import { useState, useEffect } from 'react'

interface MacautionExtractionProps {
  /** Afficher la demande de consentement Vision au lieu du loading */
  needsVisionConsent?: boolean
  /** Score OCR (affiché si consentement demandé) */
  ocrConfidence?: number
  /** Callback si l'utilisateur accepte la Vision */
  onVisionConsent?: () => void
  /** Callback si l'utilisateur refuse (retour au mode manuel) */
  onManualFallback?: () => void
}

const LOADING_MESSAGES = [
  { text: 'Lecture de vos documents...', delay: 0 },
  { text: 'Identification des pièces...', delay: 3000 },
  { text: 'Extraction des données...', delay: 6000 },
  { text: 'Comparaison des états des lieux...', delay: 10000 },
  { text: 'Préparation du récapitulatif...', delay: 14000 },
]

export function MacautionExtraction({
  needsVisionConsent,
  ocrConfidence,
  onVisionConsent,
  onManualFallback,
}: MacautionExtractionProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  // Messages séquentiels
  useEffect(() => {
    if (needsVisionConsent) return

    const timers = LOADING_MESSAGES.map((msg, i) =>
      setTimeout(() => setMessageIndex(i), msg.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [needsVisionConsent])

  // Barre de progression simulée
  useEffect(() => {
    if (needsVisionConsent) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90 }
        return prev + Math.random() * 8
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [needsVisionConsent])

  // ============================================================
  // MODE : Demande de consentement Vision
  // ============================================================
  if (needsVisionConsent) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-[600px] mx-auto px-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
            {/* Icône */}
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl mx-auto mb-5">
              🔍
            </div>

            <h3 className="font-heading font-bold text-slate-text text-xl text-center mb-3">
              Analyse approfondie nécessaire
            </h3>

            <p className="text-slate-muted text-sm text-center mb-6 leading-relaxed">
              La qualité de vos documents
              {ocrConfidence !== undefined && (
                <span className="text-amber-700 font-semibold"> (lisibilité : {ocrConfidence}%)</span>
              )}{' '}
              ne permet pas une lecture automatique fiable. Pour extraire correctement les données,
              nous pouvons utiliser une <strong>analyse par IA avancée</strong>.
            </p>

            {/* Réassurance RGPD */}
            <div className="bg-white rounded-xl p-5 mb-6 space-y-3">
              <p className="text-xs font-semibold text-slate-text uppercase tracking-wider mb-3">
                Garanties de protection
              </p>
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">🔒</span>
                <p className="text-sm text-slate-muted">
                  Vos documents sont analysés <strong>en temps réel</strong> et immédiatement supprimés après traitement.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">🚫</span>
                <p className="text-sm text-slate-muted">
                  <strong>Aucun stockage</strong>, aucune conservation par le prestataire d&apos;IA.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">✅</span>
                <p className="text-sm text-slate-muted">
                  Prestataire certifié <strong>SOC 2 Type II</strong> — les données ne sont pas utilisées pour l&apos;entraînement.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">🇪🇺</span>
                <p className="text-sm text-slate-muted">
                  Traitement conforme au <strong>RGPD</strong> avec votre consentement explicite.
                </p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={onVisionConsent}
                className="cta-primary !text-[15px] !py-[14px] w-full"
              >
                J&apos;autorise l&apos;analyse par IA avancée →
              </button>
              <button
                type="button"
                onClick={onManualFallback}
                className="text-sm text-slate-muted hover:text-emerald-dark transition-colors text-center py-2"
              >
                Non merci → Remplir le formulaire manuellement
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ============================================================
  // MODE : Chargement (extraction en cours)
  // ============================================================
  return (
    <section className="py-20 bg-white">
      <div className="max-w-[500px] mx-auto px-6 text-center">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-slate-border/30 rounded-full" />
          <div
            className="absolute inset-0 border-4 border-emerald rounded-full animate-spin"
            style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            🔍
          </div>
        </div>

        {/* Message courant */}
        <p className="font-heading font-bold text-slate-text text-lg mb-3 transition-all duration-500">
          {LOADING_MESSAGES[messageIndex]?.text}
        </p>

        {/* Barre de progression */}
        <div className="w-full h-2 bg-slate-bg rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-emerald to-emerald-light rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(progress, 95)}%` }}
          />
        </div>

        {/* Réassurance */}
        <p className="text-xs text-slate-muted flex items-center justify-center gap-1.5 mt-6">
          <span>🔒</span>
          Vos documents sont analysés de manière sécurisée et anonymisée
        </p>
      </div>
    </section>
  )
}
