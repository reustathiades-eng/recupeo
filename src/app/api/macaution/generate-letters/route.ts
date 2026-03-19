// ============================================================
// POST /api/macaution/generate-letters
// Génération des courriers (mise en demeure + CDC + tribunal)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { callClaude } from '@/lib/anthropic'
import { LETTERS_SYSTEM_PROMPT, buildLettersUserMessage } from '@/lib/macaution/prompts'
import { computeMacautionCalculations } from '@/lib/macaution/calculations'
import { createMacautionAnonymizer } from '@/lib/macaution/anonymize'

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

    const inputData = diagnostic.inputData as any
    const preDiagnostic = diagnostic.aiAnalysis as any
    const calculations = computeMacautionCalculations(inputData)

    // 2. Anonymiser + appeler Claude
    const anonymizer = createMacautionAnonymizer(inputData)
    const rawMessage = buildLettersUserMessage(inputData, calculations, preDiagnostic)
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
      console.error('[MACAUTION] Erreur génération courriers:', aiError instanceof Error ? aiError.message : aiError)
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
      console.error('[MACAUTION] Erreur sauvegarde courriers:', dbError instanceof Error ? dbError.message : dbError)
    }

    return NextResponse.json({ success: true, letters })

  } catch (error) {
    console.error('[MACAUTION] Erreur inattendue generate-letters:', error)
    return NextResponse.json({ success: false, error: 'Erreur inattendue' }, { status: 500 })
  }
}
