// POST /api/mabanque/generate-letters — Courriers de contestation (payant 29€)
import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import { mabanqueSchema } from '@/lib/mabanque/schema'
import { detectAnomalies } from '@/lib/mabanque/anomaly-detection'
import { calculTropPercu } from '@/lib/mabanque/calculations'
import { lettersSystemPrompt, buildLettersMessage } from '@/lib/mabanque/prompts'
import type { MabanqueLetters, ErrorResponse } from '@/lib/mabanque/types'
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
    const userMessage = buildLettersMessage(data, anomalies, tropPercu)

    const claudeResponse = await callClaude({
      system: lettersSystemPrompt,
      userMessage,
      maxTokens: 6144,
      temperature: 0.3,
    })

    let letters: MabanqueLetters
    try {
      let cleaned = claudeResponse.trim()
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
      else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
      const parsed = JSON.parse(cleaned.trim())
      letters = {
        reclamationServiceClient: parsed.reclamation_service_client || '',
        saisineMediator: parsed.saisine_mediateur || '',
        guideSignalConso: parsed.guide_signalconso || '',
        guideProcedure: parsed.guide_procedure || '',
      }
    } catch {
      letters = {
        reclamationServiceClient: claudeResponse,
        saisineMediator: '',
        guideSignalConso: '',
        guideProcedure: '',
      }
    }

    track({ event: 'report_generated', brique: 'mabanque' })
    return NextResponse.json({ success: true, letters })
  } catch (err) {
    console.error('[mabanque-letters] Erreur:', err)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' } satisfies ErrorResponse,
      { status: 500 }
    )
  }
}
