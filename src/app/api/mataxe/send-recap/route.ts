// ============================================================
// POST /api/mataxe/send-recap
// Envoi email récapitulatif du pré-diagnostic (gratuit)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, buildMataxeRecapEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, diagnosticId, commune, anomaliesCount, impactAnnualMin, impactAnnualMax,
            impact4Years, reliabilityLevel, reliabilityScore, anomalies } = body

    if (!email || !diagnosticId) {
      return NextResponse.json({ success: false, error: 'Email et diagnosticId requis' }, { status: 400 })
    }

    const html = buildMataxeRecapEmail({
      anomaliesCount: anomaliesCount || 0,
      impactAnnualMin: impactAnnualMin || 0,
      impactAnnualMax: impactAnnualMax || 0,
      impact4Years: impact4Years || 0,
      reliabilityLevel: reliabilityLevel || 'argent',
      reliabilityScore: reliabilityScore || 60,
      anomalies: anomalies || [],
      commune: commune || 'votre commune',
      diagnosticId,
    })

    const sent = await sendEmail({
      to: email,
      subject: `RÉCUPÉO — Votre pré-diagnostic taxe foncière (${anomaliesCount} anomalie${anomaliesCount > 1 ? 's' : ''})`,
      htmlContent: html,
      tags: ['mataxe', 'pre-diagnostic'],
    })

    return NextResponse.json({ success: true, sent })
  } catch (err) {
    console.error('[MATAXE] Erreur send-recap:', err)
    return NextResponse.json({ success: false, error: 'Erreur envoi email' }, { status: 500 })
  }
}
