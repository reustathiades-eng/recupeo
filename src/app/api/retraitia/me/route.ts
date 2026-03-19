// ============================================================
// GET /api/retraitia/me
// Retourne le dossier RETRAITIA du client connecte.
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const email = user.email.toLowerCase().trim()

    // Cas 1 : proche aidant - dossierId explicite en query
    const aidantDossierId = request.nextUrl.searchParams.get('dossierId')
    if (aidantDossierId) {
      try {
        const dossier = await payload.findByID({
          collection: 'retraitia-dossiers',
          id: aidantDossierId,
        })
        const proche = (dossier as any).procheAidant
        if (proche && proche.email?.toLowerCase() === email) {
          return NextResponse.json({ dossier, isProche: true })
        }
        if ((dossier as any).userEmail?.toLowerCase() === email) {
          return NextResponse.json({ dossier, isProche: false })
        }
        return NextResponse.json({ error: "Acces refuse" }, { status: 403 })
      } catch {
        return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 })
      }
    }

    // Cas 2 : dossier du client connecte (par email)
    const result = await payload.find({
      collection: 'retraitia-dossiers',
      where: { userEmail: { equals: email } },
      sort: '-createdAt',
      limit: 10,
    })

    if (result.docs.length === 0) {
      return NextResponse.json({ dossier: null })
    }

    const dossier = result.docs[0]
    const allDossiers = result.docs.map((d: any) => ({
      id: String(d.id),
      parcours: d.parcours,
      clientName: d.clientName,
      status: d.status,
      coupleId: d.coupleId,
      createdAt: d.createdAt,
    }))

    return NextResponse.json({
      dossier,
      allDossiers: allDossiers.length > 1 ? allDossiers : undefined,
      isProche: false,
    })
  } catch (err) {
    console.error('[RETRAITIA/ME] Erreur:', err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
