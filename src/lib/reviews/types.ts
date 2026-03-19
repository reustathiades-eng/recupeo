// ============================================================
// RÉCUPÉO — Reviews Types
// ============================================================

export interface Review {
  id: string
  email: string
  userId?: string
  diagnosticId?: string
  brique: string
  note: number
  commentaire?: string
  prenom: string
  ville?: string
  montantRecupere?: number
  hasRecovered: 'yes' | 'pending' | 'not_yet' | 'no_anomaly'
  status: 'published' | 'pending' | 'rejected' | 'hidden'
  isVerified: boolean
  source: 'email_j2' | 'email_j30' | 'in_app' | 'manual'
  publishedAt?: string
  createdAt: string
}

export interface ReviewStats {
  averageNote: number
  totalReviews: number
  totalRecovered: number
  averageRecovered: number
  recoveryRate: number
  byBrique: Record<string, {
    averageNote: number
    count: number
    averageRecovered: number
  }>
  distribution: Record<number, number> // 1-5
}

export interface ReviewSubmitData {
  token: string
  note: number
  commentaire?: string
  prenom: string
  ville?: string
  montantRecupere?: number
  hasRecovered: 'yes' | 'pending' | 'not_yet' | 'no_anomaly'
  consentPublication: boolean
}
