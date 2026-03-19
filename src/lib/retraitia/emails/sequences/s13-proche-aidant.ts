// S13 — Proche aidant (1 email, immédiat, envoyé AU PROCHE)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, heading, para, infoBox, signature } from '../renderer'

export const S13: EmailSequence = {
  id: 'S13',
  label: 'Invitation proche',
  stopCondition: 'none',
  steps: [
    {
      etape: 1,
      delayDays: 0,
      channel: 'email',
      subject: (v) => `${v.prenomClient || 'Un proche'} a besoin de votre aide pour vérifier sa pension`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenomProche || ''},`),
        para(`<strong>${v.prenomClient || 'Votre proche'}</strong> utilise le service RÉCUPÉO pour vérifier sa pension de retraite et a besoin de votre aide.`),
        para(`Voici ce que vous pouvez faire :`),
        infoBox([
          `<p style="margin:8px 0;font-size:14px;"><strong>1.</strong> Accéder au dossier</p>`,
          `<p style="margin:8px 0;font-size:14px;"><strong>2.</strong> Récupérer les documents en ligne (identifiants FranceConnect nécessaires)</p>`,
          `<p style="margin:8px 0;font-size:14px;"><strong>3.</strong> Uploader les documents dans l'espace RÉCUPÉO</p>`,
        ].join('\n')),
        para(`Comptez environ <strong>30 minutes</strong> pour les 3 documents essentiels.`),
        ctaButton('Accéder au dossier', v.lienMagicLink || v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
    },
  ],
}
