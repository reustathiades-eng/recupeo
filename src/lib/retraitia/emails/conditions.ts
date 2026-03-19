// ============================================================
// RETRAITIA — Conditions d'envoi et anti-harcèlement
// ============================================================
// Vérifie toutes les règles avant envoi : max fréquence,
// condition d'arrêt, désabonnement, dimanche interdit.
// ============================================================

import type { EmailSequenceState, SequenceId, StopCondition } from './types'

interface DossierContext {
  dossierId: string
  status: string
  pack9Paid: boolean
  pack49Paid: boolean
  franceConnectVerified: boolean
  unsubscribed: boolean
  parcours: 'retraite' | 'preretraite' | 'reversion'
  emailSequences?: EmailSequenceState | null
  documents?: Array<{ type: string; status: string; obligatoire: boolean }>
  nbAnomalies?: number
}

interface CheckResult {
  canSend: boolean
  reason?: string
}

/**
 * Vérifie si un email/SMS peut être envoyé.
 * Applique TOUTES les règles anti-harcèlement.
 */
export function canSendEmail(
  dossier: DossierContext,
  sequence: SequenceId,
  etape: number,
  channel: 'email' | 'sms',
  now: Date = new Date()
): CheckResult {
  // 1. Client désabonné ?
  if (dossier.unsubscribed) {
    return { canSend: false, reason: 'Client désabonné (RGPD)' }
  }

  // 2. Pas le dimanche
  if (now.getDay() === 0) {
    return { canSend: false, reason: 'Envoi interdit le dimanche' }
  }

  const state = dossier.emailSequences
  if (!state) {
    return { canSend: true } // Premier envoi, pas d'historique
  }

  // 3. Condition d'arrêt de la séquence atteinte ?
  const stopCheck = checkStopCondition(sequence, dossier)
  if (stopCheck) {
    return { canSend: false, reason: `Condition d'arrêt : ${stopCheck}` }
  }

  // 4. Étape déjà envoyée ?
  const seqState = state.active[sequence]
  if (seqState && seqState.lastStepSent >= etape) {
    return { canSend: false, reason: `Étape ${etape} déjà envoyée` }
  }

  // 5. Séquence déjà terminée ?
  if (seqState?.completedAt) {
    return { canSend: false, reason: 'Séquence déjà terminée' }
  }

  // 6. Max fréquence par semaine
  const logs = state.logs || []
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentLogs = logs.filter(l => l.success && new Date(l.sentAt) > weekAgo)

  if (channel === 'email') {
    const emailsThisWeek = recentLogs.filter(l => l.channel === 'email').length
    if (emailsThisWeek >= 2) {
      return { canSend: false, reason: 'Max 2 emails/semaine atteint' }
    }
  }

  if (channel === 'sms') {
    const smsThisWeek = recentLogs.filter(l => l.channel === 'sms').length
    if (smsThisWeek >= 1) {
      return { canSend: false, reason: 'Max 1 SMS/semaine atteint' }
    }
  }

  // 7. J+60 sans activité → arrêt total
  const lastActivity = getLastActivityDate(state)
  if (lastActivity) {
    const daysSinceActivity = Math.floor(
      (now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000)
    )
    if (daysSinceActivity > 60) {
      return { canSend: false, reason: 'J+60 sans activité — arrêt' }
    }
  }

  return { canSend: true }
}

/**
 * Vérifie si la condition d'arrêt d'une séquence est atteinte.
 */
function checkStopCondition(
  sequence: SequenceId,
  dossier: DossierContext
): string | null {
  const map: Record<SequenceId, StopCondition> = {
    S1: 'paiement_9',
    S2: 'none',
    S3: 'acces_fc_valide',
    S4: 'docs_complets',
    S5: 'none',
    S6: 'none',
    S7: 'paiement_49',
    S8: 'none',
    S9: 'anomalie_resolue',
    S10: 'none',
    S11: 'client_agit',
    S12: 'none',
    S13: 'none',
    S14: 'none',
    S15: 'none',
  }

  const condition = map[sequence]

  switch (condition) {
    case 'paiement_9':
      return dossier.pack9Paid ? 'Pack 9€ payé' : null
    case 'paiement_49':
      return dossier.pack49Paid ? 'Pack 49€ payé' : null
    case 'acces_fc_valide':
      return dossier.franceConnectVerified ? 'FranceConnect vérifié' : null
    case 'docs_complets': {
      const docs = dossier.documents || []
      const obligManquants = docs.filter(d => d.obligatoire && d.status !== 'uploaded' && d.status !== 'extracted')
      return obligManquants.length === 0 ? 'Tous les docs obligatoires uploadés' : null
    }
    case 'anomalie_resolue':
      return null // Vérifié au niveau de l'anomalie individuelle
    case 'client_agit':
      return null // Vérifié au niveau de la démarche individuelle
    case 'none':
      return null
    default:
      return null
  }
}

/**
 * Calcule le nombre de jours écoulés depuis le déclenchement de la séquence.
 */
export function daysSinceTrigger(state: EmailSequenceState, sequence: SequenceId, now: Date = new Date()): number {
  const seqState = state.active[sequence]
  if (!seqState) return -1
  const triggered = new Date(seqState.triggeredAt)
  return Math.floor((now.getTime() - triggered.getTime()) / (24 * 60 * 60 * 1000))
}

/**
 * Date de la dernière activité du client (dernier log ou déclenchement).
 */
function getLastActivityDate(state: EmailSequenceState): Date | null {
  const logs = state.logs || []
  if (logs.length === 0) return null

  const dates = logs.map(l => new Date(l.sentAt).getTime())
  // On regarde aussi les triggers actifs
  for (const key of Object.keys(state.active)) {
    const s = state.active[key]
    if (s.triggeredAt) dates.push(new Date(s.triggeredAt).getTime())
  }

  return new Date(Math.max(...dates))
}

/**
 * Adapter le ton si parcours réversion.
 * Remplace les formulations agressives par des formulations sobres.
 */
export function adaptTonReversion(subject: string, body: string): { subject: string; body: string } {
  const replacements: [RegExp, string][] = [
    [/Vous perdez de l'argent/gi, `Faire valoir vos droits`],
    [/Urgence/gi, `Important`],
    [/Chaque mois qui passe/gi, `Pour vos démarches`],
    [/manque à gagner/gi, `droits non réclamés`],
    [/argent perdu/gi, `droits à faire valoir`],
    [/🚨/g, ''],
    [/💰/g, ''],
  ]

  let s = subject
  let b = body
  for (const [regex, replacement] of replacements) {
    s = s.replace(regex, replacement)
    b = b.replace(regex, replacement)
  }
  return { subject: s, body: b }
}
