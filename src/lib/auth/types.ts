// ============================================================
// RÉCUPÉO — Auth Types
// ============================================================

export interface UserProfile {
  isOwner?: boolean
  isTenant?: boolean
  isRetired?: boolean
  isEmployee?: boolean
  isJobSeeker?: boolean
  isDivorced?: boolean
}

export interface UserNotifications {
  reminders: boolean
  newBriques: boolean
  annualAlerts: boolean
  newsletter: boolean
}

export interface SessionUser {
  id: string
  email: string
  firstName?: string
  profile?: UserProfile
}

export interface JWTPayload {
  sub: string      // user ID
  email: string
  firstName?: string
  iat: number
  exp: number
}

export interface MagicLinkResult {
  success: boolean
  error?: string
}

export interface AuthState {
  authenticated: boolean
  user: SessionUser | null
  loading: boolean
}

// Statuts enrichis pour les diagnostics
export type DiagnosticStatus =
  | 'pre_diagnostic'
  | 'paid'
  | 'report_generated'
  | 'letters_generated'

export type RecoveryStatus =
  | 'yes'
  | 'pending'
  | 'not_yet'
  | 'no_anomaly'

export interface DemarcheTracking {
  letterSentAt?: string
  responseReceivedAt?: string
  responseType?: string
  montantRecupere?: number
  notes?: string
}
