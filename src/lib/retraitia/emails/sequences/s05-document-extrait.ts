// S5 — Document extrait (1 email, immédiat)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, heading, para, infoBox, signature } from '../renderer'

export const S5: EmailSequence = {
  id: 'S5',
  label: 'Document extrait',
  stopCondition: 'none',
  steps: [
    {
      etape: 1,
      delayDays: 0,
      channel: 'email',
      subject: (v) => `✅ ${v.nomDoc || 'Document'} analysé`,
      htmlContent: (v) => {
        const resumeHtml = v.resumeExtraction
          ? infoBox(`<p style="font-size:14px;">${v.resumeExtraction}</p>`)
          : ''

        const suiteHtml = v.nbDocsManquants && v.nbDocsManquants > 0
          ? para(`Il vous reste <strong>${v.nbDocsManquants} document(s)</strong> à récupérer pour améliorer la précision.`)
          : para(`<strong>Tous vos documents sont là\u00A0!</strong> Votre diagnostic sera bientôt prêt.`)

        return wrapEmail([
          heading(`Bonjour ${v.prenom},`),
          para(`Votre <strong>${v.nomDoc || 'document'}</strong> a été analysé avec succès.`),
          resumeHtml,
          para(`Précision de l'audit : <strong>${v.precisionAudit ?? 40}\u00A0%</strong>`),
          suiteHtml,
          ctaButton('Mon espace', v.lienEspaceClient),
          signature(),
        ].join('\n'), v.dossierId)
      },
    },
  ],
}
