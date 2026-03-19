// ============================================================
// POST /api/monloyer/generate-letters
// Génération des 3 courriers (mise en demeure, CDC, préfecture)
// Payant — 29 EUR
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { callClaude } from '@/lib/anthropic'
import { LETTERS_SYSTEM_PROMPT, buildLettersUserMessage } from '@/lib/monloyer/prompts'
import type { MonloyerFormData, MonloyerCheckResult } from '@/lib/monloyer/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { diagnosticId, tenantName, tenantAddress, landlordName, landlordAddress } = body

    if (!diagnosticId) {
      return NextResponse.json({ success: false, error: 'diagnosticId requis' }, { status: 400 })
    }

    // 1. Récupérer le diagnostic en base
    const payload = await getPayload({ config })
    const diagnostic = await payload.findByID({ collection: 'diagnostics', id: diagnosticId })

    if (!diagnostic) {
      return NextResponse.json({ success: false, error: 'Diagnostic introuvable' }, { status: 404 })
    }

    if (diagnostic.brique !== 'monloyer') {
      return NextResponse.json({ success: false, error: 'Ce diagnostic n\'est pas un MONLOYER' }, { status: 400 })
    }

    // TODO: Vérifier le paiement quand PayPlug sera intégré
    // if (!diagnostic.paid) {
    //   return NextResponse.json({ success: false, error: 'Paiement requis' }, { status: 402 })
    // }

    const formData = diagnostic.inputData as MonloyerFormData
    const checkResult = diagnostic.aiAnalysis as MonloyerCheckResult

    // 2. Vérifier que le diagnostic montre un dépassement
    if (checkResult.status === 'conforme') {
      return NextResponse.json(
        { success: false, error: 'Votre loyer est conforme, pas de courrier nécessaire' },
        { status: 400 }
      )
    }

    // 3. Construire le message et appeler Claude
    const clientInfo = {
      tenantName: tenantName || undefined,
      tenantAddress: tenantAddress || formData.address || undefined,
      landlordName: landlordName || undefined,
      landlordAddress: landlordAddress || undefined,
    }

    const userMessage = buildLettersUserMessage(formData, checkResult, clientInfo)

    let letters: any
    try {
      const aiResponse = await callClaude({
        system: LETTERS_SYSTEM_PROMPT,
        userMessage,
        maxTokens: 8192,
        temperature: 0.3,
      })

      let jsonStr = aiResponse.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      letters = JSON.parse(jsonStr)
    } catch (aiError: any) {
      console.error('[MONLOYER LETTERS] Claude API error:', aiError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la génération des courriers' },
        { status: 500 }
      )
    }

    // 4. Sauvegarder les courriers en base (collection Reports)
    const report = await payload.create({
      collection: 'reports',
      data: {
        title: 'Courriers MONLOYER — Encadrement des loyers',
        diagnostic: diagnosticId,
        reportContent: null,
        generatedLetters: letters,
      },
    })

    // 5. Marquer le diagnostic comme complet
    await payload.update({
      collection: 'diagnostics',
      id: diagnosticId,
      data: {
        title: 'Courriers MONLOYER — Encadrement des loyers',
        status: 'full_report',
      },
    })

    return NextResponse.json({
      success: true,
      letters,
      reportId: String(report.id),
    })

  } catch (err: any) {
    console.error('[MONLOYER LETTERS]', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
