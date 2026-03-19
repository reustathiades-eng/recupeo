// ============================================================
// RETRAITIA — Scheduler email/SMS
// ============================================================
// Appelé par le cron horaire. Vérifie les séquences actives,
// calcule les étapes à envoyer, applique les conditions.
// ============================================================

import { getPayload } from 'payload'
import config from '@payload-config'
import { sendEmail } from '@/lib/email'
import { sendSMS } from './sms'
import { canSendEmail, daysSinceTrigger, adaptTonReversion } from './conditions'
import { ALL_SEQUENCES } from './sequences'
import type { SequenceId, EmailVars, EmailLog, EmailSequenceState } from './types'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://recupeo.fr'

/**
 * Exécute un cycle du scheduler.
 * Parcourt tous les dossiers avec des séquences actives
 * et envoie les emails/SMS dont le timing est atteint.
 */
export async function runScheduler(): Promise<{ sent: number; skipped: number; errors: number }> {
  const payload = await getPayload({ config })
  const stats = { sent: 0, skipped: 0, errors: 0 }
  const now = new Date()

  // Récupérer tous les dossiers avec des séquences email actives
  const { docs: dossiers } = await payload.find({
    collection: 'retraitia-dossiers' as any,
    where: {
      emailSequences: { exists: true },
      unsubscribed: { not_equals: true },
    },
    limit: 500,
    depth: 0,
  })

  for (const dossier of dossiers) {
    const did = String(dossier.id)
    const state = dossier.emailSequences as EmailSequenceState | null
    if (!state?.active) continue

    for (const [seqId, seqState] of Object.entries(state.active)) {
      if (seqState.completedAt) continue // Séquence terminée

      const sequence = ALL_SEQUENCES[seqId as SequenceId]
      if (!sequence) continue

      const days = daysSinceTrigger(state, seqId as SequenceId, now)

      // Trouver la prochaine étape à envoyer
      const nextStep = sequence.steps.find(s =>
        s.etape > seqState.lastStepSent && s.delayDays <= days
      )
      if (!nextStep) continue

      // Construire les variables
      const vars = buildVarsFromDossier(dossier)

      // Vérifier la condition spécifique de l'étape
      if (nextStep.condition && !nextStep.condition(vars)) {
        stats.skipped++
        continue
      }

      // Envoyer l'email
      if (nextStep.channel === 'email' || nextStep.channel === 'email+sms') {
        const check = canSendEmail(
          {
            dossierId: String(dossier.id),
            status: dossier.status as string,
            pack9Paid: !!dossier.pack9Paid,
            pack49Paid: !!dossier.pack49Paid,
            franceConnectVerified: !!dossier.franceConnectVerified,
            unsubscribed: !!dossier.unsubscribed,
            parcours: (dossier.parcours as any) || 'retraite',
            emailSequences: state,
            documents: (dossier.documents as any) || [],
            nbAnomalies: (dossier.nbAnomalies as number) || 0,
          },
          seqId as SequenceId,
          nextStep.etape,
          'email',
          now
        )

        if (!check.canSend) {
          console.log(`[SCHEDULER] Skip ${seqId}-E${nextStep.etape} pour ${did}: ${check.reason}`)
          stats.skipped++
          // Si c'est une condition d'arrêt → marquer la séquence terminée
          if (check.reason?.startsWith(`Condition d'arrêt`)) {
            await markSequenceCompleted(payload, did, state, seqId, check.reason)
          }
          continue
        }

        let subject = nextStep.subject(vars)
        let html = nextStep.htmlContent(vars)

        // Adapter le ton pour la réversion
        if (vars.parcours === 'reversion' && sequence.hasReversionVariant) {
          const adapted = adaptTonReversion(subject, html)
          subject = adapted.subject
          html = adapted.body
        }

        const sent = await sendEmail({
          to: vars.email,
          toName: `${vars.prenom} ${vars.nom || ''}`.trim(),
          subject,
          htmlContent: html,
          tags: ['retraitia', seqId.toLowerCase(), `e${nextStep.etape}`],
        })

        const log: EmailLog = {
          sequence: seqId as SequenceId,
          etape: nextStep.etape,
          channel: 'email',
          sentAt: now.toISOString(),
          subject,
          to: vars.email,
          success: sent,
        }

        if (sent) {
          stats.sent++
        } else {
          stats.errors++
          log.error = 'Brevo send failed'
        }

        // Mettre à jour l'état
        await updateSequenceState(payload, did, state, seqId, nextStep.etape, log, sequence.steps.length)
      }

      // Envoyer le SMS
      if ((nextStep.channel === 'sms' || nextStep.channel === 'email+sms') && nextStep.smsContent) {
        const smsCheck = canSendEmail(
          {
            dossierId: String(dossier.id),
            status: dossier.status as string,
            pack9Paid: !!dossier.pack9Paid,
            pack49Paid: !!dossier.pack49Paid,
            franceConnectVerified: !!dossier.franceConnectVerified,
            unsubscribed: !!dossier.unsubscribed,
            parcours: (dossier.parcours as any) || 'retraite',
            emailSequences: state,
            documents: (dossier.documents as any) || [],
          },
          seqId as SequenceId,
          nextStep.etape,
          'sms',
          now
        )

        if (smsCheck.canSend && vars.telephone) {
          const smsContent = nextStep.smsContent(vars)
          const smsSent = await sendSMS({
            to: vars.telephone,
            content: smsContent,
            tag: `retraitia-${seqId.toLowerCase()}`,
          })

          const smsLog: EmailLog = {
            sequence: seqId as SequenceId,
            etape: nextStep.etape,
            channel: 'sms',
            sentAt: now.toISOString(),
            to: vars.telephone,
            success: smsSent,
          }

          // Ajouter au log
          state.logs = [...(state.logs || []), smsLog]
          if (smsSent) stats.sent++
          else stats.errors++
        }
      }
    }
  }

  console.log(`[SCHEDULER] Cycle terminé: ${stats.sent} envoyés, ${stats.skipped} skippés, ${stats.errors} erreurs`)
  return stats
}

