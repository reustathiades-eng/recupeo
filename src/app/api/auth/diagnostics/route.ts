// ============================================================
// GET /api/auth/diagnostics
// Retourne tous les diagnostics de l'utilisateur connecté
// ============================================================
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    const diagnostics = await payload.find({
      collection: 'diagnostics',
      where: {
        or: [
          { user: { equals: user.id } },
          { userEmail: { equals: user.email } },
        ],
      },
      sort: '-createdAt',
      limit: 100,
    })

    return NextResponse.json({
      diagnostics: diagnostics.docs.map((d: Record<string, unknown>) => ({
        id: d.id,
        brique: d.brique,
        createdAt: d.createdAt,
        estimatedAmount: d.estimatedAmount,
        anomaliesCount: d.anomaliesCount,
        paid: d.paid || false,
        status: d.status || 'pending',
        demarche: d.demarche || null,
        generatedPdfUrl: d.generatedPdfUrl,
        generatedLettersUrl: d.generatedLettersUrl,
      })),
    })
  } catch (err) {
    console.error('[DIAGNOSTICS] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
