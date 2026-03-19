// S6 — Diagnostic prêt (1 email + 1 SMS, immédiat)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, heading, para, impactBlock, signature } from '../renderer'

export const S6: EmailSequence = {
  id: 'S6',
  label: 'Diagnostic prêt',
  stopCondition: 'none',
  hasReversionVariant: true,
  steps: [
    {
      etape: 1,
      delayDays: 0,
      channel: 'email+sms',
      subject: (v) => v.parcours === 'reversion'
        ? `Vos droits à réversion — résultat de votre diagnostic`
        : `Votre diagnostic RETRAITIA : ${v.nbAnomalies ?? 0} anomalie(s) détectée(s)`,
      htmlContent: (v) => {
        if (v.parcours === 'reversion') {
          return wrapEmail([
            heading(`Bonjour ${v.prenom},`),
            para(`Suite à l'analyse de votre situation, nous avons identifié <strong>${v.nbRegimes ?? 0} régime(s)</strong> de votre conjoint auprès desquels vous pouvez demander une pension de réversion.`),
            para(`Montant estimé : entre <strong>${v.impactMin ?? 0}\u00A0€</strong> et <strong>${v.impactMax ?? 0}\u00A0€/mois</strong>`),
            para(`Nous vous accompagnons dans chaque démarche.`),
            ctaButton('Voir le détail', v.lienEspaceClient),
            signature(),
          ].join('\n'), v.dossierId)
        }
        return wrapEmail([
          heading(`Bonjour ${v.prenom},`),
          para(`Votre diagnostic RETRAITIA est prêt.`),
          impactBlock(v.nbAnomalies ?? 0, v.impactMin ?? 0, v.impactMax ?? 0, v.scoreGlobal),
          para(`Connectez-vous pour voir le détail :`),
          ctaButton('Voir mon diagnostic', v.lienEspaceClient),
          para(`Pour <strong>${v.prixPackAction ?? 49}\u00A0€</strong>, débloquez votre rapport complet avec les montants exacts et les messages prêts à envoyer.`),
          signature(),
        ].join('\n'), v.dossierId)
      },
      smsContent: (v) => v.parcours === 'reversion'
        ? `RECUPEO : Votre diagnostic reversion est pret — ${v.nbRegimes ?? 0} regime(s) identifies. Voir : ${v.lienEspaceClient}`
        : `RECUPEO : Votre diagnostic est pret — ${v.nbAnomalies ?? 0} anomalie(s) detectee(s). Voir : ${v.lienEspaceClient}`,
    },
  ],
}
