// ============================================================
// POST /api/retraitia/pre-diagnostic
// Analyse IA gratuite (teaser) — pré-diagnostic RETRAITIA
// ============================================================
// Flow de données :
//   1. Validation Zod
//   2. Calculs purs JS (trimestres, taux, décote, majorations)
//   3. Détection d'anomalies JS (pré-filtrage)
//   4. Anonymisation des données personnelles
//   5. Envoi du message ANONYMISÉ à Claude API
//   6. Désanonymisation de la réponse Claude
//   7. Sauvegarde en base (données RÉELLES)
//   8. Réponse au frontend (teaser)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { retraitiaSchema } from '@/lib/retraitia/schema'
import { computeRetraitiaCalculations } from '@/lib/retraitia/calculations'
import { detectAnomalies, computeLifetimeImpact } from '@/lib/retraitia/anomaly-detection'
import { callClaude } from '@/lib/anthropic'
import { PRE_DIAGNOSTIC_SYSTEM_PROMPT, buildPreDiagnosticUserMessage } from '@/lib/retraitia/prompts'
import { createRetraitiaAnonymizer } from '@/lib/retraitia/anonymize'
import { sendEmail, buildRetraitiaRecapEmail } from '@/lib/email'
import type {
  RetraitiaFormData,
  RetraitiaCalculations,
  RetraitiaPreDiagResult,
  RetraitiaPreDiagResponse,
  RetraitiaAnomaly,
  ErrorResponse,
} from '@/lib/retraitia/types'

export async function POST(request: NextRequest) {
  try {
    // 1. Parser le body
    const body = await request.json()

    // 2. Valider avec Zod
    const validation = retraitiaSchema.safeParse(body)
    if (!validation.success) {
      const errors: Record<string, string[]> = {}
      validation.error.issues.forEach(err => {
        const path = err.path.join('.')
        if (!errors[path]) errors[path] = []
        errors[path].push(err.message)
      })
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: errors } satisfies ErrorResponse,
        { status: 400 }
      )
    }

    const data = validation.data as RetraitiaFormData

    // 3. Calculs purs (JS, déterministes)
    const calculations = computeRetraitiaCalculations(data)

    // 4. Détection d'anomalies JS (pré-filtrage avant Claude)
    const jsAnomalies = detectAnomalies(data, calculations)

    // 5. ANONYMISATION
    const anonymizer = createRetraitiaAnonymizer(data)

    // 6. Construire le message et l'anonymiser
    const rawUserMessage = buildPreDiagnosticUserMessage(
      data,
      calculations,
      jsAnomalies.map(a => ({ type: a.type, severity: a.severity, title: a.title, summary: a.summary }))
    )
    const safeUserMessage = anonymizer.anonymize(rawUserMessage)

    if (anonymizer.count > 0) {
      console.log(`[RETRAITIA] Anonymisation: ${anonymizer.count} donnée(s) personnelle(s) masquée(s)`)
    }

    // 7. Appel Claude API
    let aiResult: RetraitiaPreDiagResult

    try {
      let rawResponse = await callClaude({
        system: PRE_DIAGNOSTIC_SYSTEM_PROMPT,
        userMessage: safeUserMessage,
        maxTokens: 4096,
        temperature: 0.2,
      })

      // Nettoyer éventuels backticks markdown
      rawResponse = rawResponse.trim()
      if (rawResponse.startsWith('```')) {
        rawResponse = rawResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }

      // 8. Désanonymisation
      const realResponse = anonymizer.deanonymize(rawResponse)

      aiResult = JSON.parse(realResponse) as RetraitiaPreDiagResult
    } catch (aiError) {
      console.error('[RETRAITIA] Erreur Claude API, fallback JS:', aiError instanceof Error ? aiError.message : aiError)
      aiResult = buildFallbackResult(data, calculations, jsAnomalies)
    }

    // 9. Sauvegarder en base via Payload Local API
    let diagnosticId = ''
    try {
      const payload = await getPayload({ config })
      const doc = await payload.create({
        collection: 'diagnostics',
        data: {
          brique: 'retraitia',
          userEmail: data.email?.toLowerCase?.() || '',
          status: 'pre_diagnostic',
          anomaliesCount: aiResult.anomalies.length,
          estimatedAmount: aiResult.totalImpactLifetime,
          inputData: data,
          aiAnalysis: aiResult,
          paid: false,
        },
      })
      diagnosticId = String(doc.id)
    } catch (dbError) {
      console.error('[RETRAITIA] Erreur sauvegarde DB:', dbError instanceof Error ? dbError.message : dbError)
    }

    // 10. Construire la réponse (teaser frontend)
    const response: RetraitiaPreDiagResponse = {
      success: true,
      diagnosticId,
      anomaliesCount: aiResult.anomalies.length,
      impactMonthlyMin: aiResult.totalImpactMonthlyMin,
      impactMonthlyMax: aiResult.totalImpactMonthlyMax,
      impactLifetime: aiResult.totalImpactLifetime,
      riskLevel: aiResult.riskLevel,
      anomalies: aiResult.anomalies.map(a => ({
        type: a.type,
        severity: a.severity,
        title: a.title,
        summary: a.summary,
        impactMonthlyMax: a.impactMonthlyMax,
      })),
      recommendation: aiResult.recommendation,
      calculations,
    }


    // 11. Envoi email récapitulatif (fire-and-forget, non bloquant)
    try {
      const emailHtml = buildRetraitiaRecapEmail({
        anomaliesCount: aiResult.anomalies.length,
        impactMonthlyMin: aiResult.totalImpactMonthlyMin,
        impactMonthlyMax: aiResult.totalImpactMonthlyMax,
        impactLifetime: aiResult.totalImpactLifetime,
        riskLevel: aiResult.riskLevel,
        anomalies: aiResult.anomalies.map(a => ({
          title: a.title,
          impactMonthlyMax: a.impactMonthlyMax,
          severity: a.severity,
        })),
        diagnosticId,
      })
      sendEmail({
        to: data.email,
        subject: `RÉCUPÉO — Votre pré-diagnostic retraite (${aiResult.anomalies.length} anomalie${aiResult.anomalies.length > 1 ? 's' : ''})`,
        htmlContent: emailHtml,
        tags: ['retraitia', 'pre-diagnostic'],
      }).catch(e => console.warn('[RETRAITIA] Email non envoyé:', e))
    } catch {
      // Email non bloquant
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[RETRAITIA] Erreur inattendue:', err)
    return NextResponse.json(
      { success: false, error: 'Une erreur inattendue est survenue. Veuillez réessayer.' } satisfies ErrorResponse,
      { status: 500 }
    )
  }
}

