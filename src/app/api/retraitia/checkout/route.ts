// ============================================================
// POST /api/retraitia/checkout
// Crée une session Stripe Checkout pour les packs RETRAITIA
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, pack, flashId, dossierId } = body

    if (!email || !pack) {
      return NextResponse.json({ error: 'Email et pack requis' }, { status: 400 })
    }

    // Configs par pack
    const packConfigs: Record<string, { name: string; desc: string; amount: number; plan: string }> = {
      dossier_9: {
        name: 'RETRAITIA — Pack Dossier',
        desc: 'Espace personnel + guides FranceConnect + diagnostic personnalisé',
        amount: 900,
        plan: 'dossier_9',
      },
      action_49: {
        name: 'RETRAITIA — Pack Action',
        desc: 'Rapport complet + messages + suivi des démarches',
        amount: 4900,
        plan: 'action_49',
      },
      action_40: {
        name: 'RETRAITIA — Pack Action (9€ déduits)',
        desc: 'Rapport complet + messages + suivi — 9€ déjà payés',
        amount: 4000,
        plan: 'action_40',
      },
      couple_79: {
        name: 'RETRAITIA — Pack Couple',
        desc: '2 rapports complets + 2 jeux de messages',
        amount: 7900,
        plan: 'couple_79',
      },
      preretraite_39: {
        name: 'RETRAITIA — Pack Pré-retraité',
        desc: 'Simulation multi-scénarios + rachat trimestres + rapport',
        amount: 3900,
        plan: 'preretraite_39',
      },
    }

    const config = packConfigs[pack]
    if (!config) {
      return NextResponse.json({ error: 'Pack invalide' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://recupeo.fr'

    const result = await createCheckoutSession({
      productName: config.name,
      productDescription: config.desc,
      amount: config.amount,
      email,
      brique: 'retraitia',
      diagnosticId: dossierId || flashId || 'new',
      plan: config.plan,
      successUrl: `${baseUrl}/mon-espace/retraitia?payment=success&pack=${pack}`,
      cancelUrl: `${baseUrl}/retraitia/test?payment=cancelled`,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    })
  } catch (err) {
    console.error('[retraitia/checkout] Error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
