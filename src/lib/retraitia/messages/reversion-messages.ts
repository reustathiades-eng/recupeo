// ============================================================
// RETRAITIA V2 — Messages de demande de reversion par regime
// ============================================================

import type { GeneratedMessage, ReversionRegime } from '../types'

export interface ReversionMessageVars {
  prenomSurvivant: string
  nomSurvivant: string
  nirSurvivant: string
  dateNaissanceSurvivant: string
  prenomDefunt: string
  nomDefunt: string
  nirDefunt: string
  dateDeces: string
  dateMariage: string
}

const TEMPLATES: Record<string, { objet: string; corps: string }> = {
  cnav: {
    objet: `Demande de pension de reversion`,
    corps: `Madame, Monsieur,

Suite au deces de mon conjoint {prenomDefunt} {nomDefunt}, survenu le {dateDeces}, je souhaite faire valoir mes droits a la pension de reversion.

Informations sur le defunt :
- Nom : {prenomDefunt} {nomDefunt}
- N de securite sociale : {nirDefunt}
- Date de deces : {dateDeces}

Informations me concernant :
- Nom : {prenomSurvivant} {nomSurvivant}
- N de securite sociale : {nirSurvivant}
- Date de naissance : {dateNaissanceSurvivant}
- Date de mariage : {dateMariage}
- Situation actuelle : non remarie(e)

Je vous remercie de bien vouloir traiter ma demande dans les meilleurs delais.

Cordialement,
{prenomSurvivant} {nomSurvivant}`,
  },
  agirc_arrco: {
    objet: `Demande de pension de reversion complementaire Agirc-Arrco`,
    corps: `Madame, Monsieur,

Suite au deces de mon conjoint {prenomDefunt} {nomDefunt} (N SS : {nirDefunt}), survenu le {dateDeces}, je souhaite faire valoir mes droits a la pension de reversion complementaire Agirc-Arrco.

Je suis {prenomSurvivant} {nomSurvivant}, ne(e) le {dateNaissanceSurvivant}, N SS : {nirSurvivant}.

Nous etions maries depuis le {dateMariage}. Je ne me suis pas remarie(e).

Je joins les pieces justificatives requises.

Cordialement,
{prenomSurvivant} {nomSurvivant}`,
  },
  sre: {
    objet: `Demande de pension de reversion — Fonction publique Etat`,
    corps: `Madame, Monsieur,

Suite au deces de mon conjoint {prenomDefunt} {nomDefunt}, fonctionnaire de l'Etat, survenu le {dateDeces}, je souhaite faire valoir mes droits a la pension de reversion.

Defunt : {prenomDefunt} {nomDefunt}, N SS : {nirDefunt}
Survivant : {prenomSurvivant} {nomSurvivant}, N SS : {nirSurvivant}
Date de mariage : {dateMariage}
Situation : non remarie(e), non pacse(e)

Cordialement,
{prenomSurvivant} {nomSurvivant}`,
  },
  cnracl: {
    objet: `Demande de pension de reversion — CNRACL`,
    corps: `Madame, Monsieur,

Suite au deces de mon conjoint {prenomDefunt} {nomDefunt}, agent de la fonction publique territoriale/hospitaliere, survenu le {dateDeces}, je souhaite faire valoir mes droits a la pension de reversion.

Defunt : {prenomDefunt} {nomDefunt}, N SS : {nirDefunt}
Survivant : {prenomSurvivant} {nomSurvivant}, N SS : {nirSurvivant}
Date de mariage : {dateMariage}
Situation : non remarie(e), non pacse(e)

Cordialement,
{prenomSurvivant} {nomSurvivant}`,
  },
  msa_salarie: {
    objet: `Demande de pension de reversion — MSA`,
    corps: `Madame, Monsieur,

Suite au deces de mon conjoint {prenomDefunt} {nomDefunt} (N SS : {nirDefunt}), survenu le {dateDeces}, je souhaite faire valoir mes droits a la pension de reversion au titre du regime MSA.

Survivant : {prenomSurvivant} {nomSurvivant}, N SS : {nirSurvivant}
Date de mariage : {dateMariage}

Cordialement,
{prenomSurvivant} {nomSurvivant}`,
  },
  msa_exploitant: {
    objet: `Demande de pension de reversion — MSA exploitant`,
    corps: `Madame, Monsieur,

Suite au deces de mon conjoint {prenomDefunt} {nomDefunt} (N SS : {nirDefunt}), exploitant agricole, survenu le {dateDeces}, je souhaite faire valoir mes droits a la pension de reversion.

Survivant : {prenomSurvivant} {nomSurvivant}, N SS : {nirSurvivant}
Date de mariage : {dateMariage}

Cordialement,
{prenomSurvivant} {nomSurvivant}`,
  },
  rafp: {
    objet: `Demande de reversion RAFP`,
    corps: `Madame, Monsieur,

Suite au deces de mon conjoint {prenomDefunt} {nomDefunt} (N SS : {nirDefunt}), fonctionnaire, survenu le {dateDeces}, je souhaite faire valoir mes droits a la reversion au titre du RAFP.

Survivant : {prenomSurvivant} {nomSurvivant}, N SS : {nirSurvivant}

Cordialement,
{prenomSurvivant} {nomSurvivant}`,
  },
  ircantec: {
    objet: `Demande de reversion Ircantec`,
    corps: `Madame, Monsieur,

Suite au deces de mon conjoint {prenomDefunt} {nomDefunt} (N SS : {nirDefunt}), survenu le {dateDeces}, je souhaite faire valoir mes droits a la reversion Ircantec.

Survivant : {prenomSurvivant} {nomSurvivant}, N SS : {nirSurvivant}
Date de mariage : {dateMariage}

Cordialement,
{prenomSurvivant} {nomSurvivant}`,
  },
}

