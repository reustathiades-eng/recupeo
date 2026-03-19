// ============================================================
// Hook useRetraitiaDossier
// Charge le dossier RETRAITIA du client connecte.
// Utilise par toutes les pages de l'espace client.
// ============================================================
import { useState, useEffect, useCallback } from 'react'

export interface RetraitiaDossier {
  id: string
  userEmail: string
  clientName?: string
  parcours: string
  status: string
  formulaire?: any
  formulaireComplet: boolean
  franceConnectVerified: boolean
  documents?: any[]
  extractions?: any
  calcul?: any
  diagnostic?: any
  scoreGlobal?: string
  nbAnomalies: number
  impactMensuelMin?: number
  impactMensuelMax?: number
  precisionAudit?: number
  seuilGratuit: boolean
  demarches?: any[]
  messages?: any[]
  rapport?: {
    pdfUrl?: string
    version?: number
    generatedAt?: string
    variant?: string
  }
  pack9Paid: boolean
  pack9PaidAt?: string
  pack49Paid: boolean
  pack49PaidAt?: string
  coupleId?: string
  couplePack: boolean
  procheAidant?: any
  createdAt: string
  updatedAt: string
}

interface DossierSummary {
  id: string
  parcours: string
  clientName?: string
  status: string
  coupleId?: string
  createdAt: string
}

interface UseRetraitiaDossierResult {
  dossier: RetraitiaDossier | null
  allDossiers?: DossierSummary[]
  isProche: boolean
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRetraitiaDossier(dossierId?: string): UseRetraitiaDossierResult {
  const [dossier, setDossier] = useState<RetraitiaDossier | null>(null)
  const [allDossiers, setAllDossiers] = useState<DossierSummary[] | undefined>()
  const [isProche, setIsProche] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDossier = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = dossierId ? "?dossierId=" + encodeURIComponent(dossierId) : ""
      const res = await fetch("/api/retraitia/me" + params)

      if (res.status === 401) {
        // Non connecte -> rediriger vers login
        window.location.href = "/connexion?redirect=/mon-espace/retraitia"
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur lors du chargement du dossier")
      }

      const data = await res.json()
      setDossier(data.dossier || null)
      setAllDossiers(data.allDossiers)
      setIsProche(data.isProche || false)
    } catch (err: any) {
      setError(err.message || "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }, [dossierId])

  useEffect(() => {
    fetchDossier()
  }, [fetchDossier])

  return { dossier, allDossiers, isProche, loading, error, refetch: fetchDossier }
}
