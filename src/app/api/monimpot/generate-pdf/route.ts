// ============================================================
// POST /api/monimpot/generate-pdf
// Génération PDF (rapport ou réclamation fiscale)
// O7 — Passe sensitiveData à la réclamation
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateMonimpotReportPDF, generateMonimpotReclamationPDF } from '@/lib/monimpot/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const { diagnosticId, type = 'report', sensitiveData } = await request.json()
    if (!diagnosticId) {
      return NextResponse.json({ success: false, error: 'diagnosticId requis' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Récupérer le diagnostic
    const diagnostic = await payload.findByID({ collection: 'diagnostics', id: diagnosticId })
    if (!diagnostic) {
      return NextResponse.json({ success: false, error: 'Diagnostic introuvable' }, { status: 404 })
    }

    const aiAnalysis = diagnostic.aiAnalysis as any

    let pdfBuffer: Buffer

    if (type === 'report') {
      const report = aiAnalysis?.report?.rapport || aiAnalysis?.report
      if (!report) {
        return NextResponse.json({ success: false, error: 'Rapport non disponible' }, { status: 404 })
      }
      pdfBuffer = await generateMonimpotReportPDF(report, aiAnalysis?.calc)
    } else if (type === 'reclamation') {
      const reclamation = aiAnalysis?.reclamation
      if (!reclamation) {
        return NextResponse.json({ success: false, error: 'Réclamation non disponible' }, { status: 404 })
      }
      // O7 — Passer sensitiveData pour les coordonnées du centre des impôts
      pdfBuffer = await generateMonimpotReclamationPDF(reclamation, sensitiveData)
    } else {
      return NextResponse.json({ success: false, error: 'Type invalide (report ou reclamation)' }, { status: 400 })
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="RECUPEO-${type === 'report' ? 'rapport' : 'reclamation'}-monimpot.pdf"`,
      },
    })
  } catch (error) {
    console.error('[MONIMPOT] Erreur PDF:', error)
    return NextResponse.json({ success: false, error: 'Erreur generation PDF' }, { status: 500 })
  }
}
