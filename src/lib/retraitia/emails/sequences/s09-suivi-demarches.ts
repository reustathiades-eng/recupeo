// S9 — Suivi démarches (4 emails + 2 SMS)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, heading, para, signature } from '../renderer'

export const S9: EmailSequence = {
  id: 'S9',
  label: 'Suivi démarches',
  stopCondition: 'anomalie_resolue',
  steps: [
    {
      etape: 1,
      delayDays: 0,
      channel: 'email',
      subject: () => `Message envoyé ✅ — voici la suite`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Vous avez envoyé votre message à <strong>${v.organisme || 'l\'organisme'}</strong> pour l'anomalie : <strong>${v.anomalieLabel || '—'}</strong>.`),
        para(`<strong>Prochaine étape :</strong> attendre la réponse.<br/>Délai habituel : ${v.delaiEstime || '2 mois'}.<br/>Nous vous préviendrons quand il sera temps de relancer si nécessaire.`),
        ctaButton('Mon suivi', v.lienDemarches || v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
    },
    {
      etape: 2,
      delayDays: 30,
      channel: 'email',
      subject: (v) => `Avez-vous des nouvelles de ${v.organisme || 'l\'organisme'}\u00A0?`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Vous avez envoyé un message à <strong>${v.organisme || 'l\'organisme'}</strong> le ${v.dateEnvoi || '—'} concernant : <strong>${v.anomalieLabel || '—'}</strong>.`),
        para(`Avez-vous reçu une réponse\u00A0?`),
        para(`→ <strong>Oui</strong> : connectez-vous pour mettre à jour votre dossier.<br/>→ <strong>Non</strong> : le délai légal est de 2 mois. Nous vous préviendrons quand il sera temps de relancer.`),
        ctaButton('Mettre à jour', v.lienDemarches || v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
    },
    {
      etape: 3,
      delayDays: 55,
      channel: 'email+sms',
      subject: (v) => `Le délai de réponse de ${v.organisme || 'l\'organisme'} expire dans 5 jours`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Le délai de 2 mois pour la réponse de <strong>${v.organisme || 'l\'organisme'}</strong> expire le <strong>${v.dateEcheance || '—'}</strong>.`),
        para(`Si vous n'avez pas reçu de réponse d'ici là, une relance sera recommandée.`),
        ctaButton('Mettre à jour mon dossier', v.lienDemarches || v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
      smsContent: (v) => `RECUPEO : Delai ${v.organisme || 'organisme'} expire dans 5 jours. Avez-vous une reponse ? ${v.lienEspaceClient}`,
    },
    {
      etape: 4,
      delayDays: 60,
      channel: 'email',
      subject: (v) => `Pas de réponse de ${v.organisme || 'l\'organisme'} — voici comment relancer`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Le délai de 2 mois est écoulé et <strong>${v.organisme || 'l\'organisme'}</strong> n'a pas répondu à votre demande concernant : <strong>${v.anomalieLabel || '—'}</strong>.`),
        para(`Voici vos options :`),
        para(`<strong>1.</strong> Envoyer un message de relance (gratuit)<br/>→ Message prêt dans votre espace`),
        para(`<strong>2.</strong> Envoyer un courrier recommandé (14,90\u00A0€)<br/>→ Plus formel, avec accusé de réception`),
        ctaButton('Choisir mon option', v.lienDemarches || v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
    },
  ],
}
