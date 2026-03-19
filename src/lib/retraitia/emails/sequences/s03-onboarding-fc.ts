// S3 — Onboarding FranceConnect (4 emails + 1 SMS)
import type { EmailSequence } from '../types'
import { wrapEmail, ctaButton, heading, para, signature } from '../renderer'

const BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'https://recupeo.fr'

export const S3: EmailSequence = {
  id: 'S3',
  label: 'Onboarding FranceConnect',
  stopCondition: 'acces_fc_valide',
  steps: [
    {
      etape: 1,
      delayDays: 2,
      channel: 'email',
      subject: () => `Besoin d'aide pour vous connecter\u00A0?`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Votre espace RETRAITIA est en attente de votre première connexion FranceConnect.`),
        para(`FranceConnect vous permet d'accéder à tous vos documents de retraite avec un seul compte (Ameli, impots.gouv ou La Poste).`),
        ctaButton('Guide pas-à-pas', v.lienGuideFC || `${BASE}/mon-espace/retraitia/documents`),
        para(`Si vous avez un compte Ameli, impots.gouv ou La Poste, vous avez déjà FranceConnect.`),
        signature(),
      ].join('\n'), v.dossierId),
    },
    {
      etape: 2,
      delayDays: 5,
      channel: 'email+sms',
      subject: () => `Mot de passe oublié\u00A0? Voici comment le retrouver`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Beaucoup de personnes ont déjà un compte Ameli ou impots.gouv sans le savoir (créé par un proche ou un conseiller).`),
        para(`Si vous avez oublié votre mot de passe\u00A0:`),
        para(`→ <a href="${v.lienGuideMdpAmeli || '#'}" style="color:#00D68F;">Récupérer mon mot de passe Ameli</a>`),
        para(`→ <a href="${v.lienGuideMdpImpots || '#'}" style="color:#00D68F;">Récupérer mon mot de passe impots.gouv</a>`),
        signature(),
      ].join('\n'), v.dossierId),
      smsContent: (v) => `RECUPEO : Besoin d'aide pour FranceConnect ? Voici le guide : ${v.lienGuideFC || `${BASE}/mon-espace/retraitia`}`,
    },
    {
      etape: 3,
      delayDays: 10,
      channel: 'email',
      subject: () => `Un proche peut vous aider en 30 minutes`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Si vous avez du mal à vous connecter, un proche peut le faire pour vous.`),
        ctaButton(`Inviter un proche à m'aider`, v.lienEspaceClient),
        para(`Votre proche recevra les guides et pourra récupérer vos documents à votre place.`),
        signature(),
      ].join('\n'), v.dossierId),
    },
    {
      etape: 4,
      delayDays: 20,
      channel: 'email',
      subject: () => `Un conseiller France Services peut vous aider gratuitement`,
      htmlContent: (v) => wrapEmail([
        heading(`Bonjour ${v.prenom},`),
        para(`Si vous n'arrivez pas à vous connecter en ligne, un conseiller France Services peut vous aider gratuitement et sans rendez-vous.`),
        v.adresseFranceServices
          ? para(`<strong>L'espace le plus proche :</strong><br/>${v.adresseFranceServices}${v.horairesFranceServices ? `<br/>${v.horairesFranceServices}` : ''}`)
          : para(`Trouvez l'espace le plus proche sur <a href="https://www.france-services.gouv.fr" style="color:#00D68F;">france-services.gouv.fr</a>`),
        para(`Apportez votre carte Vitale et une pièce d'identité.`),
        signature(),
      ].join('\n'), v.dossierId),
    },
  ],
}
