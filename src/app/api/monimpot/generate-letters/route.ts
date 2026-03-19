// ============================================================
// POST /api/monimpot/generate-letters — Guide + Réclamation (V3 Zero API)
// Templates JS au lieu de 2× Claude API
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { detectOptimisations } from '@/lib/monimpot/anomaly-detection'
import { computeMonimpotCalculations } from '@/lib/monimpot/calculations'
import { buildCorrectionGuide, buildReclamationLetter } from '@/lib/monimpot/report-builder'
import type { MonimpotFormData } from '@/lib/monimpot/types'
import type { AvisImpositionExtracted } from '@/lib/monimpot/extract-types'

export async function POST(request: NextRequest) {
  try {
    const { diagnosticId, sensitiveData } = await request.json()
    if (!diagnosticId) return NextResponse.json({ success: false, error: 'diagnosticId requis' }, { status: 400 })

    const payload = await getPayload({ config })
    const diag = await payload.findByID({ collection: 'diagnostics', id: diagnosticId })
    const d = diag as Record<string, unknown>

    const data = d.inputData as MonimpotFormData
    const calc = computeMonimpotCalculations(data)

    // Données d'extraction si disponibles
    const inputAny = data as any
    const extraction: AvisImpositionExtracted | undefined = inputAny.isFromExtraction
      ? {
          annee: inputAny.extractedAnnee || new Date().getFullYear() - 1,
          rfr: inputAny.rfr || 0,
          casesRenseignees: inputAny.extractedCases || {},
          numeroFiscal: inputAny.numeroFiscal,
          numeroAvis: inputAny.numeroAvis,
          adresseCentre: inputAny.adresseCentre,
        } as AvisImpositionExtracted
      : undefined

    const optimisations = detectOptimisations(data, calc, extraction)

    // ═══ V3 : Templates JS au lieu de 2× callClaude ═══

    // 1. Guide de correction
    const guide = buildCorrectionGuide(data, calc, optimisations, extraction)

    // 2. Réclamation pré-remplie
    let reclamation = null
    if (optimisations.length > 0) {
      const safeSD = sensitiveData || {
        numeroFiscal: '[VOTRE N° FISCAL — voir votre avis d\'imposition]',
        numeroAvis: '[N° AVIS]',
        adresseCentre: '[ADRESSE DE VOTRE CENTRE DES IMPÔTS — voir votre avis]',
      }
      reclamation = buildReclamationLetter(data, calc, optimisations, safeSD, extraction)
    }

    // Sauvegarder en base
    const existingAnalysis = (d.aiAnalysis as any) || {}
    await payload.update({
      collection: 'diagnostics',
      id: diagnosticId,
      data: {
        status: 'letters_generated',
        aiAnalysis: { ...existingAnalysis, guide, reclamation },
      },
    })

    return NextResponse.json({ success: true, guide, reclamation })
  } catch (err) {
    console.error('[MONIMPOT] Erreur generate-letters:', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