const GENERIQUE = {
  objet: `Demande de pension de reversion`,
  corps: `Madame, Monsieur,

Suite au deces de mon conjoint {prenomDefunt} {nomDefunt} (N SS : {nirDefunt}), survenu le {dateDeces}, je souhaite faire valoir mes droits a la pension de reversion.

Survivant : {prenomSurvivant} {nomSurvivant}, N SS : {nirSurvivant}
Date de mariage : {dateMariage}

Cordialement,
{prenomSurvivant} {nomSurvivant}`,
}

function inject(text: string, v: ReversionMessageVars): string {
  return text
    .replace(/\{prenomSurvivant\}/g, v.prenomSurvivant)
    .replace(/\{nomSurvivant\}/g, v.nomSurvivant)
    .replace(/\{nirSurvivant\}/g, v.nirSurvivant)
    .replace(/\{dateNaissanceSurvivant\}/g, v.dateNaissanceSurvivant)
    .replace(/\{prenomDefunt\}/g, v.prenomDefunt)
    .replace(/\{nomDefunt\}/g, v.nomDefunt)
    .replace(/\{nirDefunt\}/g, v.nirDefunt)
    .replace(/\{dateDeces\}/g, v.dateDeces)
    .replace(/\{dateMariage\}/g, v.dateMariage)
}

/**
 * Genere les messages de demande de reversion pour chaque regime eligible.
 */
export function generateReversionMessages(
  regimes: ReversionRegime[],
  vars: ReversionMessageVars,
): GeneratedMessage[] {
  const messages: GeneratedMessage[] = []

  for (const regime of regimes) {
    if (!regime.eligible) continue

    const template = TEMPLATES[regime.regime] || GENERIQUE

    messages.push({
      anomalyId: 'N3_REVERSION_NON_DEMANDEE',
      category: 'demande_reversion',
      channel: 'messagerie_en_ligne',
      organisme: regime.label,
      destinataire: regime.canal,
      objet: inject(template.objet, vars),
      corps: inject(template.corps, vars),
      guideEnvoi: `Connectez-vous sur ${regime.canal} et envoyez votre demande via la messagerie securisee.`,
    })
  }

  return messages
}
