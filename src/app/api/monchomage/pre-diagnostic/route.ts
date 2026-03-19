// POST /api/monchomage/pre-diagnostic — Pré-diagnostic GRATUIT (JS pur)
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { monchomageSchema } from '@/lib/monchomage/schema'
import { computeMonchomageCalculations } from '@/lib/monchomage/calculations'
import { detectAnomalies } from '@/lib/monchomage/anomaly-detection'
import type { MonchomagePreDiagResponse, ErrorResponse } from '@/lib/monchomage/types'
import { track } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = monchomageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({
        success: false, error: 'Données invalides',
        details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ErrorResponse, { status: 400 })
    }

    const data = parsed.data
    const calc = computeMonchomageCalculations(data)
    const anomalies = detectAnomalies(data, calc)

    // Filtrer anomalies type "trop_percu_possible" pour le flag
    const tropPercuRisque = anomalies.some(a => a.type === 'trop_percu_possible')
    const realAnomalies = anomalies.filter(a => a.type !== 'trop_percu_possible')

    // Sauvegarde en base Payload
    let diagnosticId = `MCH-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    try {
      const payload = await getPayload({ config })
      const doc = await payload.create({
        collection: 'diagnostics',
        data: {
          brique: 'monchomage',
          userEmail: data.email?.toLowerCase?.() || '',
          status: 'pre_diagnostic',
          anomaliesCount: realAnomalies.length,
          estimatedAmount: calc.ecartTotal,
          inputData: data,
          aiAnalysis: { anomalies, calc },
          paid: false,
        },
      })
      diagnosticId = String(doc.id)
    } catch (dbError) {
      console.error('[MONCHOMAGE] Erreur sauvegarde DB:', dbError instanceof Error ? dbError.message : dbError)
    }

    track({ event: 'check_completed', brique: 'monchomage' })

    const response: MonchomagePreDiagResponse = {
      success: true,
      diagnosticId,
      anomalies,
      totalAnomalies: realAnomalies.length,
      sjrTheorique: calc.sjrTheorique,
      ajTheorique: calc.ajTheorique,
      ajNotifiee: data.ajBrute,
      ecartJournalier: calc.ecartAJ,
      ecartMensuel: calc.ecartMensuel,
      ecartTotal: calc.ecartTotal,
      dureeNotifiee: data.dureeIndemnisation,
      hasAnomalies: realAnomalies.length > 0,
      tropPercuRisque,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[monchomage-prediag] Erreur:', err)
    return NextResponse.json({ success: false, error: 'Erreur interne' } satisfies ErrorResponse, { status: 500 })
  }
}
