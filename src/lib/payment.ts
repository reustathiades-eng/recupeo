// ============================================================
// RÉCUPÉO — Client Stripe (Checkout Sessions)
// ============================================================
// Utilise Stripe Checkout hébergé : l'utilisateur est redirigé
// vers la page Stripe puis revient sur notre site.
// Doc: https://docs.stripe.com/checkout/quickstart
// ============================================================
import Stripe from 'stripe'

// ─── Singleton Stripe ───

let _stripe: Stripe | null = null

function getStripe(): Stripe | null {
  if (_stripe) return _stripe
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    console.warn('[PAYMENT] STRIPE_SECRET_KEY non configurée')
    return null
  }
  _stripe = new Stripe(secretKey)
  return _stripe
}

// ─── Types ───

export interface CreateCheckoutOptions {
  /** Nom du produit affiché sur Stripe */
  productName: string
  /** Description courte */
  productDescription: string
  /** Montant en centimes (ex: 4900 pour 49€) */
  amount: number
  /** Email du client (pré-rempli sur Stripe) */
  email: string
  /** Slug de la brique (mataxe, macaution, retraitia, monloyer) */
  brique: string
  /** ID du diagnostic en base */
  diagnosticId: string
  /** Plan choisi (rapport, rapport_courriers, solo, couple, etc.) */
  plan: string
  /** URL de retour succès */
  successUrl: string
  /** URL de retour annulation */
  cancelUrl: string
}

// ─── Créer une session Checkout ───

export async function createCheckoutSession(options: CreateCheckoutOptions): Promise<{
  success: true
  sessionId: string
  checkoutUrl: string
} | {
  success: false
  error: string
}> {
  const stripe = getStripe()
  if (!stripe) {
    return { success: false, error: 'Service de paiement non configuré' }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      ...(options.email ? { customer_email: options.email } : {}),
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: options.amount,
            product_data: {
              name: options.productName,
              description: options.productDescription,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        brique: options.brique,
        diagnosticId: options.diagnosticId,
        plan: options.plan,
      },
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
    })

    if (!session.url) {
      return { success: false, error: 'Impossible de créer la session de paiement' }
    }

    return {
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
    }
  } catch (error) {
    console.error('[PAYMENT] Erreur Stripe:', error instanceof Error ? error.message : error)
    return { success: false, error: 'Erreur lors de la création du paiement' }
  }
}

// ─── Vérifier une session ───

export async function verifyCheckoutSession(sessionId: string): Promise<{
  paid: boolean
  diagnosticId?: string
  brique?: string
  plan?: string
  email?: string
}> {
  const stripe = getStripe()
  if (!stripe) return { paid: false }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return {
      paid: session.payment_status === 'paid',
      diagnosticId: session.metadata?.diagnosticId,
      brique: session.metadata?.brique,
      plan: session.metadata?.plan,
      email: session.customer_email || undefined,
    }
  } catch {
    return { paid: false }
  }
}

// ─── Construire un événement webhook ───

export function constructWebhookEvent(body: string | Buffer, signature: string): Stripe.Event | null {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !webhookSecret) return null

  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[PAYMENT] Webhook signature invalide:', err instanceof Error ? err.message : err)
    return null
  }
}

// ─── Catalogue des offres ───

