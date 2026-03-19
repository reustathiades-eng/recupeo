'use client'

interface RetraitiaExtractionProps {
  needsVisionConsent: boolean
  ocrConfidence?: number
  onVisionConsent: () => void
  onManualFallback: () => void
}

export function RetraitiaExtraction({
  needsVisionConsent,
  ocrConfidence,
  onVisionConsent,
  onManualFallback,
}: RetraitiaExtractionProps) {
  if (needsVisionConsent) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-[560px] mx-auto px-6 text-center">
          <div className="text-5xl mb-6">🔍</div>
          <h2 className="font-heading text-xl font-bold text-slate-text mb-3">
            Lecture automatique insuffisante
          </h2>
          <p className="text-sm text-slate-muted mb-6">
            La qualité de vos documents{ocrConfidence ? ` (confiance : ${ocrConfidence}%)` : ''} ne permet pas une lecture fiable par OCR.
            Pour une extraction précise, notre IA peut analyser les images directement.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-amber-700">
              <strong>⚠️ Consentement requis :</strong> les images de vos documents seront envoyées à notre IA (Claude, Anthropic).
              Les données personnelles (nom, NIR) seront anonymisées dans la réponse. Les images ne sont pas conservées.
            </p>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={onVisionConsent} className="cta-primary">
              J&apos;accepte — Analyser mes documents →
            </button>
            <button onClick={onManualFallback} className="px-6 py-3 rounded-xl border-2 border-slate-border text-slate-muted text-sm font-semibold hover:border-emerald/40 transition-all">
              Remplir manuellement
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[500px] mx-auto px-6 text-center">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-slate-border/30 rounded-full" />
          <div
            className="absolute inset-0 border-4 border-emerald rounded-full animate-spin"
            style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">📄</div>
        </div>
        <p className="font-heading font-bold text-slate-text text-lg mb-3">
          Analyse de vos documents en cours...
        </p>
        <p className="text-sm text-slate-muted mb-2">
          Lecture, extraction des trimestres, régimes et montants.
        </p>
        <p className="text-xs text-slate-muted">
          🔒 Traitement local anonymisé — 10 à 30 secondes
        </p>
      </div>
    </section>
  )
}
