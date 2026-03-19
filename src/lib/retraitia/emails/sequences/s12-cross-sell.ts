// S12 — Cross-sell (1 email, J+7 après première anomalie corrigée)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, heading, para, signature } from '../renderer'

export const S12: EmailSequence = {
  id: 'S12',
  label: 'Cross-sell',
  stopCondition: 'none',
  steps: [
    {
      etape: 1,
      delayDays: 7,
      channel: 'email',
      subject: () => `Votre pension est corrigée — et vos impôts, votre taxe foncière\u00A0?`,
      htmlContent: (v) => {
        const opportunites: string[] = []

        if (v.exonerationTF) {
          opportunites.push(para(`🏠 <strong>Taxe foncière</strong> : exonération possible (~${v.impactTF ?? '?'}\u00A0€/an)` +
            (v.lienMataxe ? `<br/>→ <a href="${v.lienMataxe}" style="color:#00D68F;">Vérifier avec MATAXE</a>` : '')))
        }
        if (v.creditImpot) {
          opportunites.push(para(`💶 <strong>Impôts</strong> : crédit d'impôt non optimisé (~${v.impactCI ?? '?'}\u00A0€/an)` +
            (v.lienMonimpot ? `<br/>→ <a href="${v.lienMonimpot}" style="color:#00D68F;">Vérifier avec MONIMPOT</a>` : '')))
        }
        if (v.aspaCss) {
          opportunites.push(para(`🏥 <strong>Aides sociales</strong> : éligibilité possible`))
        }

        return wrapEmail([
          heading(`Bonjour ${v.prenom},`),
          para(`Félicitations pour la correction de votre pension\u00A0!`),
          para(`Notre audit a aussi détecté des opportunités sur d'autres domaines :`),
          ...opportunites,
          signature(),
        ].join('\n'), v.dossierId)
      },
      condition: (v) => !!(v.exonerationTF || v.creditImpot || v.aspaCss),
    },
  ],
}
