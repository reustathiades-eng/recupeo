// GET + POST /api/retraitia/emails/unsubscribe
// Désabonnement RGPD. Le GET affiche la confirmation, le POST désabonne.

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return new NextResponse(pageHtml('Lien invalide', false), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  return new NextResponse(pageHtml('Confirmer le désabonnement', true, id), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { dossierId } = body

    if (!dossierId) {
      return NextResponse.json({ error: 'dossierId requis' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    await payload.update({
      collection: 'retraitia-dossiers' as any,
      id: dossierId,
      data: { unsubscribed: true } as any,
    })

    console.log(`[UNSUBSCRIBE] Dossier ${dossierId} désabonné`)

    return NextResponse.json({ success: true, message: 'Désabonnement confirmé' })
  } catch (err) {
    console.error('[UNSUBSCRIBE] Erreur:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur interne' },
      { status: 500 }
    )
  }
}

function pageHtml(title: string, showForm: boolean, dossierId?: string): string {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://recupeo.fr'
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Désabonnement — RÉCUPÉO</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:480px;margin:60px auto;padding:20px;text-align:center;color:#334155;}
h1{font-size:22px;color:#0F172A;}button{background:#00D68F;color:#060D1B;border:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:16px;cursor:pointer;margin-top:20px;}
.done{color:#00D68F;font-size:18px;margin-top:20px;}</style></head>
<body><h1>${title}</h1>
${showForm && dossierId ? `
<p>Vous ne recevrez plus d'emails de RETRAITIA.</p>
<p style="color:#94a3b8;font-size:13px;">Votre espace client restera accessible.</p>
<button onclick="unsub()">Confirmer le désabonnement</button>
<div id="msg"></div>
<script>
async function unsub(){
  try{
    const r=await fetch('${base}/api/retraitia/emails/unsubscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dossierId:'${dossierId}'})});
    const d=await r.json();
    document.getElementById('msg').innerHTML=d.success?'<p class="done">✅ Vous êtes désabonné.</p>':'<p style="color:red;">Erreur. Réessayez.</p>';
    document.querySelector('button').style.display='none';
  }catch(e){document.getElementById('msg').innerHTML='<p style="color:red;">Erreur réseau.</p>';}
}
</script>` : '<p>Ce lien n\'est pas valide.</p>'}
</body></html>`
}
