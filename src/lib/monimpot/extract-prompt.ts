// ============================================================
// MONIMPÔT V2 — Prompts d'extraction d'avis d'imposition
// ============================================================

const COMMON_EXTRACTION_RULES = `
DONNÉES À EXTRAIRE :

1. IDENTITÉ FISCALE
- annee : Année des revenus (dans le titre "IMPÔT SUR LE REVENU 20XX" ou "REVENUS DE L'ANNÉE 20XX")
- numeroFiscal : Numéro fiscal du déclarant (13 chiffres, format XX XX XXX XXX XXX)
- numeroAvis : Numéro d'avis d'imposition
- adresseCentre : Adresse complète du Service des Impôts des Particuliers (SIP)

2. SITUATION FAMILIALE
- situationFamiliale : M (marié), C (célibataire), D (divorcé), V (veuf), O (pacsé)
- nbPartsDeclarees : Nombre de parts fiscales
- nbPersonnesCharge : Nombre de personnes à charge
- caseT : La case T (parent isolé) est-elle cochée ? true/false
- caseL : La case L (ancien parent isolé) est-elle cochée ? true/false

3. REVENUS — LECTURE TRÈS ATTENTIVE REQUISE
⚠️ RÈGLE CRITIQUE : Le RFR et le RNI sont DEUX lignes DISTINCTES sur l'avis. Tu DOIS les chercher activement.

- revenuBrutGlobal : Revenu brut global (somme des revenus avant abattements/charges)
- revenuNetImposable : Revenu net imposable (APRÈS abattement 10% ou frais réels, APRÈS charges déductibles). C'est TOUJOURS ≤ revenuBrutGlobal. Si tu ne trouves pas de ligne "Revenu net imposable", calcule : revenuBrutGlobal × 0.9 (abattement 10%)
- rfr : Revenu Fiscal de Référence. Cherche la ligne exacte "REVENU FISCAL DE RÉFÉRENCE" (souvent en MAJUSCULES et en GRAS). Le RFR est TOUJOURS ≥ revenuNetImposable. Si tu ne trouves pas cette ligne, mets rfr = revenuNetImposable comme approximation, mais JAMAIS 0.

- salairesTraitements : Salaires déclarant 1 (case 1AJ uniquement, PAS la somme des 2 déclarants)
- salairesDeclarant2 : Salaires déclarant 2 (case 1BJ) — 0 si célibataire
- pensionsRetraite : Pensions déclarant 1 (case 1AS)
- pensionsDeclarant2 : Pensions déclarant 2 (case 1BS) — 0 si célibataire
- revenusCapitaux : Revenus de capitaux mobiliers (dividendes, intérêts)
- revenusFonciers : Revenus fonciers NETS (case 4BA après déduction charges, ou micro-foncier 4BE)
- revenusFonciersBruts : Revenus fonciers bruts (loyers encaissés avant charges)
- microFoncier : true si régime micro-foncier (loyers < 15 000€, abattement 30%)
- plusValues : Plus-values mobilières ou immobilières taxables
- microBIC : Chiffre d'affaires micro-BIC (cases 5ND, 5KO, etc.)
- microBNC : Recettes micro-BNC (cases 5HQ, 5KP, etc.)
- deficitsFonciers : Déficits fonciers reportables (case 4BD ou mentions en page 2)

4. IMPÔT — DISTINCTION CRUCIALE ENTRE 3 MONTANTS
⚠️ L'avis contient 3 montants différents pour l'impôt. NE PAS les confondre :

A) IMPÔT NET (impotNet) = impôt annuel dû pour l'année
   Calcul : impôt brut - décote - réductions - crédits
   → Toujours POSITIF ou 0. C'est le "vrai" impôt.

B) PRÉLÈVEMENT À LA SOURCE (prelevementSource) = ce qui a DÉJÀ ÉTÉ PAYÉ
   → Ligne "Prélèvement à la source déjà versé" ou "Retenue à la source"

C) SOLDE (soldeAPayer) = impotNet - prelevementSource
   → Positif = "MONTANT RESTANT À PAYER"
   → Négatif = "MONTANT DE VOTRE RESTITUTION" (remboursement)

EXEMPLE CONCRET :
  Impôt brut: 1 550 €, Décote: -350 €
  → IMPÔT NET = 1 200 € (impotNet = 1200)
  Prélèvement à la source: 1 100 € (prelevementSource = 1100)
  → MONTANT RESTANT À PAYER = 100 € (soldeAPayer = 100)

AUTRE EXEMPLE (restitution) :
  IMPÔT NET = 3 500 € (impotNet = 3500)
  Prélèvement à la source: 6 200 € (prelevementSource = 6200)
  → RESTITUTION = +2 700 € (soldeAPayer = -2700)

- impotBrut : Impôt brut (barème progressif, avant décote et réductions)
- decotePlafonnement : Montant de la décote ou plafonnement QF
- totalReductionsCredits : Total des réductions ET crédits d'impôt
- impotNetAvantCredits : Impôt net avant crédits d'impôt
- impotNet : IMPÔT ANNUEL DÛ. Toujours POSITIF ou 0.
- prelevementSource : Montant du prélèvement à la source DÉJÀ PAYÉ. Cherche "Prélèvement à la source déjà versé". Si absent, mets 0.
- soldeAPayer : SOLDE FINAL = impotNet - prelevementSource. Négatif si restitution. Cherche "MONTANT RESTANT À PAYER" (positif) ou "MONTANT DE VOTRE RESTITUTION" (négatif).

5. CASES RENSEIGNÉES (CRUCIAL pour détecter les optimisations)
- fraisReels1AK : Frais réels (case 1AK) — 0 si abattement forfaitaire 10%
- pensionVersee6EL : Pension alimentaire versée (case 6EL)
- dons7UF : Dons associations intérêt général (case 7UF)
- dons7UD : Dons aide aux personnes (case 7UD, réduction 75%)
- emploiDomicile7DB : Emploi salarié à domicile (case 7DB)
- gardeEnfant7GA : Frais de garde enfant < 6 ans (case 7GA)
- ehpad7CD : Hébergement EHPAD (case 7CD)
- per6NS : Versements PER (case 6NS)
- case2OP : Option barème progressif (case 2OP) — true/false
- investPME7CF : Investissement PME (case 7CF)

RÈGLES FINALES :
- impotNet est TOUJOURS ≥ 0
- soldeAPayer peut être négatif (restitution)
- rfr est TOUJOURS > 0 si le contribuable a des revenus. JAMAIS 0 sauf si revenus = 0.
- revenuNetImposable est TOUJOURS ≤ revenuBrutGlobal
- Si une case n'est pas mentionnée → mettre 0 ou false
- Anonymiser le NOM du contribuable → "[CONTRIBUABLE]"
- Conserver le numéro fiscal et l'adresse du centre
- Pour un COUPLE : mettre dans salairesTraitements UNIQUEMENT le salaire déclarant 1 (1AJ), et salairesDeclarant2 = salaire déclarant 2 (1BJ)
- Pour les revenus fonciers : distinguer le net (4BA) et le brut si visible
- Pour micro-BIC/BNC : extraire le CA/recettes, pas le résultat après abattement`

