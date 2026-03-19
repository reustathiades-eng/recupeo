// ============================================================
// MONIMPÔT V2 — Mapper extraction → formulaire + cases vides
// ============================================================

import type { MonimpotFormData, SituationFamiliale } from './types'
import type { AvisImpositionExtracted, MultiAvisData } from './extract-types'

// ─── Mapper situation familiale (avis → formulaire) ───

const SITUATION_MAP: Record<string, SituationFamiliale> = {
  M: 'marie_pacse',
  O: 'marie_pacse',
  C: 'celibataire',
  D: 'divorce_separe',
  V: 'veuf',
}

// ─── Mapper extraction → données formulaire pré-remplies ───

export function mapExtractionToFormData(
  extraction: AvisImpositionExtracted
): Partial<MonimpotFormData> {
  const cases = extraction.casesRenseignees

  // Détecter le type de revenus depuis les montants extraits
  let typeRevenus: MonimpotFormData['typeRevenus'] = 'salaires'
  if (extraction.salairesTraitements && extraction.pensionsRetraite) {
    typeRevenus = extraction.salairesTraitements > extraction.pensionsRetraite ? 'mixte' : 'retraite'
  } else if (extraction.pensionsRetraite && !extraction.salairesTraitements) {
    typeRevenus = 'retraite'
  }

  // Inférer la situation si le défaut 'C' est incohérent avec les parts
  let situation = SITUATION_MAP[extraction.situationFamiliale] || 'celibataire'
  if (situation === 'celibataire' && extraction.nbPartsDeclarees >= 2 && extraction.nbPersonnesCharge === 0) {
    situation = 'marie_pacse'
  }

  // Inférer les enfants depuis les parts si non détectés
  let enfantsMineurs = Math.max(0, extraction.nbPersonnesCharge)
  if (enfantsMineurs === 0 && extraction.nbPartsDeclarees > 0) {
    const baseParts = (situation === 'marie_pacse') ? 2 : 1
    const remaining = extraction.nbPartsDeclarees - baseParts
    if (remaining > 0) {
      enfantsMineurs = remaining <= 1 ? Math.round(remaining / 0.5) : 2 + Math.round(remaining - 1)
    }
  }

  return {
    situation,
    nbParts: extraction.nbPartsDeclarees,
    revenuNetImposable: extraction.revenuNetImposable,
    impotPaye: extraction.impotNet, // impotNet = impôt annuel réel (toujours >= 0), PAS le solde/restitution
    typeRevenus,
    enfantsMineurs,
    enfantsMajeurs: 0,
    vivezSeul: false, // Non extractible de l'avis → question SmartForm
    eleveSeul5ans: extraction.caseL,
    invalidite: false, // Non extractible → question si applicable

    // Cases renseignées → booleans + montants
    fraisReels: (cases.fraisReels1AK ?? 0) > 0,
    ...(cases.fraisReels1AK && cases.fraisReels1AK > 0 ? {} : {}),

    pensionAlimentaire: (cases.pensionVersee6EL ?? 0) > 0,
    pensionMontantMois: cases.pensionVersee6EL
      ? Math.round(cases.pensionVersee6EL / 12)
      : undefined,

    dons: (cases.dons7UF ?? 0) > 0 || (cases.dons7UD ?? 0) > 0,
    donsMontantAn: (cases.dons7UF ?? 0) + (cases.dons7UD ?? 0) || undefined,

    emploiDomicile: (cases.emploiDomicile7DB ?? 0) > 0,
    emploiDomicileMontantAn: cases.emploiDomicile7DB || undefined,

    gardeEnfant: (cases.gardeEnfant7GA ?? 0) > 0,
    gardeMontantAn: cases.gardeEnfant7GA || undefined,

    ehpad: (cases.ehpad7CD ?? 0) > 0,
    ehpadMontantAn: cases.ehpad7CD || undefined,

    per: (cases.per6NS ?? 0) > 0,
    perMontantAn: cases.per6NS || undefined,

    revenusCapitaux: (extraction.revenusCapitaux ?? 0) > 0,
    case2op: cases.case2OP,
  }
}

// ─── Détection des cases vides (= pistes d'optimisation) ───

export interface CaseVide {
  key: string
  label: string
  caseImpot: string
  question: string
  condition?: (extraction: AvisImpositionExtracted) => boolean
}

