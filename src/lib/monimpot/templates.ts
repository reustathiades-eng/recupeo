// ============================================================
// MONIMPÔT V3 — Templates rapport / guide / réclamation (Zero API)
// 13 types d'optimisation × 3 templates chacun
// ============================================================

import type { Optimisation } from './types'
import type { MonimpotCalculations } from './calculations'
import { fmt } from '@/lib/format'

// ─── TYPES TEMPLATES ───

export interface OptimisationTemplate {
  type: string
  // Rapport
  rapport: {
    situationActuelle: (o: Optimisation, ctx: TemplateContext) => string
    situationOptimisee: (o: Optimisation, ctx: TemplateContext) => string
    referenceCGI: string
  }
  // Guide impots.gouv
  guide: {
    titre: string
    etapes: (o: Optimisation, ctx: TemplateContext) => string[]
    caseAModifier: string
  }
  // Réclamation
  reclamation: {
    articlesJuridiques: string[]
    argumentaire: (o: Optimisation, ctx: TemplateContext) => string
  }
}

export interface TemplateContext {
  situation: string
  age: number
  nbParts: number
  revenuNetImposable: number
  impotPaye: number
  calc: MonimpotCalculations
  annee: number
  numeroFiscal?: string
  numeroAvis?: string
  adresseCentre?: string
}

// ─── DICTIONNAIRE DES 13 TEMPLATES ───

