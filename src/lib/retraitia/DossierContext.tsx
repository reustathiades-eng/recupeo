// ============================================================
// DossierContext — partage le dossier entre toutes les pages espace client
// ============================================================
'use client'
import { createContext, useContext } from 'react'
import { useRetraitiaDossier } from '@/lib/retraitia/useRetraitiaDossier'
import type { RetraitiaDossier } from '@/lib/retraitia/useRetraitiaDossier'

interface DossierContextValue {
  dossier: RetraitiaDossier | null
  isProche: boolean
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const DossierContext = createContext<DossierContextValue>({
  dossier: null,
  isProche: false,
  loading: true,
  error: null,
  refetch: async () => {},
})

export function DossierProvider({ children }: { children: React.ReactNode }) {
  const { dossier, isProche, loading, error, refetch } = useRetraitiaDossier()

  return (
    <DossierContext.Provider value={{ dossier, isProche, loading, error, refetch }}>
      {children}
    </DossierContext.Provider>
  )
}

export function useDossier() {
  return useContext(DossierContext)
}
