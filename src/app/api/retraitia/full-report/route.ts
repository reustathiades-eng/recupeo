// ============================================================
// POST /api/retraitia/full-report
// Génération du rapport complet (après paiement)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { callClaude } from '@/lib/anthropic'
import { FULL_REPORT_SYSTEM_PROMPT, buildFullReportUserMessage } from '@/lib/retraitia/prompts'
import { computeRetraitiaCalculations } from '@/lib/retraitia/calculations'
import { createRetraitiaAnonymizer } from '@/lib/retraitia/anonymize'
import type { RetraitiaFormData, RetraitiaPreDiagResult } from '@/lib/retraitia/types'

export async function POST(request: NextRequest) {
  try {
    const { diagnosticId } = await request.json()
    if (!diagnosticId) {
      return NextResponse.json({ success: false, error: 'diagnosticId requis' }, { status: 400 })
    }

    // 1. Récupérer le diagnostic en base
    const payload = await getPayload({ config })
    const diagnostic = await payload.findByID({ collection: 'diagnostics', id: diagnosticId })

    if (!diagnostic) {
      return NextResponse.json({ success: false, error: 'Diagnostic introuvable' }, { status: 404 })
    }

    // TODO: Vérifier le paiement quand PayPlug sera intégré
    // if (!diagnostic.paid) {
    //   return NextResponse.json({ success: false, error: 'Paiement requis' }, { status: 402 })
    // }

    const inputData = diagnostic.inputData as RetraitiaFormData
    const preDiagnostic = diagnostic.aiAnalysis as RetraitiaPreDiagResult

    // 2. Recalculer (déterministe)
    const calculations = computeRetraitiaCalculations(inputData)

    // 3. Anonymiser avant envoi
    const anonymizer = createRetraitiaAnonymizer(inputData)
    const rawMessage = buildFullReportUserMessage(inputData, calculations, preDiagnostic)
    const safeMessage = anonymizer.anonymize(rawMessage)

    // 4. Appel Claude API
    let report: any
    try {
      const aiResponse = await callClaude({
        system: FULL_REPORT_SYSTEM_PROMPT,
        userMessage: safeMessage,
        maxTokens: 8192,
        temperature: 0.3,
      })

      let jsonStr = aiResponse.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      report = JSON.parse(anonymizer.deanonymize(jsonStr))
    } catch (aiError) {
      console.error('[RETRAITIA] Erreur rapport complet:', aiError instanceof Error ? aiError.message : aiError)
      return NextResponse.json({ success: false, error: 'Erreur lors de la génération du rapport' }, { status: 500 })
    }

    // 5. Sauvegarder le rapport
    try {
      await payload.create({
        collection: 'reports',
        data: {
          title: `Rapport RETRAITIA — ${new Date().toLocaleDateString('fr-FR')}`,
          diagnostic: diagnosticId,
          reportContent: report,
        },
      })

      await payload.update({
        collection: 'diagnostics',
        id: diagnosticId,
        data: { status: 'full_report' },
      })
    } catch (dbError) {
      console.error('[RETRAITIA] Erreur sauvegarde rapport:', dbError instanceof Error ? dbError.message : dbError)
    }

    return NextResponse.json({ success: true, report })

  } catch (error) {
    console.error('[RETRAITIA] Erreur inattendue full-report:', error)
    return NextResponse.json({ success: false, error: 'Erreur inattendue' }, { status: 500 })
  }
}
