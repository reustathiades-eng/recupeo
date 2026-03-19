// S1 — Post-flash non-payant (4 emails, J+1 à J+14)
import type { EmailSequence, EmailVars } from '../types'
import { wrapEmail, ctaButton, ctaSubtext, heading, para, signature } from '../renderer'

export const S1: EmailSequence = {
  id: 'S1',
  label: 'Post-flash non-payant',
  stopCondition: 'paiement_9',
  steps: [
    {
      etape: 1,
      delayDays: 1,
      channel: 'email',
      subject: (v) => `Votre pension contient peut-être une erreur — votre résultat est en attente`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Hier, vous avez testé votre pension sur RÉCUPÉO.`),
        para(`Votre résultat : risque <strong>${v.niveauRisque || 'MODÉRÉ'}</strong>`),
        v.facteurs ? `<div style="margin:16px 0;">${v.facteurs}</div>` : '',
        para(`Pour 9\u00A0€, nous vérifions votre pension en détail à partir de vos documents officiels. Ces 9\u00A0€ sont déduits si vous poursuivez l'analyse.`),
        ctaButton('Vérifier ma pension — 9\u00A0€', v.lienPaiement9 || v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
    },
    {
      etape: 2,
      delayDays: 3,
      channel: 'email',
      subject: () => `1 pension sur 7 est mal calculée — la vôtre aussi ?`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Saviez-vous que selon la Cour des Comptes, <strong>1 pension de retraite sur 7</strong> contient une erreur\u00A0? Dans 75\u00A0% des cas, l'erreur est en défaveur du retraité.`),
        para(`Votre profil (${v.anneeNaissance || '—'}, ${v.nbEnfants ?? 0} enfant${(v.nbEnfants ?? 0) > 1 ? 's' : ''}, carrière ${v.typeCarriere || '—'}) présente un risque <strong>${v.niveauRisque || 'MODÉRÉ'}</strong>.`),
        para(`Ne laissez pas passer une erreur qui pourrait vous coûter des milliers d'euros.`),
        ctaButton('Vérifier ma pension — 9\u00A0€', v.lienPaiement9 || v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
    },
    {
      etape: 3,
      delayDays: 7,
      channel: 'email',
      subject: () => `Chaque mois sans vérification, c'est de l'argent perdu`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Si votre pension contient une erreur, chaque mois qui passe est un mois de manque à gagner.`),
        para(`Pour les profils comme le vôtre, le manque à gagner moyen est de <strong>plusieurs dizaines d'euros par mois</strong>. Sur une année, ça représente des centaines d'euros.`),
        para(`Pour 9\u00A0€, on prend votre dossier en main.`),
        ctaButton('Vérifier ma pension', v.lienPaiement9 || v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
    },
    {
      etape: 4,
      delayDays: 14,
      channel: 'email',
      subject: () => `Un proche peut vérifier pour vous`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Vous n'avez pas eu le temps de vérifier votre pension\u00A0?`),
        para(`Un proche (enfant, petit-enfant, ami) peut le faire pour vous. Transmettez-lui ce lien\u00A0:`),
        ctaButton('Partager le test pension', v.lienTestFlash || 'https://recupeo.fr/retraitia/test'),
        para(`Il pourra récupérer les documents en ligne et lancer la vérification en 30 minutes.`),
        signature(),
      ].join('\n'), v.dossierId),
    },
  ],
}
