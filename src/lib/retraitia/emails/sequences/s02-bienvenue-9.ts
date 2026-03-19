// S2 — Bienvenue post-9€ (1 email, immédiat)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, heading, para, infoBox, signature } from '../renderer'

export const S2: EmailSequence = {
  id: 'S2',
  label: 'Bienvenue post-9€',
  stopCondition: 'none',
  steps: [
    {
      etape: 1,
      delayDays: 0,
      channel: 'email',
      subject: () => `Votre espace RETRAITIA est prêt`,
      htmlContent: (v) => wrapEmail([
        heading(`Bienvenue ${v.prenom}\u00A0!`),
        para(`Merci pour votre confiance. Votre espace RETRAITIA est ouvert et prêt.`),
        para(`Voici ce qui vous attend\u00A0:`),
        infoBox([
          `<p style="margin:8px 0;font-size:14px;"><strong>1.</strong> Vérifier votre accès FranceConnect (2 min)</p>`,
          `<p style="margin:8px 0;font-size:14px;"><strong>2.</strong> Récupérer vos documents en ligne (20-30 min)</p>`,
          `<p style="margin:8px 0;font-size:14px;"><strong>3.</strong> Répondre à quelques questions complémentaires (5 min)</p>`,
          `<p style="margin:8px 0;font-size:14px;"><strong>4.</strong> Recevoir votre diagnostic automatique</p>`,
        ].join('\n')),
        para(`Vous pouvez vous arrêter et reprendre à tout moment. Votre progression est sauvegardée.`),
        ctaButton(`Accéder à mon espace`, v.lienEspaceClient),
        para(`<span style="color:#94a3b8;font-size:13px;">Un proche peut vous aider\u00A0? Transmettez-lui le lien depuis votre espace client.</span>`),
        signature(),
        para(`<span style="color:#94a3b8;font-size:12px;">P.S. Rappel : ces 9\u00A0€ sont déduits si vous poursuivez avec le Pack Action.</span>`),
      ].join('\n'), v.dossierId),
    },
  ],
}
