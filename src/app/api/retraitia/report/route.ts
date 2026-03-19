// ============================================================
// GET /api/retraitia/report?dossierId=xxx
// Genere et retourne le rapport PDF
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateRetraitiaPDF } from '@/lib/retraitia/pdf/report-generator'
import type { DossierFormulaire, DiagnosticResult, CalculResult, DossierExtractions } from '@/lib/retraitia/types'

export async function GET(request: NextRequest) {
  try {
    const dossierId = request.nextUrl.searchParams.get('dossierId')
    if (!dossierId) {
      return NextResponse.json({ error: 'dossierId requis' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const dossier = await payload.findByID({ collection: 'retraitia-dossiers', id: dossierId }) as any

    if (!dossier) {
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
    }

    if (!dossier.pack49Paid && !dossier.seuilGratuit) {
      return NextResponse.json({ error: 'Pack Action non paye' }, { status: 403 })
    }

    if (!dossier.diagnostic || !dossier.calcul) {
      return NextResponse.json({ error: 'Diagnostic non genere' }, { status: 400 })
    }

    const pdfBuffer = generateRetraitiaPDF({
      formulaire: dossier.formulaire as DossierFormulaire,
      diagnostic: dossier.diagnostic as DiagnosticResult,
      calcul: dossier.calcul as CalculResult,
      extractions: (dossier.extractions || {}) as DossierExtractions,
      dossierId,
    })

    const nom = dossier.formulaire?.identite?.nom || 'retraitia'
    const filename = `rapport-retraitia-${nom.toLowerCase().replace(/\s+/g, '-')}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[retraitia/report] Error:', err)
    return NextResponse.json({ error: 'Erreur generation PDF' }, { status: 500 })
  }
}