const JSON_TEMPLATE = `{
  "annee": 2024,
  "numeroFiscal": "XX XX XXX XXX XXX",
  "numeroAvis": "...",
  "adresseCentre": "SIP de ...",
  "situationFamiliale": "C",
  "nbPartsDeclarees": 1,
  "nbPersonnesCharge": 0,
  "caseT": false,
  "caseL": false,
  "revenuBrutGlobal": 0,
  "revenuNetImposable": 0,
  "rfr": 0,
  "impotBrut": 0,
  "decotePlafonnement": 0,
  "totalReductionsCredits": 0,
  "impotNetAvantCredits": 0,
  "impotNet": 0,
  "prelevementSource": 0,
  "soldeAPayer": 0,
  "salairesTraitements": 0,
  "salairesDeclarant2": 0,
  "pensionsRetraite": 0,
  "pensionsDeclarant2": 0,
  "revenusCapitaux": 0,
  "revenusFonciers": 0,
  "revenusFonciersBruts": 0,
  "microFoncier": false,
  "plusValues": 0,
  "microBIC": 0,
  "microBNC": 0,
  "deficitsFonciers": 0,
  "casesRenseignees": {
    "fraisReels1AK": 0,
    "pensionVersee6EL": 0,
    "dons7UF": 0,
    "dons7UD": 0,
    "emploiDomicile7DB": 0,
    "gardeEnfant7GA": 0,
    "ehpad7CD": 0,
    "per6NS": 0,
    "case2OP": false,
    "investPME7CF": 0
  },
  "confidence": 85,
  "warnings": []
}`

