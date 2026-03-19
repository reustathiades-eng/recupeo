// POST /api/mabanque/full-report — Rapport complet (payant 19€)
import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import { mabanqueSchema } from '@/lib/mabanque/schema'
import { detectAnomalies } from '@/lib/mabanque/anomaly-detection'
import { calculTropPercu } from '@/lib/mabanque/calculations'
import { fullReportSystemPrompt, buildFullReportMessage } from '@/lib/mabanque/prompts'
import type { MabanqueFullReportResponse, ErrorResponse } from '@/lib/mabanque/types'
import { track } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = mabanqueSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides' } satisfies ErrorResponse,
        { status: 400 }
      )
    }

    const data = parsed.data
    const anomalies = detectAnomalies(data)
    const tropPercu = calculTropPercu(data)

    // TODO: Vérifier le paiement (décommenter quand Stripe prod activé)
    // const diagnostic = await getDiagnostic(body.diagnosticId)
    // if (!diagnostic?.paid) return NextResponse.json({ success: false, error: 'Paiement requis' }, { status: 402 })

    const userMessage = buildFullReportMessage(data, anomalies, tropPercu)
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

    track({ event: 'report_generated', brique: 'mabanque' })

    const response: MabanqueFullReportResponse = {
      success: true,
      diagnosticId: body.diagnosticId || `MAB-${Date.now()}`,
      anomalies,
      tropPercuMensuel: tropPercu.tropPercuMensuel,
      tropPercuAnnuel: tropPercu.tropPercuAnnuel,
      tropPercu5ans: tropPercu.tropPercu5ans,
      report: {
        title: 'Rapport d\'audit — Frais bancaires',
        date: new Date().toISOString().split('T')[0],
        reference: `MAB-${Date.now()}`,
        sections,
      },
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[mabanque-report] Erreur:', err)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' } satisfies ErrorResponse,
      { status: 500 }
    )
  }
}
