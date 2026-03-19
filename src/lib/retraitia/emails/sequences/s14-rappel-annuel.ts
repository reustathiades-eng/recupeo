// S14 — Rappel annuel pré-retraités (1 email, J+365)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, heading, para, signature } from '../renderer'

export const S14: EmailSequence = {
  id: 'S14',
  label: 'Rappel annuel',
  stopCondition: 'none',
  steps: [
    {
      etape: 1,
      delayDays: 365,
      channel: 'email',
      subject: () => `Votre RIS a-t-il été mis à jour\u00A0?`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Il y a un an, nous avions identifié et corrigé <strong>${v.nbCorrections ?? 0} anomalie(s)</strong> sur votre carrière.`),
        para(`Il est temps de vérifier que les corrections ont bien été prises en compte sur votre nouveau RIS.`),
        para(`→ Téléchargez votre RIS sur <a href="https://www.info-retraite.fr" style="color:#00D68F;">info-retraite.fr</a><br/>→ Uploadez-le dans votre espace RÉCUPÉO<br/>→ Nous vérifierons automatiquement`),
        ctaButton('Mon espace', v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
      condition: (v) => v.parcours === 'preretraite',
    },
  ],
}
