// S15 — Upsell départ pré-retraité (1 email, 6 mois avant)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, heading, para, signature } from '../renderer'

export const S15: EmailSequence = {
  id: 'S15',
  label: 'Upsell départ',
  stopCondition: 'none',
  steps: [
    {
      etape: 1,
      delayDays: 0,
      channel: 'email',
      subject: () => `Votre départ en retraite approche — vérifiez votre première pension`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Votre départ en retraite est prévu pour <strong>${v.dateDepart || '—'}</strong>.`),
        para(`Nous avions corrigé <strong>${v.nbCorrections ?? 0} anomalie(s)</strong> sur votre carrière. Il est maintenant temps de vérifier que votre première pension sera correcte.`),
        para(`Pour <strong>${v.prixUpsell ?? 49}\u00A0€</strong>, nous vérifions votre notification de pension dès que vous la recevez :`),
        para(`✓ Comparaison avec notre calcul<br/>✓ Vérification des majorations<br/>✓ Contrôle du taux de CSG<br/>✓ Messages si des erreurs subsistent`),
        ctaButton('Préparer la vérification', v.lienUpsell || v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
      condition: (v) => v.parcours === 'preretraite',
    },
  ],
}
