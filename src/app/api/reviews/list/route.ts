// ============================================================
// GET /api/reviews/list?brique=xxx&page=1
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'
import { REVIEWS_PER_PAGE } from '@/lib/reviews/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brique = searchParams.get('brique')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))

    const payload = await getPayload({ config })

    const conditions: Where[] = [{ status: { equals: 'published' } }]
    if (brique) conditions.push({ brique: { equals: brique } })

    const where: Where = conditions.length === 1 ? conditions[0] : { and: conditions }

    const result = await payload.find({
      collection: 'reviews',
      where,
      sort: '-publishedAt',
      limit: REVIEWS_PER_PAGE,
      page,
    })

    return NextResponse.json({
      reviews: result.docs.map((r: Record<string, unknown>) => ({
        id: r.id,
        brique: r.brique,
        note: r.note,
        commentaire: r.commentaire,
        prenom: r.prenom,
        ville: r.ville,
        montantRecupere: r.montantRecupere,
        hasRecovered: r.hasRecovered,
        isVerified: r.isVerified,
        publishedAt: r.publishedAt || r.createdAt,
      })),
      totalPages: result.totalPages,
      totalDocs: result.totalDocs,
      page: result.page,
    })
  } catch (err) {
    console.error('[REVIEWS] Erreur list:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
