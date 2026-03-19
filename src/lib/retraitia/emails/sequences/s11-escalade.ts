// S11 — Escalade proposée (1 email, immédiat)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, heading, para, signature } from '../renderer'

export const S11: EmailSequence = {
  id: 'S11',
  label: 'Escalade proposée',
  stopCondition: 'client_agit',
  steps: [
    {
      etape: 1,
      delayDays: 0,
      channel: 'email',
      subject: (v) => `${v.organisme || 'L\'organisme'} — votre demande nécessite une action`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`<strong>${v.organisme || 'L\'organisme'}</strong> n'a pas donné suite à votre demande concernant : <strong>${v.anomalieLabel || '—'}</strong>.`),
        para(`Ne vous découragez pas. Voici l'étape suivante :`),
        para(`Le courrier ou la saisine correspondante est prêt dans votre espace. Un envoi par courrier recommandé est disponible pour <strong>14,90\u00A0€</strong>.`),
        ctaButton('Voir les options', v.lienDemarches || v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
    },
  ],
}
