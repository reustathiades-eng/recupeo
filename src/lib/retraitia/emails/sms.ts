// ============================================================
// RETRAITIA — Envoi SMS via Brevo
// ============================================================

const BREVO_SMS_URL = 'https://api.brevo.com/v3/transactionalSMS/sms'

/**
 * Envoie un SMS transactionnel via Brevo.
 * Le numéro doit être au format international (+33...).
 * Max 160 caractères.
 */
export async function sendSMS(options: {
  to: string
  content: string
  tag?: string
}): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.warn('[SMS] BREVO_API_KEY non configurée — SMS non envoyé')
    return false
  }

  // Formater le numéro FR si nécessaire
  let phone = options.to.replace(/\s+/g, '')
  if (phone.startsWith('0')) {
    phone = '+33' + phone.slice(1)
  }

  // Valider le format
  if (!/^\+\d{10,15}$/.test(phone)) {
    console.warn(`[SMS] Numéro invalide : ${phone}`)
    return false
  }

  // Tronquer à 160 caractères
  const content = options.content.slice(0, 160)

  try {
    const res = await fetch(BREVO_SMS_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        type: 'transactional',
        unicodeEnabled: true,
        sender: 'RECUPEO',
        recipient: phone,
        content,
        tag: options.tag || 'retraitia',
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[SMS] Erreur Brevo:', res.status, err)
      return false
    }

    console.log(`[SMS] Envoyé à ${phone}`)
    return true
  } catch (err) {
    console.error('[SMS] Erreur envoi:', err instanceof Error ? err.message : err)
    return false
  }
}
