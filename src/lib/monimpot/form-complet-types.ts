// ============================================================
// MONIMPÔT V3 Phase 2 — Types formulaire intelligent (131 cases)
// ============================================================

// ─── SITUATION FAMILIALE ───

export type SituationFamilialeV3 = 'celibataire' | 'marie_pacse' | 'divorce_separe' | 'veuf'

// ─── TYPE DE REVENUS ───

export type TypeRevenusV3 = 'salaire' | 'retraite' | 'independant' | 'sans_revenu'

// ─── DONNÉES FORMULAIRE COMPLET ───

export interface FormComplet {
  // ═══ Étape 1 — Situation personnelle ═══
  situation: SituationFamilialeV3
  vivezSeul: boolean
  ageDeclarant1: number
  ageDeclarant2?: number         // Si couple
  invaliditeD1: boolean
  invaliditeD2: boolean          // Si couple
  ancienCombattant: boolean      // ≥ 75 ans

  // ═══ Étape 2 — Famille ═══
  enfantsMineurs: number
  enfantsGardeAlternee: number   // Parmi les mineurs
  enfantsMajeursRattaches: number
  enfantsHandicapes: number
  personnesInvalidesCharge: number
  eleveSeul5ans: boolean         // Case L
  caseT: boolean                 // Parent isolé

  // ═══ Étape 3 — Revenus du travail ═══
  typeRevenusD1: TypeRevenusV3
  typeRevenusD2?: TypeRevenusV3  // Si couple
  salairesD1: number             // 1AJ
  salairesD2?: number            // 1BJ
  heuresSupExoD1?: number        // 1AP
  heuresSupExoD2?: number        // 1BP
  pensionRetraiteD1?: number     // 1AS
  pensionRetraiteD2?: number     // 1BS
  pensionInvaliditeD1?: number   // 1AZ
  pensionInvaliditeD2?: number   // 1BZ
  rentesViageresD1?: number      // 1AI
  revenusGerant?: number         // 1GB
  impotPayeActuel?: number       // Montant impôt payé (avis ou estimation)

  // ═══ Étape 4 — Frais professionnels ═══
  voitureTravail: boolean
  distanceTravail?: number       // km aller simple
  puissanceFiscale?: number      // 3-7 CV
  joursSurSite?: number          // 1-5 jours/semaine
  transportEnCommun: boolean
  transportMontantAn?: number
  teletravail: boolean
  joursTeletravail?: number      // 1-5 jours/semaine
  repasPayes: boolean
  cantine: boolean               // Si repas payés
  autresFraisProD1?: number      // 1AK (si frais réels manuels)
  autresFraisProD2?: number      // 1BK

  // ═══ Étape 5 — Autres revenus ═══
  // Placements financiers
  aPlacementsFinanciers: boolean
  dividendes?: number            // 2DC
  interets?: number              // 2TR/2TS
  plusValuesMobilieres?: number  // 3VG
  moinsValues?: number           // 3VH
  rachatAssuranceVie?: number    // 2DH/2EE

  // Immobilier locatif
  proprietaireLocatif: boolean
  loyersBrutsAn?: number         // 4BE ou revenus bruts
  chargesLocatives?: number      // 4BA charges (si réel)
  microFoncier?: boolean         // Auto : true si loyers ≤ 15 000€
  deficitsFonciersAnterieurs?: number // 4BD
  locationMeublee: boolean
  locationMeubleeCA?: number     // 5ND/5NP

  // Auto-entrepreneur
  autoEntrepreneur: boolean
  typeAutoEntreprise?: 'vente' | 'services' | 'liberal'
  caAutoEntrepreneur?: number    // 5ND/5NP/5HQ

  // ═══ Étape 6 — Charges déductibles ═══
  pensionAlimentaireVersee: boolean
  pensionAlimentaireMontant?: number  // 6EL annuel
  pensionExConjoint: boolean
  pensionExConjointMontant?: number   // 6GI annuel
  prestationCompensatoire?: number    // 6GU
  perVersements: boolean
  perMontant?: number                 // 6NS
  perMontantD2?: number               // 6NT
  perpMadelin: boolean
  perpMadelinMontant?: number         // 6PS
  perco?: number                      // 6RS
  csgDeductible?: number              // 6DE

  // ═══ Étape 7 — Réductions et crédits ═══
  donsAssociations: boolean
  donsAssociationsMontant?: number    // 7UF
  donsAidePersonnes: boolean
  donsAidePersonnesMontant?: number   // 7UD
  emploiDomicile: boolean
  emploiDomicileMontant?: number      // 7DB
  emploiDomicilePremiereFois?: boolean // 7DQ
  gardeEnfant: boolean
  gardeEnfantMontant?: number         // 7GA (total)
  enfantsCollege?: number             // 7EA nombre
  enfantsLycee?: number               // 7EC nombre
  enfantsSuperieur?: number           // 7EF nombre
  ehpad: boolean
  ehpadMontant?: number               // 7CD
  cotisationsSyndicales?: number      // 7UR
  pretEtudiant?: number               // 7TD

