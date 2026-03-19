// POST /api/retraitia/tribunal
// Génère le ZIP tribunal (docs + courriers + chronologie PDF)
// Nécessite Pack Tribunal payé.

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateChronologiePdf, buildChronologie } from '@/lib/retraitia/courriers/tribunal'

export async function POST(req: NextRequest) {
  try {
    const { dossierId } = await req.json()
    if (!dossierId) {
      return NextResponse.json({ error: 'dossierId requis' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const dossier = await payload.findByID({
      collection: 'retraitia-dossiers' as any,
      id: dossierId,
      depth: 0,
    })

    if (!dossier) {
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
    }

    // Vérifier Pack Tribunal payé
    const paiements = ((dossier as any).paiements || []) as any[]
    const tribunalPaid = paiements.some((p: any) => p.pack === 'tribunal_29')
    if (!tribunalPaid) {
      return NextResponse.json({ error: 'Pack Tribunal non payé' }, { status: 403 })
    }

    // Construire la chronologie
    const chronologie = buildChronologie(dossier)

    // Générer le PDF chronologie
    const chronoPdf = generateChronologiePdf({
      dossierId: String(dossier.id),
      clientName: (dossier as any).clientName || 'Client',
      chronologie,
    })

    // Retourner le PDF chronologie (le ZIP complet avec docs+courriers sera une V2+ feature)
    return new NextResponse(new Uint8Array(chronoPdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="chronologie_${String(dossier.id).slice(0, 8)}.pdf"`,
      },
    })
  } catch (err) {
    console.error('[tribunal] Erreur:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 }
    )
  }
}
