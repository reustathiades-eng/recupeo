// ============================================================
// POST /api/mataxe/generate-pdf
// Génération PDF (rapport ou réclamation fiscale)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateMataxeReportPDF, generateMataxeReclamationPDF } from '@/lib/mataxe/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const { diagnosticId, type = 'report' } = await request.json()
    if (!diagnosticId) {
      return NextResponse.json({ success: false, error: 'diagnosticId requis' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Récupérer le diagnostic
    const diagnostic = await payload.findByID({ collection: 'diagnostics', id: diagnosticId })
    if (!diagnostic) {
      return NextResponse.json({ success: false, error: 'Diagnostic introuvable' }, { status: 404 })
    }

    // Récupérer le rapport
    const reports = await payload.find({
      collection: 'reports',
      where: { diagnostic: { equals: diagnosticId } },
      limit: 1,
    })
    if (reports.docs.length === 0) {
      return NextResponse.json({ success: false, error: 'Rapport introuvable' }, { status: 404 })
    }

    const reportDoc = reports.docs[0]
    const reportContent = reportDoc.reportContent as any
    const reclamation = reportDoc.generatedLetters as any
    const inputData = diagnostic.inputData as any
    const calculations = diagnostic.aiAnalysis as any

    let pdfBuffer: Buffer

    if (type === 'report' && reportContent) {
      pdfBuffer = await generateMataxeReportPDF(reportContent, calculations)
    } else if (type === 'reclamation' && reclamation) {
      pdfBuffer = await generateMataxeReclamationPDF(reclamation, inputData)
    } else {
      return NextResponse.json({ success: false, error: 'Contenu non disponible' }, { status: 404 })
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="RECUPEO-${type === 'report' ? 'rapport' : 'reclamation'}-mataxe.pdf"`,
      },
    })
  } catch (error) {
    console.error('[MATAXE] Erreur PDF:', error)
    return NextResponse.json({ success: false, error: 'Erreur generation PDF' }, { status: 500 })
  }
}
