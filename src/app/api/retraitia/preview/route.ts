// GET /api/retraitia/preview?id=xxx
// Retourne le rapport + courriers déjà sauvegardés en base (pas de re-génération)
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

    const payload = await getPayload({ config })
    const diagnostic = await payload.findByID({ collection: 'diagnostics', id })
    if (!diagnostic) return NextResponse.json({ error: 'Diagnostic introuvable' }, { status: 404 })

    const reports = await payload.find({
      collection: 'reports',
      where: { diagnostic: { equals: id } },
      limit: 1,
    })
    const report = reports.docs[0] || null

    return NextResponse.json({
      diagnostic: {
        id: diagnostic.id,
        brique: diagnostic.brique,
        status: diagnostic.status,
        anomaliesCount: diagnostic.anomaliesCount,
        estimatedAmount: diagnostic.estimatedAmount,
        aiAnalysis: diagnostic.aiAnalysis,
      },
      report: report ? {
        title: (report.reportContent as any)?.title,
        sections: (report.reportContent as any)?.sections,
        financial_summary: (report.reportContent as any)?.financial_summary,
        next_steps: (report.reportContent as any)?.next_steps,
      } : null,
      letters: report?.generatedLetters || null,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
