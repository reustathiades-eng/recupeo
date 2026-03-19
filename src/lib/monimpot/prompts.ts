// ============================================================
// MONIMPÔT V2 — Prompts IA (rapport + guide correction + réclamation)
// ============================================================

import type { MonimpotFormData, Optimisation } from './types'
import type { MonimpotCalculations } from './calculations'
import type { AvisImpositionExtracted } from './extract-types'

export function buildFullReportPrompt(
  data: MonimpotFormData,
  calc: MonimpotCalculations,
  optimisations: Optimisation[],
  extraction?: AvisImpositionExtracted,
  multiAvis?: AvisImpositionExtracted[]
): string {
  const extractionBlock = extraction ? `
DONNÉES EXTRAITES DE L'AVIS D'IMPOSITION (${extraction.annee}) :
- RFR réel : ${extraction.rfr}€
- Revenu brut global : ${extraction.revenuBrutGlobal}€
- Impôt brut : ${extraction.impotBrut}€
- Réductions/crédits appliqués : ${extraction.totalReductionsCredits}€
- Salaires déclarés (1AJ) : ${extraction.salairesTraitements || 'N/A'}€
- Pensions déclarées (1AS) : ${extraction.pensionsRetraite || 'N/A'}€
- Cases renseignées : ${Object.entries(extraction.casesRenseignees)
    .filter(([, v]) => v !== 0 && v !== false && v !== undefined)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ') || 'aucune'}
- Cases VIDES (optimisations potentielles) : ${Object.entries(extraction.casesRenseignees)
    .filter(([k, v]) => (v === 0 || v === false || v === undefined) && k !== 'case2OP')
    .map(([k]) => k)
    .join(', ') || 'aucune'}` : ''

  const multiAvisBlock = multiAvis && multiAvis.length > 1 ? `
COMPARAISON MULTI-ANNÉES :
${multiAvis.map(a => `- ${a.annee} : RFR ${a.rfr}€, impôt net ${a.impotNet}€, ${a.nbPartsDeclarees} parts`).join('\n')}
CASES PERDUES (renseignées une année, absentes la suivante) :
${detectCasesPerduees(multiAvis)}` : ''

  return `Tu es un expert-comptable fiscaliste français. Rédige un rapport d'audit fiscal complet pour ce contribuable.

PROFIL DU CONTRIBUABLE :
- Situation : ${data.situation}, ${data.vivezSeul ? 'vit seul(e)' : 'en couple'}
- Enfants mineurs : ${data.enfantsMineurs}, majeurs rattachés : ${data.enfantsMajeurs}
- Âge : ${data.age} ans ${data.invalidite ? '(invalidité reconnue)' : ''}
- A élevé seul un enfant 5 ans+ : ${data.eleveSeul5ans ? 'oui' : 'non'}
- Type de revenus : ${data.typeRevenus}
- Revenu net imposable : ${data.revenuNetImposable}€
- Parts déclarées : ${data.nbParts}
- Impôt payé : ${data.impotPaye}€
${extractionBlock}${multiAvisBlock}

CALCULS PRÉLIMINAIRES :
- Parts théoriques : ${calc.partsTheoriques}
- Frais réels estimés : ${calc.fraisReelsEstimes}€ (abattement 10% : ${calc.abattement10pct}€)
- Impôt théorique optimisé : ${calc.impotOptimise}€
- Économie annuelle estimée : ${calc.economieAnnuelle}€

OPTIMISATIONS DÉTECTÉES (${optimisations.length}) :
${optimisations.map(o => `- ${o.type} : ${o.label} — économie ${o.economie}€ — case ${o.caseConcernee || 'N/A'}`).join('\n')}

RÉDIGE en JSON :
{
  "rapport": {
    "synthese": "Résumé exécutif (3-4 phrases). Si données extraites, mentionner que l'analyse est basée sur l'avis réel.",
    "analyse_par_poste": [
      {
        "poste": "Nom du poste (frais réels, QF, dons, etc.)",
        "situation_actuelle": "Ce que le contribuable a déclaré",
        "situation_optimisee": "Ce qu'il devrait déclarer",
        "economie": number,
        "case_a_modifier": "1AK, T, 7UF...",
        "reference_cgi": "Article du CGI"
      }
    ],
    "comparaison_annuelle": ${multiAvis && multiAvis.length > 1 ? '"Analyse de l\'évolution et des cases perdues"' : 'null'},
    "impot_actuel": ${data.impotPaye},
    "impot_optimise": ${calc.impotOptimise},
    "economie_totale": ${calc.economieAnnuelle},
    "recommandations": ["Action 1", "Action 2", ...]
  }
}

STYLE : professionnel, pédagogique, sans jargon excessif.
DISCLAIMER obligatoire : "Cette analyse est un outil d'aide. Elle ne constitue pas un conseil fiscal personnalisé."
RÉPONDS EN JSON UNIQUEMENT.`
}

