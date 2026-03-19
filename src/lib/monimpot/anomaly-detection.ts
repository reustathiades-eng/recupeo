// ============================================================
// MONIMPÔT V2 — Détection d'optimisations manquées (JS pur)
// ============================================================

import type { MonimpotFormData, Optimisation } from './types'
import { type MonimpotCalculations, getTMI } from './calculations'
import type { AvisImpositionExtracted } from './extract-types'

/**
 * Détecte les optimisations fiscales manquées.
 * Si une extraction est fournie, utilise les données réelles (RFR, cases renseignées)
 * pour une détection plus précise.
 */
export function detectOptimisations(
  data: MonimpotFormData,
  calc: MonimpotCalculations,
  extraction?: AvisImpositionExtracted,
  multiAvis?: AvisImpositionExtracted[]
): Optimisation[] {
  const opts: Optimisation[] = []

  // TMI réel basé sur le barème progressif
  const revParPart = data.revenuNetImposable / data.nbParts
  const tmi = getTMI(revParPart) || 0.11

  // RFR réel si extraction disponible (sinon approximation)
  const rfr = extraction?.rfr ?? data.revenuNetImposable

  // 1. Frais réels plus avantageux que l'abattement 10%
  if (!data.fraisReels && calc.fraisReelsPlusAvantageux && calc.gainFraisReels > 50) {
    const eco = Math.round(calc.gainFraisReels * tmi)
    opts.push({
      type: 'frais_reels',
      label: 'Frais réels plus avantageux',
      description: `Vos frais réels estimés (${calc.fraisReelsEstimes}€) dépassent l'abattement forfaitaire de 10% (${calc.abattement10pct}€). Déclarer les frais réels pourrait réduire votre impôt.`,
      economie: eco,
      priorite: eco > 300 ? 'haute' : 'moyenne',
      caseConcernee: '1AK',
    })
  }

  // 2. Case T — Parent isolé
  if ((data.situation === 'divorce_separe' || data.situation === 'celibataire') &&
      data.vivezSeul && data.enfantsMineurs > 0 && calc.ecartParts > 0) {
    opts.push({
      type: 'case_t',
      label: 'Case T — Parent isolé',
      description: 'Vous vivez seul(e) avec vos enfants. La case T vous donne une demi-part supplémentaire.',
      economie: Math.min(1759, Math.round(calc.economieAnnuelle * 0.4)),
      priorite: 'haute',
      caseConcernee: 'T',
    })
  }

  // 3. Case L — Ancien parent isolé
  if (data.eleveSeul5ans && data.enfantsMineurs === 0 && !data.vivezSeul) {
    opts.push({
      type: 'case_l',
      label: 'Case L — Ancien parent isolé',
      description: 'Vous avez élevé seul(e) un enfant pendant 5 ans ou plus. La case L vous donne une demi-part même si l\'enfant est parti.',
      economie: Math.min(1759, 800),
      priorite: 'haute',
      caseConcernee: 'L',
    })
  }

  // 4. Dons non déclarés
  if (!data.dons && data.donsMontantAn && data.donsMontantAn > 0) {
    const reduction = Math.round(data.donsMontantAn * 0.66)
    opts.push({
      type: 'dons_oublies',
      label: 'Dons aux associations non déclarés',
      description: `Vos dons de ${data.donsMontantAn}€ donnent droit à une réduction de 66% soit ${reduction}€.`,
      economie: reduction,
      priorite: reduction > 200 ? 'haute' : 'moyenne',
      caseConcernee: '7UF',
    })
  }

  // 5. Emploi à domicile non déclaré
  if (!data.emploiDomicile && data.emploiDomicileMontantAn && data.emploiDomicileMontantAn > 0) {
    const credit = Math.round(Math.min(data.emploiDomicileMontantAn, 12000) * 0.50)
    opts.push({
      type: 'emploi_domicile',
      label: 'Crédit emploi à domicile non utilisé',
      description: `Vos dépenses d'emploi à domicile donnent droit à un crédit d'impôt de 50% soit ${credit}€.`,
      economie: credit,
      priorite: 'haute',
      caseConcernee: '7DB',
    })
  }

  // 6. Frais de garde non déclarés
  if (!data.gardeEnfant && data.gardeMontantAn && data.gardeMontantAn > 0 && data.enfantsMineurs > 0) {
    const credit = Math.round(Math.min(data.gardeMontantAn, 3500 * data.enfantsMineurs) * 0.50)
    opts.push({
      type: 'garde_enfant',
      label: 'Frais de garde non déclarés',
      description: `Vos frais de garde donnent droit à un crédit d'impôt de 50% soit ${credit}€.`,
      economie: credit,
      priorite: credit > 200 ? 'haute' : 'moyenne',
      caseConcernee: '7GA',
    })
  }

  // 7. Pension alimentaire non déduite
  if (!data.pensionAlimentaire && data.pensionMontantMois && data.pensionMontantMois > 0) {
    const deduction = Math.min(data.pensionMontantMois * 12, 6674)
    const eco = Math.round(deduction * tmi)
    opts.push({
      type: 'pension_alimentaire',
      label: 'Pension alimentaire non déduite',
      description: `La pension versée est déductible du revenu imposable (max 6 674€/enfant), soit une économie d'environ ${eco}€.`,
      economie: eco,
      priorite: 'haute',
      caseConcernee: '6EL',
    })
  }

  // 8. EHPAD non déclaré
  if (!data.ehpad && data.ehpadMontantAn && data.ehpadMontantAn > 0) {
    const reduction = Math.round(Math.min(data.ehpadMontantAn, 10000) * 0.25)
    opts.push({
      type: 'ehpad',
      label: 'Hébergement EHPAD — réduction oubliée',
      description: `Les frais d'hébergement en EHPAD donnent droit à une réduction de 25% soit ${reduction}€.`,
      economie: reduction,
      priorite: 'haute',
      caseConcernee: '7CD',
    })
  }

  // 9. PER non déduit
  if (!data.per && data.perMontantAn && data.perMontantAn > 0) {
    const eco = Math.round(data.perMontantAn * tmi)
    opts.push({
      type: 'per_deduction',
      label: 'Versements PER non déduits',
      description: `Vos versements sur un PER sont déductibles du revenu imposable, soit une économie d'environ ${eco}€.`,
      economie: eco,
      priorite: eco > 200 ? 'haute' : 'moyenne',
      caseConcernee: '6NS',
    })
  }

  // 10. Abattement seniors — utiliser RFR réel si extraction
  if (data.age >= 65) {
    // Seuils 2026 : abattement si RFR < 17 200€ (2 746€) ou < 27 670€ (1 373€)
    const SEUIL_BAS = 17200
    const SEUIL_HAUT = 27670
    const ABATTEMENT_PLEIN = 2746
    const ABATTEMENT_DEMI = 1373

    let abattement = 0
    if (rfr <= SEUIL_BAS) abattement = ABATTEMENT_PLEIN
    else if (rfr <= SEUIL_HAUT) abattement = ABATTEMENT_DEMI

    if (abattement > 0) {
      const eco = Math.round(abattement * tmi)
      const source = extraction ? ' (calculé à partir du RFR réel extrait de votre avis)' : ''
      opts.push({
        type: 'abattement_senior',
        label: 'Abattement seniors ≥ 65 ans',
        description: `Vous bénéficiez d'un abattement automatique de ${abattement}€${source}. Vérifiez qu'il est bien appliqué sur votre avis.`,
        economie: eco,
        priorite: 'moyenne',
      })
    }
  }

  // 11. Quotient familial incorrect
  if (calc.ecartParts > 0 && !opts.find(o => o.type === 'case_t' || o.type === 'case_l')) {
    opts.push({
      type: 'quotient_familial',
      label: 'Quotient familial à vérifier',
      description: `Vos parts théoriques (${calc.partsTheoriques}) diffèrent de vos parts déclarées (${data.nbParts}). Une vérification s'impose.`,
      economie: Math.min(1759, Math.round(calc.ecartParts * 1000)),
      priorite: 'haute',
    })
  }

  // ═══ 12. NOUVEAU V2 : Option barème (case 2OP) ═══
  // Si revenus de capitaux et case 2OP non cochée, vérifier si le barème est plus avantageux
  if (data.revenusCapitaux && data.case2op === false && tmi < 0.128) {
    // PFU = 12.8% IR + 17.2% PS = 30%. Si TMI < 12.8%, le barème est meilleur
    // O5 — Calcul précis si montant des revenus de capitaux connu via extraction
    const revCapMontant = extraction?.revenusCapitaux ?? 0
    let eco2op = 100 // Estimation conservatrice par défaut
    if (revCapMontant > 0) {
      // Économie = revenusCapitaux × (PFU_IR - TMI) = revCap × (0.128 - tmi)
      eco2op = Math.max(50, Math.round(revCapMontant * (0.128 - tmi)))
    }
    opts.push({
      type: 'case_2op',
      label: 'Option barème progressif (case 2OP)',
      description: revCapMontant > 0
        ? `Vos revenus de capitaux (${revCapMontant}€) sont imposés au PFU (12,8%). Avec votre TMI à ${Math.round(tmi * 100)}%, le barème progressif serait plus avantageux.`
        : 'Votre tranche marginale est inférieure au prélèvement forfaitaire. Cocher la case 2OP pourrait réduire l\'imposition de vos revenus de capitaux.',
      economie: eco2op,
      priorite: eco2op > 200 ? 'haute' : 'moyenne',
      caseConcernee: '2OP',
    })
  }

  // ═══ 13. NOUVEAU V2 : Cases perdues (multi-avis) ═══
  if (multiAvis && multiAvis.length >= 2) {
    const sorted = [...multiAvis].sort((a, b) => b.annee - a.annee)
    const recent = sorted[0]
    const previous = sorted[1]

    const CASE_INFO: Record<string, { label: string; case_: string; estimateEco: (val: number) => number }> = {
      fraisReels1AK: { label: 'Frais réels', case_: '1AK', estimateEco: (v) => Math.round(v * tmi) },
      pensionVersee6EL: { label: 'Pension alimentaire', case_: '6EL', estimateEco: (v) => Math.round(Math.min(v, 6674) * tmi) },
      dons7UF: { label: 'Dons associations', case_: '7UF', estimateEco: (v) => Math.round(v * 0.66) },
      dons7UD: { label: 'Dons aide personnes', case_: '7UD', estimateEco: (v) => Math.round(v * 0.75) },
      emploiDomicile7DB: { label: 'Emploi à domicile', case_: '7DB', estimateEco: (v) => Math.round(Math.min(v, 12000) * 0.50) },
      gardeEnfant7GA: { label: 'Garde enfant', case_: '7GA', estimateEco: (v) => Math.round(Math.min(v, 3500) * 0.50) },
      ehpad7CD: { label: 'EHPAD', case_: '7CD', estimateEco: (v) => Math.round(Math.min(v, 10000) * 0.25) },
      per6NS: { label: 'PER', case_: '6NS', estimateEco: (v) => Math.round(v * tmi) },
    }

    for (const [key, info] of Object.entries(CASE_INFO)) {
      const valRecent = (recent.casesRenseignees as Record<string, unknown>)[key]
      const valPrevious = (previous.casesRenseignees as Record<string, unknown>)[key]

      const recentVide = valRecent === undefined || valRecent === 0 || valRecent === null
      const prevRempli = typeof valPrevious === 'number' && valPrevious > 0

      if (recentVide && prevRempli) {
        // Ne pas doubler avec une optimisation déjà détectée sur la même case
        const alreadyDetected = opts.some(o => o.caseConcernee === info.case_)
        if (alreadyDetected) continue

        const eco = info.estimateEco(valPrevious)
        opts.push({
          type: 'case_perdue',
          label: `Case perdue : ${info.label} (${info.case_})`,
          description: `En ${previous.annee}, vous déclariez ${valPrevious}€ en case ${info.case_} (${info.label}). En ${recent.annee}, cette case est vide. Si votre situation n'a pas changé, c'est un oubli.`,
          economie: eco,
          priorite: 'haute',
          caseConcernee: info.case_,
        })
      }
    }
  }


  // ═══ 14. Scolarité collège (case 7EA) ═══
  const nbCollege = data.enfantsCollege ?? 0
  if (nbCollege > 0) {
    const eco = nbCollege * 61
    opts.push({
      type: 'scolarite_college',
      label: 'Réduction scolarité collège',
      description: `${nbCollege} enfant${nbCollege > 1 ? 's' : ''} au collège = ${eco}€ de réduction d'impôt (61€ par enfant, case 7EA).`,
      economie: eco,
      priorite: eco > 100 ? 'moyenne' : 'basse',
      caseConcernee: '7EA',
    })
  }

  // ═══ 15. Scolarité lycée (case 7EC) ═══
  const nbLycee = data.enfantsLycee ?? 0
  if (nbLycee > 0) {
    const eco = nbLycee * 153
    opts.push({
      type: 'scolarite_lycee',
      label: 'Réduction scolarité lycée',
      description: `${nbLycee} enfant${nbLycee > 1 ? 's' : ''} au lycée = ${eco}€ de réduction d'impôt (153€ par enfant, case 7EC).`,
      economie: eco,
      priorite: eco > 200 ? 'haute' : 'moyenne',
      caseConcernee: '7EC',
    })
  }

  // ═══ 16. Scolarité supérieur (case 7EF) ═══
  const nbSup = data.enfantsSuperieur ?? 0
  if (nbSup > 0) {
    const eco = nbSup * 183
    opts.push({
      type: 'scolarite_superieur',
      label: 'Réduction scolarité supérieur',
      description: `${nbSup} enfant${nbSup > 1 ? 's' : ''} dans le supérieur = ${eco}€ de réduction d'impôt (183€ par enfant, case 7EF).`,
      economie: eco,
      priorite: eco > 200 ? 'haute' : 'moyenne',
      caseConcernee: '7EF',
    })
  }

  // ═══ 17. Cotisations syndicales (case 7UR) ═══
  const syndicat = data.cotisationsSyndicales ?? 0
  if (syndicat > 0) {
    const eco = Math.round(syndicat * 0.66)
    opts.push({
      type: 'syndicat',
      label: 'Crédit cotisations syndicales',
      description: `Vos cotisations syndicales de ${syndicat}€ donnent droit à un crédit d'impôt de 66%, soit ${eco}€ (case 7UR).`,
      economie: eco,
      priorite: eco > 100 ? 'moyenne' : 'basse',
      caseConcernee: '7UR',
    })
  }

  // ═══ 18. Investissement Pinel (case 7CQ) ═══
  const pinel = data.pinelMontant ?? 0
  if (pinel > 0) {
    // Pinel classique : 12% sur 6 ans, 18% sur 9 ans, 21% sur 12 ans — on prend 12%/an ÷ 6
    const eco = Math.round(pinel * 0.02) // ~2% par an
    opts.push({
      type: 'pinel',
      label: 'Réduction Pinel non déclarée',
      description: `Votre investissement Pinel de ${pinel}€ ouvre droit à une réduction annuelle estimée à ${eco}€ (case 7CQ).`,
      economie: eco,
      priorite: eco > 500 ? 'haute' : 'moyenne',
      caseConcernee: '7CQ',
    })
  }

  // ═══ 19. Investissement outre-mer (case 7GH) ═══
  const outreMer = data.outreMerMontant ?? 0
  if (outreMer > 0) {
    const eco = Math.round(outreMer * 0.25)
    opts.push({
      type: 'outre_mer',
      label: 'Réduction investissement outre-mer',
      description: `Investissement outre-mer de ${outreMer}€ : réduction estimée de ${eco}€ (case 7GH).`,
      economie: eco,
      priorite: eco > 500 ? 'haute' : 'moyenne',
      caseConcernee: '7GH',
    })
  }

  // ═══ 20. Investissement forestier (case 7WN) ═══
  const foret = data.investForestier ?? 0
  if (foret > 0) {
    const eco = Math.round(Math.min(foret, 5700) * 0.25)
    opts.push({
      type: 'foret',
      label: 'Réduction investissement forestier',
      description: `Investissement forestier de ${foret}€ : réduction de 25% soit ${eco}€ (case 7WN, plafond 5 700€).`,
      economie: eco,
      priorite: 'moyenne',
      caseConcernee: '7WN',
    })
  }

  // ═══ 21. Rénovation énergétique (case 7RN) ═══
  const reno = data.renovationEnergetique ?? 0
  if (reno > 0) {
    // MaPrimeRénov' Sérénité ou crédit transition énergétique résiduel
    const eco = Math.round(reno * 0.30) // Estimation 30%
    opts.push({
      type: 'renovation_energetique',
      label: 'Travaux de rénovation énergétique',
      description: `Travaux de ${reno}€ : aide/crédit estimé à ${eco}€. Vérifiez votre éligibilité à MaPrimeRénov' et aux crédits d'impôt (case 7RN).`,
      economie: eco,
      priorite: eco > 500 ? 'haute' : 'moyenne',
      caseConcernee: '7RN',
    })
  }

  // ═══ 22. Borne de recharge électrique (case 7ZQ) ═══
  const bornes = data.borneElectriqueMontant ?? 0
  if (bornes > 0) {
    const eco = Math.min(bornes, 2) * 300
    opts.push({
      type: 'borne_electrique',
      label: 'Crédit borne de recharge',
      description: `${bornes} borne${bornes > 1 ? 's' : ''} de recharge installée${bornes > 1 ? 's' : ''} : crédit de ${eco}€ (300€/borne, max 2, case 7ZQ).`,
      economie: eco,
      priorite: 'moyenne',
      caseConcernee: '7ZQ',
    })
  }

  // ═══ 23. Intérêts prêt étudiant (case 7TD) ═══
  const pretEtu = data.pretEtudiantMontant ?? 0
  if (pretEtu > 0) {
    const eco = Math.min(Math.round(pretEtu * 0.25), 625)
    opts.push({
      type: 'pret_etudiant',
      label: 'Crédit intérêts prêt étudiant',
      description: `Intérêts de prêt étudiant : crédit de 25% soit ${eco}€ (max 625€/an, case 7TD).`,
      economie: eco,
      priorite: eco > 200 ? 'moyenne' : 'basse',
      caseConcernee: '7TD',
    })
  }

  // ═══ 24. Micro-foncier vs réel (cases 4BE/4BA) ═══
  const loyersBruts = data.loyersBruts ?? 0
  const chargesLoc = data.chargesLocatives ?? 0
  if (loyersBruts > 0 && loyersBruts <= 15000 && chargesLoc > 0) {
    const abattMicro = Math.round(loyersBruts * 0.30)
    if (chargesLoc > abattMicro) {
      const gain = chargesLoc - abattMicro
      const eco = Math.round(gain * tmi)
      opts.push({
        type: 'micro_foncier_vs_reel',
        label: 'Régime réel plus avantageux que le micro-foncier',
        description: `Vos charges réelles (${chargesLoc}€) dépassent l'abattement micro-foncier de 30% (${abattMicro}€). Le régime réel réduirait votre base de ${gain}€, soit ~${eco}€ d'impôt en moins.`,
        economie: eco,
        priorite: eco > 300 ? 'haute' : 'moyenne',
        caseConcernee: '4BA',
      })
    }
  }

  // ═══ 25. Micro-BIC vs réel (cases 5ND/5NK) ═══
  const caMeuble = data.locationMeubleeCA ?? 0
  if (caMeuble > 0 && chargesLoc > 0) {
    const abattMicroBIC = Math.round(caMeuble * 0.50) // 50% services
    if (chargesLoc > abattMicroBIC) {
      const gain = chargesLoc - abattMicroBIC
      const eco = Math.round(gain * tmi)
      opts.push({
        type: 'micro_bic_vs_reel',
        label: 'Régime réel BIC plus avantageux',
        description: `Vos charges réelles (${chargesLoc}€) dépassent l'abattement micro-BIC de 50% (${abattMicroBIC}€). Économie estimée : ${eco}€.`,
        economie: eco,
        priorite: eco > 300 ? 'haute' : 'moyenne',
        caseConcernee: '5NK',
      })
    }
  }

  // ═══ 26. Déficits fonciers non reportés (case 4BD) ═══
  const deficits = data.deficitsFonciersAnterieurs ?? 0
  if (deficits > 0) {
    const eco = Math.round(Math.min(deficits, 10700) * tmi)
    opts.push({
      type: 'deficit_foncier',
      label: 'Déficits fonciers à reporter',
      description: `Déficits fonciers antérieurs de ${deficits}€ à reporter sur vos revenus fonciers (case 4BD). Économie estimée : ${eco}€.`,
      economie: eco,
      priorite: eco > 300 ? 'haute' : 'moyenne',
      caseConcernee: '4BD',
    })
  }

  // ═══ 27. CSG déductible (case 6DE) ═══
  const csgDed = data.csgDeductibleMontant ?? 0
  if (csgDed > 0) {
    const eco = Math.round(csgDed * tmi)
    opts.push({
      type: 'csg_deductible',
      label: 'CSG déductible non reportée',
      description: `CSG déductible de ${csgDed}€ sur vos revenus du patrimoine (case 6DE). Économie estimée : ${eco}€.`,
      economie: eco,
      priorite: eco > 200 ? 'moyenne' : 'basse',
      caseConcernee: '6DE',
    })
  }

  // ═══ 28. Rattachement enfant majeur (simulation) ═══
  if (data.enfantsMajeurs > 0 && data.revenuNetImposable > 30000) {
    // Abattement enfant rattaché = 6 674€ × nb enfants majeurs
    // vs impôt séparé de l'enfant (souvent 0 si revenus faibles)
    const abattement = 6674 * data.enfantsMajeurs
    const eco = Math.round(Math.min(abattement * tmi, 1759 * data.enfantsMajeurs))
    if (eco > 100) {
      opts.push({
        type: 'rattachement_enfant',
        label: 'Vérifier le rattachement vs imposition séparée',
        description: `Avec ${data.enfantsMajeurs} enfant${data.enfantsMajeurs > 1 ? 's' : ''} majeur${data.enfantsMajeurs > 1 ? 's' : ''} rattaché${data.enfantsMajeurs > 1 ? 's' : ''}, comparez : rattachement (abattement ${abattement}€) vs imposition séparée. Gain potentiel : ${eco}€.`,
        economie: eco,
        priorite: 'moyenne',
      })
    }
  }

  // ═══ 29. Prestation compensatoire (case 7WJ/6GU) ═══
  const prestComp = data.prestationCompensatoireMontant ?? 0
  if (prestComp > 0) {
    const eco = Math.min(Math.round(prestComp * 0.25), 7625)
    opts.push({
      type: 'prestation_compensatoire',
      label: 'Réduction prestation compensatoire',
      description: `Prestation compensatoire de ${prestComp}€ : réduction de 25% soit ${eco}€ (max 7 625€, versement sur 12 mois max).`,
      economie: eco,
      priorite: eco > 500 ? 'haute' : 'moyenne',
      caseConcernee: '7WJ',
    })
  }

  // ═══ 30. Abattement DOM-TOM ═══
  if (data.domTom === true) {
    // DOM : abattement 30% (plafond 2 450€), COM : 40% (plafond 4 050€)
    // On prend DOM par défaut (30%)
    const eco = Math.min(Math.round(calc.impotTheorique * 0.30), 2450)
    if (eco > 0) {
      opts.push({
        type: 'abattement_dom_tom',
        label: 'Abattement DOM-TOM',
        description: `En tant que résident DOM-TOM, vous bénéficiez d'un abattement de 30% sur l'impôt (plafonné à 2 450€ pour les DOM). Économie : ${eco}€.`,
        economie: eco,
        priorite: 'haute',
      })
    }
  }

  // Trier par économie décroissante
  return opts.sort((a, b) => b.economie - a.economie)
}
