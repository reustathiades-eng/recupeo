// ============================================================
// POST /api/webhooks/stripe
// Reçoit les événements Stripe (paiement réussi, etc.)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { constructWebhookEvent } from '@/lib/payment'
import { sendEmail, buildReportReadyEmail, buildMonimpotReportEmail } from '@/lib/email'
import { handleRetraitiaPayment } from '@/lib/retraitia/webhook-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
    }

    const event = constructWebhookEvent(body, signature)
    if (!event) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
    }

    // Traiter uniquement les paiements réussis
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as {
        id: string
        payment_status: string
        customer_email: string | null
        metadata: Record<string, string> | null
      }

      if (session.payment_status === 'paid' && session.metadata) {
        const { diagnosticId, brique, plan } = session.metadata
        const email = session.customer_email

        console.log(`[PAYMENT] ✅ Paiement confirmé — ${brique}/${plan} — diagnostic ${diagnosticId}`)

        // ─── RETRAITIA : traitement spécifique ───
        if (brique === 'retraitia') {
          await handleRetraitiaPayment({
            plan: plan || '',
            email: email || '',
            diagnosticId: diagnosticId || '',
            stripeSessionId: session.id,
          })
          return NextResponse.json({ received: true })
        }

        // Mettre à jour le diagnostic en base
        let diagnosticData: Record<string, unknown> | null = null
        if (diagnosticId) {
          try {
            const payload = await getPayload({ config })
            const doc = await payload.update({
              collection: 'diagnostics',
              id: diagnosticId,
              data: {
                paid: true,
                status: 'paid',
                userEmail: email?.toLowerCase?.() || '',
                paidAt: new Date().toISOString(),
                stripeSessionId: session.id,
                plan: plan || undefined,
              },
            })
            diagnosticData = doc as unknown as Record<string, unknown>
            console.log(`[PAYMENT] Diagnostic ${diagnosticId} marqué comme payé`)
          } catch (dbErr) {
            console.error('[PAYMENT] Erreur mise à jour DB:', dbErr)
          }
        }

        // Envoyer l'email "rapport prêt"
        if (email && diagnosticId && brique) {
          const briqueNames: Record<string, string> = {
            mataxe: 'Taxe foncière',
            macaution: 'Caution',
            retraitia: 'Retraite',
            monloyer: 'Loyer',
            mapension: 'Pension alimentaire',
            mabanque: 'Frais bancaires',
            monchomage: 'Allocations chômage',
            monimpot: 'Déclaration revenus',
          }
          const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://recupeo.fr'
          const reportUrl = `${baseUrl}/${brique}/rapport?id=${diagnosticId}`

          try {
            let emailHtml: string

            // Email enrichi pour monimpot (avec résumé économie)
            if (brique === 'monimpot' && diagnosticData) {
              const aiAnalysis = diagnosticData.aiAnalysis as Record<string, unknown> | undefined
              const calc = aiAnalysis?.calc as Record<string, number> | undefined
              const optimisations = aiAnalysis?.optimisations as unknown[] | undefined

              emailHtml = buildMonimpotReportEmail({
                diagnosticId,
                reportUrl,
                economieAnnuelle: calc?.economieAnnuelle ?? 0,
                economie3ans: calc?.economie3ans ?? 0,
                nbOptimisations: optimisations?.length ?? 0,
                plan: plan || 'standard',
              })
            } else {
              emailHtml = buildReportReadyEmail({
                brique,
                briqueName: briqueNames[brique] || brique,
                diagnosticId,
                reportUrl,
              })
            }

            sendEmail({
              to: email,
              subject: `RÉCUPÉO — Votre rapport ${briqueNames[brique] || ''} est prêt`,
              htmlContent: emailHtml,
              tags: [brique, 'rapport-pret'],
            }).catch(e => console.warn('[PAYMENT] Email rapport non envoyé:', e))
          } catch {
            // Email non bloquant
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[WEBHOOK] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