export function buildCorrectionGuidePrompt(
  data: MonimpotFormData,
  optimisations: Optimisation[],
  extraction?: AvisImpositionExtracted
): string {
  const casesBlock = extraction ? `
CASES EXACTES À MODIFIER (extraites de l'avis ${extraction.annee}) :
${optimisations.filter(o => o.caseConcernee).map(o => `- Case ${o.caseConcernee} : ${o.label} — montant à saisir : ${o.economie > 0 ? 'voir détail' : '0'}`).join('\n')}` : ''

  // O6 — Injecter la date pour adapter le conseil correction en ligne
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const year = now.getFullYear()
  const correctionEnLigneOuverte = month >= 8 && month <= 12
  const periodeInfo = correctionEnLigneOuverte
    ? `IMPORTANT — Nous sommes en ${month}/${year} : la correction en ligne est ACTUELLEMENT OUVERTE sur impots.gouv.fr. Le contribuable peut corriger directement.`
    : `IMPORTANT — Nous sommes en ${month}/${year} : la correction en ligne est FERMÉE (ouverte seulement d'août à décembre). Le contribuable doit faire une réclamation contentieuse par courrier ou messagerie sécurisée.`

  return `Tu es un expert-comptable. Rédige un guide CONCRET de correction de déclaration de revenus.

${periodeInfo}

OPTIMISATIONS À APPLIQUER :
${optimisations.map(o => `- ${o.type} : ${o.label} — case ${o.caseConcernee || 'N/A'} — économie ${o.economie}€`).join('\n')}
${casesBlock}

SITUATION : ${data.situation}, revenu ${data.revenuNetImposable}€, impôt payé ${data.impotPaye}€

RÉDIGE en JSON :
{
  "guide_correction_en_ligne": {
    "etapes": [
      {
        "numero": 1,
        "titre": "Connexion à l'espace particulier",
        "instruction": "Allez sur impots.gouv.fr → Espace particulier → Identifiez-vous avec votre numéro fiscal et mot de passe",
        "case": null
      },
      {
        "numero": 2,
        "titre": "Accéder à la correction",
        "instruction": "Cliquez sur 'Corriger ma déclaration' dans le menu 'Déclarer'",
        "case": null
      },
      {
        "numero": 3,
        "titre": "Pour chaque optimisation, indiquer la case EXACTE, le montant EXACT à saisir, et l'étape de la déclaration en ligne",
        "instruction": "...",
        "case": "1AK"
      }
    ],
    "url": "https://www.impots.gouv.fr/particulier",
    "delai_correction": "La correction en ligne est généralement ouverte de début août à mi-décembre. Hors période : réclamation contentieuse."
  },
  "reclamation_contentieuse": {
    "modele": "Texte complet de la réclamation (LRAR) — avec objet, exposé des erreurs, calcul du dégrèvement demandé, articles CGI cités",
    "destinataire": "Service des Impôts des Particuliers",
    "pieces_jointes": ["Copie de l'avis d'imposition", "Justificatifs des déductions/réductions", "Calcul détaillé du trop-versé"]
  },
  "calendrier": [
    { "action": "Corriger en ligne (si ouvert)", "delai": "Immédiat" },
    { "action": "Réclamation contentieuse (si hors délai)", "delai": "Avant le 31/12/N+2" }
  ]
}

IMPORTANT :
- Le guide doit être utilisable par un non-initié
- Chaque étape doit mentionner la case exacte (1AK, 7UF, T, etc.) et le montant à saisir
- La réclamation doit être complète et prête à envoyer

RÉPONDS EN JSON UNIQUEMENT.`
}

