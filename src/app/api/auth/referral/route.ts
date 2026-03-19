// ============================================================
// GET /api/auth/referral — Retourne les infos parrainage
// ============================================================
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getPayload } from 'payload'
import config from '@payload-config'
import { randomBytes } from 'crypto'

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(6)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return `RCP-${code}`
}

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const fullUser = await payload.findByID({ collection: 'users', id: user.id })
    const userData = fullUser as { referralCode?: string; referralCredits?: number }

    // Générer un code parrain si absent
    let referralCode = userData.referralCode
    if (!referralCode) {
      referralCode = generateReferralCode()
      await payload.update({
        collection: 'users',
        id: user.id,
        data: { referralCode },
      })
    }

    return NextResponse.json({
      referralCode,
      referralCredits: userData.referralCredits || 0,
      referralsCount: 0, // TODO: compter dans collection Referrals quand elle existera
    })
  } catch (err) {
    console.error('[REFERRAL] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
