// ============================================================
// RÉCUPÉO — Session Management (JWT httpOnly cookie)
// ============================================================
// Cookie JWT : httpOnly, secure, sameSite strict, 30 jours
// Utilise jose (Edge-compatible) — fonctionne dans middleware.ts
// ============================================================

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { SessionUser, JWTPayload } from './types'

const COOKIE_NAME = 'recupeo_session'
const JWT_EXPIRY = '30d'
const JWT_EXPIRY_SECONDS = 30 * 24 * 60 * 60 // 30 jours

function getSecret(): Uint8Array {
  const secret = process.env.PAYLOAD_SECRET || 'CHANGE-ME'
  return new TextEncoder().encode(secret)
}

/**
 * Crée un JWT et le stocke dans un cookie httpOnly.
 */
export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
  } as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: JWT_EXPIRY_SECONDS,
    path: '/',
  })

  return token
}

/**
 * Vérifie le JWT depuis le cookie. Retourne le user ou null.
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, getSecret())
    const jwt = payload as unknown as JWTPayload

    if (!jwt.sub || !jwt.email) return null

    return {
      id: jwt.sub,
      email: jwt.email,
      firstName: jwt.firstName,
    }
  } catch {
    return null
  }
}

/**
 * Vérifie un token JWT brut (pour le middleware Edge).
 * Ne dépend pas de cookies() — prend le token en paramètre.
 */
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const jwt = payload as unknown as JWTPayload
    if (!jwt.sub || !jwt.email) return null
    return { id: jwt.sub, email: jwt.email, firstName: jwt.firstName }
  } catch {
    return null
  }
}

/**
 * Supprime le cookie de session (logout).
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
}

/**
 * Nom du cookie (exporté pour le middleware).
 */
export const SESSION_COOKIE_NAME = COOKIE_NAME
