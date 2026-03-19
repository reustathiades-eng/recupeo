// ============================================================
// RÉCUPÉO — Magic Link Auth
// ============================================================
// Génération et vérification des magic links (zéro mot de passe)
// Token : 32 bytes random, hashé SHA256 en base, expire 15 min
// Rate limit : 5 magic links / email / heure
// ============================================================

import { randomBytes, createHash } from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendEmail } from '@/lib/email'

const MAGIC_LINK_EXPIRY_MINUTES = 15
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 heure

// Rate limiter en mémoire (suffisant pour un seul serveur)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(email)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

/**
 * Hash un token en SHA256 (on stocke le hash, on envoie le token brut)
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Génère et envoie un magic link par email.
 * Crée le user s'il n'existe pas (inscription automatique).
 */
export async function sendMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim()

  // Rate limit
  if (!checkRateLimit(normalizedEmail)) {
    return { success: false, error: 'Trop de tentatives. Réessayez dans quelques minutes.' }
  }

  try {
    const payload = await getPayload({ config })

    // Chercher ou créer l'utilisateur
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: normalizedEmail } },
      limit: 1,
    })

    let userId: string

    if (existing.docs.length > 0) {
      userId = existing.docs[0].id as string
    } else {
      // Création automatique — Payload auth nécessite un password
      // On génère un password aléatoire (jamais utilisé, magic link only)
      const randomPassword = randomBytes(32).toString('hex')
      const newUser = await payload.create({
        collection: 'users',
        data: {
          email: normalizedEmail,
          password: randomPassword,
        },
      })
      userId = newUser.id as string
      console.log(`[AUTH] Nouveau compte créé pour ${normalizedEmail}`)
    }

    // Générer le token
    const rawToken = randomBytes(32).toString('hex')
    const hashedToken = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000)

    // Stocker le hash + expiry sur le user
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        magicLinkToken: hashedToken,
        magicLinkExpiry: expiresAt.toISOString(),
      },
    })

    // Construire le lien
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://recupeo.fr'
    const magicLink = `${baseUrl}/api/auth/verify?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`

    // Envoyer l'email
    const sent = await sendEmail({
      to: normalizedEmail,
      subject: 'RÉCUPÉO — Votre lien de connexion',
      htmlContent: buildMagicLinkEmail(magicLink),
      tags: ['auth', 'magic-link'],
    })

    if (!sent) {
      return { success: false, error: "Erreur lors de l'envoi de l'email. Réessayez." }
    }

    console.log(`[AUTH] Magic link envoyé à ${normalizedEmail}`)
    return { success: true }
  } catch (err) {
    console.error('[AUTH] Erreur magic link:', err)
    return { success: false, error: 'Erreur serveur. Réessayez.' }
  }
}

/**
 * Vérifie un magic link token. Retourne le userId si valide.
 */
export async function verifyMagicLink(
  email: string,
  rawToken: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim()
  const hashedToken = hashToken(rawToken)

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'users',
      where: {
        email: { equals: normalizedEmail },
        magicLinkToken: { equals: hashedToken },
      },
      limit: 1,
    })

    if (result.docs.length === 0) {
      return { success: false, error: 'Lien invalide ou expiré.' }
    }

    const user = result.docs[0] as {
      id: string
      magicLinkExpiry?: string
    }

    // Vérifier expiration
    if (user.magicLinkExpiry && new Date(user.magicLinkExpiry) < new Date()) {
      return { success: false, error: 'Lien expiré. Demandez un nouveau lien.' }
    }

    // Invalider le token (usage unique)
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        magicLinkToken: '',
        magicLinkExpiry: '',
        lastLoginAt: new Date().toISOString(),
      },
    })

    console.log(`[AUTH] Connexion réussie pour ${normalizedEmail}`)
    return { success: true, userId: user.id }
  } catch (err) {
    console.error('[AUTH] Erreur vérification magic link:', err)
    return { success: false, error: 'Erreur serveur.' }
  }
}

// ─── Template email magic link ───

function buildMagicLinkEmail(magicLink: string): string {
  return `
<div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;max-width:580px;margin:0 auto;background:#ffffff;">
  <div style="background:#0B1426;padding:24px 32px;text-align:center;">
    <span style="color:#00D68F;font-size:22px;font-weight:800;letter-spacing:-0.5px;">RÉCUPÉO</span>
    <span style="color:rgba(255,255,255,0.4);font-size:12px;margin-left:8px;">recupeo.fr</span>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#0B1426;font-size:20px;margin:0 0 16px;">Votre lien de connexion</h2>
    <p style="color:#1E293B;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Cliquez sur le bouton ci-dessous pour accéder à votre espace RÉCUPÉO. Ce lien est valable 15 minutes.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${magicLink}" style="background:#00D68F;color:#0B1426;font-weight:700;font-size:16px;padding:14px 32px;border-radius:10px;text-decoration:none;display:inline-block;">
        Me connecter →
      </a>
    </div>
    <p style="color:#64748B;font-size:13px;line-height:1.5;margin:24px 0 0;">
      Si vous n'avez pas demandé ce lien, ignorez simplement cet email.<br/>
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
      <span style="color:#00D68F;word-break:break-all;font-size:12px;">${magicLink}</span>
    </p>
  </div>
  <div style="margin-top:16px;padding:20px 32px;background:#F7F9FC;border-top:1px solid #E2E8F0;text-align:center;font-size:11px;color:#64748B;">
    <p style="margin:0;">RÉCUPÉO — L'IA qui récupère ce qu'on vous doit</p>
    <p style="margin:4px 0 0;">Données traitées conformément au RGPD · <a href="https://recupeo.fr" style="color:#00D68F;">recupeo.fr</a></p>
  </div>
</div>`
}
