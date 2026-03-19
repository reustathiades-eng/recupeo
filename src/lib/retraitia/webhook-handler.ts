// ============================================================
// RETRAITIA V2 — Webhook handler (paiement Stripe)
// ============================================================
// Appelé par le webhook Stripe quand un paiement RETRAITIA est confirmé.
// Crée/met à jour le dossier dans retraitia-dossiers.
// ============================================================

import { getPayload } from 'payload'
import config from '@payload-config'
import { sendEmail } from '@/lib/email'

interface PaymentEvent {
  plan: string
  email: string
  diagnosticId: string
  stripeSessionId: string
}

export async function handleRetraitiaPayment(event: PaymentEvent) {
  const payload = await getPayload({ config })
  const { plan, email, diagnosticId, stripeSessionId } = event
  const normalizedEmail = email.toLowerCase().trim()

  console.log(`[RETRAITIA] Traitement paiement ${plan} pour ${normalizedEmail}`)

  // ─── Pack Dossier 9€ : créer le dossier ───
  if (plan === 'dossier_9') {
    // Vérifier si un dossier existe déjà pour cet email
    const existing = await payload.find({
      collection: 'retraitia-dossiers',
      where: { userEmail: { equals: normalizedEmail } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      // Dossier existant — juste marquer comme payé
      const dossier = existing.docs[0]
      await payload.update({
        collection: 'retraitia-dossiers',
        id: dossier.id,
        data: {
          pack9Paid: true,
          pack9PaidAt: new Date().toISOString(),
          stripeCustomerId: stripeSessionId,
          paiements: [
            ...((dossier as any).paiements || []),
            { pack: 'dossier_9', amount: 900, stripeSessionId, paidAt: new Date().toISOString(), deducted9: false },
          ],
        },
      })
      console.log(`[RETRAITIA] Dossier existant ${dossier.id} mis à jour (9€)`)
    } else {
      // Créer le dossier
      const flashData = await getFlashData(payload, diagnosticId, normalizedEmail)

      const dossier = await payload.create({
        collection: 'retraitia-dossiers',
        data: {
          userEmail: normalizedEmail,
          parcours: flashData?.parcours || 'retraite',
          status: 'created',
          flashId: diagnosticId !== 'new' ? diagnosticId : undefined,
          pack9Paid: true,
          pack9PaidAt: new Date().toISOString(),
          stripeCustomerId: stripeSessionId,
          documents: buildInitialChecklist(flashData?.parcours || 'retraite'),
          paiements: [
            { pack: 'dossier_9', amount: 900, stripeSessionId, paidAt: new Date().toISOString(), deducted9: false },
          ],
        },
      })
      console.log(`[RETRAITIA] Nouveau dossier créé: ${dossier.id}`)

      // Marquer le flash comme converti
      if (diagnosticId && diagnosticId !== 'new') {
        try {
          await payload.update({
            collection: 'retraitia-flash',
            id: diagnosticId,
            data: {
              convertedToDossier: true,
              dossierId: dossier.id as string,
            },
          })
        } catch {
          // Flash ID invalide — pas grave
        }
      }
    }

    // Email bienvenue post-9€ (S2-E1)
    await sendBienvenueEmail(normalizedEmail)
  }

  // ─── Pack Action 49€ / 40€ : débloquer rapport + démarches ───
  if (plan === 'action_49' || plan === 'action_40') {
    const dossiers = await payload.find({
      collection: 'retraitia-dossiers',
      where: { userEmail: { equals: normalizedEmail } },
      limit: 1,
    })

    if (dossiers.docs.length > 0) {
      const dossier = dossiers.docs[0]
      const deducted9 = plan === 'action_40'
      await payload.update({
        collection: 'retraitia-dossiers',
        id: dossier.id,
        data: {
          pack49Paid: true,
          pack49PaidAt: new Date().toISOString(),
          status: (dossier as any).status === 'diagnostic_ready' ? 'report_paid' : (dossier as any).status,
          paiements: [
            ...((dossier as any).paiements || []),
            { pack: plan, amount: deducted9 ? 4000 : 4900, stripeSessionId, paidAt: new Date().toISOString(), deducted9 },
          ],
        },
      })
      console.log(`[RETRAITIA] Dossier ${dossier.id} mis à jour (49€)`)
    }
  }

  // ─── Pack Pré-retraité 39€ / 30€ ───
  if (plan === 'preretraite_39' || plan === 'preretraite_30') {
    const dossiers = await payload.find({
      collection: 'retraitia-dossiers',
      where: { userEmail: { equals: normalizedEmail } },
      limit: 1,
    })
    if (dossiers.docs.length > 0) {
      const dossier = dossiers.docs[0]
      const deducted9 = plan === 'preretraite_30'
      await payload.update({
        collection: 'retraitia-dossiers',
        id: dossier.id,
        data: {
          pack49Paid: true,
          pack49PaidAt: new Date().toISOString(),
          status: (dossier as any).status === 'diagnostic_ready' ? 'report_paid' : (dossier as any).status,
          paiements: [
            ...((dossier as any).paiements || []),
            { pack: plan, amount: deducted9 ? 3000 : 3900, stripeSessionId, paidAt: new Date().toISOString(), deducted9 },
          ],
        },
      })
      console.log(`[RETRAITIA] Dossier ${dossier.id} mis à jour (preretraite 39€)`)
    }
  }

  // ─── Pack Couple 79€ / 70€ : créer 2 dossiers liés ───
  if (plan === 'couple_79' || plan === 'couple_70') {
    const coupleId = `couple_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const deducted9 = plan === 'couple_70'
    const flashData = await getFlashData(payload, diagnosticId, normalizedEmail)
    const parcours = flashData?.parcours || 'retraite'

    // Dossier 1 (client principal)
    const existing = await payload.find({
      collection: 'retraitia-dossiers',
      where: { userEmail: { equals: normalizedEmail } },
      limit: 1,
    })

    let dossier1Id: string
    if (existing.docs.length > 0) {
      // Mettre à jour le dossier existant
      const d = existing.docs[0]
      await payload.update({
        collection: 'retraitia-dossiers',
        id: d.id,
        data: {
          coupleId,
          couplePack: true,
          pack49Paid: true,
          pack49PaidAt: new Date().toISOString(),
          paiements: [
            ...((d as any).paiements || []),
            { pack: plan, amount: deducted9 ? 7000 : 7900, stripeSessionId, paidAt: new Date().toISOString(), deducted9 },
          ],
        },
      })
      dossier1Id = String(d.id)
    } else {
      const d1 = await payload.create({
        collection: 'retraitia-dossiers',
        data: {
          userEmail: normalizedEmail,
          parcours,
          status: 'created',
          flashId: diagnosticId !== 'new' ? diagnosticId : undefined,
          pack9Paid: true,
          pack9PaidAt: new Date().toISOString(),
          pack49Paid: true,
          pack49PaidAt: new Date().toISOString(),
          coupleId,
          couplePack: true,
          documents: buildInitialChecklist(parcours),
          paiements: [
            { pack: plan, amount: deducted9 ? 7000 : 7900, stripeSessionId, paidAt: new Date().toISOString(), deducted9 },
          ],
        },
      })
      dossier1Id = String(d1.id)
    }

    // Dossier 2 (conjoint) — vide, à remplir
    const d2 = await payload.create({
      collection: 'retraitia-dossiers',
      data: {
        userEmail: normalizedEmail,
        clientName: 'Conjoint (à renseigner)',
        parcours,
        status: 'created',
        coupleId,
        couplePack: true,
        pack9Paid: true,
        pack9PaidAt: new Date().toISOString(),
        pack49Paid: true,
        pack49PaidAt: new Date().toISOString(),
        documents: buildInitialChecklist(parcours),
        paiements: [],
      },
    })

    console.log(`[RETRAITIA] Pack couple créé: ${dossier1Id} + ${d2.id} (coupleId: ${coupleId})`)

    await sendBienvenueEmail(normalizedEmail)
  }
}

// ─── Helpers ───

async function getFlashData(payload: any, diagnosticId: string, email: string) {
  // Essayer de récupérer les données du flash
  if (diagnosticId && diagnosticId !== 'new') {
    try {
      const flash = await payload.findByID({ collection: 'retraitia-flash', id: diagnosticId })
      if (flash) {
        const statusMap: Record<string, string> = {
          retired: 'retraite',
          pre_retired: 'preretraite',
          surviving: 'reversion',
        }
        return { parcours: statusMap[(flash as any).status] || 'retraite' }
      }
    } catch {
      // Flash non trouvé
    }
  }

  // Fallback: chercher le dernier flash pour cet email
  const flashes = await payload.find({
    collection: 'retraitia-flash',
    where: { email: { equals: email } },
    sort: '-createdAt',
    limit: 1,
  })
  if (flashes.docs.length > 0) {
    const flash = flashes.docs[0] as any
    const statusMap: Record<string, string> = {
      retired: 'retraite',
      pre_retired: 'preretraite',
      surviving: 'reversion',
    }
    return { parcours: statusMap[flash.status] || 'retraite' }
  }

  return null
}

function buildInitialChecklist(parcours: string) {
  const base = [
    { type: 'ris', status: 'missing', obligatoire: true },
    { type: 'notification_cnav', status: 'missing', obligatoire: true },
    { type: 'releve_agirc_arrco', status: 'missing', obligatoire: true },
    { type: 'releve_mensualites', status: 'missing', obligatoire: false },
    { type: 'avis_imposition', status: 'missing', obligatoire: false },
    { type: 'attestation_fiscale', status: 'missing', obligatoire: false },
  ]

  if (parcours === 'preretraite') {
    base.push({ type: 'eig', status: 'missing', obligatoire: true })
  }

  return base
}

async function sendBienvenueEmail(email: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://recupeo.fr'
    await sendEmail({
      to: email,
      subject: 'Bienvenue sur RETRAITIA — Votre espace est prêt',
      htmlContent: `
        <h2 style="color:#0F172A;font-size:22px;">Bienvenue sur RETRAITIA</h2>
        <p style="color:#64748b;font-size:15px;">
          Votre espace personnel est prêt. Voici les prochaines étapes :
        </p>
        <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;">
          <p style="margin:8px 0;font-size:14px;"><strong>1.</strong> Connectez-vous à FranceConnect (Ameli, impots.gouv...)</p>
          <p style="margin:8px 0;font-size:14px;"><strong>2.</strong> Uploadez vos documents (RIS, notification de pension, relevé Agirc-Arrco)</p>
          <p style="margin:8px 0;font-size:14px;"><strong>3.</strong> Remplissez le formulaire complémentaire (5 minutes)</p>
          <p style="margin:8px 0;font-size:14px;"><strong>4.</strong> Votre diagnostic se génère automatiquement</p>
        </div>
        <p style="color:#64748b;font-size:14px;">
          Des guides pas-à-pas vous accompagnent pour chaque étape.
        </p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${baseUrl}/mon-espace/retraitia" style="display:inline-block;background:#00D68F;color:#060D1B;padding:16px 32px;border-radius:10px;font-weight:700;font-size:16px;text-decoration:none;">
            Accéder à mon espace
          </a>
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center;">
          Besoin d'aide ? Un proche peut accéder à votre dossier pour vous aider.
        </p>
      `,
      tags: ['retraitia', 'bienvenue-9'],
    })
  } catch (err) {
    console.error('[RETRAITIA] Email bienvenue non envoyé:', err)
  }
}
