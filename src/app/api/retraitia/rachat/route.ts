// POST /api/retraitia/rachat
// Analyse la rentabilité du rachat de trimestres.

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { simulerScenarios, analyserRachat } from '@/lib/retraitia/simulation'
import { runCalculEngine } from '@/lib/retraitia/calcul/engine'

export async function POST(req: NextRequest) {
  try {
    const { dossierId } = await req.json()
    if (!dossierId) {
      return NextResponse.json({ error: 'dossierId requis' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const dossier = await payload.findByID({
      collection: 'retraitia-dossiers' as any,
      id: dossierId,
      depth: 0,
    })
    if (!dossier) {
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
    }

    const formulaire = dossier.formulaire as any
    const extractions = (dossier.extractions || {}) as any
    if (!formulaire) {
      return NextResponse.json({ error: 'Formulaire non rempli' }, { status: 400 })
    }

    const calcul = runCalculEngine({ formulaire, extractions })
    const simulation = simulerScenarios({ formulaire, ris: extractions.ris, calcul })
    const rachat = analyserRachat({ formulaire, ris: extractions.ris, simulation })

    return NextResponse.json({ success: true, ...rachat })
  } catch (err) {
    console.error('[rachat] Erreur:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 }
    )
  }
}
