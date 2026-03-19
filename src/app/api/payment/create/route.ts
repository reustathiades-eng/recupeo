// ============================================================
// POST /api/payment/create
// Crée une session Stripe Checkout et retourne l'URL
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createCheckoutSession, OFFERS, type Brique } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brique, plan, diagnosticId } = body
    let { email } = body

    // Validation
    if (!brique || !plan || !diagnosticId) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants (brique, plan, diagnosticId)' },
        { status: 400 }
      )
    }

    // Si pas d'email fourni, le récupérer depuis le diagnostic en base
    if (!email) {
      try {
        const payload = await getPayload({ config })
        const diagnostic = await payload.findByID({ collection: 'diagnostics', id: diagnosticId })
        if (diagnostic?.inputData && typeof diagnostic.inputData === 'object' && 'email' in diagnostic.inputData) {
          email = (diagnostic.inputData as { email?: string }).email
        }
      } catch {
        // Continue sans email — Stripe le demandera
      }
    }

    // Vérifier que la brique et le plan existent
    const briqueOffers = OFFERS[brique as Brique]
    if (!briqueOffers) {
      return NextResponse.json(
        { success: false, error: `Brique inconnue: ${brique}` },
        { status: 400 }
      )
    }

    const offer = (briqueOffers as unknown as Record<string, { id: string; label: string; description: string; amount: number; display: string }>)[plan]
    if (!offer) {
      return NextResponse.json(
        { success: false, error: `Plan inconnu: ${plan} pour ${brique}` },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://recupeo.fr'

    const result = await createCheckoutSession({
      productName: `RÉCUPÉO — ${offer.label}`,
      productDescription: offer.description,
      amount: offer.amount,
      email: email || '',
      brique,
      diagnosticId,
      plan,
      successUrl: `${baseUrl}/${brique}/rapport?id=${diagnosticId}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/${brique}?id=${diagnosticId}&cancelled=true`,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    })
  } catch (err) {
    console.error('[PAYMENT] Erreur création session:', err)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
