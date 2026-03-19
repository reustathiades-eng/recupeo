// ============================================================
// GET /api/reviews/stats — Stats agrégées (cache 1h)
// ============================================================
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

let cachedStats: unknown = null
let cacheTime = 0
const CACHE_TTL = 3600_000 // 1h

export async function GET() {
  try {
    if (cachedStats && Date.now() - cacheTime < CACHE_TTL) {
      return NextResponse.json(cachedStats)
    }

    const payload = await getPayload({ config })

    const allReviews = await payload.find({
      collection: 'reviews',
      where: { status: { equals: 'published' } },
      limit: 1000,
    })

    const docs = allReviews.docs as unknown as Array<{
      note: number
      brique: string
      montantRecupere?: number
      hasRecovered?: string
    }>

    if (docs.length === 0) {
      const empty = {
        averageNote: 0, totalReviews: 0, totalRecovered: 0,
        averageRecovered: 0, recoveryRate: 0, byBrique: {}, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
      return NextResponse.json(empty)
    }

    // Calculs
    const totalNotes = docs.reduce((s, d) => s + d.note, 0)
    const averageNote = Math.round((totalNotes / docs.length) * 10) / 10

    const withRecovery = docs.filter(d => d.montantRecupere && d.montantRecupere > 0)
    const totalRecovered = withRecovery.reduce((s, d) => s + (d.montantRecupere || 0), 0)
    const averageRecovered = withRecovery.length > 0 ? Math.round(totalRecovered / withRecovery.length) : 0

    const yesCount = docs.filter(d => d.hasRecovered === 'yes').length
    const recoveryRate = docs.length > 0 ? Math.round((yesCount / docs.length) * 100) : 0

    // Distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const d of docs) distribution[d.note] = (distribution[d.note] || 0) + 1

    // Par brique
    const byBrique: Record<string, { notes: number[]; recovered: number[] }> = {}
    for (const d of docs) {
      if (!byBrique[d.brique]) byBrique[d.brique] = { notes: [], recovered: [] }
      byBrique[d.brique].notes.push(d.note)
      if (d.montantRecupere) byBrique[d.brique].recovered.push(d.montantRecupere)
    }

    const byBriqueStats: Record<string, { averageNote: number; count: number; averageRecovered: number }> = {}
    for (const [b, data] of Object.entries(byBrique)) {
      const avg = data.notes.reduce((s, n) => s + n, 0) / data.notes.length
      const avgRec = data.recovered.length > 0 ? data.recovered.reduce((s, n) => s + n, 0) / data.recovered.length : 0
      byBriqueStats[b] = {
        averageNote: Math.round(avg * 10) / 10,
        count: data.notes.length,
        averageRecovered: Math.round(avgRec),
      }
    }

    const stats = {
      averageNote, totalReviews: docs.length, totalRecovered: Math.round(totalRecovered),
      averageRecovered, recoveryRate, byBrique: byBriqueStats, distribution,
    }

    cachedStats = stats
    cacheTime = Date.now()

    return NextResponse.json(stats)
  } catch (err) {
    console.error('[REVIEWS] Erreur stats:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
