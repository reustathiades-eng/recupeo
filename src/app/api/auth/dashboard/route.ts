// ============================================================
// GET /api/auth/dashboard
// Retourne les données du tableau de bord utilisateur
// ============================================================
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getRecommendations } from '@/lib/auth/recommendations'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Récupérer les diagnostics de l'utilisateur
    const diagnostics = await payload.find({
      collection: 'diagnostics',
      where: {
        or: [
          { user: { equals: user.id } },
          { userEmail: { equals: user.email } },
        ],
      },
      sort: '-createdAt',
      limit: 50,
    })

    const docs = diagnostics.docs as Array<{
      id: string
      brique: string
      createdAt: string
      estimatedAmount?: number
      paid?: boolean
      status?: string
      demarche?: { montantRecupere?: number }
    }>

    // Stats agrégées
    const totalDetected = docs.reduce((sum, d) => sum + (d.estimatedAmount || 0), 0)
    const totalRecovered = docs.reduce((sum, d) => sum + (d.demarche?.montantRecupere || 0), 0)
    const paidDocs = docs.filter(d => d.paid)
    const inProgress = paidDocs.filter(d => d.status !== 'letters_generated').length

    // Briques utilisées
    const usedBriques = [...new Set(docs.map(d => d.brique))]

    // Récupérer le profil user complet pour les recommandations
    let profile
    try {
      const fullUser = await payload.findByID({ collection: 'users', id: user.id })
      profile = (fullUser as { profile?: Record<string, boolean> }).profile
    } catch {
      // Pas grave
    }

    const recommendations = getRecommendations(usedBriques, profile)

    return NextResponse.json({
      stats: {
        totalDiagnostics: docs.length,
        totalDetected,
        totalRecovered,
        inProgress,
      },
      recentDiagnostics: docs.slice(0, 5).map(d => ({
        id: d.id,
        brique: d.brique,
        createdAt: d.createdAt,
        estimatedAmount: d.estimatedAmount,
        paid: d.paid || false,
        status: d.status || 'pending',
      })),
      recommendations,
    })
  } catch (err) {
    console.error('[DASHBOARD] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