  // ═══ Étape 8 — Investissements ═══
  investPME: boolean
  investPMEMontant?: number           // 7CF
  pinelActif: boolean
  pinelMontant?: number               // 7CQ
  outreMer?: number                   // 7GH
  investForestier?: number            // 7WN
  renovationEnergetique?: number      // 7RN
  borneElectrique: boolean
  borneElectriqueMontant?: number     // 7ZQ

  // ═══ Étape 9 — Situations particulières ═══
  changementSituation: boolean
  revenusEtranger?: number            // 8TK
  compteBancaireEtranger: boolean     // 8UU
  domTom?: boolean                    // Résident DOM-TOM

  // ═══ Étape 10 — Métadonnées ═══
  email: string
  annee: number                       // Année des revenus
  confirmeExactitude: boolean         // Checkbox obligatoire
}

// ─── RÉSULTAT TEMPS RÉEL ───

export interface ResultatTempsReel {
  impotActuel: number
  impotOptimise: number
  economie: number
  optimisationsCount: number
  progression: number              // 0-100%
  etapeActuelle: number
}

// ─── ÉTAPE DU FORMULAIRE ───

export interface EtapeFormulaire {
  numero: number                   // 1-10
  titre: string
  sousTitre: string
  icone: string                    // Emoji
  questionsIds: string[]           // IDs des questions de cette étape
}

export const ETAPES: EtapeFormulaire[] = [
  { numero: 1, titre: 'Votre situation', sousTitre: 'Qui êtes-vous ?', icone: '👤', questionsIds: [] },
  { numero: 2, titre: 'Votre famille', sousTitre: 'Enfants et personnes à charge', icone: '👨‍👩‍👧‍👦', questionsIds: [] },
  { numero: 3, titre: 'Vos revenus', sousTitre: 'Salaires, pensions, retraite', icone: '💰', questionsIds: [] },
  { numero: 4, titre: 'Frais professionnels', sousTitre: 'Transport, télétravail, repas', icone: '🚗', questionsIds: [] },
  { numero: 5, titre: 'Autres revenus', sousTitre: 'Placements, immobilier, indépendant', icone: '🏠', questionsIds: [] },
  { numero: 6, titre: 'Charges déductibles', sousTitre: 'Pensions, PER, épargne retraite', icone: '📉', questionsIds: [] },
  { numero: 7, titre: 'Réductions d\'impôt', sousTitre: 'Dons, emploi domicile, garde', icone: '🎁', questionsIds: [] },
  { numero: 8, titre: 'Investissements', sousTitre: 'PME, Pinel, rénovation', icone: '📈', questionsIds: [] },
  { numero: 9, titre: 'Cas particuliers', sousTitre: 'Étranger, changement familial', icone: '🌍', questionsIds: [] },
  { numero: 10, titre: 'Récapitulatif', sousTitre: 'Vérifiez et confirmez', icone: '✅', questionsIds: [] },
]

// ─── VALEURS PAR DÉFAUT ───

export function defaultFormComplet(): Partial<FormComplet> {
  return {
    situation: 'celibataire',
    vivezSeul: false,
    ageDeclarant1: 35,
    invaliditeD1: false,
    invaliditeD2: false,
    ancienCombattant: false,
    enfantsMineurs: 0,
    enfantsGardeAlternee: 0,
    enfantsMajeursRattaches: 0,
    enfantsHandicapes: 0,
    personnesInvalidesCharge: 0,
    eleveSeul5ans: false,
    caseT: false,
    typeRevenusD1: 'salaire',
    salairesD1: 0,
    voitureTravail: false,
    transportEnCommun: false,
    teletravail: false,
    repasPayes: false,
    cantine: false,
    aPlacementsFinanciers: false,
    proprietaireLocatif: false,
    locationMeublee: false,
    autoEntrepreneur: false,
    pensionAlimentaireVersee: false,
    pensionExConjoint: false,
    perVersements: false,
    perpMadelin: false,
    donsAssociations: false,
    donsAidePersonnes: false,
    emploiDomicile: false,
    gardeEnfant: false,
    ehpad: false,
    investPME: false,
    pinelActif: false,
    borneElectrique: false,
    changementSituation: false,
    compteBancaireEtranger: false,
    domTom: false,
    annee: new Date().getFullYear() - 1,
    confirmeExactitude: false,
  }
}
