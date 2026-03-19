// ============================================================
// RÉCUPÉO — Token pour avis vérifiés
// ============================================================
// Token JWT signé contenant l'email, la brique et le diagnosticId.
// Envoyé dans l'email J+2 / J+30 pour prouver que l'avis = achat réel.
// ============================================================

import { SignJWT, jwtVerify } from 'jose'

const TOKEN_EXPIRY = '60d' // 60 jours de validité

function getSecret(): Uint8Array {
  const secret = process.env.PAYLOAD_SECRET || 'CHANGE-ME'
  return new TextEncoder().encode(`review-${secret}`)
}

export interface ReviewTokenPayload {
  email: string
  brique: string
  diagnosticId: string
  source: 'email_j2' | 'email_j30' | 'in_app'
}

export async function generateReviewToken(data: ReviewTokenPayload): Promise<string> {
  return new SignJWT({ ...data } as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret())
}

export async function verifyReviewToken(token: string): Promise<ReviewTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const p = payload as unknown as ReviewTokenPayload
    if (!p.email || !p.brique || !p.diagnosticId) return null
    return p
  } catch {
    return null
  }
}
