// ============================================================
// POST /api/auth/magic-link
// Envoie un magic link par email pour se connecter
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { sendMagicLink } from '@/lib/auth/magic-link'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email requis.' },
        { status: 400 }
      )
    }

    // Validation basique email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email invalide.' },
        { status: 400 }
      )
    }

    const result = await sendMagicLink(email)

    if (!result.success) {
      // On log l'erreur mais on renvoie un message générique (sécurité)
      console.warn('[AUTH] Magic link échoué:', result.error)
    }

    // Toujours succès côté client pour ne pas révéler si l'email existe
    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cet email, un lien de connexion a été envoyé.',
    })
  } catch (err) {
    console.error('[AUTH] Erreur /api/auth/magic-link:', err)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur.' },
      { status: 500 }
    )
  }
}
