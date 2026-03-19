'use client'
import { AccountPrompt } from '@/components/auth/AccountPrompt'
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { RetraitiaReport } from '@/components/retraitia/RetraitiaReport'
import { LegalDisclaimer } from '@/components/shared/TrustBadges'

function RapportContent() {
  const searchParams = useSearchParams()
  const diagnosticId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    if (!diagnosticId) {
      setError('Aucun diagnostic spécifié.')
      setLoading(false)
      return
    }

    const generateReport = async () => {
      try {
        const res = await fetch('/api/retraitia/full-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ diagnosticId }),
        })
        const data = await res.json()
        if (data.success) {
          setReport(data.report)
        } else {
          setError(data.error || 'Erreur lors de la génération du rapport')
        }
      } catch {
        setError('Erreur de connexion')
      } finally {
        setLoading(false)
      }
    }

    generateReport()
  }, [diagnosticId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-bg pt-[80px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold text-slate-text mb-2">Génération du rapport en cours...</h2>
          <p className="text-sm text-slate-muted">Notre IA analyse votre pension en détail. Cela prend 15 à 30 secondes.</p>
          <p className="text-xs text-slate-muted mt-2">🔒 Vos données sont anonymisées pendant l&apos;analyse.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-bg pt-[80px]">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-heading text-xl font-bold text-slate-text mb-2">Erreur</h2>
          <p className="text-sm text-slate-muted mb-4">{error}</p>
          <a href="/retraitia" className="cta-primary">← Retour au formulaire</a>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[80px]">
      {report && (
        <RetraitiaReport
          report={report}
          letters={null}
          diagnosticId={diagnosticId!}
        />
      )}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <AccountPrompt brique="retraitia" />
      </div>
      <LegalDisclaimer brique="retraitia" />
    </div>
  )
}

export default function RapportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-bg pt-[80px]">
        <div className="w-12 h-12 border-4 border-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RapportContent />
    </Suspense>
  )
}
