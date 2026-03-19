// ============================================================
// POST /api/mataxe/generate-letters
// Génération de la réclamation fiscale (courrier + guide 6675-M)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { callClaude } from '@/lib/anthropic'
import { RECLAMATION_SYSTEM_PROMPT, buildReclamationUserMessage } from '@/lib/mataxe/prompts'
import { computeMataxeCalculations } from '@/lib/mataxe/calculations'
import { AnonymizationSession } from '@/lib/anonymizer'
import type { MataxeFormData, MataxePreDiagResult } from '@/lib/mataxe/types'

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

    const inputData = diagnostic.inputData as MataxeFormData
    const preDiagnostic = diagnostic.aiAnalysis as MataxePreDiagResult
    const calculations = computeMataxeCalculations(inputData)

    // 2. Anonymiser + appeler Claude
    const session = new AnonymizationSession()
    session.register('email', inputData.email)
    const rawMessage = buildReclamationUserMessage(inputData, calculations, preDiagnostic.anomalies)
    const safeMessage = session.anonymize(rawMessage)

    let reclamation: any
    try {
      const aiResponse = await callClaude({
        system: RECLAMATION_SYSTEM_PROMPT,
        userMessage: safeMessage,
        maxTokens: 8192,
        temperature: 0.3,
      })

      let jsonStr = aiResponse.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      reclamation = JSON.parse(session.deanonymize(jsonStr))
    } catch (aiError) {
      console.error('[MATAXE] Erreur génération réclamation:', aiError instanceof Error ? aiError.message : aiError)
      return NextResponse.json({ success: false, error: 'Erreur lors de la génération de la réclamation' }, { status: 500 })
    }

    // 3. Sauvegarder dans le rapport existant
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
          data: { generatedLetters: reclamation },
        })
      }
    } catch (dbError) {
      console.error('[MATAXE] Erreur sauvegarde réclamation:', dbError instanceof Error ? dbError.message : dbError)
    }

    return NextResponse.json({ success: true, reclamation })

  } catch (error) {
    console.error('[MATAXE] Erreur inattendue generate-letters:', error)
    return NextResponse.json({ success: false, error: 'Erreur inattendue' }, { status: 500 })
  }
}
