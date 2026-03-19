// ============================================================
// RETRAITIA V2 — Catalogue des 41 anomalies
// ============================================================
// Source : BRIEF_ANOMALY_DETECTION.md
// Chaque anomalie est définie statiquement.
// La logique de détection est dans detector.ts (à créer au Bloc E).
// ============================================================

import type {
  AnomalyId,
  AnomalyLevel,
  AnomalyCategory,
  AnomalyDefinition,
  ConfidenceLevel,
  CorrectionDifficulty,
  AnomalyFrequency,
  Regime,
} from '../types'

// Helper pour créer une définition
function def(
  id: AnomalyId,
  niveau: AnomalyLevel,
  categorie: AnomalyCategory,
  label: string,
  description: string,
  opts: {
    regimes: Regime[]
    donnees: string[]
    impact: [number, number]
    confiance: ConfidenceLevel
    facilite: CorrectionDifficulty
    frequence: AnomalyFrequency
    organisme: string
    delai: string
    crossSell?: 'mataxe' | 'monimpot' | 'mesdroits' | 'mabanque'
  },
): AnomalyDefinition {
  return {
    id,
    niveau,
    categorie,
    label,
    description,
    regimesConcernes: opts.regimes,
    donneesNecessaires: opts.donnees,
    impactTypique: { min: opts.impact[0], max: opts.impact[1] },
    confianceParDefaut: opts.confiance,
    faciliteCorrection: opts.facilite,
    frequenceEstimee: opts.frequence,
    organisme: opts.organisme,
    delaiEstime: opts.delai,
    crossSell: opts.crossSell,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NIVEAU 1 — Retraite de base (18 anomalies)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const N1: AnomalyDefinition[] = [
  def('N1_TRIM_COTISES_MANQUANTS', 1, 'erreur',
    'Trimestres de travail non reportés',
    'Des périodes de travail ne figurent pas sur votre relevé de carrière.',
    { regimes: ['cnav'], donnees: ['ris', 'formulaire.carriere'], impact: [20, 150], confiance: 'ESTIMATION', facilite: 'moyen', frequence: 'tres_frequent', organisme: 'CARSAT', delai: '2-4 mois' }),

  def('N1_TRIM_MILITAIRE', 1, 'oubli',
    'Service militaire non comptabilisé',
    'Votre service militaire ne figure pas sur votre relevé de carrière.',
    { regimes: ['cnav'], donnees: ['ris', 'formulaire.serviceMilitaire'], impact: [10, 80], confiance: 'CERTAIN', facilite: 'simple', frequence: 'frequent', organisme: 'CARSAT', delai: '2-3 mois' }),

  def('N1_TRIM_ENFANTS', 1, 'oubli',
    'Trimestres pour enfants non comptabilisés',
    'Chaque enfant donne droit à 8 trimestres (4 maternité + 4 éducation). Ces trimestres sont souvent absents du RIS.',
    { regimes: ['cnav'], donnees: ['formulaire.enfants'], impact: [0, 200], confiance: 'ESTIMATION', facilite: 'simple', frequence: 'tres_frequent', organisme: 'CARSAT + info-retraite.fr', delai: '2-3 mois' }),

  def('N1_TRIM_CHOMAGE', 1, 'erreur',
    'Périodes de chômage non comptabilisées',
    'Chaque période de 50 jours de chômage indemnisé donne droit à 1 trimestre.',
    { regimes: ['cnav'], donnees: ['ris', 'formulaire.chomage'], impact: [15, 80], confiance: 'ESTIMATION', facilite: 'moyen', frequence: 'frequent', organisme: 'CARSAT', delai: '2-4 mois' }),

  def('N1_TRIM_MALADIE', 1, 'erreur',
    'Périodes de maladie/maternité non comptabilisées',
    'Les arrêts maladie (+60 jours = 1 trimestre) et congés maternité donnent droit à des trimestres.',
    { regimes: ['cnav'], donnees: ['ris', 'formulaire.maladie'], impact: [10, 60], confiance: 'ESTIMATION', facilite: 'moyen', frequence: 'frequent', organisme: 'CARSAT', delai: '2-4 mois' }),

  def('N1_TRIM_AVPF', 1, 'oubli',
    'Trimestres parent au foyer non attribués',
    "Si vous avez cessé ou réduit votre activité pour élever un enfant avec certaines prestations, vous aviez droit à des trimestres gratuits (AVPF).",
    { regimes: ['cnav'], donnees: ['ris', 'formulaire.parentAuFoyer'], impact: [10, 60], confiance: 'ESTIMATION', facilite: 'moyen', frequence: 'occasionnel', organisme: 'CARSAT', delai: '3-6 mois' }),

  def('N1_TRIM_CHOMAGE_NON_INDEMNISE', 1, 'oubli',
    'Trimestres chômage non indemnisé non comptés',
    'Les périodes de chômage non indemnisé donnent droit à des trimestres : 6 pour la 1ère période, 4 ensuite.',
    { regimes: ['cnav'], donnees: ['ris', 'formulaire.chomage'], impact: [10, 50], confiance: 'ESTIMATION', facilite: 'moyen', frequence: 'occasionnel', organisme: 'CARSAT', delai: '2-4 mois' }),

  def('N1_TRIM_APPRENTISSAGE', 1, 'erreur',
    "Période d'apprentissage mal reportée",
    "Avant 2014, les périodes d'apprentissage étaient souvent mal reportées (cotisations sur base forfaitaire).",
    { regimes: ['cnav'], donnees: ['ris', 'formulaire.apprentissage'], impact: [5, 40], confiance: 'ESTIMATION', facilite: 'moyen', frequence: 'occasionnel', organisme: 'CARSAT', delai: '2-4 mois' }),

  def('N1_TRIM_ETRANGER', 1, 'oubli',
    "Périodes de travail à l'étranger non comptabilisées",
    'Vos périodes de travail à l\'étranger peuvent être prises en compte (accord bilatéral ou règlement européen).',
    { regimes: ['cnav'], donnees: ['ris', 'formulaire.periodesEtranger'], impact: [10, 100], confiance: 'ESTIMATION', facilite: 'complexe', frequence: 'occasionnel', organisme: 'CARSAT', delai: '3-6 mois' }),

  def('N1_SAM_INCORRECT', 1, 'erreur',
    'Salaire annuel moyen potentiellement incorrect',
    "Notre recalcul de votre SAM (25 meilleures années revalorisées) diffère de votre notification.",
    { regimes: ['cnav'], donnees: ['ris', 'notification_cnav'], impact: [10, 100], confiance: 'HAUTE_CONFIANCE', facilite: 'complexe', frequence: 'occasionnel', organisme: 'CARSAT', delai: '3-6 mois' }),

  def('N1_TAUX_INCORRECT', 1, 'erreur',
    'Taux de liquidation incorrect',
    "Votre notification indique un taux différent de celui que nous calculons.",
    { regimes: ['cnav'], donnees: ['notification_cnav', 'ris'], impact: [20, 200], confiance: 'CERTAIN', facilite: 'complexe', frequence: 'rare', organisme: 'CARSAT', delai: '3-6 mois' }),

  def('N1_SURCOTE_ABSENTE', 1, 'oubli',
    'Surcote non appliquée',
    "Vous avez travaillé au-delà du taux plein après l'âge légal. Cela donne droit à une surcote (+1,25%/trimestre).",
    { regimes: ['cnav'], donnees: ['ris', 'notification_cnav'], impact: [20, 150], confiance: 'CERTAIN', facilite: 'moyen', frequence: 'frequent', organisme: 'CARSAT', delai: '2-4 mois' }),

  def('N1_DECOTE_EXCESSIVE', 1, 'erreur',
    'Décote calculée sur trop de trimestres',
    "Le nombre de trimestres manquants retenu par la caisse est supérieur à notre calcul.",
    { regimes: ['cnav'], donnees: ['notification_cnav', 'ris'], impact: [20, 200], confiance: 'CERTAIN', facilite: 'complexe', frequence: 'rare', organisme: 'CARSAT', delai: '3-6 mois' }),

  def('N1_MAJORATION_ENFANTS_ABSENTE', 1, 'oubli',
    'Majoration de 10% pour 3 enfants non appliquée',
    "Vous avez élevé 3+ enfants. Votre pension devrait être majorée de 10%.",
    { regimes: ['cnav'], donnees: ['formulaire.enfants', 'notification_cnav'], impact: [50, 200], confiance: 'CERTAIN', facilite: 'simple', frequence: 'tres_frequent', organisme: 'CARSAT', delai: '2-3 mois' }),

  def('N1_MINIMUM_CONTRIBUTIF', 1, 'oubli',
    'Minimum contributif non appliqué',
    "Votre pension est inférieure au minimum contributif alors que vous avez le taux plein.",
    { regimes: ['cnav'], donnees: ['notification_cnav', 'formulaire.carriere'], impact: [30, 200], confiance: 'HAUTE_CONFIANCE', facilite: 'moyen', frequence: 'frequent', organisme: 'CARSAT', delai: '2-4 mois' }),

  def('N1_PRORATISATION_INCORRECTE', 1, 'erreur',
    'Coefficient de proratisation incorrect',
    "Le coefficient de proratisation de votre notification ne correspond pas à nos calculs.",
    { regimes: ['cnav'], donnees: ['notification_cnav', 'ris'], impact: [10, 100], confiance: 'CERTAIN', facilite: 'complexe', frequence: 'rare', organisme: 'CARSAT', delai: '3-6 mois' }),

  def('N1_FP_TRAITEMENT_INCORRECT', 1, 'erreur',
    'Traitement indiciaire de référence incorrect',
    "L'indice retenu pour le calcul ne correspond pas à votre dernier échelon.",
    { regimes: ['sre', 'cnracl'], donnees: ['notification_sre', 'formulaire.fonctionnaire'], impact: [30, 200], confiance: 'HAUTE_CONFIANCE', facilite: 'moyen', frequence: 'occasionnel', organisme: 'SRE / CNRACL', delai: '3-6 mois' }),

  def('N1_FP_BONIFICATION_MANQUANTE', 1, 'oubli',
    'Bonifications de services non comptabilisées',
    "Vos bonifications (enfants, outre-mer, catégorie active) ne semblent pas prises en compte.",
    { regimes: ['sre', 'cnracl'], donnees: ['notification_sre', 'formulaire.fonctionnaire'], impact: [20, 150], confiance: 'ESTIMATION', facilite: 'moyen', frequence: 'occasionnel', organisme: 'SRE / CNRACL', delai: '3-6 mois' }),

  def('N1_FP_MINIMUM_GARANTI', 1, 'oubli',
    'Minimum garanti non appliqué',
    "Votre pension est inférieure au minimum garanti pour votre durée de services.",
    { regimes: ['sre', 'cnracl'], donnees: ['notification_sre'], impact: [30, 150], confiance: 'HAUTE_CONFIANCE', facilite: 'moyen', frequence: 'occasionnel', organisme: 'SRE / CNRACL', delai: '3-6 mois' }),

  def('N1_MSA_REVALORISATION', 1, 'oubli',
    'Revalorisation petites pensions agricoles non appliquée',
    "La loi Chassaigne revalorise les petites pensions agricoles.",
    { regimes: ['msa_exploitant'], donnees: ['notification_msa'], impact: [50, 200], confiance: 'HAUTE_CONFIANCE', facilite: 'moyen', frequence: 'frequent', organisme: 'MSA', delai: '2-4 mois' }),

  def('N1_SSI_MIGRATION', 1, 'erreur',
    'Données de carrière perdues lors de la migration RSI',
    "Lors du transfert du RSI vers le régime général en 2020, des trimestres ou revenus semblent perdus.",
    { regimes: ['ssi', 'cnav'], donnees: ['ris', 'formulaire.carriere'], impact: [20, 100], confiance: 'ESTIMATION', facilite: 'complexe', frequence: 'frequent', organisme: 'CARSAT', delai: '3-6 mois' }),

  def('N1_JOBS_ETE', 1, 'oubli',
    'Emplois de jeunesse non reportés',
    "Les emplois d'été et stages rémunérés avant ~1985 sont fréquemment absents des relevés.",
    { regimes: ['cnav'], donnees: ['ris', 'formulaire.carriere'], impact: [5, 30], confiance: 'ESTIMATION', facilite: 'complexe', frequence: 'occasionnel', organisme: 'CARSAT', delai: '3-6 mois' }),
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NIVEAU 2 — Complémentaire (9 anomalies)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const N2: AnomalyDefinition[] = [
  def('N2_POINTS_MANQUANTS', 2, 'erreur',
    'Points de retraite complémentaire manquants',
    "Des années cotisées au régime général n'ont pas de points Agirc-Arrco correspondants.",
    { regimes: ['agirc_arrco'], donnees: ['ris', 'releve_agirc_arrco'], impact: [10, 80], confiance: 'CERTAIN', facilite: 'moyen', frequence: 'frequent', organisme: 'Agirc-Arrco', delai: '2-4 mois' }),

  def('N2_POINTS_GRATUITS', 2, 'oubli',
    'Points gratuits chômage/maladie non attribués',
    "Pendant vos périodes de chômage indemnisé ou maladie longue, vous devriez avoir reçu des points gratuits.",
    { regimes: ['agirc_arrco'], donnees: ['ris', 'releve_agirc_arrco'], impact: [5, 50], confiance: 'CERTAIN', facilite: 'moyen', frequence: 'frequent', organisme: 'Agirc-Arrco', delai: '2-4 mois' }),

  def('N2_MAJORATION_AA', 2, 'oubli',
    'Majoration enfants Agirc-Arrco non appliquée',
    "Vous avez droit à +10% sur votre complémentaire pour 3+ enfants élevés.",
    { regimes: ['agirc_arrco'], donnees: ['formulaire.enfants', 'paiements_agirc_arrco'], impact: [30, 100], confiance: 'ESTIMATION', facilite: 'simple', frequence: 'frequent', organisme: 'Agirc-Arrco', delai: '2-3 mois' }),

  def('N2_MALUS_NON_LEVE', 2, 'erreur',
    'Malus Agirc-Arrco toujours actif après 3 ans',
    "Le coefficient de solidarité de -10% devait être levé après 3 ans (ou à 67 ans).",
    { regimes: ['agirc_arrco'], donnees: ['paiements_agirc_arrco', 'formulaire.carriere'], impact: [30, 80], confiance: 'CERTAIN', facilite: 'simple', frequence: 'occasionnel', organisme: 'Agirc-Arrco', delai: '1-2 mois' }),

  def('N2_FUSION_2019', 2, 'erreur',
    'Erreur de conversion des points Agirc lors de la fusion 2019',
    "Les points Agirc (cadres) convertis en points unifiés présentent un écart.",
    { regimes: ['agirc_arrco'], donnees: ['releve_agirc_arrco'], impact: [5, 50], confiance: 'HAUTE_CONFIANCE', facilite: 'moyen', frequence: 'occasionnel', organisme: 'Agirc-Arrco', delai: '2-4 mois' }),

  def('N2_GMP', 2, 'oubli',
    'Garantie Minimale de Points non attribuée',
    "En tant que cadre cotisant sous le plafond SS avant 2019, vous deviez recevoir un minimum de points Agirc.",
    { regimes: ['agirc_arrco'], donnees: ['releve_agirc_arrco', 'formulaire.cadre'], impact: [5, 30], confiance: 'HAUTE_CONFIANCE', facilite: 'moyen', frequence: 'occasionnel', organisme: 'Agirc-Arrco', delai: '2-4 mois' }),

  def('N2_RAFP_MANQUANT', 2, 'oubli',
    'Points RAFP manquants',
    "Des années de service post-2005 n'ont pas généré de points RAFP.",
    { regimes: ['rafp'], donnees: ['ris', 'formulaire.fonctionnaire'], impact: [5, 30], confiance: 'CERTAIN', facilite: 'moyen', frequence: 'rare', organisme: 'ERAFP', delai: '2-4 mois' }),

  def('N2_IRCANTEC_OUBLIE', 2, 'oubli',
    'Points Ircantec non comptabilisés',
    "Vos périodes de contractuel dans la fonction publique n'ont pas de points Ircantec.",
    { regimes: ['ircantec'], donnees: ['ris', 'formulaire.carriere'], impact: [10, 50], confiance: 'ESTIMATION', facilite: 'moyen', frequence: 'occasionnel', organisme: 'Ircantec', delai: '2-4 mois' }),

  def('N2_RCI_CONVERSION', 2, 'erreur',
    'Points de complémentaire indépendant mal convertis',
    "Les points de l'ancienne complémentaire RSI semblent mal convertis.",
    { regimes: ['rci'], donnees: ['ris', 'formulaire.carriere'], impact: [5, 40], confiance: 'HAUTE_CONFIANCE', facilite: 'moyen', frequence: 'occasionnel', organisme: 'CARSAT', delai: '3-6 mois' }),
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NIVEAU 3 — Réversion (3 anomalies)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const N3: AnomalyDefinition[] = [
  def('N3_REVERSION_NON_DEMANDEE', 3, 'oubli',
    'Pension de réversion non demandée',
    "Votre conjoint est décédé et vous ne percevez pas de pension de réversion.",
    { regimes: ['cnav', 'agirc_arrco', 'sre', 'cnracl'], donnees: ['formulaire.identite'], impact: [300, 1200], confiance: 'CERTAIN', facilite: 'simple', frequence: 'frequent', organisme: 'info-retraite.fr + Agirc-Arrco', delai: '2-4 mois' }),

  def('N3_REVERSION_COMPLEMENTAIRE_OUBLIEE', 3, 'oubli',
    'Réversion complémentaire non demandée',
    "Vous percevez la réversion de base mais pas la réversion Agirc-Arrco (60%, sans condition de ressources).",
    { regimes: ['agirc_arrco'], donnees: ['formulaire.identite', 'formulaire.carriere'], impact: [150, 500], confiance: 'CERTAIN', facilite: 'simple', frequence: 'tres_frequent', organisme: 'Agirc-Arrco', delai: '2-3 mois' }),

  def('N3_REVERSION_MONTANT_INCORRECT', 3, 'erreur',
    'Montant de réversion à vérifier',
    "Le montant de votre réversion ne correspond pas au calcul théorique.",
    { regimes: ['cnav', 'agirc_arrco'], donnees: ['notification_cnav', 'formulaire.identite'], impact: [20, 100], confiance: 'HAUTE_CONFIANCE', facilite: 'moyen', frequence: 'occasionnel', organisme: 'CARSAT / Agirc-Arrco', delai: '3-6 mois' }),
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NIVEAU 4 — Aides non réclamées (5 opportunités)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const N4: AnomalyDefinition[] = [
  def('N4_ASPA', 4, 'opportunite',
    'Éligibilité ASPA potentielle',
    "L'Allocation de Solidarité aux Personnes Âgées complète vos revenus.",
    { regimes: ['cnav'], donnees: ['avis_imposition', 'formulaire.identite'], impact: [100, 500], confiance: 'ESTIMATION', facilite: 'moyen', frequence: 'occasionnel', organisme: 'CARSAT', delai: '2-4 mois', crossSell: 'mesdroits' }),

  def('N4_CSS', 4, 'opportunite',
    'Complémentaire Santé Solidaire accessible',
    "Vous pourriez bénéficier d'une complémentaire santé gratuite ou à 1€/jour.",
    { regimes: ['cnav'], donnees: ['avis_imposition'], impact: [30, 100], confiance: 'ESTIMATION', facilite: 'simple', frequence: 'occasionnel', organisme: 'CPAM', delai: '1-2 mois', crossSell: 'mesdroits' }),

  def('N4_APL', 4, 'opportunite',
    'Aide au logement potentiellement accessible',
    "En tant que locataire avec des revenus modestes, vous pourriez percevoir une aide au logement.",
    { regimes: ['cnav'], donnees: ['avis_imposition', 'formulaire.carriere'], impact: [50, 300], confiance: 'ESTIMATION', facilite: 'simple', frequence: 'occasionnel', organisme: 'CAF', delai: '1-2 mois' }),

  def('N4_EXONERATION_TF', 4, 'opportunite',
    'Exonération de taxe foncière accessible',
    "En tant que propriétaire de 75+ ans avec des revenus modestes, vous pouvez être exonéré.",
    { regimes: ['cnav'], donnees: ['avis_imposition', 'formulaire.identite', 'formulaire.carriere'], impact: [25, 170], confiance: 'ESTIMATION', facilite: 'simple', frequence: 'occasionnel', organisme: 'Impôts', delai: '1-3 mois', crossSell: 'mataxe' }),

  def('N4_MAPRIME_ADAPT', 4, 'opportunite',
    "Aide à l'adaptation du logement",
    "MaPrimeAdapt' finance l'adaptation de votre logement (douche, monte-escalier…).",
    { regimes: ['cnav'], donnees: ['formulaire.identite', 'formulaire.carriere'], impact: [0, 0], confiance: 'ESTIMATION', facilite: 'moyen', frequence: 'occasionnel', organisme: 'ANAH', delai: '3-6 mois' }),
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NIVEAU 5 — Optimisation fiscale (4 opportunités)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const N5: AnomalyDefinition[] = [
  def('N5_DEMI_PART_ANCIEN_COMBATTANT', 5, 'opportunite',
    'Demi-part ancien combattant non utilisée',
    "Les anciens combattants de 75+ ans ont droit à une demi-part fiscale supplémentaire.",
    { regimes: ['cnav'], donnees: ['avis_imposition', 'formulaire.carriere'], impact: [17, 125], confiance: 'ESTIMATION', facilite: 'simple', frequence: 'occasionnel', organisme: 'Impôts', delai: '1-3 mois', crossSell: 'monimpot' }),

  def('N5_DEMI_PART_INVALIDITE', 5, 'opportunite',
    'Demi-part invalidité non utilisée',
    "L'invalidité à 80%+ donne droit à une demi-part fiscale supplémentaire.",
    { regimes: ['cnav'], donnees: ['avis_imposition', 'formulaire.carriere'], impact: [17, 125], confiance: 'ESTIMATION', facilite: 'simple', frequence: 'occasionnel', organisme: 'Impôts', delai: '1-3 mois', crossSell: 'monimpot' }),

  def('N5_DEMI_PART_PARENT_ISOLE', 5, 'opportunite',
    'Demi-part parent isolé potentiellement accessible',
    "Les veufs/veuves ayant élevé seul(e) un enfant pendant 5 ans ont droit à une demi-part.",
    { regimes: ['cnav'], donnees: ['avis_imposition', 'formulaire.enfants'], impact: [17, 125], confiance: 'ESTIMATION', facilite: 'simple', frequence: 'occasionnel', organisme: 'Impôts', delai: '1-3 mois', crossSell: 'monimpot' }),

  def('N5_CREDIT_IMPOT_EMPLOI_DOMICILE', 5, 'opportunite',
    "Crédit d'impôt emploi à domicile à vérifier",
    "L'emploi d'un salarié à domicile donne droit à un crédit d'impôt de 50%.",
    { regimes: ['cnav'], donnees: ['avis_imposition', 'formulaire.carriere'], impact: [42, 500], confiance: 'ESTIMATION', facilite: 'simple', frequence: 'occasionnel', organisme: 'Impôts', delai: '1-3 mois', crossSell: 'monimpot' }),
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NIVEAU 6 — CSG/CRDS (2 anomalies)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const N6: AnomalyDefinition[] = [
  def('N6_CSG_TROP_ELEVEE', 6, 'erreur',
    'Taux de CSG trop élevé',
    "Votre taux de CSG ne correspond pas à votre Revenu Fiscal de Référence.",
    { regimes: ['cnav', 'agirc_arrco'], donnees: ['avis_imposition', 'releve_mensualites'], impact: [15, 80], confiance: 'CERTAIN', facilite: 'simple', frequence: 'frequent', organisme: 'CARSAT', delai: '1-2 mois' }),

  def('N6_CSG_POST_VARIATION', 6, 'erreur',
    'Taux CSG non rétabli après variation exceptionnelle',
    "Votre RFR a augmenté ponctuellement puis est redescendu, mais votre taux de CSG n'a pas été rétabli.",
    { regimes: ['cnav', 'agirc_arrco'], donnees: ['avis_imposition', 'releve_mensualites'], impact: [15, 80], confiance: 'CERTAIN', facilite: 'simple', frequence: 'occasionnel', organisme: 'CARSAT', delai: '1-2 mois' }),
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRÉ-RETRAITÉ — 4 anomalies spécifiques
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const NP: AnomalyDefinition[] = [
  def('NP_RACHAT_TRIMESTRES', 1, 'opportunite',
    'Rachat de trimestres potentiellement rentable',
    "Racheter des trimestres (études supérieures, années incomplètes) pourrait être rentable avant votre départ.",
    { regimes: ['cnav'], donnees: ['ris', 'formulaire.carriere'], impact: [20, 150], confiance: 'ESTIMATION', facilite: 'moyen', frequence: 'frequent', organisme: 'CARSAT', delai: 'Devis sous 2 mois' }),

  def('NP_DATE_DEPART_SUBOPTIMALE', 1, 'opportunite',
    'Date de départ à optimiser',
    "En décalant votre départ de quelques mois, vous pourriez gagner significativement.",
    { regimes: ['cnav'], donnees: ['ris', 'formulaire.carriere'], impact: [20, 200], confiance: 'ESTIMATION', facilite: 'simple', frequence: 'frequent', organisme: '—', delai: '—' }),

  def('NP_CUMUL_EMPLOI_RETRAITE', 1, 'opportunite',
    'Nouveaux droits via le cumul emploi-retraite',
    "Depuis la réforme 2023, le cumul emploi-retraite au taux plein permet d'acquérir de nouveaux droits.",
    { regimes: ['cnav'], donnees: ['formulaire.carriere'], impact: [0, 0], confiance: 'CERTAIN', facilite: 'simple', frequence: 'occasionnel', organisme: '—', delai: '—' }),

  def('NP_CARRIERE_LONGUE', 1, 'opportunite',
    'Départ anticipé pour carrière longue accessible',
    "Vous avez commencé à travailler jeune et pourriez partir avant l'âge légal.",
    { regimes: ['cnav'], donnees: ['ris'], impact: [0, 0], confiance: 'HAUTE_CONFIANCE', facilite: 'simple', frequence: 'occasionnel', organisme: 'CARSAT', delai: '—' }),
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT CATALOGUE COMPLET
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Catalogue complet : 41 anomalies */
export const ANOMALY_CATALOGUE: AnomalyDefinition[] = [
  ...N1, ...N2, ...N3, ...N4, ...N5, ...N6, ...NP,
]

/** Accès rapide par ID */
export const ANOMALY_BY_ID: Record<AnomalyId, AnomalyDefinition> = Object.fromEntries(
  ANOMALY_CATALOGUE.map(a => [a.id, a])
) as Record<AnomalyId, AnomalyDefinition>

/** Anomalies par niveau */
export const ANOMALIES_BY_LEVEL: Record<number, AnomalyDefinition[]> = {
  1: N1,
  2: N2,
  3: N3,
  4: N4,
  5: N5,
  6: N6,
}

/** Anomalies pré-retraité */
export const ANOMALIES_PRE_RETRAITE = NP

/** Comptage */
export const ANOMALY_COUNT = ANOMALY_CATALOGUE.length // 41