export function buildReclamationPrompt(
  data: MonimpotFormData,
  optimisations: Optimisation[],
  sensitiveData: { numeroFiscal?: string; numeroAvis?: string; adresseCentre?: string },
  extraction?: AvisImpositionExtracted
): string {
  return `Tu es un avocat fiscaliste. Rédige une réclamation contentieuse COMPLÈTE et PRÊTE À ENVOYER.

CONTRIBUABLE :
- Situation : ${data.situation}
- Revenu net imposable : ${data.revenuNetImposable}€
- Impôt payé : ${data.impotPaye}€
- Numéro fiscal : ${sensitiveData.numeroFiscal || '[À COMPLÉTER]'}
- Numéro d'avis : ${sensitiveData.numeroAvis || '[À COMPLÉTER]'}
- Année des revenus : ${extraction?.annee || 'N'}

DESTINATAIRE :
${sensitiveData.adresseCentre || 'Service des Impôts des Particuliers de [VOTRE VILLE]'}

OPTIMISATIONS MANQUÉES (objet de la réclamation) :
${optimisations.map(o => `- ${o.type} : ${o.label} — case ${o.caseConcernee || 'N/A'} — économie ${o.economie}€ — ${o.description}`).join('\n')}

ÉCONOMIE TOTALE DEMANDÉE : ${optimisations.reduce((s, o) => s + o.economie, 0)}€

RÉDIGE la réclamation en JSON :
{
  "objet": "Réclamation contentieuse — Demande de dégrèvement — Impôt sur le revenu ${extraction?.annee || 'N'}",
  "expediteur": {
    "nom": "[NOM PRÉNOM]",
    "adresse": "[ADRESSE]",
    "numero_fiscal": "${sensitiveData.numeroFiscal || '[N° FISCAL]'}",
    "numero_avis": "${sensitiveData.numeroAvis || '[N° AVIS]'}"
  },
  "destinataire": "${sensitiveData.adresseCentre || 'Service des Impôts des Particuliers'}",
  "corps": "Texte COMPLET de la réclamation : formule d'appel, exposé des faits (chaque erreur/oubli avec case, montant, article CGI), calcul du dégrèvement demandé, demande formelle, formule de politesse. Le texte doit faire 1 à 2 pages.",
  "pieces_jointes": ["Liste des pièces à joindre"],
  "envoi": "Recommandé avec accusé de réception (LRAR)"
}

STYLE : formel, juridique, précis. Citer les articles du CGI (art. 156, 199 quater C, 200, etc.).
RÉPONDS EN JSON UNIQUEMENT.`
}

// ─── Helper : détection cases perdues pour le prompt ───
function detectCasesPerduees(avis: AvisImpositionExtracted[]): string {
  const sorted = [...avis].sort((a, b) => b.annee - a.annee)
  const lines: string[] = []

  const LABELS: Record<string, string> = {
    fraisReels1AK: 'Frais réels (1AK)',
    pensionVersee6EL: 'Pension alimentaire (6EL)',
    dons7UF: 'Dons (7UF)',
    emploiDomicile7DB: 'Emploi domicile (7DB)',
    gardeEnfant7GA: 'Garde enfant (7GA)',
    ehpad7CD: 'EHPAD (7CD)',
    per6NS: 'PER (6NS)',
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    for (const [key, label] of Object.entries(LABELS)) {
      const valR = (sorted[i].casesRenseignees as Record<string, unknown>)[key]
      const valP = (sorted[i + 1].casesRenseignees as Record<string, unknown>)[key]
      const rVide = valR === undefined || valR === 0 || valR === null
      const pRempli = valP !== undefined && valP !== 0 && valP !== null
      if (rVide && pRempli) {
        lines.push(`- ${label} : ${typeof valP === 'number' ? valP + '€' : 'déclaré'} en ${sorted[i + 1].annee}, ABSENT en ${sorted[i].annee}`)
      }
    }
  }

  return lines.length > 0 ? lines.join('\n') : 'Aucune case perdue détectée'
}
