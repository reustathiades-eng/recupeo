// ============================================================
// RÉCUPÉO — Middleware Edge
// ============================================================
// Protège /mon-espace/* — redirige vers /connexion si pas de session
// Utilise jose (Edge-compatible) pour vérifier le JWT
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'recupeo_session'
const PROTECTED_PREFIX = '/mon-espace'
const LOGIN_PAGE = '/connexion'

function getSecret(): Uint8Array {
  const secret = process.env.PAYLOAD_SECRET || 'CHANGE-ME'
  return new TextEncoder().encode(secret)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Seules les routes /mon-espace/* sont protégées
  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    const loginUrl = new URL(LOGIN_PAGE, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    await jwtVerify(token, getSecret())
    return NextResponse.next()
  } catch {
    // Token invalide ou expiré — rediriger vers connexion
    const loginUrl = new URL(LOGIN_PAGE, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    loginUrl.searchParams.set('error', 'session_expired')
    const response = NextResponse.redirect(loginUrl)
    // Supprimer le cookie invalide
    response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
    return response
  }
}

export const config = {
  matcher: ['/mon-espace/:path*'],
}
