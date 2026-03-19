// GET /api/cron/retraitia-emails
// Cron horaire — exécute le scheduler email RETRAITIA.
// Protégé par CRON_SECRET pour empêcher les appels externes.
// Usage PM2/crontab : curl -s -H "Authorization: Bearer $CRON_SECRET" https://recupeo.fr/api/cron/retraitia-emails

import { NextRequest, NextResponse } from 'next/server'
import { runScheduler } from '@/lib/retraitia/emails'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  // Vérifier le secret cron
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const stats = await runScheduler()
    return NextResponse.json({
      success: true,
      ...stats,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[CRON/retraitia-emails] Erreur:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 }
    )
  }
}
