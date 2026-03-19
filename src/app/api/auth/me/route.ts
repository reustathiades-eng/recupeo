// ============================================================
// GET /api/auth/me
// Retourne l'utilisateur connecté (ou null)
// ============================================================
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null })
    }

    return NextResponse.json({ authenticated: true, user })
  } catch (err) {
    console.error('[AUTH] Erreur /api/auth/me:', err)
    return NextResponse.json({ authenticated: false, user: null })
  }
}
