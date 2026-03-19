// ============================================================
// POST /api/reviews/request — Génère un token review + envoie l'email
// Appelé par le cron J+2 ou manuellement
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateReviewToken } from '@/lib/reviews/token'
import { sendEmail } from '@/lib/email'
import { BRIQUE_NAMES } from '@/lib/reviews/constants'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { diagnosticId, source } = body

    if (!diagnosticId) {
      return NextResponse.json({ error: 'diagnosticId requis' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const diag = await payload.findByID({ collection: 'diagnostics', id: diagnosticId })
    const d = diag as Record<string, unknown>

    if (!d.paid || !d.userEmail) {
      return NextResponse.json({ error: 'Diagnostic non payé ou sans email' }, { status: 400 })
    }

    // Vérifier qu'on n'a pas déjà un avis
    const existing = await payload.find({
      collection: 'reviews',
      where: {
        and: [
          { email: { equals: d.userEmail as string } },
          { brique: { equals: d.brique as string } },
        ],
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json({ success: true, alreadyReviewed: true })
    }

    // Générer le token
    const token = await generateReviewToken({
      email: d.userEmail as string,
      brique: d.brique as string,
      diagnosticId,
      source: source || 'email_j2',
    })

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://recupeo.fr'
    const reviewUrl = `${baseUrl}/avis?token=${token}&brique=${d.brique}`
    const briqueName = BRIQUE_NAMES[d.brique as string] || (d.brique as string)

    // Envoyer l'email
    const sent = await sendEmail({
      to: d.userEmail as string,
      subject: `RÉCUPÉO — Votre diagnostic ${briqueName} vous a-t-il aidé ?`,
      htmlContent: buildReviewRequestEmail({ briqueName, reviewUrl }),
      tags: ['review', source || 'email_j2', d.brique as string],
    })

    return NextResponse.json({ success: true, sent, reviewUrl })
  } catch (err) {
    console.error('[REVIEWS] Erreur request:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function buildReviewRequestEmail({ briqueName, reviewUrl }: { briqueName: string; reviewUrl: string }): string {
  return `
<div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;max-width:580px;margin:0 auto;background:#ffffff;">
  <div style="background:#0B1426;padding:24px 32px;text-align:center;">
    <span style="color:#00D68F;font-size:22px;font-weight:800;letter-spacing:-0.5px;">RÉCUPÉO</span>
    <span style="color:rgba(255,255,255,0.4);font-size:12px;margin-left:8px;">recupeo.fr</span>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#0B1426;font-size:20px;margin:0 0 16px;">Votre diagnostic ${briqueName} vous a-t-il aidé ?</h2>
    <p style="color:#1E293B;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Nous aimerions connaître votre expérience avec notre service. Votre avis nous aide à nous améliorer et guide d'autres utilisateurs.
    </p>
    <p style="color:#1E293B;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Cliquez sur une étoile pour commencer :
    </p>
    <div style="text-align:center;margin:24px 0;">
      ${[1, 2, 3, 4, 5].map(n =>
        `<a href="${reviewUrl}&note=${n}" style="text-decoration:none;font-size:28px;margin:0 4px;">${n <= 3 ? '⭐' : '⭐'}</a>`
      ).join('')}
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${reviewUrl}" style="background:#00D68F;color:#0B1426;font-weight:700;font-size:15px;padding:12px 28px;border-radius:10px;text-decoration:none;display:inline-block;">
        Donner mon avis →
      </a>
    </div>
  </div>
  <div style="padding:20px 32px;background:#F7F9FC;border-top:1px solid #E2E8F0;text-align:center;font-size:11px;color:#64748B;">
    <p style="margin:0;">RÉCUPÉO — L'IA qui récupère ce qu'on vous doit</p>
  </div>
</div>`
}
