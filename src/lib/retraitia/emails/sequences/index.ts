// Index des 15 séquences email RETRAITIA
import type { EmailSequence, SequenceId } from '../types'
import { S1 } from './s01-post-flash'
import { S2 } from './s02-bienvenue-9'
import { S3 } from './s03-onboarding-fc'
import { S4 } from './s04-relance-docs'
import { S5 } from './s05-document-extrait'
import { S6 } from './s06-diagnostic-pret'
import { S7 } from './s07-post-diagnostic'
import { S8 } from './s08-bienvenue-49'
import { S9 } from './s09-suivi-demarches'
import { S10 } from './s10-anomalie-corrigee'
import { S11 } from './s11-escalade'
import { S12 } from './s12-cross-sell'
import { S13 } from './s13-proche-aidant'
import { S14 } from './s14-rappel-annuel'
import { S15 } from './s15-upsell-depart'

export const ALL_SEQUENCES: Record<SequenceId, EmailSequence> = {
  S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15,
}

export function getSequence(id: SequenceId): EmailSequence | undefined {
  return ALL_SEQUENCES[id]
}

export { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15 }
