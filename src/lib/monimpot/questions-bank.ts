// ============================================================
// MONIMPÔT V3 Phase 2 — Banque de questions adaptatives
// 65 questions en français simple, conditions d'affichage
// ============================================================

import type { FormComplet } from './form-complet-types'

// ─── TYPES ───

export type QuestionType = 'oui_non' | 'montant' | 'choix' | 'nombre' | 'distance'

export interface FormQuestion {
  id: string
  etape: number
  caseFiscale: string[]
  question: string
  aide: string
  type: QuestionType
  field: keyof FormComplet        // Champ du FormComplet à remplir
  options?: { label: string; value: string }[]
  min?: number
  max?: number
  unite?: string
  conditionAffichage: (data: Partial<FormComplet>) => boolean
  sousQuestions?: string[]        // IDs des sous-questions conditionnelles
  infobox?: string
  placeholder?: string
  required?: boolean
}

// ─── Helper : est-ce un couple ? ───
const isCouple = (d: Partial<FormComplet>) => d.situation === 'marie_pacse'
const isSalarie = (d: Partial<FormComplet>) => d.typeRevenusD1 === 'salaire'
const isRetraite = (d: Partial<FormComplet>) => d.typeRevenusD1 === 'retraite'
const hasEnfants = (d: Partial<FormComplet>) => (d.enfantsMineurs || 0) > 0
const isDivorceSepare = (d: Partial<FormComplet>) => d.situation === 'divorce_separe' || d.situation === 'veuf'
const hasEnfantsOuMajeurs = (d: Partial<FormComplet>) => (d.enfantsMineurs || 0) > 0 || (d.enfantsMajeursRattaches || 0) > 0

// ─── BANQUE DE QUESTIONS ───

