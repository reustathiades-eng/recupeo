// ============================================================
// POST /api/monloyer/check
// Vérification encadrement loyer — GRATUIT, JS pur (pas d'IA)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { monloyerSchema } from '@/lib/monloyer/schema'
import { computeMonloyerCheck } from '@/lib/monloyer/calculations'
import { findCity } from '@/lib/monloyer/cities'
import type { MonloyerFormData, MonloyerCheckResponse, MonloyerErrorResponse } from '@/lib/monloyer/types'
import { sendEmail, buildMonloyerRecapEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // 1. Parser le body
    const body = await request.json()

    // 2. Valider avec Zod
    const validation = monloyerSchema.safeParse(body)
    if (!validation.success) {
      const errors: Record<string, string[]> = {}
      validation.error.issues.forEach(err => {
        const path = err.path.join('.')
        if (!errors[path]) errors[path] = []
        errors[path].push(err.message)
      })
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: errors } satisfies MonloyerErrorResponse,
        { status: 400 }
      )
    }

    const data = validation.data as MonloyerFormData

    // 3. Vérifier que la ville est éligible
    const city = findCity(data.city)
    if (!city) {
      return NextResponse.json(
        {
          success: false,
          error: `La ville "${data.city}" n'est pas soumise à l'encadrement des loyers. Seules 69 communes en France sont concernées.`,
        } satisfies MonloyerErrorResponse,
        { status: 400 }
      )
    }

    // 4. Calcul JS pur (pas d'appel IA)
    const result = computeMonloyerCheck(data)

    // 5. Sauvegarder en base
    const payload = await getPayload({ config })
    const diagnostic = await payload.create({
      collection: 'diagnostics',
      data: {
        brique: 'monloyer',
        userEmail: data.email?.toLowerCase?.() || '',
        status: 'pre_diagnostic',
        anomaliesCount: result.status === 'conforme' ? 0 : 1,
        estimatedAmount: result.totalRecoverable,
        inputData: data,
        aiAnalysis: result,
      },
    })

    // 6. Envoi email récapitulatif (fire-and-forget, non bloquant)
    const diagnosticId = String(diagnostic.id)
    try {
      const emailHtml = buildMonloyerRecapEmail({
        status: result.status,
        currentRent: result.currentRent,
        referenceRentMajore: result.referenceRentMajore,
        excessMonthly: result.excessMonthly,
        totalRecoverable: result.totalRecoverable,
        monthsSinceBail: result.monthsSinceBail,
        territory: result.territoryLabel,
        diagnosticId,
      })
      sendEmail({
        to: data.email,
        subject: result.status !== 'conforme'
          ? `RÉCUPÉO — Loyer excessif détecté (~${result.totalRecoverable}€ récupérables)`
          : 'RÉCUPÉO — Votre loyer est conforme',
        htmlContent: emailHtml,
        tags: ['monloyer', 'check'],
      }).catch(e => console.warn('[MONLOYER] Email non envoyé:', e))
    } catch {
      // Email non bloquant
    }

    // 7. Réponse
    return NextResponse.json({
      success: true,
      data: result,
      diagnosticId,
    } satisfies MonloyerCheckResponse)

  } catch (err: any) {
    console.error('[MONLOYER CHECK]', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur serveur' } satisfies MonloyerErrorResponse,
      { status: 500 }
    )
  }
}
