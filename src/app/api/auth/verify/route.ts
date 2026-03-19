// ============================================================
// GET /api/auth/verify?token=xxx&email=xxx
// Vérifie le magic link, crée la session JWT, redirige
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { verifyMagicLink } from '@/lib/auth/magic-link'
import { createSession } from '@/lib/auth/session'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://recupeo.fr'

  if (!token || !email) {
    return NextResponse.redirect(`${baseUrl}/connexion?error=missing_params`)
  }

  try {
    const result = await verifyMagicLink(email, token)

    if (!result.success || !result.userId) {
      return NextResponse.redirect(`${baseUrl}/connexion?error=invalid_token`)
    }

    // Récupérer les infos user pour le JWT
    const payload = await getPayload({ config })
    const user = await payload.findByID({
      collection: 'users',
      id: result.userId,
    })

    // Rattacher les diagnostics existants (par email) à ce user
    try {
      const orphanDiags = await payload.find({
        collection: 'diagnostics',
        where: {
          and: [
            { userEmail: { equals: email.toLowerCase().trim() } },
            { user: { exists: false } },
          ],
        },
        limit: 100,
      })

      for (const diag of orphanDiags.docs) {
        await payload.update({
          collection: 'diagnostics',
          id: diag.id as string,
          data: { user: result.userId },
        })
      }

      if (orphanDiags.docs.length > 0) {
        console.log(`[AUTH] ${orphanDiags.docs.length} diagnostics rattachés à ${email}`)
      }
    } catch (rattachErr) {
      console.warn('[AUTH] Erreur rattachement diagnostics:', rattachErr)
      // Non bloquant
    }

    // Créer la session JWT (cookie httpOnly)
    await createSession({
      id: result.userId,
      email: (user.email as string) || email,
      firstName: (user.firstName as string) || undefined,
    })

    console.log(`[AUTH] Session créée pour ${email}`)

    // Rediriger vers le tableau de bord
    return NextResponse.redirect(`${baseUrl}/mon-espace/tableau-de-bord`)
  } catch (err) {
    console.error('[AUTH] Erreur /api/auth/verify:', err)
    return NextResponse.redirect(`${baseUrl}/connexion?error=server_error`)
  }
}
