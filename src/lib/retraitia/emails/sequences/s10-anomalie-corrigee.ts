// S10 — Anomalie corrigée (1 email, immédiat)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, heading, para, signature } from '../renderer'

export const S10: EmailSequence = {
  id: 'S10',
  label: 'Anomalie corrigée',
  stopCondition: 'none',
  steps: [
    {
      etape: 1,
      delayDays: 0,
      channel: 'email',
      subject: (v) => `Bonne nouvelle : +${v.gain ?? 0}\u00A0€/mois récupérés`,
      htmlContent: (v) => {
        const suiteHtml = v.nbAnomaliesRestantes && v.nbAnomaliesRestantes > 0
          ? para(`Il vous reste <strong>${v.nbAnomaliesRestantes} anomalie(s)</strong> à traiter.<br/>Gain potentiel restant : ~${v.gainRestant ?? 0}\u00A0€/mois`)
          : para(`<strong>Toutes vos anomalies sont résolues\u00A0!</strong><br/>Gain total confirmé : <strong>+${v.gainTotal ?? 0}\u00A0€/mois</strong>`)
        return wrapEmail([
          heading(`Bonjour ${v.prenom},`),
          para(`L'anomalie « <strong>${v.anomalieLabel || '—'}</strong> » a été corrigée par ${v.organisme || 'l\'organisme'}.`),
          `<div style="background:#060D1B;color:white;padding:20px;border-radius:12px;text-align:center;margin:20px 0;">
            <p style="font-size:13px;color:#94a3b8;margin:0 0 4px;">Gain confirmé</p>
            <p style="font-size:32px;font-weight:800;color:#00D68F;margin:0;">+${v.gain ?? 0}\u00A0€/mois</p>
            <p style="font-size:14px;color:#e2e8f0;margin:8px 0 0;">soit +${v.gainAnnuel ?? 0}\u00A0€/an</p>
          </div>`,
          suiteHtml,
          ctaButton('Mon suivi', v.lienDemarches || v.lienEspaceClient),
          signature(),
        ].join('\n'), v.dossierId)
      },
    },
  ],
}
