// POST /api/retraitia/simulation
// Calcule les scénarios de départ pour un pré-retraité.

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { estimerPension } from '@/lib/retraitia/simulation'
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

    // Lancer le moteur de calcul
    const calcul = runCalculEngine({ formulaire, extractions })

    // Lancer l'estimation avec simulation
    const result = estimerPension({
      formulaire,
      ris: extractions.ris,
      calcul,
      eigDisponible: !!(extractions.eig),
    })

    // Sauvegarder les scénarios dans le dossier
    await payload.update({
      collection: 'retraitia-dossiers' as any,
      id: dossierId,
      data: {
        calcul,
      } as any,
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (err) {
    console.error('[simulation] Erreur:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 }
    )
  }
}
