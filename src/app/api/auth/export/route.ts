// ============================================================
// GET /api/auth/export — Export RGPD (toutes les données user)
// ============================================================
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const payload = await getPayload({ config })

    const fullUser = await payload.findByID({ collection: 'users', id: user.id })
    const diagnostics = await payload.find({
      collection: 'diagnostics',
      where: { or: [{ user: { equals: user.id } }, { userEmail: { equals: user.email } }] },
      limit: 500,
    })

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        email: (fullUser as Record<string, unknown>).email,
        firstName: (fullUser as Record<string, unknown>).firstName,
        profile: (fullUser as Record<string, unknown>).profile,
        notifications: (fullUser as Record<string, unknown>).notifications,
        referralCode: (fullUser as Record<string, unknown>).referralCode,
        createdAt: (fullUser as Record<string, unknown>).createdAt,
      },
      diagnostics: diagnostics.docs.map((d: Record<string, unknown>) => ({
        id: d.id,
        brique: d.brique,
        status: d.status,
        estimatedAmount: d.estimatedAmount,
        anomaliesCount: d.anomaliesCount,
        paid: d.paid,
        demarche: d.demarche,
        createdAt: d.createdAt,
      })),
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="recupeo-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (err) {
    console.error('[EXPORT] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