const CASES_ANALYSABLES: CaseVide[] = [
  {
    key: 'fraisReels1AK',
    label: 'Frais réels',
    caseImpot: '1AK',
    question: 'Quelle est votre distance domicile-travail (km aller simple) ?',
    condition: (e) => (e.salairesTraitements ?? 0) > 0, // Pertinent si salaires
  },
  {
    key: 'pensionVersee6EL',
    label: 'Pension alimentaire versée',
    caseImpot: '6EL',
    question: 'Versez-vous une pension alimentaire ? Si oui, quel montant par mois ?',
  },
  {
    key: 'dons7UF',
    label: 'Dons aux associations',
    caseImpot: '7UF',
    question: 'Faites-vous des dons à des associations ? Si oui, quel montant total par an ?',
  },
  {
    key: 'emploiDomicile7DB',
    label: 'Emploi à domicile',
    caseImpot: '7DB',
    question: "Employez-vous quelqu'un à domicile (ménage, garde, jardin...) ? Si oui, quel montant annuel ?",
  },
  {
    key: 'gardeEnfant7GA',
    label: 'Frais de garde enfant',
    caseImpot: '7GA',
    question: 'Avez-vous des frais de garde pour un enfant de moins de 6 ans ? Si oui, quel montant annuel ?',
    condition: (e) => e.nbPersonnesCharge > 0,
  },
  {
    key: 'ehpad7CD',
    label: 'Hébergement EHPAD',
    caseImpot: '7CD',
    question: 'Payez-vous un hébergement en EHPAD pour un proche ? Si oui, quel montant annuel ?',
  },
  {
    key: 'per6NS',
    label: 'Versements PER',
    caseImpot: '6NS',
    question: 'Versez-vous sur un Plan Épargne Retraite (PER) ? Si oui, quel montant annuel ?',
  },
  {
    key: 'investPME7CF',
    label: 'Investissement PME',
    caseImpot: '7CF',
    question: 'Avez-vous investi au capital de PME ? Si oui, quel montant ?',
  },
]

export function detectCasesVides(extraction: AvisImpositionExtracted): CaseVide[] {
  const cases = extraction.casesRenseignees

  return CASES_ANALYSABLES.filter(cv => {
    // Vérifier la condition (si elle existe)
    if (cv.condition && !cv.condition(extraction)) return false

    // La case est vide si la valeur est 0, undefined, ou false
    const val = (cases as Record<string, unknown>)[cv.key]
    return val === undefined || val === 0 || val === null || val === false
  })
}

/**
 * Génère les questions complémentaires à poser dans le SmartForm.
 * Toujours inclure : vivezSeul (si D/C/V), age (pour abattement seniors), email
 */
export function generateQuestionsComplementaires(
  extraction: AvisImpositionExtracted,
  casesVides: CaseVide[]
): string[] {
  const questions: string[] = []

  // Questions non extractibles de l'avis
  const sit = extraction.situationFamiliale
  if ((sit === 'C' || sit === 'D' || sit === 'V') && extraction.nbPersonnesCharge > 0 && !extraction.caseT) {
    questions.push('Vivez-vous seul(e) avec vos enfants ? (case T — parent isolé)')
  }

  if (!extraction.caseL && extraction.nbPersonnesCharge === 0) {
    questions.push('Avez-vous élevé seul(e) un enfant pendant au moins 5 ans ? (case L)')
  }

  // Âge pour abattement seniors (pas sur l'avis)
  questions.push('Quel est votre âge ?')

  // Questions pour chaque case vide
  for (const cv of casesVides) {
    questions.push(cv.question)
  }

  return questions
}

// ─── Comparaison multi-avis (3 ans) ───

export function compareMultiAvis(avis: AvisImpositionExtracted[]): MultiAvisData['comparaison'] {
  if (avis.length < 2) return undefined

  // Trier par année décroissante
  const sorted = [...avis].sort((a, b) => b.annee - a.annee)

  // Évolution impôt + RFR
  const evolution = sorted.map(a => ({
    annee: a.annee,
    impot: a.impotNet,
    rfr: a.rfr,
  }))

  // Détecter les cases perdues (renseignées une année, absentes la suivante)
  const casesPerduees: Array<{ annee: number; case_: string; description: string }> = []

  const CASE_LABELS: Record<string, string> = {
    fraisReels1AK: 'Frais réels (1AK)',
    pensionVersee6EL: 'Pension alimentaire (6EL)',
    dons7UF: 'Dons associations (7UF)',
    dons7UD: 'Dons aide personnes (7UD)',
    emploiDomicile7DB: 'Emploi à domicile (7DB)',
    gardeEnfant7GA: 'Garde enfant (7GA)',
    ehpad7CD: 'EHPAD (7CD)',
    per6NS: 'PER (6NS)',
    investPME7CF: 'Investissement PME (7CF)',
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const anneeRecente = sorted[i]
    const anneePrecedente = sorted[i + 1]

    for (const [key, label] of Object.entries(CASE_LABELS)) {
      const valRecente = (anneeRecente.casesRenseignees as Record<string, unknown>)[key]
      const valPrecedente = (anneePrecedente.casesRenseignees as Record<string, unknown>)[key]

      const recenteVide = valRecente === undefined || valRecente === 0 || valRecente === null
      const precedenteRemplie = valPrecedente !== undefined && valPrecedente !== 0 && valPrecedente !== null

      if (recenteVide && precedenteRemplie) {
        const montant = typeof valPrecedente === 'number' ? valPrecedente : 0
        casesPerduees.push({
          annee: anneeRecente.annee,
          case_: key,
          description: `${label} : ${montant > 0 ? `${montant}€ en ${anneePrecedente.annee}` : `déclaré en ${anneePrecedente.annee}`}, absent en ${anneeRecente.annee}`,
        })
      }
    }
  }

  return { casesPerduees, evolution }
}
