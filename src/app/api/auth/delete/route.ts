// ============================================================
// POST /api/auth/delete — Demande de suppression de compte (RGPD)
// Marque le compte pour suppression à J+30
// ============================================================
import { NextResponse } from 'next/server'
import { getSession, destroySession } from '@/lib/auth/session'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendEmail } from '@/lib/email'

export async function POST() {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const payload = await getPayload({ config })

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { deletionRequestedAt: new Date().toISOString() },
    })

    // Email de confirmation
    await sendEmail({
      to: user.email,
      subject: 'RÉCUPÉO — Demande de suppression de compte',
      htmlContent: `
        <div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;max-width:580px;margin:0 auto;">
          <div style="background:#0B1426;padding:24px 32px;text-align:center;">
            <span style="color:#00D68F;font-size:22px;font-weight:800;">RÉCUPÉO</span>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#0B1426;font-size:18px;">Demande de suppression reçue</h2>
            <p style="color:#1E293B;font-size:14px;line-height:1.6;">
              Votre demande de suppression de compte a été enregistrée. Vos données seront définitivement supprimées dans 30 jours.
            </p>
            <p style="color:#64748B;font-size:13px;">
              Si vous changez d'avis, reconnectez-vous avant cette date pour annuler la suppression.
            </p>
          </div>
        </div>
      `,
      tags: ['auth', 'deletion'],
    })

    // Déconnecter
    await destroySession()

    console.log(`[AUTH] Suppression demandée pour ${user.email}`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
