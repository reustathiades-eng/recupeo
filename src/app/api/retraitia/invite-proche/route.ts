// ============================================================
// POST /api/retraitia/invite-proche
// Genere un magic link pour inviter un proche aidant
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { dossierId, procheEmail, procheLien } = await request.json()

    if (!dossierId || !procheEmail || !procheLien) {
      return NextResponse.json({ error: 'Donnees incompletes' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const dossier = await payload.findByID({ collection: 'retraitia-dossiers', id: dossierId }) as any

    if (!dossier) {
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
    }

    // Generer le magic token
    const magicToken = crypto.randomBytes(32).toString('hex')

    // Sauvegarder
    await payload.update({
      collection: 'retraitia-dossiers',
      id: dossierId,
      data: {
        procheAidant: {
          email: procheEmail.toLowerCase().trim(),
          lien: procheLien,
          magicToken,
          createdAt: new Date().toISOString(),
          permissions: {
            voirDossier: true,
            uploader: true,
            remplirFormulaire: true,
            payer: true,
            signerCourriers: false,
          },
        },
      },
    })

    // Envoyer le magic link par email (S13)
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://recupeo.fr'
    const magicLink = `${baseUrl}/mon-espace/retraitia?aidant=${magicToken}`
    const clientName = dossier.clientName || 'votre proche'

    await sendEmail({
      to: procheEmail,
      subject: `RECUPEO — ${clientName} a besoin de votre aide pour sa retraite`,
      htmlContent: `
        <h2 style="color:#0F172A;font-size:22px;">Un proche a besoin de votre aide</h2>
        <p style="color:#64748b;font-size:15px;">
          ${clientName} vous invite a acceder a son dossier RETRAITIA pour l'aider dans ses demarches de retraite.
        </p>
        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;">
          <p style="font-size:14px;margin:8px 0;"><strong>Ce que vous pouvez faire :</strong></p>
          <p style="font-size:14px;margin:4px 0;">✓ Voir le dossier et le diagnostic</p>
          <p style="font-size:14px;margin:4px 0;">✓ Uploader des documents</p>
          <p style="font-size:14px;margin:4px 0;">✓ Remplir le formulaire</p>
          <p style="font-size:14px;margin:4px 0;">✓ Effectuer un paiement</p>
          <p style="font-size:14px;margin:4px 0;color:#94a3b8;">✗ Signer des courriers (reserve au titulaire)</p>
        </div>
        <div style="text-align:center;margin:30px 0;">
          <a href="${magicLink}" style="display:inline-block;background:#00D68F;color:#060D1B;padding:16px 32px;border-radius:10px;font-weight:700;font-size:16px;text-decoration:none;">
            Acceder au dossier
          </a>
        </div>
        <p style="color:#94a3b8;font-size:11px;text-align:center;">
          Ce lien est personnel et confidentiel. Ne le partagez pas.
        </p>
      `,
      tags: ['retraitia', 'proche-aidant'],
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[retraitia/invite-proche] Error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
