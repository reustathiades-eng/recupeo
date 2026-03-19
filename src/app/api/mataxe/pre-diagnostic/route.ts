// ============================================================
// POST /api/mataxe/pre-diagnostic
// Analyse IA gratuite (teaser) — pré-diagnostic MATAXE
// ============================================================
// Flow de données :
//   1. Validation Zod
//   2. Calculs purs JS (surface pondérée, VLC, exonérations)
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
import { mataxeSchema } from '@/lib/mataxe/schema'
import { computeMataxeCalculations } from '@/lib/mataxe/calculations'
import { detectAnomalies } from '@/lib/mataxe/anomaly-detection'
import { callClaude } from '@/lib/anthropic'
import { PRE_DIAGNOSTIC_SYSTEM_PROMPT, buildPreDiagnosticUserMessage } from '@/lib/mataxe/prompts'
import { AnonymizationSession } from '@/lib/anonymizer'
import { sendEmail, buildMataxeRecapEmail } from '@/lib/email'
import { computeReliability } from '@/lib/mataxe/reliability'
import type {
  MataxeFormData,
  MataxeCalculations,
  MataxePreDiagResult,
  MataxePreDiagResponse,
  MataxeAnomaly,
  ErrorResponse,
} from '@/lib/mataxe/types'

export async function POST(request: NextRequest) {
  try {
    // 1. Parser le body
    const body = await request.json()

    // 2. Valider avec Zod
    const validation = mataxeSchema.safeParse(body)
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

    const data = validation.data as MataxeFormData

    // 3. Calculs purs (JS, déterministes)
    const calculations = computeMataxeCalculations(data)

    // 4. Détection d'anomalies JS (pré-filtrage avant Claude)
    const jsAnomalies = detectAnomalies(data, calculations)

    // 5. Map de confiance JS (fallback si Claude ne renvoie pas confidence)
    const jsConfidenceMap: Record<string, number> = {}
    const jsConfirmableMap: Record<string, string | null> = {}
    for (const a of jsAnomalies) {
      jsConfidenceMap[a.type] = a.confidence || 50
      jsConfirmableMap[a.type] = a.confirmableWith || null
    }

    // 6. Construire le message utilisateur
    const rawUserMessage = buildPreDiagnosticUserMessage(
      data,
      calculations,
      jsAnomalies.map(a => ({ type: a.type, severity: a.severity, title: a.title, summary: a.summary }))
    )

    // 7. Anonymisation
    const session = new AnonymizationSession()
    session.register('email', data.email)
    // La commune n'est pas un PII mais on garde le reste clean
    const safeUserMessage = session.anonymize(rawUserMessage)

    if (session.count > 0) {
      console.log(`[MATAXE] Anonymisation: ${session.count} donnée(s) personnelle(s) masquée(s)`)
    }

    // 8. Appel Claude API
    let aiResult: MataxePreDiagResult

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
      const realResponse = session.deanonymize(rawResponse)

      aiResult = JSON.parse(realResponse) as MataxePreDiagResult
    } catch (aiError) {
      console.error('[MATAXE] Erreur Claude API, fallback JS:', aiError instanceof Error ? aiError.message : aiError)
      aiResult = buildFallbackResult(data, calculations, jsAnomalies)
    }

    // 9. Sauvegarder en base via Payload Local API
    let diagnosticId = ''
    try {
      const payload = await getPayload({ config })
      const doc = await payload.create({
        collection: 'diagnostics',
        data: {
          brique: 'mataxe',
          userEmail: data.email?.toLowerCase?.() || '',
          status: 'pre_diagnostic',
          anomaliesCount: aiResult.anomalies.length,
          estimatedAmount: aiResult.totalImpact4Years,
          inputData: data,
          aiAnalysis: aiResult,
          paid: false,
        },
      })
      diagnosticId = String(doc.id)
    } catch (dbError) {
      console.error('[MATAXE] Erreur sauvegarde DB:', dbError instanceof Error ? dbError.message : dbError)
    }

    // 10. Calculer la fiabilité
    const reliability = computeReliability(data)

    // 11. Construire la réponse (teaser frontend)
    const response: MataxePreDiagResponse = {
      success: true,
      diagnosticId,
      anomaliesCount: aiResult.anomalies.length,
      impactAnnualMin: aiResult.totalImpactAnnualMin,
      impactAnnualMax: aiResult.totalImpactAnnualMax,
      impact4Years: aiResult.totalImpact4Years,
      riskLevel: aiResult.riskLevel,
      anomalies: aiResult.anomalies.map(a => ({
        type: a.type,
        severity: a.severity,
        title: a.title,
        summary: a.summary,
        impactAnnualMax: a.impactAnnualMax,
        confidence: a.confidence || jsConfidenceMap[a.type] || 50,
        confirmableWith: a.confirmableWith || jsConfirmableMap[a.type] || null,
      })),
      recommendation: aiResult.recommendation,
      calculations,
      reliability: {
        level: reliability.level,
        score: reliability.score,
        label: reliability.label,
        description: reliability.description,
        whatWeKnow: reliability.whatWeKnow,
        whatWeDontKnow: reliability.whatWeDontKnow,
        nextStep: reliability.nextStep,
        nextStepGain: reliability.nextStepGain,
      },
    }

    // 12. Envoi email récapitulatif (fire-and-forget, non bloquant)
    try {
      const emailHtml = buildMataxeRecapEmail({
        anomaliesCount: aiResult.anomalies.length,
        impactAnnualMin: aiResult.totalImpactAnnualMin,
        impactAnnualMax: aiResult.totalImpactAnnualMax,
        impact4Years: aiResult.totalImpact4Years,
        reliabilityLevel: reliability.level,
        reliabilityScore: reliability.score,
        anomalies: aiResult.anomalies.map(a => ({
          title: a.title,
          impactAnnualMax: a.impactAnnualMax,
          confidence: a.confidence || 50,
        })),
        commune: data.commune,
        diagnosticId,
      })
      sendEmail({
        to: data.email,
        subject: `RÉCUPÉO — Votre pré-diagnostic taxe foncière (${aiResult.anomalies.length} anomalie${aiResult.anomalies.length > 1 ? 's' : ''})`,
        htmlContent: emailHtml,
        tags: ['mataxe', 'pre-diagnostic'],
      }).catch(e => console.warn('[MATAXE] Email non envoyé:', e))
    } catch {
      // Email non bloquant
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[MATAXE] Erreur inattendue:', err)
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
  data: MataxeFormData,
  calculations: MataxeCalculations,
  jsAnomalies: MataxeAnomaly[]
): MataxePreDiagResult {
  const totalAnnualMin = jsAnomalies.reduce((sum, a) => sum + a.impactAnnualMin, 0)
  const totalAnnualMax = jsAnomalies.reduce((sum, a) => sum + a.impactAnnualMax, 0)
  const total4Years = Math.round(((totalAnnualMin + totalAnnualMax) / 2) * 4)

  const riskLevel = totalAnnualMax > 500
    ? 'high'
    : totalAnnualMax > 150
      ? 'medium'
      : 'low'

  return {
    anomalies: jsAnomalies.map(a => ({
      ...a,
      confidence: a.confidence || 50,
      confirmableWith: a.confirmableWith || null,
    })),
    totalImpactAnnualMin: totalAnnualMin,
    totalImpactAnnualMax: totalAnnualMax,
    totalImpact4Years: total4Years,
    riskLevel,
    recommendation: jsAnomalies.length > 0
      ? 'Nous vous recommandons de demander votre fiche d\'évaluation cadastrale (formulaire 6675-M) via votre espace impots.gouv.fr, puis d\'adresser une réclamation au centre des impôts fonciers de votre commune.'
      : 'Aucune anomalie majeure détectée à partir des informations fournies. Pour un diagnostic plus précis, demandez votre formulaire 6675-M sur impots.gouv.fr.',
  }
}
