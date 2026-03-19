'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AccountPrompt } from '@/components/auth/AccountPrompt'
import { MataxeReport } from '@/components/mataxe/MataxeReport'

function MataxeRapportContent() {
  const searchParams = useSearchParams()
  const diagnosticId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<any>(null)
  const [reclamation, setReclamation] = useState<any>(null)
  const [calculations, setCalculations] = useState<any>(null)

  useEffect(() => {
    if (!diagnosticId) {
      setError('Identifiant de diagnostic manquant')
      setLoading(false)
      return
    }
    generateReport()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagnosticId])

  const generateReport = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Générer le rapport complet
      const reportRes = await fetch('/api/mataxe/full-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosticId }),
      })
      const reportData = await reportRes.json()

      if (!reportData.success) {
        setError(reportData.error || 'Erreur lors de la génération du rapport')
        setLoading(false)
        return
      }

      setReport(reportData.report)

      // 2. Générer la réclamation fiscale
      try {
        const lettersRes = await fetch('/api/mataxe/generate-letters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ diagnosticId }),
        })
        const lettersData = await lettersRes.json()
        if (lettersData.success) {
          setReclamation(lettersData.reclamation)
        }
      } catch {
        console.warn('[MATAXE] Réclamation non générée')
      }

      setCalculations(reportData.report?.calculations || null)

    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (!diagnosticId) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <h1 className="font-heading text-2xl font-bold text-slate-text mb-4">Rapport introuvable</h1>
          <p className="text-slate-muted mb-6">Aucun identifiant de diagnostic fourni.</p>
          <a href="/mataxe" className="cta-primary">Faire un diagnostic →</a>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="pt-[120px] pb-20 bg-white min-h-screen">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald/10 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-emerald" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-bold text-slate-text mb-3">
            Génération de votre rapport...
          </h2>
          <p className="text-sm text-slate-muted mb-6">
            Notre IA analyse chaque paramètre et rédige votre réclamation fiscale. Cela prend 15 à 30 secondes.
          </p>
          <div className="space-y-2">
            {['Analyse de la surface pondérée...', 'Comparaison avec les barèmes...', 'Rédaction du rapport détaillé...', 'Génération de la réclamation fiscale...'].map((msg, i) => (
              <div key={i} className="text-xs text-slate-muted animate-pulse" style={{ animationDelay: `${i * 2}s` }}>
                {msg}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="pt-[120px] pb-20 bg-white min-h-screen">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <div className="text-3xl mb-4">⚠️</div>
          <h2 className="font-heading text-xl font-bold text-slate-text mb-3">Erreur</h2>
          <p className="text-sm text-red-600 mb-6">{error}</p>
          <button onClick={generateReport} className="cta-primary">Réessayer</button>
          <div className="mt-4">
            <a href="/mataxe" className="text-sm text-slate-muted hover:text-slate-text underline">
              ← Retour au diagnostic
            </a>
          </div>
        </div>
      </section>
    )
  }

  if (!report) {
    return (
      <section className="pt-[120px] pb-20 bg-white min-h-screen">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <h2 className="font-heading text-xl font-bold text-slate-text mb-3">Rapport non disponible</h2>
          <a href="/mataxe" className="cta-primary">Faire un diagnostic →</a>
        </div>
      </section>
    )
  }

  return (
    <div className="pt-[80px]">
      <MataxeReport
        report={report}
        reclamation={reclamation}
        diagnosticId={diagnosticId}
        calculations={calculations}
      />
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <AccountPrompt brique="mataxe" />
      </div>
    </div>
  )
}

export default function MataxeRapportPage() {
  return (
    <Suspense fallback={
      <section className="pt-[120px] pb-20 bg-white min-h-screen">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <div className="animate-spin h-8 w-8 text-emerald mx-auto mb-4" />
          <p className="text-sm text-slate-muted">Chargement...</p>
        </div>
      </section>
    }>
      <MataxeRapportContent />
    </Suspense>
  )
}
