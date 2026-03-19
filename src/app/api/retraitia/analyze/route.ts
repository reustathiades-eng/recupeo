// ============================================================
// POST /api/retraitia/analyze
// Lance le moteur de calcul + detection d'anomalies sur un dossier
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { runCalculEngine } from '@/lib/retraitia/calcul/engine'
import { detectAnomalies } from '@/lib/retraitia/anomalies/detector'
import type { DossierFormulaire, DossierExtractions } from '@/lib/retraitia/types'

export async function POST(request: NextRequest) {
  try {
    const { dossierId } = await request.json()
    if (!dossierId) {
      return NextResponse.json({ error: 'dossierId requis' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const dossier = await payload.findByID({ collection: 'retraitia-dossiers', id: dossierId }) as any

    if (!dossier) {
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
    }

    const formulaire = dossier.formulaire as DossierFormulaire
    const extractions = (dossier.extractions || {}) as DossierExtractions

    if (!formulaire?.identite?.dateNaissance) {
      return NextResponse.json({ error: 'Formulaire incomplet' }, { status: 400 })
    }

    // Marquer en cours d'analyse
    await payload.update({
      collection: 'retraitia-dossiers',
      id: dossierId,
      data: { status: 'analyzing' },
    })

    // 1. Moteur de calcul
    const calcul = runCalculEngine({ formulaire, extractions })

    // 2. Detection d'anomalies
    const diagnostic = detectAnomalies({ calcul, formulaire, extractions })

    // 3. Sauvegarder les resultats
    await payload.update({
      collection: 'retraitia-dossiers',
      id: dossierId,
      data: {
        status: 'diagnostic_ready',
        calcul,
        diagnostic,
        scoreGlobal: diagnostic.scoreGlobal,
        nbAnomalies: diagnostic.anomalies.length,
        impactMensuelMin: diagnostic.impactMensuelTotal.min,
        impactMensuelMax: diagnostic.impactMensuelTotal.max,
        precisionAudit: diagnostic.precisionAudit,
        seuilGratuit: diagnostic.seuilGratuit,
      },
    })

    console.log(`[RETRAITIA] Analyse terminee: ${diagnostic.anomalies.length} anomalies, score ${diagnostic.scoreGlobal}`)

    return NextResponse.json({
      success: true,
      scoreGlobal: diagnostic.scoreGlobal,
      nbAnomalies: diagnostic.anomalies.length,
      impactMensuel: diagnostic.impactMensuelTotal,
      precisionAudit: diagnostic.precisionAudit,
      seuilGratuit: diagnostic.seuilGratuit,
    })
  } catch (err) {
    console.error('[retraitia/analyze] Error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
