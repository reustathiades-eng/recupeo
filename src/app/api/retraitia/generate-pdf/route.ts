// ============================================================
// POST /api/retraitia/generate-pdf
// Génération PDF professionnelle (rapport ou courriers)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateReportPDF, generateLettersPDF } from '@/lib/retraitia/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const { diagnosticId, type = 'report' } = await request.json()
    if (!diagnosticId) {
      return NextResponse.json({ success: false, error: 'diagnosticId requis' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Récupérer le diagnostic (pour les infos client)
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
    const letters = reportDoc.generatedLetters as any

    // Infos client extraites (pour préremplir les courriers)
    const inputData = diagnostic.inputData as any
    const clientInfo = {
      name: inputData?.clientName || undefined,
      address: inputData?.clientAddress || undefined,
      nir: inputData?.clientNIR || undefined,
      carsat: inputData?.clientCARSAT || undefined,
      city: inputData?.clientCity || undefined,
    }

    let pdfBuffer: Buffer

    if (type === 'report' && reportContent) {
      pdfBuffer = await generateReportPDF(reportContent)
    } else if (type === 'letters' && letters) {
      pdfBuffer = await generateLettersPDF(letters, clientInfo)
    } else {
      return NextResponse.json({ success: false, error: 'Contenu non disponible' }, { status: 404 })
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="RECUPEO-${type === 'report' ? 'rapport' : 'courriers'}-retraitia.pdf"`,
      },
    })
  } catch (error) {
    console.error('[RETRAITIA] Erreur PDF:', error)
    return NextResponse.json({ success: false, error: 'Erreur generation PDF' }, { status: 500 })
  }
}
