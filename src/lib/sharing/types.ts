// ============================================================
// RÉCUPÉO — Sharing Types
// ============================================================

export interface ShareData {
  brique: string
  montant: number
  referralCode?: string
}

export interface ShareChannel {
  id: string
  label: string
  icon: string
  color: string
  getUrl: (shareUrl: string, message: string) => string
}

export interface WallOfWinsStats {
  totalDiagnostics: number
  totalDetected: number
  totalLettersGenerated: number
  averageNote: number
  totalReviews: number
}