export const OFFERS = {
  mataxe: {
    rapport: {
      id: 'rapport',
      label: 'Rapport complet MATAXE',
      description: 'Audit taxe foncière + réclamation fiscale prête à envoyer',
      amount: 4900,
      display: '49€',
    },
  },
  macaution: {
    rapport: {
      id: 'rapport',
      label: 'Rapport complet',
      description: 'Analyse détaillée des anomalies sur votre dépôt de garantie',
      amount: 2900,
      display: '29€',
    },
    rapport_courriers: {
      id: 'rapport_courriers',
      label: 'Rapport + Pack courriers',
      description: 'Rapport complet + 3 courriers de réclamation personnalisés',
      amount: 4900,
      display: '49€',
    },
  },
  retraitia: {
    dossier_9: {
      id: 'dossier_9',
      label: 'Pack Dossier',
      description: 'Espace personnel + guides FranceConnect + diagnostic personnalisé',
      amount: 900,
      display: '9€',
    },
    action_49: {
      id: 'action_49',
      label: 'Pack Action',
      description: 'Rapport détaillé + messages pré-rédigés + suivi des démarches + 1er courrier recommandé',
      amount: 4900,
      display: '49€',
    },
    action_40: {
      id: 'action_40',
      label: 'Pack Action (9€ déduits)',
      description: 'Rapport détaillé + messages + suivi + courrier — 9€ déjà payés déduits',
      amount: 4000,
      display: '40€',
    },
    couple_79: {
      id: 'couple_79',
      label: 'Pack Couple',
      description: '2 rapports complets + 2 jeux de messages',
      amount: 7900,
      display: '79€',
    },
    preretraite_39: {
      id: 'preretraite_39',
      label: 'Pack Pré-retraité',
      description: 'Simulation multi-scénarios + rachat trimestres + rapport',
      amount: 3900,
      display: '39€',
    },
    lrar_15: {
      id: 'lrar_15',
      label: 'Courrier recommandé',
      description: 'Envoi LRAR avec accusé de réception',
      amount: 1490,
      display: '14,90€',
    },
    tribunal_29: {
      id: 'tribunal_29',
      label: 'Pack Tribunal',
      description: 'Export ZIP complet : documents + courriers + chronologie',
      amount: 2900,
      display: '29€',
    },
  },
  monloyer: {
    courriers: {
      id: 'courriers',
      label: 'Pack courriers loyer',
      description: '3 courriers de réclamation personnalisés (mise en demeure, CDC, préfecture)',
      amount: 2900,
      display: '29€',
    },
  },
  mapension: {
    rapport: {
      id: 'rapport',
      label: 'Rapport pension alimentaire',
      description: 'Calcul de revalorisation + courrier de demande',
      amount: 2900,
      display: '29€',
    },
    rapport_courriers: {
      id: 'rapport_courriers',
      label: 'Rapport + Pack courriers',
      description: 'Rapport complet + courriers (ex-conjoint, CAF, avocat)',
      amount: 4900,
      display: '49€',
    },
  },
  mabanque: {
    rapport: {
      id: 'rapport',
      label: 'Rapport frais bancaires',
      description: 'Audit complet de vos frais + courrier de réclamation',
      amount: 1900,
      display: '19€',
    },
    rapport_courriers: {
      id: 'rapport_courriers',
      label: 'Rapport + Pack courriers',
      description: 'Rapport complet + courriers (banque, médiateur)',
      amount: 2900,
      display: '29€',
    },
  },
  monchomage: {
    rapport: {
      id: 'rapport',
      label: 'Rapport allocations chômage',
      description: 'Audit complet de vos allocations + courrier France Travail',
      amount: 6900,
      display: '69€',
    },
    rapport_courriers: {
      id: 'rapport_courriers',
      label: 'Rapport + Pack courriers complet',
      description: 'Rapport complet + courriers (France Travail, médiateur, tribunal)',
      amount: 12900,
      display: '129€',
    },
  },
  monimpot: {
    monimpot_express: {
      id: 'monimpot_express',
      label: 'Audit Express',
      description: 'Toutes les optimisations + montants + cases fiscales + PDF',
      amount: 1900,
      display: '19€',
    },
    monimpot_standard: {
      id: 'monimpot_standard',
      label: 'Audit Standard',
      description: 'Audit complet + réclamation pré-remplie + guide correction impots.gouv.fr',
      amount: 3900,
      display: '39€',
    },
    monimpot_premium: {
      id: 'monimpot_premium',
      label: 'Audit Premium',
      description: 'Audit 3 ans + réclamation + guide + accompagnement email 30 jours',
      amount: 6900,
      display: '69€',
    },
  },
  mapaie: {
    mapaie_audit_3m: {
      id: 'mapaie_audit_3m',
      label: 'Audit 3 mois',
      description: 'Audit bulletins de paie 3 mois + détection anomalies + rapport',
      amount: 4900,
      display: '49€',
    },
    mapaie_audit_12m: {
      id: 'mapaie_audit_12m',
      label: 'Audit 12 mois + Réclamation',
      description: 'Audit complet 12 mois + rapport détaillé + LRAR employeur + saisine CPH',
      amount: 12900,
      display: '129€',
    },
  },
} as const

export type Brique = keyof typeof OFFERS