// ============================================================
// FALLBACK — Analyse JS pure si Claude est indisponible
// ============================================================
function buildFallbackResult(
  data: RetraitiaFormData,
  calculations: RetraitiaCalculations,
  jsAnomalies: RetraitiaAnomaly[]
): RetraitiaPreDiagResult {
  const totalMonthlyMin = jsAnomalies.reduce((sum, a) => sum + a.impactMonthlyMin, 0)
  const totalMonthlyMax = jsAnomalies.reduce((sum, a) => sum + a.impactMonthlyMax, 0)
  const avgMonthly = Math.round((totalMonthlyMin + totalMonthlyMax) / 2)
  const lifetimeImpact = computeLifetimeImpact(avgMonthly, calculations.esperanceVieRetraite)

  const riskLevel = totalMonthlyMax > 200
    ? 'high'
    : totalMonthlyMax > 50
      ? 'medium'
      : 'low'

  return {
    anomalies: jsAnomalies,
    totalImpactMonthlyMin: totalMonthlyMin,
    totalImpactMonthlyMax: totalMonthlyMax,
    totalImpactLifetime: lifetimeImpact,
    lifeExpectancyYears: calculations.esperanceVieRetraite,
    riskLevel,
    recommendation: jsAnomalies.length > 0
      ? 'Nous vous recommandons de vérifier votre relevé de carrière (RIS) sur info-retraite.fr, puis d\'adresser une demande de révision à votre CARSAT par courrier recommandé.'
      : 'Aucune anomalie majeure détectée à partir des informations fournies. Pour un diagnostic plus précis, consultez votre RIS sur info-retraite.fr.',
  }
}