export const OPTIMISATION_TEMPLATES: Record<string, OptimisationTemplate> = {

  // ═══ 1. FRAIS RÉELS ═══
  frais_reels: {
    type: 'frais_reels',
    rapport: {
      situationActuelle: (o, ctx) =>
        `Vous bénéficiez de l'abattement forfaitaire de 10% (${fmt(ctx.calc.abattement10pct)}€). Cependant, vos frais professionnels réels estimés s'élèvent à ${fmt(ctx.calc.fraisReelsEstimes)}€.`,
      situationOptimisee: (o, ctx) =>
        `En optant pour les frais réels (case 1AK), vous déduisez ${fmt(ctx.calc.fraisReelsEstimes)}€ au lieu de ${fmt(ctx.calc.abattement10pct)}€, soit un gain de ${fmt(ctx.calc.gainFraisReels)}€ de base imposable. Économie d'impôt estimée : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 83, 3° du CGI',
    },
    guide: {
      titre: 'Passer aux frais réels',
      etapes: (o, ctx) => [
        'Connectez-vous sur impots.gouv.fr → Espace particulier',
        'Cliquez sur "Corriger ma déclaration" (si la période de correction est ouverte)',
        `Dans la rubrique "Traitements, salaires", cochez "Frais réels" pour le déclarant concerné`,
        `Inscrivez le montant de ${fmt(ctx.calc.fraisReelsEstimes)}€ dans la case 1AK (déclarant 1) ou 1BK (déclarant 2)`,
        'Conservez tous vos justificatifs : carte grise, attestation employeur (distance), tickets péage, abonnement transport',
        'Le barème kilométrique 2026 est disponible sur bofip.impots.gouv.fr',
      ],
      caseAModifier: '1AK',
    },
    reclamation: {
      articlesJuridiques: ['Article 83, 3° du CGI', 'Article R*196-1 du LPF'],
      argumentaire: (o, ctx) =>
        `Je souhaite opter pour la déduction des frais réels en lieu et place de l'abattement forfaitaire de 10%. Mes frais professionnels réels s'élèvent à ${fmt(ctx.calc.fraisReelsEstimes)}€ (frais de transport domicile-travail calculés selon le barème kilométrique officiel), soit un montant supérieur à l'abattement de ${fmt(ctx.calc.abattement10pct)}€. Cette option, prévue à l'article 83, 3° du CGI, entraîne une diminution de ma base imposable de ${fmt(ctx.calc.gainFraisReels)}€ et un dégrèvement de ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 2. CASE T — PARENT ISOLÉ ═══
  case_t: {
    type: 'case_t',
    rapport: {
      situationActuelle: (o, ctx) =>
        `Vous vivez seul(e) avec vos enfants mais la case T (parent isolé) n'est pas cochée. Vous ne bénéficiez pas de la demi-part supplémentaire.`,
      situationOptimisee: (o) =>
        `En cochant la case T, vous obtenez une demi-part supplémentaire, réduisant votre impôt de ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 194-II du CGI',
    },
    guide: {
      titre: 'Cocher la case T (parent isolé)',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr → Espace particulier',
        'Allez dans "Corriger ma déclaration"',
        'Dans la rubrique "Situation du foyer fiscal", section "Parent isolé"',
        'Cochez la case T — "Vous viviez seul(e) au 1er janvier avec vos enfants à charge"',
        'Condition : vivre seul(e), sans concubin(e), sans PACS, au 1er janvier de l\'année d\'imposition',
      ],
      caseAModifier: 'T',
    },
    reclamation: {
      articlesJuridiques: ['Article 194-II du CGI', 'Article R*196-1 du LPF'],
      argumentaire: (o) =>
        `J'élève seul(e) mes enfants et vivais seul(e) au 1er janvier de l'année d'imposition, sans vie maritale ni PACS. Je remplis les conditions de l'article 194-II du CGI pour bénéficier de la majoration d'une demi-part au titre de parent isolé (case T). Le bénéfice de cette demi-part entraîne un dégrèvement de ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 3. CASE L — ANCIEN PARENT ISOLÉ ═══
  case_l: {
    type: 'case_l',
    rapport: {
      situationActuelle: () =>
        `Vous avez élevé seul(e) un enfant pendant au moins 5 ans mais la case L n'est pas cochée.`,
      situationOptimisee: (o) =>
        `La case L vous accorde une demi-part supplémentaire même si vos enfants ne sont plus à charge. Économie : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 195, 1-a du CGI',
    },
    guide: {
      titre: 'Cocher la case L (ancien parent isolé)',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Allez dans "Corriger ma déclaration"',
        'Rubrique "Situation du foyer fiscal"',
        'Cochez la case L — "Vous avez élevé seul(e) un enfant pendant au moins 5 ans"',
        'Vous n\'avez pas besoin d\'avoir encore l\'enfant à charge',
      ],
      caseAModifier: 'L',
    },
    reclamation: {
      articlesJuridiques: ['Article 195, 1-a du CGI'],
      argumentaire: (o) =>
        `J'ai élevé seul(e) un enfant pendant au moins cinq ans. Conformément à l'article 195, 1-a du CGI, je bénéficie d'une demi-part supplémentaire (case L), même si cet enfant n'est plus à ma charge. Le dégrèvement correspondant s'élève à ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 4. DONS OUBLIÉS ═══
  dons_oublies: {
    type: 'dons_oublies',
    rapport: {
      situationActuelle: (o, ctx) =>
        `Vos dons à des associations ne figurent pas sur votre déclaration.`,
      situationOptimisee: (o) =>
        `Les dons à des organismes d'intérêt général ouvrent droit à une réduction d'impôt de 66%. Économie : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 200 du CGI',
    },
    guide: {
      titre: 'Déclarer vos dons',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Allez dans "Corriger ma déclaration"',
        'Rubrique "Réductions et crédits d\'impôt"',
        'Inscrivez le montant total des dons en case 7UF (organismes d\'intérêt général, 66%)',
        'Pour les dons aux organismes d\'aide aux personnes (Restos du Cœur...), utilisez la case 7UD (75%, plafonnée à 1 000€)',
        'Conservez les reçus fiscaux délivrés par les associations',
      ],
      caseAModifier: '7UF',
    },
    reclamation: {
      articlesJuridiques: ['Article 200 du CGI'],
      argumentaire: (o) =>
        `J'ai effectué des dons à des organismes d'intérêt général au cours de l'année d'imposition, mais j'ai omis de les déclarer. Conformément à l'article 200 du CGI, ces dons ouvrent droit à une réduction d'impôt. Je demande le bénéfice de cette réduction pour un dégrèvement de ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 5. EMPLOI À DOMICILE ═══
  emploi_domicile: {
    type: 'emploi_domicile',
    rapport: {
      situationActuelle: () =>
        `Vous employez une personne à domicile mais n'avez pas déclaré les dépenses correspondantes.`,
      situationOptimisee: (o) =>
        `Les dépenses d'emploi à domicile ouvrent droit à un crédit d'impôt de 50%. Économie : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 199 sexdecies du CGI',
    },
    guide: {
      titre: 'Déclarer l\'emploi à domicile',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Rubrique "Réductions et crédits d\'impôt"',
        'Inscrivez le montant annuel des dépenses en case 7DB',
        'Si c\'est la première année, cochez aussi la case 7DQ',
        'Plafond : 12 000€ (+1 500€ par enfant à charge, max 15 000€)',
        'Le crédit d\'impôt est de 50% : il est remboursé même si vous n\'êtes pas imposable',
      ],
      caseAModifier: '7DB',
    },
    reclamation: {
      articlesJuridiques: ['Article 199 sexdecies du CGI'],
      argumentaire: (o) =>
        `J'ai employé un salarié à domicile au cours de l'année d'imposition. Conformément à l'article 199 sexdecies du CGI, ces dépenses ouvrent droit à un crédit d'impôt de 50%. Je sollicite le bénéfice de ce crédit pour un montant de ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 6. GARDE D'ENFANT ═══
  garde_enfant: {
    type: 'garde_enfant',
    rapport: {
      situationActuelle: () =>
        `Vous avez des frais de garde pour enfant de moins de 6 ans non déclarés.`,
      situationOptimisee: (o) =>
        `Les frais de garde ouvrent droit à un crédit d'impôt de 50% (max 3 500€ par enfant). Économie : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 200 quater B du CGI',
    },
    guide: {
      titre: 'Déclarer les frais de garde',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Rubrique "Réductions et crédits d\'impôt"',
        'Case 7GA : 1er enfant, 7GB : 2ème enfant, 7GC : 3ème enfant',
        'Montant : dépenses nettes (après déduction des aides CAF/employeur)',
        'Plafond : 3 500€ par enfant de moins de 6 ans au 1er janvier',
      ],
      caseAModifier: '7GA',
    },
    reclamation: {
      articlesJuridiques: ['Article 200 quater B du CGI'],
      argumentaire: (o) =>
        `J'ai engagé des frais de garde pour mon/mes enfant(s) de moins de 6 ans au 1er janvier de l'année d'imposition. Ces dépenses, prévues à l'article 200 quater B du CGI, ouvrent droit à un crédit d'impôt de 50%. Je demande un dégrèvement de ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 7. PENSION ALIMENTAIRE ═══
  pension_alimentaire: {
    type: 'pension_alimentaire',
    rapport: {
      situationActuelle: () =>
        `Vous versez une pension alimentaire non déduite de votre revenu imposable.`,
      situationOptimisee: (o, ctx) =>
        `La pension alimentaire est déductible du revenu imposable (max 6 674€/enfant/an). Déduction : ${fmt(ctx.calc.deductionPensionAn)}€, économie d'impôt : ${fmt(o.economie)}€.`,
      referenceCGI: 'Articles 156-II-2° et 208 du CGI',
    },
    guide: {
      titre: 'Déduire la pension alimentaire',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Rubrique "Charges déductibles"',
        'Inscrivez le montant annuel en case 6EL (enfant mineur) ou 6GI (ex-conjoint)',
        'Plafond : 6 674€ par enfant majeur non rattaché / 6 674€ pour enfant mineur selon pension fixée',
        'Justificatifs : jugement de divorce/séparation, relevés bancaires des virements',
      ],
      caseAModifier: '6EL',
    },
    reclamation: {
      articlesJuridiques: ['Articles 156-II-2° du CGI', 'Article R*196-1 du LPF'],
      argumentaire: (o, ctx) =>
        `Je verse une pension alimentaire conformément à une décision de justice/convention. Ce montant (${fmt(ctx.calc.deductionPensionAn)}€/an) est déductible de mon revenu imposable en vertu de l'article 156-II-2° du CGI. Je demande la rectification de ma base imposable et un dégrèvement de ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 8. EHPAD ═══
  ehpad: {
    type: 'ehpad',
    rapport: {
      situationActuelle: () =>
        `Vous payez un hébergement en EHPAD mais n'avez pas déclaré la réduction d'impôt correspondante.`,
      situationOptimisee: (o) =>
        `Les dépenses d'hébergement en EHPAD ouvrent droit à une réduction de 25% (plafond 10 000€). Économie : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 199 quindecies du CGI',
    },
    guide: {
      titre: 'Déclarer les frais d\'EHPAD',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Rubrique "Réductions et crédits d\'impôt"',
        'Inscrivez le montant des dépenses de dépendance et d\'hébergement en case 7CD',
        'Plafond : 10 000€ par personne hébergée',
        'Justificatif : attestation fiscale de l\'établissement',
      ],
      caseAModifier: '7CD',
    },
    reclamation: {
      articlesJuridiques: ['Article 199 quindecies du CGI'],
      argumentaire: (o) =>
        `Un de mes proches est hébergé dans un établissement pour personnes dépendantes (EHPAD). Les frais d'hébergement et de dépendance donnent droit à une réduction d'impôt de 25% en vertu de l'article 199 quindecies du CGI. Je sollicite un dégrèvement de ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 9. PER ═══
  per_deduction: {
    type: 'per_deduction',
    rapport: {
      situationActuelle: () =>
        `Vous versez sur un PER (Plan d'Épargne Retraite) sans avoir déduit ces versements.`,
      situationOptimisee: (o) =>
        `Les versements PER sont déductibles du revenu imposable (10% des revenus, min 4 399€). Économie : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 163 quatervicies du CGI',
    },
    guide: {
      titre: 'Déduire les versements PER',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Rubrique "Charges déductibles"',
        'Inscrivez le montant des versements PER en case 6NS (D1) ou 6NT (D2)',
        'PERP/Madelin : cases 6PS/6PT',
        'Plafond : 10% des revenus professionnels N-1, minimum 4 399€',
        'Le plafond disponible est indiqué sur votre avis d\'imposition précédent',
      ],
      caseAModifier: '6NS',
    },
    reclamation: {
      articlesJuridiques: ['Article 163 quatervicies du CGI'],
      argumentaire: (o) =>
        `J'ai effectué des versements sur un Plan d'Épargne Retraite (PER) au cours de l'année d'imposition. Conformément à l'article 163 quatervicies du CGI, ces versements sont déductibles de mon revenu global. Je demande la rectification de ma base imposable et un dégrèvement de ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 10. ABATTEMENT SENIORS ═══
  abattement_senior: {
    type: 'abattement_senior',
    rapport: {
      situationActuelle: (o, ctx) =>
        `Vous avez ${ctx.age} ans et votre revenu fiscal de référence pourrait vous ouvrir droit à un abattement spécial.`,
      situationOptimisee: (o) =>
        `L'abattement seniors ≥ 65 ans est appliqué automatiquement. Vérifiez sur votre avis qu'il figure bien. Économie : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 157 bis du CGI',
    },
    guide: {
      titre: 'Vérifier l\'abattement seniors',
      etapes: () => [
        'L\'abattement est normalement appliqué automatiquement par l\'administration',
        'Vérifiez sur votre avis d\'imposition, rubrique "Revenu brut global"',
        'Si votre RFR est ≤ 17 200€ : abattement de 2 746€',
        'Si votre RFR est entre 17 200€ et 27 670€ : abattement de 1 373€',
        'Si l\'abattement n\'apparaît pas, contactez votre centre des impôts',
      ],
      caseAModifier: 'automatique',
    },
    reclamation: {
      articlesJuridiques: ['Article 157 bis du CGI'],
      argumentaire: (o, ctx) =>
        `Âgé(e) de ${ctx.age} ans, je remplis les conditions de l'article 157 bis du CGI pour bénéficier de l'abattement spécial en faveur des personnes âgées. Je constate que cet abattement n'a pas été correctement appliqué sur mon imposition. Je demande un dégrèvement de ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 11. QUOTIENT FAMILIAL ═══
  quotient_familial: {
    type: 'quotient_familial',
    rapport: {
      situationActuelle: (o, ctx) =>
        `Vos parts déclarées (${ctx.nbParts}) diffèrent du nombre théorique calculé (${ctx.calc.partsTheoriques}).`,
      situationOptimisee: (o, ctx) =>
        `Avec ${ctx.calc.partsTheoriques} parts, votre impôt serait réduit de ${fmt(o.economie)}€.`,
      referenceCGI: 'Articles 194 et 195 du CGI',
    },
    guide: {
      titre: 'Corriger le nombre de parts',
      etapes: (o, ctx) => [
        'Connectez-vous sur impots.gouv.fr',
        'Vérifiez la rubrique "Situation du foyer fiscal"',
        `Le nombre de parts correct devrait être ${ctx.calc.partsTheoriques}`,
        'Vérifiez : nombre d\'enfants à charge, cases T/L, demi-parts invalidité',
        'Si erreur : "Corriger ma déclaration" ou réclamation',
      ],
      caseAModifier: 'situation',
    },
    reclamation: {
      articlesJuridiques: ['Articles 194 et 195 du CGI'],
      argumentaire: (o, ctx) =>
        `Le nombre de parts retenu pour le calcul de mon quotient familial est de ${ctx.nbParts}, alors que ma situation (${ctx.situation === 'marie_pacse' ? 'marié(e)/pacsé(e)' : ctx.situation}, ${ctx.calc.partsTheoriques} parts théoriques) justifie un nombre supérieur. Je demande la rectification du nombre de parts et un dégrèvement de ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 12. CASE 2OP — BARÈME PROGRESSIF ═══
  case_2op: {
    type: 'case_2op',
    rapport: {
      situationActuelle: () =>
        `Vos revenus de capitaux sont imposés au prélèvement forfaitaire unique (PFU) de 12,8%. Votre tranche marginale est inférieure.`,
      situationOptimisee: (o) =>
        `En cochant la case 2OP, vos revenus de capitaux seraient imposés au barème progressif (TMI inférieure à 12,8%). Économie : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 200 A du CGI',
    },
    guide: {
      titre: 'Cocher la case 2OP (barème progressif)',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Rubrique "Revenus des valeurs et capitaux mobiliers"',
        'Cochez la case 2OP — "Option pour l\'imposition au barème progressif"',
        'Attention : cette option s\'applique à TOUS vos revenus de capitaux (dividendes, intérêts, plus-values)',
        'Simulez avant de cocher : si votre TMI est à 11%, le barème est plus avantageux que le PFU (12,8%)',
      ],
      caseAModifier: '2OP',
    },
    reclamation: {
      articlesJuridiques: ['Article 200 A du CGI'],
      argumentaire: (o) =>
        `Je souhaite exercer l'option pour l'imposition de mes revenus de capitaux mobiliers au barème progressif de l'impôt sur le revenu (case 2OP), en application de l'article 200 A du CGI. Ma tranche marginale d'imposition étant inférieure au taux forfaitaire de 12,8%, cette option m'est plus favorable. Je demande un dégrèvement de ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 13. CASES PERDUES (multi-avis) ═══
  case_perdue: {
    type: 'case_perdue',
    rapport: {
      situationActuelle: (o) =>
        `${o.description}`,
      situationOptimisee: (o) =>
        `Si votre situation n'a pas changé, cette case devrait toujours être renseignée. Économie potentielle : ${fmt(o.economie)}€.`,
      referenceCGI: 'Selon la case concernée',
    },
    guide: {
      titre: 'Corriger la case manquante',
      etapes: (o) => [
        'Connectez-vous sur impots.gouv.fr',
        `Recherchez la case ${o.caseConcernee || ''} dans la rubrique correspondante`,
        'Inscrivez le montant comme les années précédentes',
        'Si votre situation a changé, cette case peut légitimement être vide',
        'En cas de doute, contactez votre centre des impôts',
      ],
      caseAModifier: 'variable',
    },
    reclamation: {
      articlesJuridiques: ['Article R*196-1 du LPF'],
      argumentaire: (o) =>
        `${o.description} Si ma situation n'a pas changé, il s'agit d'un oubli déclaratif. Je demande la prise en compte de cette information et un dégrèvement de ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 14. SCOLARITÉ COLLÈGE ═══
  scolarite_college: {
    type: 'scolarite_college',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `En déclarant vos enfants scolarisés au collège (case 7EA), vous bénéficiez d'une réduction de ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 199 quater F du CGI',
    },
    guide: {
      titre: 'Déclarer les enfants au collège',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr → Espace particulier',
        'Rubrique "Réductions et crédits d\'impôt"',
        'Case 7EA : indiquez le nombre d\'enfants scolarisés au collège',
        'Aucun justificatif à joindre (mais conservez les certificats de scolarité)',
      ],
      caseAModifier: '7EA',
    },
    reclamation: {
      articlesJuridiques: ['Article 199 quater F du CGI'],
      argumentaire: (o) =>
        `Je souhaite bénéficier de la réduction pour frais de scolarité prévue à l'article 199 quater F du CGI. Mes enfants étaient scolarisés au collège au 31 décembre. Je demande un dégrèvement de ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 15. SCOLARITÉ LYCÉE ═══
  scolarite_lycee: {
    type: 'scolarite_lycee',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `En déclarant vos enfants scolarisés au lycée (case 7EC), vous bénéficiez d'une réduction de ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 199 quater F du CGI',
    },
    guide: {
      titre: 'Déclarer les enfants au lycée',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr → Espace particulier',
        'Rubrique "Réductions et crédits d\'impôt"',
        'Case 7EC : indiquez le nombre d\'enfants scolarisés au lycée',
        'Conservez les certificats de scolarité comme justificatif',
      ],
      caseAModifier: '7EC',
    },
    reclamation: {
      articlesJuridiques: ['Article 199 quater F du CGI'],
      argumentaire: (o) =>
        `Je demande la réduction pour frais de scolarité au lycée (article 199 quater F du CGI, case 7EC). Dégrèvement demandé : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 16. SCOLARITÉ SUPÉRIEUR ═══
  scolarite_superieur: {
    type: 'scolarite_superieur',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `En déclarant vos enfants dans l'enseignement supérieur (case 7EF), vous bénéficiez d'une réduction de ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 199 quater F du CGI',
    },
    guide: {
      titre: 'Déclarer les enfants dans le supérieur',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Rubrique "Réductions et crédits d\'impôt"',
        'Case 7EF : nombre d\'enfants dans l\'enseignement supérieur',
        'Justificatif : certificat de scolarité universitaire',
      ],
      caseAModifier: '7EF',
    },
    reclamation: {
      articlesJuridiques: ['Article 199 quater F du CGI'],
      argumentaire: (o) =>
        `Je demande la réduction pour enfant poursuivant des études supérieures (article 199 quater F du CGI, case 7EF). Dégrèvement : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 17. COTISATIONS SYNDICALES ═══
  syndicat: {
    type: 'syndicat',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `En déclarant vos cotisations syndicales (case 7UR), vous obtenez un crédit d'impôt de ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 199 quater C du CGI',
    },
    guide: {
      titre: 'Déclarer les cotisations syndicales',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Rubrique "Réductions et crédits d\'impôt"',
        'Case 7UR : montant total des cotisations versées dans l\'année',
        'Justificatif : reçu annuel de votre syndicat',
      ],
      caseAModifier: '7UR',
    },
    reclamation: {
      articlesJuridiques: ['Article 199 quater C du CGI'],
      argumentaire: (o) =>
        `Je souhaite bénéficier du crédit d'impôt pour cotisations syndicales (article 199 quater C du CGI). Crédit demandé : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 18. PINEL ═══
  pinel: {
    type: 'pinel',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `La réduction Pinel (case 7CQ) vous permet de déduire une part de votre investissement locatif. Économie annuelle estimée : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 199 novovicies du CGI',
    },
    guide: {
      titre: 'Déclarer un investissement Pinel',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Rubrique "Investissements locatifs" → dispositif Pinel',
        'Case 7CQ (ou 7CI/7CJ selon durée d\'engagement)',
        'Reporter le montant de l\'investissement selon le formulaire 2042 RICI',
        'Justificatifs : acte notarié, bail, déclaration d\'achèvement',
      ],
      caseAModifier: '7CQ',
    },
    reclamation: {
      articlesJuridiques: ['Article 199 novovicies du CGI'],
      argumentaire: (o) =>
        `Je demande la prise en compte de mon investissement Pinel (article 199 novovicies). Réduction annuelle : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 19. OUTRE-MER ═══
  outre_mer: {
    type: 'outre_mer',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `La réduction pour investissement outre-mer (case 7GH) s'élève à ${fmt(o.economie)}€.`,
      referenceCGI: 'Articles 199 undecies A et B du CGI',
    },
    guide: {
      titre: 'Déclarer un investissement outre-mer',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Formulaire 2042 IOM (investissements outre-mer)',
        'Case selon le dispositif (7GH pour Girardin industriel)',
        'Fournir les attestations de l\'organisme agréé',
      ],
      caseAModifier: '7GH',
    },
    reclamation: {
      articlesJuridiques: ['Articles 199 undecies A et B du CGI'],
      argumentaire: (o) =>
        `Je demande la réduction pour investissement outre-mer. Montant : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 20. FORÊT ═══
  foret: {
    type: 'foret',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `La réduction pour investissement forestier (case 7WN) s'élève à ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 199 decies H du CGI',
    },
    guide: {
      titre: 'Déclarer un investissement forestier',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Rubrique "Réductions et crédits d\'impôt"',
        'Case 7WN : montant de l\'investissement forestier',
        'Justificatif : attestation du groupement forestier',
      ],
      caseAModifier: '7WN',
    },
    reclamation: {
      articlesJuridiques: ['Article 199 decies H du CGI'],
      argumentaire: (o) =>
        `Je demande la réduction pour investissement forestier (article 199 decies H). Réduction : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 21. RÉNOVATION ÉNERGÉTIQUE ═══
  renovation_energetique: {
    type: 'renovation_energetique',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `Vos travaux de rénovation énergétique ouvrent droit à un crédit estimé à ${fmt(o.economie)}€ (case 7RN).`,
      referenceCGI: 'Article 200 quater du CGI / MaPrimeRénov\'',
    },
    guide: {
      titre: 'Déclarer des travaux de rénovation énergétique',
      etapes: () => [
        'Vérifiez votre éligibilité sur maprimerenov.gouv.fr',
        'Connectez-vous sur impots.gouv.fr',
        'Case 7RN ou cases spécifiques selon le type de travaux',
        'Justificatifs : factures entreprise RGE, attestation',
      ],
      caseAModifier: '7RN',
    },
    reclamation: {
      articlesJuridiques: ['Article 200 quater du CGI'],
      argumentaire: (o) =>
        `Je demande le crédit d'impôt pour travaux de rénovation énergétique (article 200 quater). Crédit : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 22. BORNE ÉLECTRIQUE ═══
  borne_electrique: {
    type: 'borne_electrique',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `L'installation de borne(s) de recharge donne un crédit de ${fmt(o.economie)}€ (300€/borne, case 7ZQ).`,
      referenceCGI: 'Article 200 quater C du CGI',
    },
    guide: {
      titre: 'Déclarer une borne de recharge',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Case 7ZQ : nombre de bornes installées (max 2)',
        'Justificatif : facture d\'installation',
      ],
      caseAModifier: '7ZQ',
    },
    reclamation: {
      articlesJuridiques: ['Article 200 quater C du CGI'],
      argumentaire: (o) =>
        `Je demande le crédit d'impôt pour installation de borne de recharge (article 200 quater C). Crédit : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 23. PRÊT ÉTUDIANT ═══
  pret_etudiant: {
    type: 'pret_etudiant',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `Les intérêts de prêt étudiant donnent un crédit de 25%, soit ${fmt(o.economie)}€ (max 625€/an, case 7TD).`,
      referenceCGI: 'Article 200 terdecies du CGI',
    },
    guide: {
      titre: 'Déclarer les intérêts de prêt étudiant',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Case 7TD : montant des intérêts payés dans l\'année',
        'Justificatif : attestation de votre banque',
        'Applicable les 5 premières années de remboursement',
      ],
      caseAModifier: '7TD',
    },
    reclamation: {
      articlesJuridiques: ['Article 200 terdecies du CGI'],
      argumentaire: (o) =>
        `Je demande le crédit pour intérêts de prêt étudiant (article 200 terdecies). Crédit : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 24. MICRO-FONCIER VS RÉEL ═══
  micro_foncier_vs_reel: {
    type: 'micro_foncier_vs_reel',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `Le passage au régime réel foncier (case 4BA) réduirait votre base imposable. Économie estimée : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 32 du CGI (micro-foncier) / Article 28 (réel)',
    },
    guide: {
      titre: 'Passer au régime réel foncier',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Remplir la déclaration 2044 (revenus fonciers au réel)',
        'Case 4BA : résultat net foncier (revenus - charges)',
        'Le choix du réel est irrévocable pendant 3 ans',
        'Charges déductibles : intérêts emprunt, travaux, assurance, taxe foncière',
      ],
      caseAModifier: '4BA',
    },
    reclamation: {
      articlesJuridiques: ['Article 28 du CGI', 'Article 31 du CGI'],
      argumentaire: (o) =>
        `Je souhaite opter pour le régime réel d'imposition de mes revenus fonciers (article 28 du CGI). Mes charges réelles dépassent l'abattement forfaitaire de 30%. Économie estimée : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 25. MICRO-BIC VS RÉEL ═══
  micro_bic_vs_reel: {
    type: 'micro_bic_vs_reel',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `Le passage au régime réel BIC permettrait de déduire vos charges réelles. Économie : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 50-0 du CGI (micro-BIC) / Article 38 (réel)',
    },
    guide: {
      titre: 'Passer au régime réel BIC',
      etapes: () => [
        'Adresser un courrier au SIE avant le 1er février',
        'Remplir la liasse fiscale 2031 + 2033',
        'Le choix est irrévocable pendant 2 ans',
        'Déductible : amortissements, intérêts, charges copro, travaux',
      ],
      caseAModifier: '5NK',
    },
    reclamation: {
      articlesJuridiques: ['Article 50-0 du CGI'],
      argumentaire: (o) =>
        `Je demande le passage au régime réel BIC. Mes charges réelles dépassent l'abattement micro. Économie : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 26. DÉFICIT FONCIER ═══
  deficit_foncier: {
    type: 'deficit_foncier',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `Le report de vos déficits fonciers (case 4BD) réduit votre base imposable. Économie : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 156, I, 3° du CGI',
    },
    guide: {
      titre: 'Reporter les déficits fonciers',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Déclaration 2044 : reporter les déficits des années antérieures',
        'Case 4BD : montant des déficits non encore imputés',
        'Les déficits sont reportables pendant 10 ans',
      ],
      caseAModifier: '4BD',
    },
    reclamation: {
      articlesJuridiques: ['Article 156, I, 3° du CGI'],
      argumentaire: (o) =>
        `Je demande l'imputation de mes déficits fonciers antérieurs (article 156, I, 3° du CGI). Dégrèvement : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 27. CSG DÉDUCTIBLE ═══
  csg_deductible: {
    type: 'csg_deductible',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `La CSG déductible (case 6DE) réduit votre revenu imposable. Économie : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 154 quinquies du CGI',
    },
    guide: {
      titre: 'Déduire la CSG sur revenus du patrimoine',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Case 6DE : montant de la CSG déductible (indiqué sur votre avis précédent)',
        'Ce montant est souvent pré-rempli mais vérifiez',
      ],
      caseAModifier: '6DE',
    },
    reclamation: {
      articlesJuridiques: ['Article 154 quinquies du CGI'],
      argumentaire: (o) =>
        `Je demande la déduction de la CSG sur mes revenus du patrimoine (article 154 quinquies). Dégrèvement : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 28. RATTACHEMENT ENFANT MAJEUR ═══
  rattachement_enfant: {
    type: 'rattachement_enfant',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `Comparez rattachement (demi-part ou abattement) vs imposition séparée de votre enfant majeur. Gain potentiel : ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 6, 3 du CGI / Article 196 B du CGI',
    },
    guide: {
      titre: 'Optimiser le rattachement enfant majeur',
      etapes: () => [
        'Simulez les deux options sur impots.gouv.fr',
        'Option 1 : rattachement → demi-part ou abattement de 6 674€',
        'Option 2 : déclaration séparée de l\'enfant + pension déductible',
        'Choisissez l\'option la plus avantageuse pour le foyer global',
      ],
      caseAModifier: '',
    },
    reclamation: {
      articlesJuridiques: ['Article 6, 3 du CGI', 'Article 196 B du CGI'],
      argumentaire: (o) =>
        `Je souhaite modifier le choix de rattachement de mon enfant majeur pour optimiser l'imposition du foyer. Économie estimée : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 29. PRESTATION COMPENSATOIRE ═══
  prestation_compensatoire: {
    type: 'prestation_compensatoire',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `La prestation compensatoire versée en capital (max 12 mois) donne une réduction de 25% soit ${fmt(o.economie)}€ (case 7WJ).`,
      referenceCGI: 'Article 199 octodecies du CGI',
    },
    guide: {
      titre: 'Déclarer une prestation compensatoire',
      etapes: () => [
        'Connectez-vous sur impots.gouv.fr',
        'Case 7WJ : montant versé en capital (dans les 12 mois)',
        'Si versée en rente : case 6GU (déduction du revenu)',
        'Justificatif : jugement de divorce + preuve de paiement',
      ],
      caseAModifier: '7WJ',
    },
    reclamation: {
      articlesJuridiques: ['Article 199 octodecies du CGI'],
      argumentaire: (o) =>
        `Je demande la réduction pour prestation compensatoire (article 199 octodecies). Réduction : ${fmt(o.economie)}€.`,
    },
  },

  // ═══ 30. ABATTEMENT DOM-TOM ═══
  abattement_dom_tom: {
    type: 'abattement_dom_tom',
    rapport: {
      situationActuelle: (o) => o.description,
      situationOptimisee: (o) =>
        `En tant que résident DOM-TOM, l'abattement de 30% (DOM) ou 40% (COM) réduit votre impôt de ${fmt(o.economie)}€.`,
      referenceCGI: 'Article 197, I, 3 du CGI',
    },
    guide: {
      titre: 'Vérifier l\'abattement DOM-TOM',
      etapes: () => [
        'L\'abattement est normalement appliqué automatiquement',
        'Vérifiez sur votre avis que la mention "DOM" apparaît',
        'DOM : abattement 30% (max 2 450€)',
        'COM (Saint-Martin, etc.) : 40% (max 4 050€)',
        'Si absent, réclamez auprès de votre centre des impôts',
      ],
      caseAModifier: '',
    },
    reclamation: {
      articlesJuridiques: ['Article 197, I, 3 du CGI'],
      argumentaire: (o) =>
        `En tant que résident d'un département d'outre-mer, je bénéficie d'un abattement de 30% sur mon impôt (article 197, I, 3 du CGI). Je demande l'application de cet abattement pour un dégrèvement de ${fmt(o.economie)}€.`,
    },
  },
}

// ─── HELPER : obtenir le template d'une optimisation ───

export function getOptimisationTemplate(type: string): OptimisationTemplate | undefined {
  return OPTIMISATION_TEMPLATES[type]
}
