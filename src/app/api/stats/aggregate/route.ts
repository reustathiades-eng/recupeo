// ============================================================
// GET /api/stats/aggregate — Wall of Wins (vrais chiffres MongoDB)
// Cache 1h — utilisé par la home page
// ============================================================
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

let cached: unknown = null
let cacheTime = 0
const CACHE_TTL = 3600_000

export async function GET() {
  try {
    if (cached && Date.now() - cacheTime < CACHE_TTL) {
      return NextResponse.json(cached)
    }

    const payload = await getPayload({ config })

    // Diagnostics
    const allDiags = await payload.find({
      collection: 'diagnostics',
      limit: 5000,
      where: { status: { not_equals: 'pending' } },
    })

    const diagDocs = allDiags.docs as unknown as Array<{
      estimatedAmount?: number
      status?: string
      paid?: boolean
    }>

    const totalDiagnostics = diagDocs.length
    const totalDetected = diagDocs.reduce((s, d) => s + (d.estimatedAmount || 0), 0)
    const totalLettersGenerated = diagDocs.filter(d =>
      d.status === 'letters_generated' || d.status === 'report_generated'
    ).length

    // Reviews
    const allReviews = await payload.find({
      collection: 'reviews',
      where: { status: { equals: 'published' } },
      limit: 1000,
    })

    const reviewDocs = allReviews.docs as unknown as Array<{ note: number }>
    const totalReviews = reviewDocs.length
    const averageNote = totalReviews > 0
      ? Math.round((reviewDocs.reduce((s, r) => s + r.note, 0) / totalReviews) * 10) / 10
      : 0

    const stats = {
      totalDiagnostics,
      totalDetected: Math.round(totalDetected),
      totalLettersGenerated,
      averageNote,
      totalReviews,
    }

    cached = stats
    cacheTime = Date.now()

    return NextResponse.json(stats)
  } catch (err) {
    console.error('[STATS] Erreur aggregate:', err)
    return NextResponse.json({
      totalDiagnostics: 0, totalDetected: 0, totalLettersGenerated: 0,
      averageNote: 0, totalReviews: 0,
    })
  }
}