export const QUESTIONS_BANK: FormQuestion[] = [

  // ═══════════════════════════════════════════
  // ÉTAPE 1 — SITUATION PERSONNELLE (7 questions)
  // ═══════════════════════════════════════════

  {
    id: 'situation',
    etape: 1,
    caseFiscale: [],
    question: 'Quelle est votre situation familiale ?',
    aide: 'Votre situation au 1er janvier de l\'année d\'imposition.',
    type: 'choix',
    field: 'situation',
    options: [
      { label: 'Célibataire', value: 'celibataire' },
      { label: 'Marié(e) ou pacsé(e)', value: 'marie_pacse' },
      { label: 'Divorcé(e) ou séparé(e)', value: 'divorce_separe' },
      { label: 'Veuf / Veuve', value: 'veuf' },
    ],
    conditionAffichage: () => true,
  },
  {
    id: 'age_d1',
    etape: 1,
    caseFiscale: [],
    question: 'Quel est votre âge ?',
    aide: 'Votre âge au 1er janvier. Si vous avez 65 ans ou plus, un abattement spécial peut s\'appliquer.',
    type: 'nombre',
    field: 'ageDeclarant1',
    min: 16, max: 110, unite: 'ans',
    conditionAffichage: () => true,
  },
  {
    id: 'age_d2',
    etape: 1,
    caseFiscale: [],
    question: 'Quel est l\'âge de votre conjoint(e) ?',
    aide: 'L\'âge de votre conjoint(e) au 1er janvier.',
    type: 'nombre',
    field: 'ageDeclarant2',
    min: 16, max: 110, unite: 'ans',
    conditionAffichage: isCouple,
  },
  {
    id: 'vivez_seul',
    etape: 1,
    caseFiscale: ['T'],
    question: 'Vivez-vous seul(e) ?',
    aide: 'Sans concubin(e), sans vie maritale, au 1er janvier de l\'année.',
    type: 'oui_non',
    field: 'vivezSeul',
    conditionAffichage: (d) => !isCouple(d),
  },
  {
    id: 'invalidite_d1',
    etape: 1,
    caseFiscale: ['P'],
    question: 'Êtes-vous titulaire d\'une carte d\'invalidité (ou carte mobilité inclusion) ?',
    aide: 'Donne droit à une demi-part supplémentaire.',
    type: 'oui_non',
    field: 'invaliditeD1',
    conditionAffichage: () => true,
  },
  {
    id: 'invalidite_d2',
    etape: 1,
    caseFiscale: ['F'],
    question: 'Votre conjoint(e) est-il/elle titulaire d\'une carte d\'invalidité ?',
    aide: 'Donne droit à une demi-part supplémentaire.',
    type: 'oui_non',
    field: 'invaliditeD2',
    conditionAffichage: isCouple,
  },
  {
    id: 'ancien_combattant',
    etape: 1,
    caseFiscale: ['W', 'S'],
    question: 'Êtes-vous ancien combattant de 75 ans ou plus ?',
    aide: 'Donne droit à une demi-part supplémentaire.',
    type: 'oui_non',
    field: 'ancienCombattant',
    conditionAffichage: (d) => (d.ageDeclarant1 || 0) >= 75,
  },

  // ═══════════════════════════════════════════
  // ÉTAPE 2 — FAMILLE (7 questions)
  // ═══════════════════════════════════════════

  {
    id: 'enfants_mineurs',
    etape: 2,
    caseFiscale: [],
    question: 'Combien avez-vous d\'enfants mineurs à charge ?',
    aide: 'Enfants de moins de 18 ans au 1er janvier, vivant chez vous.',
    type: 'nombre',
    field: 'enfantsMineurs',
    min: 0, max: 15, unite: 'enfant(s)',
    conditionAffichage: () => true,
  },
  {
    id: 'garde_alternee',
    etape: 2,
    caseFiscale: ['H'],
    question: 'Combien sont en résidence alternée ?',
    aide: 'Enfants dont vous partagez la garde avec l\'autre parent.',
    type: 'nombre',
    field: 'enfantsGardeAlternee',
    min: 0, max: 15, unite: 'enfant(s)',
    conditionAffichage: (d) => hasEnfants(d) && isDivorceSepare(d),
  },
  {
    id: 'enfants_majeurs',
    etape: 2,
    caseFiscale: [],
    question: 'Avez-vous des enfants majeurs rattachés à votre foyer fiscal ?',
    aide: 'Enfants de 18 à 25 ans (étudiants) rattachés à votre déclaration.',
    type: 'nombre',
    field: 'enfantsMajeursRattaches',
    min: 0, max: 10, unite: 'enfant(s)',
    conditionAffichage: () => true,
  },
  {
    id: 'enfants_handicapes',
    etape: 2,
    caseFiscale: [],
    question: 'Combien de vos enfants sont en situation de handicap ?',
    aide: 'Donne une demi-part supplémentaire par enfant handicapé.',
    type: 'nombre',
    field: 'enfantsHandicapes',
    min: 0, max: 10, unite: 'enfant(s)',
    conditionAffichage: hasEnfants,
  },
  {
    id: 'personnes_invalides',
    etape: 2,
    caseFiscale: ['G', 'R', 'I'],
    question: 'Avez-vous une personne invalide vivant sous votre toit ?',
    aide: 'Autre qu\'un enfant : parent, ascendant, personne titulaire d\'une carte d\'invalidité.',
    type: 'nombre',
    field: 'personnesInvalidesCharge',
    min: 0, max: 5,
    conditionAffichage: () => true,
  },
  {
    id: 'case_t',
    etape: 2,
    caseFiscale: ['T'],
    question: 'Vivez-vous seul(e) avec vos enfants ?',
    aide: 'La case T "parent isolé" vous donne une demi-part en plus. Condition : vivre seul(e) au 1er janvier, sans concubin(e).',
    type: 'oui_non',
    field: 'caseT',
    infobox: '💡 Si vous vivez seul(e) avec au moins un enfant à charge, cette demi-part peut réduire votre impôt de 1 759€ maximum.',
    conditionAffichage: (d) => hasEnfants(d) && d.vivezSeul === true && !isCouple(d),
  },
  {
    id: 'eleve_seul_5ans',
    etape: 2,
    caseFiscale: ['L'],
    question: 'Avez-vous élevé seul(e) un enfant pendant au moins 5 ans ?',
    aide: 'Même si l\'enfant est parti. La case L vous donne une demi-part.',
    type: 'oui_non',
    field: 'eleveSeul5ans',
    conditionAffichage: (d) => !isCouple(d) && !hasEnfants(d),
  },

  // ═══════════════════════════════════════════
  // ÉTAPE 3 — REVENUS DU TRAVAIL (10 questions)
  // ═══════════════════════════════════════════

  {
    id: 'type_revenus_d1',
    etape: 3,
    caseFiscale: [],
    question: 'Quelle est votre source principale de revenus ?',
    aide: 'Cela détermine les questions suivantes.',
    type: 'choix',
    field: 'typeRevenusD1',
    options: [
      { label: 'Salarié(e)', value: 'salaire' },
      { label: 'Retraité(e) / Pensionné(e)', value: 'retraite' },
      { label: 'Indépendant / Auto-entrepreneur', value: 'independant' },
      { label: 'Sans revenu professionnel', value: 'sans_revenu' },
    ],
    conditionAffichage: () => true,
  },
  {
    id: 'type_revenus_d2',
    etape: 3,
    caseFiscale: [],
    question: 'Quelle est la source de revenus de votre conjoint(e) ?',
    aide: '',
    type: 'choix',
    field: 'typeRevenusD2',
    options: [
      { label: 'Salarié(e)', value: 'salaire' },
      { label: 'Retraité(e)', value: 'retraite' },
      { label: 'Indépendant', value: 'independant' },
      { label: 'Sans revenu', value: 'sans_revenu' },
    ],
    conditionAffichage: isCouple,
  },
  {
    id: 'salaires_d1',
    etape: 3,
    caseFiscale: ['1AJ'],
    question: 'Quel est votre salaire net imposable annuel ?',
    aide: 'Le montant figure en bas de votre bulletin de paie de décembre, ou sur votre déclaration pré-remplie.',
    type: 'montant',
    field: 'salairesD1',
    min: 0, max: 1000000, unite: '€',
    placeholder: 'Ex : 28 000',
    required: true,
    conditionAffichage: isSalarie,
  },
  {
    id: 'salaires_d2',
    etape: 3,
    caseFiscale: ['1BJ'],
    question: 'Salaire net imposable annuel de votre conjoint(e) ?',
    aide: '',
    type: 'montant',
    field: 'salairesD2',
    min: 0, max: 1000000, unite: '€',
    conditionAffichage: (d) => isCouple(d) && d.typeRevenusD2 === 'salaire',
  },
  {
    id: 'heures_sup_d1',
    etape: 3,
    caseFiscale: ['1AP'],
    question: 'Avez-vous perçu des heures supplémentaires exonérées ?',
    aide: 'Heures sup exonérées jusqu\'à 7 500€/an. Le montant figure sur votre bulletin.',
    type: 'montant',
    field: 'heuresSupExoD1',
    min: 0, max: 10000, unite: '€',
    conditionAffichage: isSalarie,
  },
  {
    id: 'pension_retraite_d1',
    etape: 3,
    caseFiscale: ['1AS'],
    question: 'Quel est le montant annuel de votre pension de retraite ?',
    aide: 'Montant net imposable (pas le montant brut). Vous le trouvez sur l\'attestation annuelle de votre caisse.',
    type: 'montant',
    field: 'pensionRetraiteD1',
    min: 0, max: 500000, unite: '€',
    placeholder: 'Ex : 18 000',
    required: true,
    conditionAffichage: isRetraite,
  },
  {
    id: 'pension_retraite_d2',
    etape: 3,
    caseFiscale: ['1BS'],
    question: 'Pension de retraite annuelle de votre conjoint(e) ?',
    aide: '',
    type: 'montant',
    field: 'pensionRetraiteD2',
    min: 0, max: 500000, unite: '€',
    conditionAffichage: (d) => isCouple(d) && d.typeRevenusD2 === 'retraite',
  },
  {
    id: 'pension_invalidite',
    etape: 3,
    caseFiscale: ['1AZ'],
    question: 'Percevez-vous une pension d\'invalidité ?',
    aide: '',
    type: 'montant',
    field: 'pensionInvaliditeD1',
    min: 0, max: 100000, unite: '€',
    conditionAffichage: (d) => d.invaliditeD1 === true,
  },
  {
    id: 'revenus_gerant',
    etape: 3,
    caseFiscale: ['1GB'],
    question: 'Revenus de gérant/associé (article 62) ?',
    aide: 'Rémunérations perçues en tant que gérant majoritaire de SARL.',
    type: 'montant',
    field: 'revenusGerant',
    min: 0, max: 1000000, unite: '€',
    conditionAffichage: (d) => d.typeRevenusD1 === 'independant',
  },
  {
    id: 'impot_paye_actuel',
    etape: 3,
    caseFiscale: [],
    question: "Combien d'impôt sur le revenu avez-vous payé cette année ?",
    aide: `Le montant figure sur votre dernier avis d'imposition (ligne "Impôt sur le revenu net"). Si vous ne le connaissez pas, laissez vide.`,
    type: 'montant',
    field: 'impotPayeActuel',
    min: 0, max: 500000, unite: '€',
    placeholder: 'Ex : 3 200',
    conditionAffichage: () => true,
  },

  // ═══════════════════════════════════════════
  // ÉTAPE 4 — FRAIS PROFESSIONNELS (9 questions)
  // ═══════════════════════════════════════════

  {
    id: 'voiture_travail',
    etape: 4,
    caseFiscale: ['1AK'],
    question: 'Prenez-vous la voiture pour aller travailler ?',
    aide: 'Si vous habitez à plus de 15 km, les frais réels sont souvent plus intéressants que l\'abattement de 10%.',
    type: 'oui_non',
    field: 'voitureTravail',
    infobox: '💡 Si la distance dépasse 15 km, les frais réels battent presque toujours l\'abattement forfaitaire de 10% !',
    conditionAffichage: (d) => isSalarie(d) || d.typeRevenusD2 === 'salaire',
  },
  {
    id: 'distance_travail',
    etape: 4,
    caseFiscale: ['1AK'],
    question: 'Quelle distance aller simple domicile-travail ?',
    aide: 'En kilomètres, un seul trajet.',
    type: 'distance',
    field: 'distanceTravail',
    min: 1, max: 200, unite: 'km',
    placeholder: 'Ex : 25',
    conditionAffichage: (d) => d.voitureTravail === true,
  },
  {
    id: 'puissance_fiscale',
    etape: 4,
    caseFiscale: ['1AK'],
    question: 'Quelle est la puissance fiscale de votre véhicule ?',
    aide: 'Indiquée sur la carte grise (case P.6).',
    type: 'choix',
    field: 'puissanceFiscale',
    options: [
      { label: '3 CV ou moins', value: '3' },
      { label: '4 CV', value: '4' },
      { label: '5 CV', value: '5' },
      { label: '6 CV', value: '6' },
      { label: '7 CV ou plus', value: '7' },
    ],
    conditionAffichage: (d) => d.voitureTravail === true,
  },
  {
    id: 'jours_site',
    etape: 4,
    caseFiscale: ['1AK'],
    question: 'Combien de jours par semaine travaillez-vous sur site ?',
    aide: 'Hors télétravail.',
    type: 'nombre',
    field: 'joursSurSite',
    min: 1, max: 6, unite: 'jours',
    conditionAffichage: (d) => d.voitureTravail === true,
  },
  {
    id: 'transport_commun',
    etape: 4,
    caseFiscale: ['1AK'],
    question: 'Prenez-vous les transports en commun ?',
    aide: 'L\'abonnement annuel peut entrer dans vos frais réels.',
    type: 'oui_non',
    field: 'transportEnCommun',
    conditionAffichage: (d) => d.voitureTravail === false && (isSalarie(d) || d.typeRevenusD2 === 'salaire'),
  },
  {
    id: 'transport_montant',
    etape: 4,
    caseFiscale: ['1AK'],
    question: 'Quel est votre abonnement transport annuel (votre part) ?',
    aide: 'Montant restant à votre charge après remboursement employeur (50%).',
    type: 'montant',
    field: 'transportMontantAn',
    min: 0, max: 5000, unite: '€',
    conditionAffichage: (d) => d.transportEnCommun === true,
  },
  {
    id: 'teletravail',
    etape: 4,
    caseFiscale: ['1AK'],
    question: 'Faites-vous du télétravail ?',
    aide: 'Le forfait télétravail (2,70€/jour, max 603€/an) peut être ajouté aux frais réels.',
    type: 'oui_non',
    field: 'teletravail',
    conditionAffichage: (d) => isSalarie(d) || d.typeRevenusD2 === 'salaire',
  },
  {
    id: 'jours_teletravail',
    etape: 4,
    caseFiscale: ['1AK'],
    question: 'Combien de jours par semaine en télétravail ?',
    aide: '',
    type: 'nombre',
    field: 'joursTeletravail',
    min: 1, max: 5, unite: 'jours',
    conditionAffichage: (d) => d.teletravail === true,
  },
  {
    id: 'repas_travail',
    etape: 4,
    caseFiscale: ['1AK'],
    question: 'Payez-vous vos repas sur votre lieu de travail ?',
    aide: 'Si pas de cantine ni tickets restaurant, un forfait repas de 5,35€/jour est déductible.',
    type: 'oui_non',
    field: 'repasPayes',
    conditionAffichage: (d) => isSalarie(d) && d.voitureTravail === true,
  },

  // ═══════════════════════════════════════════
  // ÉTAPE 5 — AUTRES REVENUS (11 questions)
  // ═══════════════════════════════════════════

  {
    id: 'placements_financiers',
    etape: 5,
    caseFiscale: ['2DC', '2TR', '3VG'],
    question: 'Avez-vous des placements financiers (actions, assurance-vie, livrets) ?',
    aide: 'Dividendes, intérêts, plus-values de vente d\'actions.',
    type: 'oui_non',
    field: 'aPlacementsFinanciers',
    infobox: '💡 Si votre tranche d\'impôt est à 11%, vous payez peut-être trop avec le prélèvement forfaitaire (12,8%). On va vérifier !',
    conditionAffichage: () => true,
  },
  {
    id: 'dividendes',
    etape: 5,
    caseFiscale: ['2DC'],
    question: 'Montant des dividendes perçus cette année ?',
    aide: 'Montant brut avant prélèvements.',
    type: 'montant',
    field: 'dividendes',
    min: 0, max: 1000000, unite: '€',
    conditionAffichage: (d) => d.aPlacementsFinanciers === true,
  },
  {
    id: 'interets',
    etape: 5,
    caseFiscale: ['2TR', '2TS'],
    question: 'Montant des intérêts perçus (livrets, obligations) ?',
    aide: 'Hors Livret A et LDDS qui sont exonérés.',
    type: 'montant',
    field: 'interets',
    min: 0, max: 500000, unite: '€',
    conditionAffichage: (d) => d.aPlacementsFinanciers === true,
  },
  {
    id: 'plus_values',
    etape: 5,
    caseFiscale: ['3VG'],
    question: 'Avez-vous vendu des actions ou parts cette année ?',
    aide: 'Si oui, indiquez la plus-value nette (gains - pertes).',
    type: 'montant',
    field: 'plusValuesMobilieres',
    min: 0, max: 5000000, unite: '€',
    conditionAffichage: (d) => d.aPlacementsFinanciers === true,
  },
  {
    id: 'proprietaire_locatif',
    etape: 5,
    caseFiscale: ['4BE', '4BA'],
    question: 'Êtes-vous propriétaire d\'un bien que vous louez (non meublé) ?',
    aide: 'Appartement ou maison loué(e) vide.',
    type: 'oui_non',
    field: 'proprietaireLocatif',
    conditionAffichage: () => true,
  },
  {
    id: 'loyers_bruts',
    etape: 5,
    caseFiscale: ['4BE'],
    question: 'Quel est le montant annuel de vos loyers bruts ?',
    aide: 'Total des loyers perçus dans l\'année, avant charges.',
    type: 'montant',
    field: 'loyersBrutsAn',
    min: 0, max: 500000, unite: '€',
    placeholder: 'Ex : 9 600',
    infobox: '💡 Si vos loyers sont inférieurs à 15 000€, vous bénéficiez du micro-foncier (abattement 30% automatique).',
    conditionAffichage: (d) => d.proprietaireLocatif === true,
  },
  {
    id: 'charges_locatives',
    etape: 5,
    caseFiscale: ['4BA'],
    question: 'Montant annuel de vos charges (travaux, intérêts d\'emprunt, assurance...) ?',
    aide: 'Uniquement si vos loyers dépassent 15 000€ (régime réel).',
    type: 'montant',
    field: 'chargesLocatives',
    min: 0, max: 500000, unite: '€',
    conditionAffichage: (d) => d.proprietaireLocatif === true && (d.loyersBrutsAn || 0) > 15000,
  },
  {
    id: 'location_meublee',
    etape: 5,
    caseFiscale: ['5ND'],
    question: 'Louez-vous un bien meublé (LMNP) ?',
    aide: 'Location meublée non professionnelle.',
    type: 'oui_non',
    field: 'locationMeublee',
    conditionAffichage: () => true,
  },
  {
    id: 'location_meublee_ca',
    etape: 5,
    caseFiscale: ['5ND'],
    question: 'Chiffre d\'affaires annuel de la location meublée ?',
    aide: '',
    type: 'montant',
    field: 'locationMeubleeCA',
    min: 0, max: 500000, unite: '€',
    conditionAffichage: (d) => d.locationMeublee === true,
  },
  {
    id: 'auto_entrepreneur',
    etape: 5,
    caseFiscale: ['5ND', '5NP', '5HQ'],
    question: 'Avez-vous une activité d\'auto-entrepreneur / micro-entreprise ?',
    aide: '',
    type: 'oui_non',
    field: 'autoEntrepreneur',
    conditionAffichage: (d) => d.typeRevenusD1 !== 'independant',
  },
  {
    id: 'auto_entrepreneur_ca',
    etape: 5,
    caseFiscale: ['5ND', '5NP', '5HQ'],
    question: 'Quel est votre chiffre d\'affaires annuel ?',
    aide: '',
    type: 'montant',
    field: 'caAutoEntrepreneur',
    min: 0, max: 500000, unite: '€',
    conditionAffichage: (d) => d.autoEntrepreneur === true || d.typeRevenusD1 === 'independant',
  },

  // ═══════════════════════════════════════════
  // ÉTAPE 6 — CHARGES DÉDUCTIBLES (8 questions)
  // ═══════════════════════════════════════════

  {
    id: 'pension_alimentaire',
    etape: 6,
    caseFiscale: ['6EL'],
    question: 'Versez-vous une pension alimentaire ?',
    aide: 'À un enfant ou à un ex-conjoint. Déductible de votre revenu imposable.',
    type: 'oui_non',
    field: 'pensionAlimentaireVersee',
    conditionAffichage: () => true,
  },
  {
    id: 'pension_alimentaire_montant',
    etape: 6,
    caseFiscale: ['6EL'],
    question: 'Montant annuel de la pension alimentaire versée ?',
    aide: 'Max 6 674€ par enfant majeur non rattaché.',
    type: 'montant',
    field: 'pensionAlimentaireMontant',
    min: 0, max: 100000, unite: '€',
    conditionAffichage: (d) => d.pensionAlimentaireVersee === true,
  },
  {
    id: 'per_versements',
    etape: 6,
    caseFiscale: ['6NS'],
    question: 'Mettez-vous de l\'argent de côté pour votre retraite (PER, PERP) ?',
    aide: 'Les versements sont déductibles de votre revenu imposable (10% des revenus, min 4 399€).',
    type: 'oui_non',
    field: 'perVersements',
    infobox: '💡 Le PER est l\'un des meilleurs outils de défiscalisation : 1 000€ versés = 300€ d\'impôt en moins (TMI 30%).',
    conditionAffichage: () => true,
  },
  {
    id: 'per_montant',
    etape: 6,
    caseFiscale: ['6NS'],
    question: 'Montant versé sur votre PER / PERP cette année ?',
    aide: '',
    type: 'montant',
    field: 'perMontant',
    min: 0, max: 100000, unite: '€',
    conditionAffichage: (d) => d.perVersements === true,
  },
  {
    id: 'per_montant_d2',
    etape: 6,
    caseFiscale: ['6NT'],
    question: 'Montant versé par votre conjoint(e) sur son PER ?',
    aide: '',
    type: 'montant',
    field: 'perMontantD2',
    min: 0, max: 100000, unite: '€',
    conditionAffichage: (d) => d.perVersements === true && isCouple(d),
  },
  {
    id: 'pension_ex_conjoint',
    etape: 6,
    caseFiscale: ['6GI'],
    question: 'Versez-vous une pension à votre ex-conjoint(e) ?',
    aide: 'Prestation compensatoire ou pension après divorce.',
    type: 'oui_non',
    field: 'pensionExConjoint',
    conditionAffichage: (d) => d.situation === 'divorce_separe',
  },
  {
    id: 'pension_ex_montant',
    etape: 6,
    caseFiscale: ['6GI'],
    question: 'Montant annuel versé à l\'ex-conjoint(e) ?',
    aide: '',
    type: 'montant',
    field: 'pensionExConjointMontant',
    min: 0, max: 200000, unite: '€',
    conditionAffichage: (d) => d.pensionExConjoint === true,
  },
  {
    id: 'csg_deductible',
    etape: 6,
    caseFiscale: ['6DE'],
    question: 'Avez-vous de la CSG déductible sur vos revenus du patrimoine ?',
    aide: 'La part déductible de la CSG est indiquée sur votre avis d\'imposition précédent.',
    type: 'montant',
    field: 'csgDeductible',
    min: 0, max: 50000, unite: '€',
    conditionAffichage: (d) => d.aPlacementsFinanciers === true || d.proprietaireLocatif === true,
  },
  {
    id: 'prestation_compensatoire',
    etape: 6,
    caseFiscale: ['6GU'],
    question: 'Versez-vous une prestation compensatoire suite à un divorce ?',
    aide: "Réduction de 25% du montant (plafonnée à 30 500€, soit 7 625€ max de réduction).",
    type: 'montant',
    field: 'prestationCompensatoire',
    min: 0, max: 100000, unite: '€',
    conditionAffichage: isDivorceSepare,
  },

  // ═══════════════════════════════════════════
  // ÉTAPE 7 — RÉDUCTIONS ET CRÉDITS (9 questions)
  // ═══════════════════════════════════════════

  {
    id: 'dons_associations',
    etape: 7,
    caseFiscale: ['7UF'],
    question: 'Faites-vous des dons à des associations ? (même 10€ comptent !)',
    aide: 'Réduction de 66% du montant des dons.',
    type: 'oui_non',
    field: 'donsAssociations',
    conditionAffichage: () => true,
  },
  {
    id: 'dons_montant',
    etape: 7,
    caseFiscale: ['7UF'],
    question: 'Montant total des dons cette année ?',
    aide: 'Associations d\'intérêt général : réduction 66%. Restos du Cœur, Croix-Rouge, etc. : 75% (case 7UD, plafond 1 000€).',
    type: 'montant',
    field: 'donsAssociationsMontant',
    min: 0, max: 100000, unite: '€',
    conditionAffichage: (d) => d.donsAssociations === true,
  },
  {
    id: 'emploi_domicile',
    etape: 7,
    caseFiscale: ['7DB'],
    question: 'Quelqu\'un fait-il le ménage, le repassage ou le jardinage chez vous ?',
    aide: 'Crédit d\'impôt de 50%. Aussi : garde d\'enfant à domicile, soutien scolaire, aide aux personnes âgées.',
    type: 'oui_non',
    field: 'emploiDomicile',
    conditionAffichage: () => true,
  },
  {
    id: 'emploi_domicile_montant',
    etape: 7,
    caseFiscale: ['7DB'],
    question: 'Montant annuel des dépenses d\'emploi à domicile ?',
    aide: 'Plafond : 12 000€ (+1 500€ par enfant, max 15 000€).',
    type: 'montant',
    field: 'emploiDomicileMontant',
    min: 0, max: 20000, unite: '€',
    conditionAffichage: (d) => d.emploiDomicile === true,
  },
  {
    id: 'garde_enfant',
    etape: 7,
    caseFiscale: ['7GA'],
    question: 'Avez-vous des frais de garde pour un enfant de moins de 6 ans ?',
    aide: 'Crèche, assistante maternelle, garderie. Crédit d\'impôt de 50%.',
    type: 'oui_non',
    field: 'gardeEnfant',
    conditionAffichage: hasEnfants,
  },
  {
    id: 'garde_enfant_montant',
    etape: 7,
    caseFiscale: ['7GA'],
    question: 'Montant annuel des frais de garde (après aides CAF) ?',
    aide: 'Plafond : 3 500€ par enfant.',
    type: 'montant',
    field: 'gardeEnfantMontant',
    min: 0, max: 20000, unite: '€',
    conditionAffichage: (d) => d.gardeEnfant === true,
  },
  {
    id: 'scolarite_college',
    etape: 7,
    caseFiscale: ['7EA'],
    question: 'Combien de vos enfants sont au collège ?',
    aide: 'Réduction de 61€ par enfant scolarisé au collège (case 7EA).',
    type: 'nombre',
    field: 'enfantsCollege',
    min: 0, max: 10,
    infobox: '💡 Beaucoup de parents oublient cette réduction !',
    conditionAffichage: hasEnfants,
  },
  {
    id: 'scolarite_lycee',
    etape: 7,
    caseFiscale: ['7EC'],
    question: 'Combien de vos enfants sont au lycée ?',
    aide: 'Réduction de 153€ par enfant scolarisé au lycée (case 7EC).',
    type: 'nombre',
    field: 'enfantsLycee',
    min: 0, max: 10,
    conditionAffichage: hasEnfants,
  },
  {
    id: 'scolarite_superieur',
    etape: 7,
    caseFiscale: ['7EF'],
    question: 'Combien de vos enfants sont dans le supérieur ?',
    aide: 'Réduction de 183€ par enfant dans le supérieur (case 7EF). Inclut les enfants majeurs rattachés.',
    type: 'nombre',
    field: 'enfantsSuperieur',
    min: 0, max: 10,
    conditionAffichage: hasEnfantsOuMajeurs,
  },
  {
    id: 'cotisations_syndicales',
    etape: 7,
    caseFiscale: ['7UR'],
    question: 'Payez-vous des cotisations syndicales ?',
    aide: "Crédit d'impôt de 66% des cotisations versées (case 7UR).",
    type: 'montant',
    field: 'cotisationsSyndicales',
    min: 0, max: 5000, unite: '€',
    conditionAffichage: (d) => isSalarie(d) || isRetraite(d),
  },
  {
    id: 'pret_etudiant',
    etape: 7,
    caseFiscale: ['7TD'],
    question: "Remboursez-vous un prêt étudiant contracté entre 2005 et 2008 ?",
    aide: "Crédit d'impôt de 25% des intérêts (max 625€/an) pendant les 5 premières années.",
    type: 'montant',
    field: 'pretEtudiant',
    min: 0, max: 10000, unite: '€',
    conditionAffichage: () => true,
  },
  {
    id: 'ehpad',
    etape: 7,
    caseFiscale: ['7CD'],
    question: 'Un de vos proches est-il en maison de retraite ou EHPAD ?',
    aide: 'Réduction de 25% des frais (plafond 10 000€ par personne).',
    type: 'oui_non',
    field: 'ehpad',
    conditionAffichage: () => true,
  },
  {
    id: 'ehpad_montant',
    etape: 7,
    caseFiscale: ['7CD'],
    question: 'Montant annuel des frais d\'hébergement en EHPAD ?',
    aide: 'Frais de dépendance + hébergement (pas les soins médicaux).',
    type: 'montant',
    field: 'ehpadMontant',
    min: 0, max: 50000, unite: '€',
    conditionAffichage: (d) => d.ehpad === true,
  },

  // ═══════════════════════════════════════════
  // ÉTAPE 8 — INVESTISSEMENTS (6 questions)
  // ═══════════════════════════════════════════

  {
    id: 'invest_pme',
    etape: 8,
    caseFiscale: ['7CF'],
    question: 'Avez-vous investi dans une petite entreprise (PME) ?',
    aide: 'Réduction de 25% (plafonné à 50 000€ pour un célibataire, 100 000€ pour un couple).',
    type: 'oui_non',
    field: 'investPME',
    conditionAffichage: () => true,
  },
  {
    id: 'invest_pme_montant',
    etape: 8,
    caseFiscale: ['7CF'],
    question: 'Montant investi au capital de PME ?',
    aide: '',
    type: 'montant',
    field: 'investPMEMontant',
    min: 0, max: 200000, unite: '€',
    conditionAffichage: (d) => d.investPME === true,
  },
  {
    id: 'pinel',
    etape: 8,
    caseFiscale: ['7CQ'],
    question: 'Avez-vous un investissement locatif Pinel en cours ?',
    aide: 'Réduction d\'impôt sur 6, 9 ou 12 ans.',
    type: 'oui_non',
    field: 'pinelActif',
    conditionAffichage: () => true,
  },
  {
    id: 'pinel_montant',
    etape: 8,
    caseFiscale: ['7CQ'],
    question: 'Montant de la réduction Pinel annuelle ?',
    aide: 'Le montant annuel figure sur votre échéancier Pinel.',
    type: 'montant',
    field: 'pinelMontant',
    min: 0, max: 100000, unite: '€',
    conditionAffichage: (d) => d.pinelActif === true,
  },
  {
    id: 'borne_electrique',
    etape: 8,
    caseFiscale: ['7ZQ'],
    question: 'Avez-vous installé une borne de recharge pour véhicule électrique ?',
    aide: 'Crédit d\'impôt de 300€ par borne (max 2 bornes par foyer).',
    type: 'oui_non',
    field: 'borneElectrique',
    conditionAffichage: () => true,
  },
  {
    id: 'renovation_energetique',
    etape: 8,
    caseFiscale: ['7RN'],
    question: 'Avez-vous fait des travaux de rénovation énergétique ?',
    aide: 'MaPrimeRénov\', isolation, pompe à chaleur, etc.',
    type: 'montant',
    field: 'renovationEnergetique',
    min: 0, max: 100000, unite: '€',
    conditionAffichage: () => true,
  },
  {
    id: 'outre_mer',
    etape: 8,
    caseFiscale: ['7GH'],
    question: "Avez-vous investi en outre-mer (Pinel outre-mer, Girardin, etc.) ?",
    aide: "Réduction variable selon le dispositif (Girardin industriel, logement social, etc.).",
    type: 'montant',
    field: 'outreMer',
    min: 0, max: 500000, unite: '€',
    conditionAffichage: () => true,
  },
  {
    id: 'invest_forestier',
    etape: 8,
    caseFiscale: ['7WN'],
    question: "Avez-vous réalisé un investissement forestier ?",
    aide: "Réduction de 25% de l'investissement (acquisition de forêts ou parts de groupements forestiers).",
    type: 'montant',
    field: 'investForestier',
    min: 0, max: 100000, unite: '€',
    conditionAffichage: () => true,
  },
  {
    id: 'borne_electrique_montant',
    etape: 8,
    caseFiscale: ['7ZQ'],
    question: "Combien de bornes avez-vous installées ?",
    aide: "Crédit de 300€ par borne (maximum 2 pour un foyer).",
    type: 'nombre',
    field: 'borneElectriqueMontant',
    min: 1, max: 4,
    conditionAffichage: (d) => d.borneElectrique === true,
  },

  // ═══════════════════════════════════════════
  // ÉTAPE 9 — SITUATIONS PARTICULIÈRES (3 questions)
  // ═══════════════════════════════════════════

  {
    id: 'changement_situation',
    etape: 9,
    caseFiscale: [],
    question: 'Avez-vous changé de situation familiale cette année ? (mariage, divorce, décès)',
    aide: 'Un changement peut modifier le nombre de déclarations à déposer.',
    type: 'oui_non',
    field: 'changementSituation',
    conditionAffichage: () => true,
  },
  {
    id: 'revenus_etranger',
    etape: 9,
    caseFiscale: ['8TK'],
    question: 'Avez-vous perçu des revenus de source étrangère ?',
    aide: 'Revenus perçus à l\'étranger, déjà imposés ou non dans le pays source.',
    type: 'montant',
    field: 'revenusEtranger',
    min: 0, max: 1000000, unite: '€',
    conditionAffichage: () => true,
  },
  {
    id: 'compte_etranger',
    etape: 9,
    caseFiscale: ['8UU'],
    question: 'Détenez-vous un compte bancaire à l\'étranger ?',
    aide: 'Déclaration obligatoire. L\'oubli peut entraîner une amende de 1 500€ par compte.',
    type: 'oui_non',
    field: 'compteBancaireEtranger',
    conditionAffichage: () => true,
  },
  {
    id: 'dom_tom',
    etape: 9,
    caseFiscale: [],
    question: "Habitez-vous dans un département ou territoire d'outre-mer (DOM-TOM) ?",
    aide: "Les résidents DOM-TOM bénéficient d'un abattement de 30% (DOM) ou 40% (COM) sur l'impôt.",
    type: 'oui_non',
    field: 'domTom',
    conditionAffichage: () => true,
  },
]

