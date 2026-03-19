// ============================================================
// RETRAITIA — Module email (API publique)
// ============================================================
// Point d'entrée unique pour toute interaction avec les emails.
// Usage : import { triggerSequence, stopSequence } from '@/lib/retraitia/emails'
// ============================================================

export { triggerSequence, stopSequence, runScheduler } from './scheduler'
export { canSendEmail, adaptTonReversion } from './conditions'
export { sendSMS } from './sms'
export { wrapEmail, ctaButton, heading, para, infoBox, impactBlock, signature } from './renderer'
export { getSequence, ALL_SEQUENCES } from './sequences'
export type {
  SequenceId,
  EmailSequence,
  EmailStep,
  EmailVars,
  EmailLog,
  EmailSequenceState,
  StopCondition,
} from './types'