/**
 * Déclenche une séquence pour un dossier.
 */
export async function triggerSequence(
  dossierId: string,
  sequenceId: SequenceId,
  vars?: Partial<EmailVars>
): Promise<void> {
  const payload = await getPayload({ config })
  const dossier = await payload.findByID({
    collection: 'retraitia-dossiers' as any,
    id: dossierId,
    depth: 0,
  })

  if (!dossier) {
    console.error(`[SCHEDULER] Dossier ${dossierId} non trouvé`)
    return
  }

  const state: EmailSequenceState = (dossier.emailSequences as EmailSequenceState) || {
    active: {},
    logs: [],
    channelPreference: 'email_sms',
  }

  // Si la séquence est déjà active, ne pas la re-déclencher
  if (state.active[sequenceId] && !state.active[sequenceId].completedAt) {
    console.log(`[SCHEDULER] Séquence ${sequenceId} déjà active pour ${dossierId}`)
    return
  }

  state.active[sequenceId] = {
    triggeredAt: new Date().toISOString(),
    lastStepSent: 0,
  }

  await payload.update({
    collection: 'retraitia-dossiers' as any,
    id: dossierId,
    data: { emailSequences: state } as any,
  })

  console.log(`[SCHEDULER] Séquence ${sequenceId} déclenchée pour ${dossierId}`)

  // Pour les séquences immédiates (delayDays=0 pour E1), envoyer tout de suite
  const sequence = ALL_SEQUENCES[sequenceId]
  if (sequence?.steps[0]?.delayDays === 0) {
    const allVars = { ...buildVarsFromDossier(dossier), ...(vars || {}) }
    const step = sequence.steps[0]

    let subject = step.subject(allVars)
    let html = step.htmlContent(allVars)

    if (allVars.parcours === 'reversion' && sequence.hasReversionVariant) {
      const adapted = adaptTonReversion(subject, html)
      subject = adapted.subject
      html = adapted.body
    }

    const sent = await sendEmail({
      to: allVars.email,
      toName: `${allVars.prenom} ${allVars.nom || ''}`.trim(),
      subject,
      htmlContent: html,
      tags: ['retraitia', sequenceId.toLowerCase(), 'e1'],
    })

    const log: EmailLog = {
      sequence: sequenceId,
      etape: 1,
      channel: 'email',
      sentAt: new Date().toISOString(),
      subject,
      to: allVars.email,
      success: sent,
    }

    await updateSequenceState(payload, dossierId, state, sequenceId, 1, log, sequence.steps.length)

    // SMS immédiat si applicable
    if ((step.channel === 'sms' || step.channel === 'email+sms') && step.smsContent && allVars.telephone) {
      const smsSent = await sendSMS({
        to: allVars.telephone,
        content: step.smsContent(allVars),
        tag: `retraitia-${sequenceId.toLowerCase()}`,
      })
      state.logs = [...(state.logs || []), {
        sequence: sequenceId,
        etape: 1,
        channel: 'sms' as const,
        sentAt: new Date().toISOString(),
        to: allVars.telephone,
        success: smsSent,
      }]
    }
  }
}

/**
 * Stoppe une séquence pour un dossier.
 */
