// POST /api/monchomage/full-report — Rapport complet (payant 69€)
import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import { monchomageSchema } from '@/lib/monchomage/schema'
import { computeMonchomageCalculations } from '@/lib/monchomage/calculations'
import { detectAnomalies } from '@/lib/monchomage/anomaly-detection'
import { fullReportSystemPrompt, buildFullReportMessage } from '@/lib/monchomage/prompts'
import type { MonchomageFullReportResponse, ErrorResponse } from '@/lib/monchomage/types'
import { track } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = monchomageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Données invalides' } satisfies ErrorResponse, { status: 400 })
    }

    const data = parsed.data
    const calc = computeMonchomageCalculations(data)
    const anomalies = detectAnomalies(data, calc)

    // TODO: Vérifier le paiement (décommenter quand Stripe prod activé)

    const userMessage = buildFullReportMessage(data, calc, anomalies)
    const claudeResponse = await callClaude({ system: fullReportSystemPrompt, userMessage, maxTokens: 4096, temperature: 0.3 })

    let sections: Array<{ id: string; title: string; content: string }> = []
    try {
      let cleaned = claudeResponse.trim()
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
      else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
      sections = JSON.parse(cleaned.trim()).sections || []
    } catch { sections = [{ id: 'rapport', title: 'Rapport', content: claudeResponse }] }

    track({ event: 'report_generated', brique: 'monchomage' })

    const response: MonchomageFullReportResponse = {
      success: true,
      diagnosticId: body.diagnosticId || `MCH-${Date.now()}`,
      calculations: calc,
      anomalies,
      report: {
        title: "Rapport d'audit — Allocation chômage (ARE)",
        date: new Date().toISOString().split('T')[0],
        reference: `MCH-${Date.now()}`,
        sections,
      },
    }
    return NextResponse.json(response)
  } catch (err) {
    console.error('[monchomage-report] Erreur:', err)
    return NextResponse.json({ success: false, error: 'Erreur interne' } satisfies ErrorResponse, { status: 500 })
  }
}
