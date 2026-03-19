// ============================================================
// POST /api/macaution/pre-diagnostic
// Analyse IA gratuite (teaser) — pré-diagnostic MACAUTION
// ============================================================
// Flow de données :
//   1. Validation Zod
//   2. Calculs purs JS (déterministes)
//   3. Anonymisation des données personnelles
//   4. Envoi du message ANONYMISÉ à Claude API
//   5. Désanonymisation de la réponse Claude
//   6. Sauvegarde en base (données RÉELLES)
//   7. Réponse au frontend
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { macautionSchema } from '@/lib/macaution/schema'
import { computeMacautionCalculations } from '@/lib/macaution/calculations'
import { callClaude } from '@/lib/anthropic'
import { PRE_DIAGNOSTIC_SYSTEM_PROMPT, buildPreDiagnosticUserMessage } from '@/lib/macaution/prompts'
import { createMacautionAnonymizer } from '@/lib/macaution/anonymize'
import type { PreDiagnosticResult, PreDiagnosticResponse, ErrorResponse } from '@/lib/macaution/types'
import { sendEmail, buildMacautionRecapEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // 1. Parser le body
    const body = await request.json()

    // Extraire edlComparison (optionnel, envoyé par le flow V2 extraction)
    const edlComparison = body.edlComparison || null
    delete body.edlComparison  // Retirer avant validation Zod

    // 2. Valider avec Zod
    const validation = macautionSchema.safeParse(body)
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

    const data = validation.data

    // 3. Si restitution totale → pas d'anomalie
    if (data.depositReturned === 'total') {
      return NextResponse.json({
        success: true,
        diagnosticId: '',
        anomaliesCount: 0,
        estimatedAmount: 0,
        riskLevel: 'low',
        anomalies: [],
        recommendation: 'Votre dépôt de garantie a été restitué en totalité. Aucune anomalie détectée.',
        calculations: computeMacautionCalculations(data),
      } satisfies PreDiagnosticResponse)
    }

    // 4. Calculs purs (JS, déterministes)
    const calculations = computeMacautionCalculations(data)

    // 5. ANONYMISATION — Créer une session et enregistrer les PII
    const anonymizer = createMacautionAnonymizer(data)

    // 6. Construire le message et l'anonymiser AVANT envoi
    const rawUserMessage = buildPreDiagnosticUserMessage(data, calculations)
    const safeUserMessage = anonymizer.anonymize(rawUserMessage)

    if (anonymizer.count > 0) {
      console.log(`[MACAUTION] Anonymisation: ${anonymizer.count} donnée(s) personnelle(s) masquée(s)`)
    }

    // 7. Appel Claude API avec le message ANONYMISÉ
    let aiResult: PreDiagnosticResult

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

      // 8. DÉSANONYMISATION — Remettre les vraies valeurs dans la réponse
      const realResponse = anonymizer.deanonymize(rawResponse)

      // Parser le JSON
      aiResult = JSON.parse(realResponse) as PreDiagnosticResult
    } catch (aiError) {
      console.error('[MACAUTION] Erreur Claude API, fallback JS:', aiError instanceof Error ? aiError.message : aiError)
      aiResult = buildFallbackResult(data, calculations)
    }

    // 9. Sauvegarder en base via Payload Local API (données RÉELLES, pas anonymisées)
    let diagnosticId = ''
    try {
      const payload = await getPayload({ config })
      const doc = await payload.create({
        collection: 'diagnostics',
        data: {
          brique: 'macaution',
          userEmail: data.email?.toLowerCase?.() || '',
          status: 'pre_diagnostic',
          anomaliesCount: aiResult.anomalies.length,
          estimatedAmount: aiResult.total_recoverable,
          inputData: data,              // Données réelles en base
          edlComparison: edlComparison, // Comparaison EDL si extraction V2
          aiAnalysis: aiResult,         // Réponse désanonymisée en base
          paid: false,
        },
      })
      diagnosticId = String(doc.id)
    } catch (dbError) {
      console.error('[MACAUTION] Erreur sauvegarde DB:', dbError instanceof Error ? dbError.message : dbError)
    }

    // 10. Construire la réponse (teaser)
    const response: PreDiagnosticResponse = {
      success: true,
      diagnosticId,
      anomaliesCount: aiResult.anomalies.length,
      estimatedAmount: aiResult.total_recoverable,
      riskLevel: aiResult.risk_level,
      anomalies: aiResult.anomalies.map(a => ({
        type: a.type,
        severity: a.severity,
        title: a.title,
        summary: a.summary,
        amount: a.amount,
      })),
      recommendation: aiResult.recommendation,
      calculations,
    }

    // 11. Envoi email récapitulatif (fire-and-forget, non bloquant)
    try {
      const emailHtml = buildMacautionRecapEmail({
        anomaliesCount: aiResult.anomalies.length,
        estimatedAmount: aiResult.total_recoverable,
        riskLevel: aiResult.risk_level,
        anomalies: aiResult.anomalies.map(a => ({
          title: a.title,
          amount: a.amount,
          severity: a.severity,
        })),
        diagnosticId,
      })
      sendEmail({
        to: data.email,
        subject: `RÉCUPÉO — Votre pré-diagnostic caution (${aiResult.anomalies.length} anomalie${aiResult.anomalies.length > 1 ? 's' : ''})`  ,
        htmlContent: emailHtml,
        tags: ['macaution', 'pre-diagnostic'],
      }).catch(e => console.warn('[MACAUTION] Email non envoyé:', e))
    } catch {
      // Email non bloquant
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[MACAUTION] Erreur inattendue:', err)
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
  data: ReturnType<typeof macautionSchema.parse>,
  calculations: ReturnType<typeof computeMacautionCalculations>
): PreDiagnosticResult {
  const anomalies: PreDiagnosticResult['anomalies'] = []

  // Retard de restitution
  if (calculations.daysLate > 0) {
    anomalies.push({
      type: 'retard_restitution',
      severity: 'confirmed',
      title: 'Retard de restitution du dépôt',
      summary: `Votre bailleur a dépassé le délai légal de restitution de ${calculations.monthsLate} mois.`,
      detail: `Le bailleur avait un délai de ${calculations.legalDeadlineDays === 60 ? '2 mois' : '1 mois'} pour restituer le dépôt (art. 22 al. 5-6), soit jusqu'au ${calculations.legalDeadlineDate}. Le retard constaté est de ${calculations.daysLate} jours (${calculations.monthsLate} mois commencé${calculations.monthsLate > 1 ? 's' : ''}).`,
      amount: 0,
      legal_reference: 'Art. 22 al. 5-6 loi 89-462',
    })
  }

  // Pénalités de retard
  if (calculations.latePenalties > 0) {
    anomalies.push({
      type: 'penalites',
      severity: 'confirmed',
      title: 'Pénalités de retard applicables',
      summary: `${calculations.latePenalties}€ de pénalités de retard vous sont dues (10% du loyer/mois).`,
      detail: `Pénalités de 10% du loyer mensuel HC (${data.rentAmount}€) par mois de retard commencé : ${calculations.monthsLate} × ${Math.round(data.rentAmount * 0.1)}€ = ${calculations.latePenalties}€. Ces pénalités sont de plein droit (art. 22 al. 7).`,
      amount: calculations.latePenalties,
      legal_reference: 'Art. 22 al. 7 loi 89-462',
    })
  }

  // Dépôt excessif
  if (calculations.depositExcessive) {
    anomalies.push({
      type: 'depot_excessif',
      severity: 'confirmed',
      title: 'Dépôt de garantie excessif',
      summary: `Votre dépôt dépasse le plafond légal de ${calculations.depositExcess}€.`,
      detail: `Le dépôt versé (${data.depositAmount}€) dépasse le plafond de ${calculations.depositLegalMax}€ pour une location ${data.locationType === 'vide' ? 'vide (1 mois HC)' : 'meublée (2 mois HC)'}.`,
      amount: calculations.depositExcess,
      legal_reference: 'Art. 22 al. 1 loi 89-462',
    })
  }

  // Absence de justificatifs
  if (data.hasInvoices === 'no') {
    anomalies.push({
      type: 'absence_justificatif',
      severity: 'confirmed',
      title: 'Retenues sans justificatif',
      summary: `Le bailleur a retenu ${calculations.amountWithheld}€ sans fournir aucun justificatif.`,
      detail: 'Toute retenue sur le dépôt de garantie doit être justifiée par des factures ou devis détaillés. En l\'absence de justificatifs, les retenues sont contestables en totalité.',
      amount: calculations.amountWithheld,
      legal_reference: 'Art. 22 loi 89-462',
    })
  } else if (data.hasInvoices === 'partial') {
    anomalies.push({
      type: 'absence_justificatif',
      severity: 'probable',
      title: 'Justificatifs partiels',
      summary: 'Le bailleur n\'a fourni que des justificatifs partiels pour ses retenues.',
      detail: 'Les retenues non accompagnées de factures ou devis détaillés sont contestables.',
      amount: Math.round(calculations.amountWithheld * 0.5),
      legal_reference: 'Art. 22 loi 89-462',
    })
  }

  // Absence EDL d'entrée
  if (data.entryDamages === 'no_edl') {
    anomalies.push({
      type: 'absence_edl',
      severity: 'confirmed',
      title: "Absence d'état des lieux d'entrée",
      summary: "Sans EDL d'entrée, le logement est présumé rendu en bon état à votre arrivée.",
      detail: "L'absence d'état des lieux d'entrée crée une présomption de bon état en faveur du locataire (art. 3-2).",
      amount: calculations.amountWithheld,
      legal_reference: 'Art. 3-2 loi 89-462',
    })
  }

  // Dégradations préexistantes
  if (data.entryDamages === 'yes' && data.deductions.length > 0) {
    anomalies.push({
      type: 'retenue_abusive',
      severity: 'probable',
      title: 'Dégradations potentiellement préexistantes',
      summary: "Des dégradations étaient déjà mentionnées à l'entrée — retenue possiblement abusive.",
      detail: "L'EDL d'entrée mentionnait des dégradations existantes. Si le bailleur retient pour des éléments déjà dégradés, la retenue est abusive.",
      amount: Math.round(calculations.amountWithheld * 0.3),
      legal_reference: 'Art. 3-2 loi 89-462',
    })
  }

  // Vétusté non appliquée
  if (calculations.vetuste && calculations.vetuste.length > 0) {
    const totalAbuse = calculations.vetuste.reduce((sum, v) => sum + v.landlordAbuse, 0)
    if (totalAbuse > 0) {
      anomalies.push({
        type: 'vetuste_non_appliquee',
        severity: 'probable',
        title: 'Vétusté probablement non appliquée',
        summary: `Après ${(calculations.occupationMonths / 12).toFixed(0)} ans d'occupation, la vétusté réduit fortement les retenues légitimes.`,
        detail: `La grille de vétusté FNAIM indique une usure normale significative. Excédent retenu estimé : ~${Math.round(totalAbuse)}€.`,
        amount: Math.round(totalAbuse),
        legal_reference: 'Grille vétusté FNAIM — Jurisprudence constante',
      })
    }
  }

  const totalRecoverable = calculateUniqueTotal(anomalies, calculations)
  const riskLevel = totalRecoverable > 1000 ? 'high' : totalRecoverable > 300 ? 'medium' : 'low'

  return {
    anomalies,
    total_recoverable: totalRecoverable,
    risk_level: riskLevel,
    recommendation: anomalies.length > 0
      ? 'Nous vous recommandons d\'envoyer une lettre de mise en demeure en recommandé avec accusé de réception. Si le bailleur ne répond pas sous 8 jours, saisissez la Commission Départementale de Conciliation (gratuit).'
      : 'Aucune anomalie majeure détectée.',
  }
}

function calculateUniqueTotal(
  anomalies: PreDiagnosticResult['anomalies'],
  calculations: ReturnType<typeof computeMacautionCalculations>
): number {
  let total = 0
  const penalites = anomalies.find(a => a.type === 'penalites')
  if (penalites) total += penalites.amount
  const excessif = anomalies.find(a => a.type === 'depot_excessif')
  if (excessif) total += excessif.amount
  const retenueAnomalies = anomalies.filter(a =>
    ['absence_justificatif', 'absence_edl', 'vetuste_non_appliquee', 'retenue_abusive'].includes(a.type)
  )
  if (retenueAnomalies.length > 0) {
    total += Math.max(...retenueAnomalies.map(a => a.amount))
  }
  return Math.round(total)
}
