// POST /api/retraitia/emails/trigger
// Déclenche manuellement une séquence email pour un dossier.
// Input: { dossierId: string, sequence: SequenceId, vars?: Partial<EmailVars> }

import { NextRequest, NextResponse } from 'next/server'
import { triggerSequence } from '@/lib/retraitia/emails'
import type { SequenceId } from '@/lib/retraitia/emails'

const VALID_SEQUENCES: SequenceId[] = [
  'S1','S2','S3','S4','S5','S6','S7','S8',
  'S9','S10','S11','S12','S13','S14','S15',
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { dossierId, sequence, vars } = body

    if (!dossierId || typeof dossierId !== 'string') {
      return NextResponse.json({ error: 'dossierId requis' }, { status: 400 })
    }

    if (!sequence || !VALID_SEQUENCES.includes(sequence)) {
      return NextResponse.json(
        { error: `sequence invalide. Valeurs : ${VALID_SEQUENCES.join(', ')}` },
        { status: 400 }
      )
    }

    await triggerSequence(dossierId, sequence, vars)

    return NextResponse.json({
      success: true,
      message: `Séquence ${sequence} déclenchée pour ${dossierId}`,
    })
  } catch (err) {
    console.error('[emails/trigger] Erreur:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 }
    )
  }
}
