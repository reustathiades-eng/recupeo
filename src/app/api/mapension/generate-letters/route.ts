// POST /api/mapension/generate-letters — Courriers de réclamation
import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import { mapensionSchema } from '@/lib/mapension/schema'
import { computeMapensionCalculations } from '@/lib/mapension/calculations'
import { lettersSystemPrompt, buildLettersMessage } from '@/lib/mapension/prompts'
import type { MapensionLetters, ErrorResponse } from '@/lib/mapension/types'
import { track } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = mapensionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Données invalides' } satisfies ErrorResponse, { status: 400 })
    }

    const data = parsed.data
    const calc = computeMapensionCalculations(data)
    const userMessage = buildLettersMessage(data, calc)

    const claudeResponse = await callClaude({
      system: lettersSystemPrompt,
      userMessage,
      maxTokens: 6144,
      temperature: 0.3,
    })

    let letters: MapensionLetters
    try {
      let cleaned = claudeResponse.trim()
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
      else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
      const parsed = JSON.parse(cleaned.trim())
      letters = {
        reclamationAmiable: parsed.reclamation_amiable || '',
        miseEnDemeure: parsed.mise_en_demeure || '',
        guideAripa: parsed.guide_aripa || '',
        guideProcedure: parsed.guide_procedure || '',
      }
    } catch {
      letters = {
        reclamationAmiable: claudeResponse,
        miseEnDemeure: '', guideAripa: '', guideProcedure: '',
      }
    }

    track({ event: 'report_generated', brique: 'mapension' })
    return NextResponse.json({ success: true, letters })
  } catch (err) {
    console.error('[mapension-letters] Erreur:', err)
    return NextResponse.json({ success: false, error: 'Erreur interne' } satisfies ErrorResponse, { status: 500 })
  }
}
