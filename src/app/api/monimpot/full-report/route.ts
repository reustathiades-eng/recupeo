// ============================================================
// POST /api/monimpot/full-report — Rapport complet (V3 Zero API)
// Templates JS au lieu de Claude API
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { detectOptimisations } from '@/lib/monimpot/anomaly-detection'
import { computeMonimpotCalculations } from '@/lib/monimpot/calculations'
import { buildReport } from '@/lib/monimpot/report-builder'
import type { MonimpotFormData } from '@/lib/monimpot/types'
import type { AvisImpositionExtracted } from '@/lib/monimpot/extract-types'
import { track } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const { diagnosticId } = await request.json()
    if (!diagnosticId) return NextResponse.json({ success: false, error: 'diagnosticId requis' }, { status: 400 })

    const payload = await getPayload({ config })
    const diag = await payload.findByID({ collection: 'diagnostics', id: diagnosticId })
    const d = diag as Record<string, unknown>

    // Vérifier paiement (décommenter quand Stripe prod actif)
    // if (d.status !== 'paid') {
    //   return NextResponse.json({ success: false, error: 'Paiement requis' }, { status: 403 })
    // }

    const data = d.inputData as MonimpotFormData
    const calc = computeMonimpotCalculations(data)

    // Récupérer les données d'extraction si disponibles
    const inputAny = data as any
    const extraction: AvisImpositionExtracted | undefined = inputAny.isFromExtraction
      ? {
          annee: inputAny.extractedAnnee || new Date().getFullYear() - 1,
          rfr: inputAny.rfr || 0,
          revenuBrutGlobal: inputAny.revenuBrutGlobal || 0,
          impotBrut: inputAny.impotBrut || 0,
          totalReductionsCredits: inputAny.totalReductionsCredits || 0,
          salairesTraitements: inputAny.salairesTraitements || undefined,
          pensionsRetraite: inputAny.pensionsRetraite || undefined,
          revenusCapitaux: inputAny.extractedRevenusCapitaux || undefined,
          casesRenseignees: inputAny.extractedCases || {},
          // Données sensibles restaurées pour la réclamation
          numeroFiscal: inputAny.numeroFiscal,
          numeroAvis: inputAny.numeroAvis,
          adresseCentre: inputAny.adresseCentre,
        } as AvisImpositionExtracted
      : undefined
    const multiAvis: AvisImpositionExtracted[] | undefined = inputAny.multiAvis

    const optimisations = detectOptimisations(data, calc, extraction, multiAvis)

    // ═══ V3 : Templates JS au lieu de callClaude ═══
    const report = buildReport(data, calc, optimisations, extraction, multiAvis)

    await payload.update({
      collection: 'diagnostics',
      id: diagnosticId,
      data: {
        status: 'report_generated',
        aiAnalysis: { optimisations, calc, report: report.rapport },
      },
    })

    track({
      event: 'report_generated',
      brique: 'monimpot',
      optimisations_count: optimisations.length,
      method: 'template_v3',
    })

    return NextResponse.json({ success: true, report: report.rapport })
  } catch (err) {
    console.error('[MONIMPOT] Erreur full-report:', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
