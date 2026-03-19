// ============================================================
// MONIMPÔT V2 — Types extraction avis d'imposition
// ============================================================

export interface AvisImpositionExtracted {
  // Identité fiscale
  annee: number                       // Année des revenus (ex: 2025)
  numeroFiscal?: string               // N° fiscal (13 chiffres)
  numeroAvis?: string                 // N° d'avis
  adresseCentre?: string              // Adresse du centre des impôts (pour réclamation)

  // Situation familiale
  situationFamiliale: string          // M, C, D, V, O
  nbPartsDeclarees: number            // Nombre de parts
  nbPersonnesCharge: number           // Nombre de personnes à charge
  caseT: boolean                      // Parent isolé coché
  caseL: boolean                      // Ancien parent isolé coché

  // Revenus
  revenuBrutGlobal: number
  revenuNetImposable: number
  rfr: number                         // Revenu Fiscal de Référence

  // Impôt — DISTINCTION CRUCIALE
  impotBrut: number                   // Impôt brut (barème progressif)
  decotePlafonnement?: number         // Décote ou plafonnement QF
  totalReductionsCredits: number      // Total réductions + crédits d'impôt
  impotNetAvantCredits: number        // Impôt net avant crédits
  impotNet: number                    // ⚠️ IMPÔT ANNUEL DÛ (après réductions et crédits, AVANT prélèvement à la source)
  prelevementSource?: number          // Montant déjà prélevé à la source dans l'année
  soldeAPayer: number                 // SOLDE : positif = reste à payer, négatif = RESTITUTION

  // Revenus détaillés
  salairesTraitements?: number        // Case 1AJ (déclarant 1)
  salairesDeclarant2?: number         // Case 1BJ (déclarant 2, couple)
  pensionsRetraite?: number           // Case 1AS (déclarant 1)
  pensionsDeclarant2?: number         // Case 1BS (déclarant 2, couple)
  revenusCapitaux?: number            // Revenus de capitaux mobiliers

  // O4 — Revenus complexes
  revenusFonciers?: number            // Revenus fonciers nets (case 4BA ou micro-foncier 4BE)
  revenusFonciersBruts?: number       // Revenus fonciers bruts (avant abattement)
  microFoncier?: boolean              // Régime micro-foncier (< 15 000€)
  plusValues?: number                 // Plus-values mobilières ou immobilières
  microBIC?: number                   // Micro-BIC : chiffre d'affaires (case 5ND/5KO)
  microBNC?: number                   // Micro-BNC : recettes (case 5HQ/5KP)
  deficitsFonciers?: number           // Déficits fonciers reportables

  // Cases déjà cochées / renseignées (GAME CHANGER)
  casesRenseignees: {
    fraisReels1AK?: number            // Frais réels déclarés (0 = abattement 10%)
    pensionVersee6EL?: number         // Pension alimentaire versée
    dons7UF?: number                  // Dons associations intérêt général
    dons7UD?: number                  // Dons aide aux personnes (75%)
    emploiDomicile7DB?: number        // Emploi salarié à domicile
    gardeEnfant7GA?: number           // Frais de garde < 6 ans
    ehpad7CD?: number                 // Hébergement EHPAD
    per6NS?: number                   // Versements PER
    case2OP: boolean                  // Option barème progressif
    investPME7CF?: number             // Investissement PME
  }

  // Métadonnées extraction
  confidence: number                  // 0-100
  warnings: string[]                  // Champs incertains
}

export interface MonimpotExtractResponse {
  success: boolean
  extraction: AvisImpositionExtracted
  casesVides: string[]                // Cases non renseignées = pistes d'optimisation
  questionsComplementaires: string[]  // Questions à poser à l'utilisateur
  error?: string
}

// Pour multi-avis (3 ans)
export interface MultiAvisData {
  avis: AvisImpositionExtracted[]
  comparaison?: {
    casesPerduees: Array<{ annee: number; case_: string; description: string }>
    evolution: { annee: number; impot: number; rfr: number }[]
  }
}
