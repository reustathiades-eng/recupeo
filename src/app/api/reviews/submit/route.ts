// ============================================================
// POST /api/reviews/submit — Soumettre un avis
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyReviewToken } from '@/lib/reviews/token'
import { moderateReview } from '@/lib/reviews/moderation'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, note, commentaire, prenom, ville, montantRecupere, hasRecovered, consentPublication } = body

    // Validation
    if (!token || !note || !prenom) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }
    if (note < 1 || note > 5) {
      return NextResponse.json({ error: 'Note invalide (1-5)' }, { status: 400 })
    }
    if (!consentPublication) {
      return NextResponse.json({ error: 'Consentement de publication requis' }, { status: 400 })
    }

    // Vérifier le token
    const tokenData = await verifyReviewToken(token)
    if (!tokenData) {
      return NextResponse.json({ error: 'Lien expiré ou invalide' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Vérifier doublon (même email + même brique)
    const existing = await payload.find({
      collection: 'reviews',
      where: {
        and: [
          { email: { equals: tokenData.email } },
          { brique: { equals: tokenData.brique } },
        ],
      },
      limit: 1,
    })

    // Modération
    const modResult = moderateReview(commentaire, note)

    if (existing.docs.length > 0) {
      // Mise à jour de l'avis existant
      await payload.update({
        collection: 'reviews',
        id: existing.docs[0].id as string,
        data: {
          note,
          commentaire: modResult.sanitizedComment || commentaire?.trim()?.slice(0, 500) || '',
          prenom: prenom.trim().slice(0, 50),
          ville: ville?.trim()?.slice(0, 50),
          montantRecupere: montantRecupere ? Number(montantRecupere) : undefined,
          hasRecovered: hasRecovered || 'pending',
          status: modResult.status,
          publishedAt: modResult.status === 'published' ? new Date().toISOString() : undefined,
        },
      })
      return NextResponse.json({ success: true, updated: true })
    }

    // Création
    await payload.create({
      collection: 'reviews',
      data: {
        email: tokenData.email,
        diagnosticId: tokenData.diagnosticId,
        brique: tokenData.brique,
        note,
        commentaire: modResult.sanitizedComment || commentaire?.trim()?.slice(0, 500) || '',
        prenom: prenom.trim().slice(0, 50),
        ville: ville?.trim()?.slice(0, 50),
        montantRecupere: montantRecupere ? Number(montantRecupere) : undefined,
        hasRecovered: hasRecovered || 'pending',
        status: modResult.status,
        isVerified: true,
        source: tokenData.source,
        publishedAt: modResult.status === 'published' ? new Date().toISOString() : undefined,
      },
    })

    // Notification admin si note basse
    if (note <= 2 && commentaire) {
      sendEmail({
        to: 'contact@recupeo.fr',
        subject: `[ALERTE] Avis négatif ${note}/5 — ${tokenData.brique}`,
        htmlContent: `<p>Avis ${note}/5 de ${prenom} sur ${tokenData.brique}.</p><p>"${commentaire?.slice(0, 200)}"</p>`,
        tags: ['review', 'alert'],
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[REVIEWS] Erreur submit:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