export const extractOCRSystemPrompt = `Tu es un expert en fiscalité française. Tu reçois le texte OCR d'un avis d'imposition sur les revenus émis par la Direction Générale des Finances Publiques (DGFiP).

Ta mission : extraire TOUTES les informations fiscales structurées de cet avis.
${COMMON_EXTRACTION_RULES}

Réponds UNIQUEMENT en JSON strict :
${JSON_TEMPLATE}`

export const extractVisionSystemPrompt = `Tu es un expert en fiscalité française. Tu reçois les IMAGES d'un avis d'imposition sur les revenus émis par la Direction Générale des Finances Publiques (DGFiP).

Ta mission : lire visuellement chaque page de l'avis et extraire TOUTES les informations fiscales structurées.
${COMMON_EXTRACTION_RULES}

CONSEILS VISION :
- Page 1 : identité, situation familiale, n° fiscal, adresse SIP
- Page 1 (bas) : RFR (souvent en bas de page, en gras), résumé impôt/solde
- Page 2+ : détail des revenus, cases renseignées, réductions/crédits
- Si couple : chercher les lignes 1BJ, 1BS (déclarant 2)
- Revenus fonciers : chercher lignes 4BA, 4BE, 4BD
- Micro-BIC/BNC : chercher cases 5ND, 5KO, 5HQ, 5KP

Réponds UNIQUEMENT en JSON strict :
${JSON_TEMPLATE}`

// ─── Builders de messages ───

export function buildOCRExtractionMessage(
  docs: Array<{ fileName: string; ocrText: string; pageCount: number }>
): string {
  const docTexts = docs.map((d, i) =>
    `=== AVIS D'IMPOSITION ${i + 1} : ${d.fileName} (${d.pageCount} page${d.pageCount > 1 ? 's' : ''}) ===\n${d.ocrText}`
  ).join('\n\n')

  return `Voici le texte OCR extrait d'un avis d'imposition français :

${docTexts}

Extrais TOUTES les informations fiscales. Porte une attention particulière :
1. Au numéro fiscal et à l'adresse du centre des impôts
2. Aux cases renseignées (frais réels, dons, emploi domicile, etc.)
3. ⚠️ REVENU FISCAL DE RÉFÉRENCE (rfr) : cherche la ligne exacte. Il vaut TOUJOURS > 0 si le contribuable a des revenus. NE METS JAMAIS rfr=0 sauf revenus nuls.
4. ⚠️ REVENU NET IMPOSABLE (revenuNetImposable) : c'est APRÈS abattement 10%. Toujours ≤ revenuBrutGlobal.
5. ⚠️ DISTINGUER les 3 montants d'impôt :
   - impotNet = impôt annuel dû (POSITIF)
   - prelevementSource = déjà payé (cherche "Prélèvement à la source déjà versé")
   - soldeAPayer = impotNet - prelevementSource (négatif si restitution)
6. Si COUPLE : salairesTraitements = UNIQUEMENT déclarant 1 (1AJ). Mettre déclarant 2 dans salairesDeclarant2 (1BJ).
7. Revenus fonciers (4BA/4BE), micro-BIC/BNC (5ND/5KO/5HQ/5KP), plus-values
8. Déficits fonciers reportables (4BD)

Réponds en JSON strict.`
}

export function buildVisionExtractionMessage(fileNames: string[]): string {
  return `Voici les images d'un avis d'imposition français (${fileNames.join(', ')}).

Lis visuellement CHAQUE page et extrais TOUTES les informations fiscales. Attention particulière :
1. Page 1 : identité, situation familiale, numéro fiscal, adresse SIP
2. Pages suivantes : détail des revenus, cases renseignées, réductions/crédits
3. ⚠️ RFR : cherche "REVENU FISCAL DE RÉFÉRENCE" (souvent en gras, bas de page 1 ou haut page 2). TOUJOURS > 0. JAMAIS 0.
4. ⚠️ RNI : "Revenu net imposable" est APRÈS abattement 10%. Toujours ≤ revenuBrutGlobal.
5. ⚠️ DISTINGUER impotNet (dû) / prelevementSource (déjà payé) / soldeAPayer (reste ou restitution)
6. Si COUPLE : salairesTraitements = 1AJ seul, salairesDeclarant2 = 1BJ
7. Revenus fonciers, micro-BIC/BNC, plus-values, déficits fonciers

Réponds en JSON strict.`
}