export async function stopSequence(
  dossierId: string,
  sequenceId: SequenceId,
  reason: string
): Promise<void> {
  const payload = await getPayload({ config })
  const dossier = await payload.findByID({
    collection: 'retraitia-dossiers' as any,
    id: dossierId,
    depth: 0,
  })
  if (!dossier) return

  const state: EmailSequenceState = (dossier.emailSequences as EmailSequenceState) || {
    active: {},
    logs: [],
    channelPreference: 'email_sms',
  }

  await markSequenceCompleted(payload, dossierId, state, sequenceId, reason)
}

// ─── Helpers internes ────────────────────────────────

async function updateSequenceState(
  payload: any,
  dossierId: string,
  state: EmailSequenceState,
  seqId: string,
  etape: number,
  log: EmailLog,
  totalSteps: number
): Promise<void> {
  state.active[seqId] = {
    ...state.active[seqId],
    lastStepSent: etape,
    ...(etape >= totalSteps ? { completedAt: new Date().toISOString() } : {}),
  }
  state.logs = [...(state.logs || []), log]

  await payload.update({
    collection: 'retraitia-dossiers' as any,
    id: dossierId,
    data: { emailSequences: state } as any,
  })
}

async function markSequenceCompleted(
  payload: any,
  dossierId: string,
  state: EmailSequenceState,
  seqId: string,
  reason: string
): Promise<void> {
  if (state.active[seqId]) {
    state.active[seqId].completedAt = new Date().toISOString()
    state.active[seqId].stoppedReason = reason
  }

  await payload.update({
    collection: 'retraitia-dossiers' as any,
    id: dossierId,
    data: { emailSequences: state } as any,
  })
}

function buildVarsFromDossier(dossier: any): EmailVars {
  const formulaire = dossier.formulaire || {}
  const identite = formulaire.identite || {}
  const diagnostic = dossier.diagnostic || {}
  const topAnomalies = (diagnostic.anomalies || [])
    .slice(0, 3)
    .map((a: any) => ({
      label: a.label || a.id || '—',
      impact: a.impact?.mensuel?.max || 0,
      organisme: a.organisme || '—',
    }))

  return {
    prenom: identite.prenom || dossier.clientName?.split(' ')[0] || 'Client',
    nom: identite.nom || '',
    email: dossier.userEmail || '',
    telephone: identite.telephone || undefined,
    parcours: dossier.parcours || 'retraite',
    dossierId: String(dossier.id),
    lienEspaceClient: `${BASE_URL}/mon-espace/retraitia`,
    lienPaiement9: `${BASE_URL}/api/retraitia/checkout?pack=dossier_9&id=${dossier.id}`,
    lienPaiement49: `${BASE_URL}/api/retraitia/checkout?pack=action_49&id=${dossier.id}`,
    lienDemarches: `${BASE_URL}/mon-espace/retraitia/demarches`,
    lienRapportPdf: dossier.rapport?.pdfUrl || undefined,
    lienTestFlash: `${BASE_URL}/retraitia/test`,
    lienGuideFC: `${BASE_URL}/mon-espace/retraitia/documents#franceconnect`,
    lienGuideMdpAmeli: `${BASE_URL}/mon-espace/retraitia/documents#ameli-mdp`,
    lienGuideMdpImpots: `${BASE_URL}/mon-espace/retraitia/documents#impots-mdp`,
    lienGuideRIS: `${BASE_URL}/mon-espace/retraitia/documents#ris`,

    // Diagnostic
    nbAnomalies: dossier.nbAnomalies || 0,
    scoreGlobal: dossier.scoreGlobal || undefined,
    impactMin: dossier.impactMensuelMin || 0,
    impactMax: dossier.impactMensuelMax || 0,
    precisionAudit: dossier.precisionAudit || 40,
    topAnomalies,

    // Pricing
    prixPackAction: dossier.pack9Paid ? 40 : 49,
    montantDeduit: dossier.pack9Paid ? 9 : 0,
    prixNet: dossier.pack9Paid ? 40 : 49,

    // Documents
    nbDocsManquants: countMissingDocs(dossier.documents),
    risUploade: isDocUploaded(dossier.documents, 'ris'),
  }
}

function countMissingDocs(docs: any): number {
  if (!Array.isArray(docs)) return 0
  return docs.filter((d: any) => d.obligatoire && d.status !== 'uploaded' && d.status !== 'extracted').length
}

function isDocUploaded(docs: any, type: string): boolean {
  if (!Array.isArray(docs)) return false
  return docs.some((d: any) => d.type === type && (d.status === 'uploaded' || d.status === 'extracted'))
}
