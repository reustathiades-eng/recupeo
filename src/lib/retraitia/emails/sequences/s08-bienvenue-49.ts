// S8 — Bienvenue post-49€ (1 email, immédiat)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, heading, para, anomalyLine, signature } from '../renderer'

export const S8: EmailSequence = {
  id: 'S8',
  label: 'Bienvenue post-49€',
  stopCondition: 'none',
  steps: [
    {
      etape: 1,
      delayDays: 0,
      channel: 'email',
      subject: () => `Votre rapport est prêt — voici comment agir`,
      htmlContent: (v) => {
        const top = (v.topAnomalies || []).slice(0, 3)
          .map(a => anomalyLine(a.label, a.impact, a.organisme))
          .join('\n')

        return wrapEmail([
          heading(`Bonjour ${v.prenom},`),
          para(`Votre rapport RETRAITIA complet est disponible.`),
          v.lienRapportPdf
            ? para(`📄 <a href="${v.lienRapportPdf}" style="color:#00D68F;font-weight:600;">Télécharger le rapport PDF</a>`)
            : '',
          para(`📋 <strong>${v.nbAnomalies ?? 0} anomalie(s)</strong> à traiter :`),
          top,
          para(`Toutes vos démarches sont détaillées dans votre espace client avec les messages prêts à copier.`),
          ctaButton('Voir mes démarches', v.lienDemarches || v.lienEspaceClient),
          para(`<span style="color:#64748b;font-size:13px;">Nous vous recommandons de commencer par l'anomalie au plus gros impact.</span>`),
          signature(),
        ].join('\n'), v.dossierId)
      },
    },
  ],
}
