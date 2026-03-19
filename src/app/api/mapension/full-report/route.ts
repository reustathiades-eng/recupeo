// POST /api/mapension/full-report — Rapport complet (payant)
import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import { mapensionSchema } from '@/lib/mapension/schema'
import { computeMapensionCalculations } from '@/lib/mapension/calculations'
import { fullReportSystemPrompt, buildFullReportMessage } from '@/lib/mapension/prompts'
import type { MapensionFullReportResponse, ErrorResponse } from '@/lib/mapension/types'
import { track } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = mapensionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides' } satisfies ErrorResponse,
        { status: 400 }
      )
    }

    const data = parsed.data
    const calc = computeMapensionCalculations(data)

    // TODO: Vérifier le paiement (décommenter quand Stripe prod activé)
    // const diagnostic = await getDiagnostic(body.diagnosticId)
    // if (!diagnostic?.paid) return NextResponse.json({ success: false, error: 'Paiement requis' }, { status: 402 })

    const userMessage = buildFullReportMessage(data, calc)
    const claudeResponse = await callClaude({
      system: fullReportSystemPrompt,
      userMessage,
      maxTokens: 4096,
      temperature: 0.3,
    })

    let sections: Array<{ id: string; title: string; content: string }> = []
    try {
      let cleaned = claudeResponse.trim()
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
      else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
      const parsed = JSON.parse(cleaned.trim())
      sections = parsed.sections || []
    } catch {
      sections = [{ id: 'rapport', title: 'Rapport', content: claudeResponse }]
    }

    track({ event: 'report_generated', brique: 'mapension' })

    const response: MapensionFullReportResponse = {
      success: true,
      calculations: calc,
      report: {
        title: 'Rapport de revalorisation — Pension alimentaire',
        date: new Date().toISOString().split('T')[0],
        reference: `MAP-${Date.now()}`,
        sections,
      },
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[mapension-full-report] Erreur:', err)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' } satisfies ErrorResponse,
      { status: 500 }
    )
  }
}
