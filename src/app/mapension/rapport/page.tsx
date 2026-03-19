'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function RapportContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const diagnosticId = searchParams.get('id')
    if (!diagnosticId) { setError('Identifiant manquant'); setLoading(false); return }
    setLoading(false)
    setError('Le rapport sera disponible après activation de Stripe en production.')
  }, [searchParams])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 text-emerald mx-auto mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-slate-muted">Chargement du rapport...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="text-3xl mb-3">📄</div>
        <h1 className="font-heading font-bold text-xl text-slate-text mb-2">Rapport MAPENSION</h1>
        <p className="text-sm text-slate-muted">{error || 'Chargement...'}</p>
      </div>
    </div>
  )
}

export default function MapensionRapportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-muted">Chargement...</p>
      </div>
    }>
      <RapportContent />
    </Suspense>
  )
}
