// ============================================================
// RETRAITIA V2 — Envoi LRAR via API (AR24 / Maileva)
// ============================================================
// Abstraction d'envoi de courrier recommandé avec AR.
// V1 : stub AR24. L'intégration réelle sera branchée quand
// le compte AR24 sera configuré.
// ============================================================

import type { AnomalyId } from '../types'

export interface LRARRequest {
  dossierId: string
  anomalyId: AnomalyId
  destinataire: {
    nom: string
    adresse: string
    codePostal: string
    ville: string
  }
  expediteur: {
    nom: string
    adresse: string
    codePostal: string
    ville: string
  }
  /** PDF du courrier en base64 */
  pdfBase64: string
  /** Pièces jointes optionnelles */
  piecesJointes?: Array<{ nom: string; base64: string }>
}

export interface LRARResult {
  success: boolean
  trackingId?: string
  provider: 'ar24' | 'maileva' | 'stub'
  sentAt?: string
  error?: string
  estimatedDelivery?: string
}

export interface LRARTracking {
  trackingId: string
  status: 'sent' | 'in_transit' | 'delivered' | 'returned' | 'unknown'
  sentAt: string
  deliveredAt?: string
  arReceivedAt?: string
  arPdfUrl?: string
}

/**
 * Envoie un courrier recommandé via l'API AR24.
 * En mode stub si AR24_API_KEY n'est pas configuré.
 */
export async function envoyerLRAR(request: LRARRequest): Promise<LRARResult> {
  const apiKey = process.env.AR24_API_KEY

  if (!apiKey) {
    console.warn('[LRAR] AR24_API_KEY non configurée — mode stub')
    return {
      success: true,
      trackingId: `STUB_${Date.now()}`,
      provider: 'stub',
      sentAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  try {
    // ── API AR24 — Envoi LRE (Lettre Recommandée Électronique) ──
    const res = await fetch('https://api.ar24.fr/v2/letter', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'lre',
        sender: {
          name: request.expediteur.nom,
          address: request.expediteur.adresse,
          zip: request.expediteur.codePostal,
          city: request.expediteur.ville,
          country: 'FR',
        },
        recipient: {
          name: request.destinataire.nom,
          address: request.destinataire.adresse,
          zip: request.destinataire.codePostal,
          city: request.destinataire.ville,
          country: 'FR',
        },
        content: request.pdfBase64,
        attachments: request.piecesJointes?.map(p => ({
          name: p.nom,
          content: p.base64,
        })),
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[LRAR] Erreur AR24:', res.status, err)
      return { success: false, provider: 'ar24', error: `AR24 ${res.status}: ${err}` }
    }

    const data = await res.json()
    return {
      success: true,
      trackingId: data.id || data.tracking_id,
      provider: 'ar24',
      sentAt: new Date().toISOString(),
      estimatedDelivery: data.estimated_delivery,
    }
  } catch (err) {
    console.error('[LRAR] Erreur envoi:', err)
    return { success: false, provider: 'ar24', error: err instanceof Error ? err.message : 'Erreur réseau' }
  }
}

/**
 * Vérifie le statut de livraison d'un LRAR.
 */
export async function suivreLRAR(trackingId: string): Promise<LRARTracking> {
  const apiKey = process.env.AR24_API_KEY

  if (!apiKey || trackingId.startsWith('STUB_')) {
    return {
      trackingId,
      status: 'sent',
      sentAt: new Date().toISOString(),
    }
  }

  try {
    const res = await fetch(`https://api.ar24.fr/v2/letter/${trackingId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    const data = await res.json()

    const statusMap: Record<string, LRARTracking['status']> = {
      sent: 'sent',
      in_delivery: 'in_transit',
      delivered: 'delivered',
      returned: 'returned',
    }

    return {
      trackingId,
      status: statusMap[data.status] || 'unknown',
      sentAt: data.sent_at || new Date().toISOString(),
      deliveredAt: data.delivered_at,
      arReceivedAt: data.ar_received_at,
      arPdfUrl: data.ar_pdf_url,
    }
  } catch {
    return { trackingId, status: 'unknown', sentAt: '' }
  }
}
