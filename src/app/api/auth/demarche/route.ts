// ============================================================
// POST /api/auth/demarche
// Met à jour le suivi démarche d'un diagnostic
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getPayload } from 'payload'
import config from '@payload-config'

const ALLOWED_FIELDS = ['letterSentAt', 'responseReceivedAt', 'responseType', 'montantRecupere', 'notes']

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { diagnosticId, field, value } = body

    if (!diagnosticId || !field || !ALLOWED_FIELDS.includes(field)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Vérifier que le diagnostic appartient au user
    const diag = await payload.findByID({ collection: 'diagnostics', id: diagnosticId })
    const diagData = diag as {
      user?: string | { id: string }
      userEmail?: string
      demarche?: Record<string, unknown>
    }
    const diagUserId = typeof diagData.user === 'string' ? diagData.user : diagData.user?.id

    if (diagUserId !== user.id && diagData.userEmail !== user.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Merger avec les données existantes du groupe demarche
    const existingDemarche = diagData.demarche || {}
    const fieldValue = field === 'montantRecupere' ? (Number(value) || 0) : value

    await payload.update({
      collection: 'diagnostics',
      id: diagnosticId,
      data: {
        demarche: {
          ...existingDemarche,
          [field]: fieldValue,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DEMARCHE] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
