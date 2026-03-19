// ============================================================
// RETRAITIA V2 — Prompts Claude pour extraction
// ============================================================

import type { DocumentType } from '../types'

interface ExtractionPrompt {
  system: string
  buildUserMessage: (text: string) => string
}

const PROMPT_RIS: ExtractionPrompt = {
  system: `Tu es un extracteur de données spécialisé dans les Relevés Individuels de Situation (RIS) de retraite français.
RÈGLES :
- Renvoie UNIQUEMENT du JSON, aucun texte avant ou après, pas de backticks
- Ne déduis RIEN : si une donnée n'est pas dans le texte, mets null
- Les montants sont en euros avec 2 décimales
- Les trimestres sont des entiers (max 4 par an par régime)`,
  buildUserMessage: (text) => `Extrais les données de ce RIS en JSON :
{"carriere":[{"annee":number,"regime":string,"trimestresValides":number,"trimestresCotises":number,"salaire":number|null}],"totalTrimestresValides":number,"totalTrimestresCotises":number,"regimesPresents":[string],"premiereAnnee":number,"derniereAnnee":number}

Texte :
${text.substring(0, 12000)}`,
}

const PROMPT_NOTIFICATION: ExtractionPrompt = {
  system: `Tu es un extracteur de données spécialisé dans les notifications de pension de retraite françaises (CARSAT / régime général).
RÈGLES :
- Renvoie UNIQUEMENT du JSON, aucun texte, pas de backticks
- Ne déduis RIEN : si absent, mets null`,
  buildUserMessage: (text) => `Extrais les données de cette notification en JSON :
{"montantMensuelBrut":number,"montantMensuelNet":number|null,"sam":number|null,"taux":number,"trimestresRetenus":number,"trimestresRequis":number,"proratisation":number|null,"majorationEnfants":boolean,"majorationEnfantsMontant":number|null,"decote":boolean,"decoteTrimestres":number|null,"surcote":boolean,"surcoteTrimestres":number|null,"minimumContributif":boolean,"dateEffet":string|null,"tauxCSG":number|null}

Texte :
${text.substring(0, 8000)}`,
}

const PROMPT_AGIRC_ARRCO: ExtractionPrompt = {
  system: `Tu es un extracteur de données spécialisé dans les relevés de points Agirc-Arrco.
RÈGLES :
- Renvoie UNIQUEMENT du JSON, pas de backticks
- Points = nombres décimaux possibles`,
  buildUserMessage: (text) => `Extrais les données de ce relevé Agirc-Arrco en JSON :
{"pointsParAnnee":[{"annee":number,"points":number,"type":"cotises"|"gratuits"|"gmp"}],"totalPoints":number,"pensionAnnuelle":number|null,"majorationEnfants":boolean,"malus":boolean}

Texte :
${text.substring(0, 10000)}`,
}

const PROMPT_AVIS: ExtractionPrompt = {
  system: `Tu es un extracteur de données spécialisé dans les avis d'imposition français.
RÈGLES : JSON uniquement, pas de backticks.`,
  buildUserMessage: (text) => `Extrais : {"annee":number,"rfr":number,"nombreParts":number,"impotNet":number,"creditImpotEmploiDomicile":number|null}

Texte :
${text.substring(0, 6000)}`,
}

export const EXTRACTION_PROMPTS: Partial<Record<DocumentType, ExtractionPrompt>> = {
  ris: PROMPT_RIS,
  notification_cnav: PROMPT_NOTIFICATION,
  releve_agirc_arrco: PROMPT_AGIRC_ARRCO,
  avis_imposition: PROMPT_AVIS,
}
