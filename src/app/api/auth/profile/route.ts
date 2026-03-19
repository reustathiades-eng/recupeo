// ============================================================
// GET + PUT /api/auth/profile
// Récupère et met à jour le profil utilisateur
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const payload = await getPayload({ config })
    const fullUser = await payload.findByID({ collection: 'users', id: user.id })
    const u = fullUser as Record<string, unknown>

    return NextResponse.json({
      email: u.email,
      firstName: u.firstName || '',
      profile: u.profile || {},
      notifications: u.notifications || { reminders: true, newBriques: true, annualAlerts: true, newsletter: false },
    })
  } catch (err) {
    console.error('[PROFILE] Erreur GET:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = await request.json()
    const payload = await getPayload({ config })

    const allowedFields: Record<string, unknown> = {}

    if (typeof body.firstName === 'string') {
      allowedFields.firstName = body.firstName.trim().slice(0, 50)
    }

    if (body.profile && typeof body.profile === 'object') {
      const p = body.profile
      allowedFields.profile = {
        isOwner: !!p.isOwner,
        isTenant: !!p.isTenant,
        isRetired: !!p.isRetired,
        isEmployee: !!p.isEmployee,
        isJobSeeker: !!p.isJobSeeker,
        isDivorced: !!p.isDivorced,
      }
    }

    if (body.notifications && typeof body.notifications === 'object') {
      const n = body.notifications
      allowedFields.notifications = {
        reminders: !!n.reminders,
        newBriques: !!n.newBriques,
        annualAlerts: !!n.annualAlerts,
        newsletter: !!n.newsletter,
      }
    }

    await payload.update({
      collection: 'users',
      id: user.id,
      data: allowedFields,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PROFILE] Erreur PUT:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
