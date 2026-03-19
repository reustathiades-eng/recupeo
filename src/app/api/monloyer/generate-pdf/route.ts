// ============================================================
// POST /api/monloyer/generate-pdf
// Génération PDF des courriers MONLOYER
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateMonloyerLettersPDF } from '@/lib/monloyer/pdf-generator'
import type { MonloyerFormData } from '@/lib/monloyer/types'

export async function POST(request: NextRequest) {
  try {
    const { diagnosticId } = await request.json()
    if (!diagnosticId) {
      return NextResponse.json({ success: false, error: 'diagnosticId requis' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // 1. Récupérer le diagnostic
    const diagnostic = await payload.findByID({ collection: 'diagnostics', id: diagnosticId })
    if (!diagnostic) {
      return NextResponse.json({ success: false, error: 'Diagnostic introuvable' }, { status: 404 })
    }

    // 2. Récupérer le rapport (courriers)
    const reports = await payload.find({
      collection: 'reports',
      where: { diagnostic: { equals: diagnosticId } },
      limit: 1,
    })
    if (reports.docs.length === 0) {
      return NextResponse.json({ success: false, error: 'Courriers introuvables. Générez-les d\'abord.' }, { status: 404 })
    }

    const reportDoc = reports.docs[0]
    const letters = reportDoc.generatedLetters as any

    if (!letters) {
      return NextResponse.json({ success: false, error: 'Aucun courrier généré' }, { status: 404 })
    }

    // 3. Infos client
    const formData = diagnostic.inputData as MonloyerFormData
    const raw = diagnostic.inputData as any
    const clientInfo = {
      tenantName: raw?.tenantName || undefined,
      tenantAddress: raw?.tenantAddress || formData?.address || undefined,
      landlordName: raw?.landlordName || undefined,
      landlordAddress: raw?.landlordAddress || undefined,
      city: formData?.city || undefined,
    }

    // 4. Générer le PDF
    const pdfBuffer = await generateMonloyerLettersPDF(letters, clientInfo)

    // 5. Réponse PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="RECUPEO_MONLOYER_Courriers_${diagnosticId}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })

  } catch (err: any) {
    console.error('[MONLOYER PDF]', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
