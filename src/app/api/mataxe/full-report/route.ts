// ============================================================
// POST /api/mataxe/full-report
// Génération du rapport complet (après paiement 49€)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { callClaude } from '@/lib/anthropic'
import { FULL_REPORT_SYSTEM_PROMPT, buildFullReportUserMessage } from '@/lib/mataxe/prompts'
import { computeMataxeCalculations } from '@/lib/mataxe/calculations'
import { AnonymizationSession } from '@/lib/anonymizer'
import type { MataxeFormData, MataxePreDiagResult } from '@/lib/mataxe/types'

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

    const inputData = diagnostic.inputData as MataxeFormData
    const preDiagnostic = diagnostic.aiAnalysis as MataxePreDiagResult

    // 2. Recalculer (déterministe)
    const calculations = computeMataxeCalculations(inputData)

    // 3. Anonymiser avant envoi
    const session = new AnonymizationSession()
    session.register('email', inputData.email)
    const rawMessage = buildFullReportUserMessage(inputData, calculations, preDiagnostic)
    const safeMessage = session.anonymize(rawMessage)

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
      report = JSON.parse(session.deanonymize(jsonStr))
    } catch (aiError) {
      console.error('[MATAXE] Erreur rapport complet:', aiError instanceof Error ? aiError.message : aiError)
      return NextResponse.json({ success: false, error: 'Erreur lors de la génération du rapport' }, { status: 500 })
    }

    // 5. Sauvegarder le rapport
    try {
      await payload.create({
        collection: 'reports',
        data: {
          title: `Rapport MATAXE — ${new Date().toLocaleDateString('fr-FR')}`,
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
      console.error('[MATAXE] Erreur sauvegarde rapport:', dbError instanceof Error ? dbError.message : dbError)
    }

    return NextResponse.json({ success: true, report })

  } catch (error) {
    console.error('[MATAXE] Erreur inattendue full-report:', error)
    return NextResponse.json({ success: false, error: 'Erreur inattendue' }, { status: 500 })
  }
}
