// POST /api/mapension/calculate — Calcul gratuit revalorisation
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mapensionSchema } from '@/lib/mapension/schema'
import { computeMapensionCalculations } from '@/lib/mapension/calculations'
import type { MapensionCalculateResponse, ErrorResponse } from '@/lib/mapension/types'
import { track } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = mapensionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({
        success: false, error: 'Données invalides',
        details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ErrorResponse, { status: 400 })
    }

    const data = parsed.data
    const calc = computeMapensionCalculations(data)

    // Sauvegarde en base Payload
    let diagnosticId = `MAP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    try {
      const payload = await getPayload({ config })
      const doc = await payload.create({
        collection: 'diagnostics',
        data: {
          brique: 'mapension',
          userEmail: data.email?.toLowerCase?.() || '',
          status: 'pre_diagnostic',
          anomaliesCount: calc.hasArrears ? 1 : 0,
          estimatedAmount: calc.totalArrears,
          inputData: data,
          aiAnalysis: calc,
          paid: false,
        },
      })
      diagnosticId = String(doc.id)
    } catch (dbError) {
      console.error('[MAPENSION] Erreur sauvegarde DB:', dbError instanceof Error ? dbError.message : dbError)
    }

    track({ event: 'check_completed', brique: 'mapension' })

    const response: MapensionCalculateResponse = {
      success: true,
      diagnosticId,
      initialAmount: data.initialAmount,
      revaluedAmount: calc.currentRevaluedAmount,
      revaluationPct: calc.revaluationPct,
      monthlyGap: calc.monthlyGap,
      estimatedTotalArrears: calc.totalArrears,
      arrearsYears: calc.arrearsYears,
      hasArrears: calc.hasArrears,
      usesARIPA: calc.usesARIPA,
      isCreditor: calc.isCreditor,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[mapension-calculate] Erreur:', err)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' } satisfies ErrorResponse,
      { status: 500 }
    )
  }
}
