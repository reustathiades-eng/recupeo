// POST /api/mabanque/pre-diagnostic — Pré-diagnostic GRATUIT (JS pur, pas d'IA)
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { mabanqueSchema } from '@/lib/mabanque/schema'
import { detectAnomalies } from '@/lib/mabanque/anomaly-detection'
import { calculTropPercu, isFragileEligible, isFragileApplied } from '@/lib/mabanque/calculations'
import type { MabanquePreDiagResponse, ErrorResponse } from '@/lib/mabanque/types'
import { track } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = mabanqueSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ErrorResponse, { status: 400 })
    }

    const data = parsed.data
    const anomalies = detectAnomalies(data)
    const tropPercu = calculTropPercu(data)

    // Sauvegarde en base Payload
    let diagnosticId = `MAB-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    try {
      const payload = await getPayload({ config })
      const doc = await payload.create({
        collection: 'diagnostics',
        data: {
          brique: 'mabanque',
          userEmail: data.email?.toLowerCase?.() || '',
          status: 'pre_diagnostic',
          anomaliesCount: anomalies.length,
          estimatedAmount: tropPercu.tropPercu5ans,
          inputData: data,
          aiAnalysis: { anomalies, tropPercu },
          paid: false,
        },
      })
      diagnosticId = String(doc.id)
    } catch (dbError) {
      console.error('[MABANQUE] Erreur sauvegarde DB:', dbError instanceof Error ? dbError.message : dbError)
    }

    track({ event: 'check_completed', brique: 'mabanque' })

    const response: MabanquePreDiagResponse = {
      success: true,
      diagnosticId,
      anomalies,
      totalAnomalies: anomalies.length,
      tropPercuMensuel: tropPercu.tropPercuMensuel,
      tropPercuAnnuel: tropPercu.tropPercuAnnuel,
      tropPercu5ans: tropPercu.tropPercu5ans,
      isFragileEligible: isFragileEligible(data),
      isFragileApplied: isFragileApplied(data),
      banque: data.banque,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[mabanque-prediag] Erreur:', err)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' } satisfies ErrorResponse,
      { status: 500 }
    )
  }
}
