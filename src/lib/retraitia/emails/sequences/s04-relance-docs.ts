// S4 — Relance collecte documents (5 emails + 2 SMS)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, heading, para, infoBox, docStatusLine, signature } from '../renderer'

export const S4: EmailSequence = {
  id: 'S4',
  label: 'Relance collecte documents',
  stopCondition: 'docs_complets',
  steps: [
    {
      etape: 1,
      delayDays: 1,
      channel: 'email',
      subject: () => `Votre premier document à récupérer : le RIS`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Première étape : récupérer votre <strong>Relevé de Carrière (RIS)</strong> sur info-retraite.fr. C'est le document le plus important.`),
        para(`Comptez 5 minutes :`),
        ctaButton('Guide pas-à-pas', v.lienGuideRIS || v.lienEspaceClient),
        para(`Connectez-vous sur info-retraite.fr avec FranceConnect, téléchargez votre relevé en PDF, et uploadez-le sur votre espace RÉCUPÉO.`),
        signature(),
      ].join('\n'), v.dossierId),
    },
    {
      etape: 2,
      delayDays: 4,
      channel: 'email',
      subject: () => `Avez-vous pu récupérer votre RIS\u00A0?`,
      htmlContent: (v) => {
        const body = v.risUploade
          ? [
              para(`Bravo, votre RIS est bien reçu\u00A0!`),
              v.nbDocsManquants
                ? para(`Il vous reste <strong>${v.nbDocsManquants} document(s)</strong> à récupérer\u00A0:`)
                : '',
              v.listeDocsManquants || '',
            ]
          : [
              para(`Votre relevé de carrière (RIS) est en attente. C'est le document essentiel pour votre diagnostic.`),
              ctaButton('Guide RIS', v.lienGuideRIS || v.lienEspaceClient),
            ]
        return wrapEmail([
          heading(`Bonjour ${v.prenom},`),
          ...body,
          ctaButton('Mon espace', v.lienEspaceClient),
          signature(),
        ].join('\n'), v.dossierId)
      },
    },
    {
      etape: 3,
      delayDays: 7,
      channel: 'email+sms',
      subject: (v) => `Il vous reste ${v.nbDocsManquants ?? '?'} document(s) — votre dossier avance bien`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`État de votre dossier :`),
        infoBox(v.listeDocsStatus || '<p style="font-size:14px;">Consultez votre espace pour voir l\'état de vos documents.</p>'),
        para(`Précision actuelle de l'audit : <strong>${v.precisionAudit ?? 40}\u00A0%</strong><br/>Plus vous uploadez, plus l'analyse est précise.`),
        ctaButton('Mon espace', v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
      smsContent: (v) => `RECUPEO : Il vous reste ${v.nbDocsManquants ?? '?'} document(s) a uploader. Votre dossier : ${v.lienEspaceClient}`,
    },
    {
      etape: 4,
      delayDays: 14,
      channel: 'email',
      subject: () => `Un proche peut récupérer vos documents pour vous`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Vous n'avez pas eu le temps de récupérer tous vos documents\u00A0? Un proche peut le faire pour vous avec vos identifiants FranceConnect.`),
        ctaButton('Inviter un proche', v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
    },
    {
      etape: 5,
      delayDays: 30,
      channel: 'email+sms',
      subject: () => `Votre dossier RETRAITIA est en attente`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Votre espace RETRAITIA est toujours ouvert et en attente de vos documents.`),
        v.listeDocsManquants
          ? para(`Documents manquants :<br/>${v.listeDocsManquants}`)
          : '',
        para(`Votre dossier restera accessible. Vous pouvez reprendre à tout moment.`),
        ctaButton('Reprendre mon dossier', v.lienEspaceClient),
        signature(),
      ].join('\n'), v.dossierId),
      smsContent: (v) => `RECUPEO : Votre dossier retraite est en attente. Reprenez quand vous voulez : ${v.lienEspaceClient}`,
    },
  ],
}
