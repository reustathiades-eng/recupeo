// ============================================================
// POST /api/retraitia/generate-letters
// Génération des 3 courriers (CARSAT, CRA, Médiateur)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { callClaude } from '@/lib/anthropic'
import { LETTERS_SYSTEM_PROMPT, buildLettersUserMessage } from '@/lib/retraitia/prompts'
import { computeRetraitiaCalculations } from '@/lib/retraitia/calculations'
import { createRetraitiaAnonymizer } from '@/lib/retraitia/anonymize'
import type { RetraitiaFormData, RetraitiaPreDiagResult } from '@/lib/retraitia/types'

export async function POST(request: NextRequest) {
  try {
    const { diagnosticId } = await request.json()
    if (!diagnosticId) {
      return NextResponse.json({ success: false, error: 'diagnosticId requis' }, { status: 400 })
    }

    // 1. Récupérer le diagnostic
    const payload = await getPayload({ config })
    const diagnostic = await payload.findByID({ collection: 'diagnostics', id: diagnosticId })

    if (!diagnostic) {
      return NextResponse.json({ success: false, error: 'Diagnostic introuvable' }, { status: 404 })
    }

    const inputData = diagnostic.inputData as RetraitiaFormData
    const preDiagnostic = diagnostic.aiAnalysis as RetraitiaPreDiagResult
    const calculations = computeRetraitiaCalculations(inputData)

    // 2. Anonymiser + appeler Claude
    const anonymizer = createRetraitiaAnonymizer(inputData)
    // Récupérer les infos client (champs extra hors du type strict)
    const raw = diagnostic.inputData as any
    const clientInfo = {
      name: raw?.clientName || undefined,
      address: raw?.clientAddress || undefined,
      nir: raw?.clientNIR || undefined,
      carsat: raw?.clientCARSAT || undefined,
      city: raw?.clientCity || undefined,
    }
    const rawMessage = buildLettersUserMessage(inputData, calculations, preDiagnostic, clientInfo)
    const safeMessage = anonymizer.anonymize(rawMessage)

    let letters: any
    try {
      const aiResponse = await callClaude({
        system: LETTERS_SYSTEM_PROMPT,
        userMessage: safeMessage,
        maxTokens: 8192,
        temperature: 0.3,
      })

      let jsonStr = aiResponse.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      letters = JSON.parse(anonymizer.deanonymize(jsonStr))
    } catch (aiError) {
      console.error('[RETRAITIA] Erreur génération courriers:', aiError instanceof Error ? aiError.message : aiError)
      return NextResponse.json({ success: false, error: 'Erreur lors de la génération des courriers' }, { status: 500 })
    }

    // 3. Sauvegarder les courriers dans le rapport existant
    try {
      const reports = await payload.find({
        collection: 'reports',
        where: { diagnostic: { equals: diagnosticId } },
        limit: 1,
      })
      if (reports.docs.length > 0) {
        await payload.update({
          collection: 'reports',
          id: reports.docs[0].id as string,
          data: { generatedLetters: letters },
        })
      }
    } catch (dbError) {
      console.error('[RETRAITIA] Erreur sauvegarde courriers:', dbError instanceof Error ? dbError.message : dbError)
    }

    return NextResponse.json({ success: true, letters })

  } catch (error) {
    console.error('[RETRAITIA] Erreur inattendue generate-letters:', error)
    return NextResponse.json({ success: false, error: 'Erreur inattendue' }, { status: 500 })
  }
}
