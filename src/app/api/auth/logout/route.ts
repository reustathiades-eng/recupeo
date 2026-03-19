// ============================================================
// POST /api/auth/logout
// Détruit la session (supprime le cookie JWT)
// ============================================================
import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth/session'

export async function POST() {
  try {
    await destroySession()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[AUTH] Erreur /api/auth/logout:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
