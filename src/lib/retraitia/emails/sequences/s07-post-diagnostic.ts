// S7 — Post-diagnostic non-payant (3 emails, J+2 à J+10)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, ctaSubtext, heading, para, signature } from '../renderer'

export const S7: EmailSequence = {
  id: 'S7',
  label: 'Post-diagnostic non-payant',
  stopCondition: 'paiement_49',
  steps: [
    {
      etape: 1,
      delayDays: 2,
      channel: 'email',
      subject: (v) => `${v.nbAnomalies ?? 0} anomalie(s) sur votre pension — voici comment agir`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Votre diagnostic a révélé <strong>${v.nbAnomalies ?? 0} anomalie(s)</strong> avec un impact estimé entre <strong>${v.impactMin ?? 0}\u00A0€</strong> et <strong>${v.impactMax ?? 0}\u00A0€/mois</strong>.`),
        para(`Voici ce que le rapport complet vous apporte :`),
        para(`✓ Le montant exact de chaque anomalie<br/>✓ Les messages prêts à copier-coller<br/>✓ Le guide étape par étape pour chaque organisme<br/>✓ Le suivi de vos démarches`),
        ctaButton(`Débloquer le rapport — ${v.prixNet ?? 49}\u00A0€`, v.lienPaiement49 || v.lienEspaceClient),
        v.montantDeduit ? ctaSubtext(`${v.montantDeduit}\u00A0€ déjà déduits de votre Pack Dossier.`) : '',
        signature(),
      ].join('\n'), v.dossierId),
    },
    {
      etape: 2,
      delayDays: 5,
      channel: 'email',
      subject: (v) => `Depuis votre départ en retraite, vous avez potentiellement perdu ${v.impactCumuleMax ?? '—'}\u00A0€`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Chaque mois sans correction, c'est entre <strong>${v.impactMin ?? 0}\u00A0€</strong> et <strong>${v.impactMax ?? 0}\u00A0€</strong> de manque à gagner.`),
        v.anneeDepart
          ? para(`Depuis votre départ en <strong>${v.anneeDepart}</strong>, cela représente entre <strong>${v.impactCumuleMin ?? 0}\u00A0€</strong> et <strong>${v.impactCumuleMax ?? 0}\u00A0€</strong>.`)
          : '',
        para(`Pour <strong>${v.prixNet ?? 49}\u00A0€</strong>, on vous dit exactement quoi faire et on vous prépare tous les messages.`),
        ctaButton('Agir maintenant', v.lienPaiement49 || v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
    },
    {
      etape: 3,
      delayDays: 10,
      channel: 'email',
      subject: () => `Dernière chance : votre diagnostic est en attente`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Votre diagnostic RETRAITIA (${v.nbAnomalies ?? 0} anomalie(s) détectée(s)) est toujours disponible dans votre espace.`),
        para(`Nous ne vous enverrons plus de rappel à ce sujet. Votre espace reste accessible à tout moment.`),
        ctaButton('Voir mon diagnostic', v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
    },
  ],
}
