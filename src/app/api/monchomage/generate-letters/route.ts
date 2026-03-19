// POST /api/monchomage/generate-letters — Courriers contestation ARE
import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import { monchomageSchema } from '@/lib/monchomage/schema'
import { computeMonchomageCalculations } from '@/lib/monchomage/calculations'
import { detectAnomalies } from '@/lib/monchomage/anomaly-detection'
import { lettersSystemPrompt, buildLettersMessage } from '@/lib/monchomage/prompts'
import type { MonchomageLetters, ErrorResponse } from '@/lib/monchomage/types'
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
    const userMessage = buildLettersMessage(data, calc, anomalies)

    const claudeResponse = await callClaude({ system: lettersSystemPrompt, userMessage, maxTokens: 6144, temperature: 0.3 })

    let letters: MonchomageLetters
    try {
      let cleaned = claudeResponse.trim()
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
      else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
      const parsed = JSON.parse(cleaned.trim())
      letters = {
        reclamationAgence: parsed.reclamation_agence || '',
        saisineMediator: parsed.saisine_mediateur || '',
        guideProcedure: parsed.guide_procedure || '',
      }
    } catch {
      letters = { reclamationAgence: claudeResponse, saisineMediator: '', guideProcedure: '' }
    }

    track({ event: 'report_generated', brique: 'monchomage' })
    return NextResponse.json({ success: true, letters })
  } catch (err) {
    console.error('[monchomage-letters] Erreur:', err)
    return NextResponse.json({ success: false, error: 'Erreur interne' } satisfies ErrorResponse, { status: 500 })
  }
}