// ─── HELPERS ───

/** Retourne les questions visibles pour l'étape donnée */
export function getQuestionsForEtape(etape: number, data: Partial<FormComplet>): FormQuestion[] {
  return QUESTIONS_BANK.filter(q => q.etape === etape && q.conditionAffichage(data))
}

/** Retourne toutes les questions visibles pour l'état actuel */
export function getAllVisibleQuestions(data: Partial<FormComplet>): FormQuestion[] {
  return QUESTIONS_BANK.filter(q => q.conditionAffichage(data))
}

/** Calcule la progression (% de questions répondues) */
export function computeProgression(data: Partial<FormComplet>): number {
  const visible = getAllVisibleQuestions(data)
  const answered = visible.filter(q => {
    const val = data[q.field]
    if (q.type === 'oui_non') return val !== undefined
    if (q.type === 'montant' || q.type === 'nombre' || q.type === 'distance') return val !== undefined && val !== 0
    if (q.type === 'choix') return val !== undefined && val !== ''
    return val !== undefined
  })
  return visible.length > 0 ? Math.round((answered.length / visible.length) * 100) : 0
}

/** Vérifie si une étape est complète */
export function isEtapeComplete(etape: number, data: Partial<FormComplet>): boolean {
  const questions = getQuestionsForEtape(etape, data)
  return questions.every(q => {
    const val = data[q.field]
    if (q.type === 'oui_non') return val !== undefined
    if (q.type === 'choix') return val !== undefined && val !== ''
    // montant/nombre/distance : 0 est une réponse valide
    return val !== undefined
  })
}

/** Détermine la prochaine étape pertinente (saute les vides) */
export function getNextEtape(currentEtape: number, data: Partial<FormComplet>): number {
  for (let e = currentEtape + 1; e <= 10; e++) {
    if (e === 10) return 10  // Récapitulatif toujours affiché
    const questions = getQuestionsForEtape(e, data)
    if (questions.length > 0) return e
  }
  return 10
}

/** Détermine l'étape précédente pertinente */
export function getPrevEtape(currentEtape: number, data: Partial<FormComplet>): number {
  for (let e = currentEtape - 1; e >= 1; e--) {
    const questions = getQuestionsForEtape(e, data)
    if (questions.length > 0) return e
  }
  return 1
}
