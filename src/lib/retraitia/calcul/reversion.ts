// ============================================================
// RETRAITIA V2 — Calcul eligibilite reversion par regime
// ============================================================
// Verifie les conditions et estime le montant pour chaque
// regime du defunt. Source : BRIEF_PARCOURS_REVERSION.md §3
// ============================================================

import type {
  ReversionRegime, ReversionResult,
  DefuntInfo, SurvivantInfo, BaseRegime,
} from '../types'

// ── Regles par regime ──

interface RegleReversion {
  label: string
  taux: number
  conditionRessources: boolean
  plafondRessourcesSeul?: number
  plafondRessourcesCouple?: number
  conditionAgeMin?: number       // 0 = pas de condition
  conditionMariageDureeMin?: number // annees, 0 = pas de duree
  conditionEnfantExempteAge?: boolean
  perteSiRemariage: boolean
  perteSiPacs?: boolean
  retroactiviteIllimitee: boolean
  canal: string
}

const REGLES: Record<string, RegleReversion> = {
  cnav: {
    label: 'Retraite de base (CNAV)',
    taux: 54,
    conditionRessources: true,
    plafondRessourcesSeul: 24232,
    plafondRessourcesCouple: 38771,
    conditionAgeMin: 55,
    conditionMariageDureeMin: 0,
    conditionEnfantExempteAge: false,
    perteSiRemariage: true,
    retroactiviteIllimitee: false,
    canal: 'info-retraite.fr (demande unique)',
  },
  agirc_arrco: {
    label: 'Complementaire Agirc-Arrco',
    taux: 60,
    conditionRessources: false,
    conditionAgeMin: 55,
    conditionMariageDureeMin: 0,
    conditionEnfantExempteAge: true, // pas de condition age si 2+ enfants a charge
    perteSiRemariage: true,
    retroactiviteIllimitee: false,
    canal: 'agirc-arrco.fr (demande separee)',
  },
  sre: {
    label: 'Fonction publique Etat (SRE)',
    taux: 50,
    conditionRessources: false,
    conditionAgeMin: 0,
    conditionMariageDureeMin: 4,
    conditionEnfantExempteAge: true,
    perteSiRemariage: true,
    perteSiPacs: true,
    retroactiviteIllimitee: true,
    canal: 'ensap.gouv.fr',
  },
  cnracl: {
    label: 'Fonction publique territoriale/hospitaliere (CNRACL)',
    taux: 50,
    conditionRessources: false,
    conditionAgeMin: 0,
    conditionMariageDureeMin: 4,
    conditionEnfantExempteAge: true,
    perteSiRemariage: true,
    perteSiPacs: true,
    retroactiviteIllimitee: true,
    canal: 'cnracl.retraites.fr',
  },
  msa_salarie: {
    label: 'MSA salaries',
    taux: 54,
    conditionRessources: true,
    plafondRessourcesSeul: 24232,
    plafondRessourcesCouple: 38771,
    conditionAgeMin: 55,
    conditionMariageDureeMin: 0,
    perteSiRemariage: true,
    retroactiviteIllimitee: false,
    canal: 'info-retraite.fr (demande unique)',
  },
  msa_exploitant: {
    label: 'MSA exploitants',
    taux: 54,
    conditionRessources: true,
    plafondRessourcesSeul: 24232,
    plafondRessourcesCouple: 38771,
    conditionAgeMin: 55,
    conditionMariageDureeMin: 0,
    perteSiRemariage: true,
    retroactiviteIllimitee: false,
    canal: 'msa.fr',
  },
  ssi: {
    label: 'Independants (ex-RSI)',
    taux: 54,
    conditionRessources: true,
    plafondRessourcesSeul: 24232,
    plafondRessourcesCouple: 38771,
    conditionAgeMin: 55,
    conditionMariageDureeMin: 0,
    perteSiRemariage: true,
    retroactiviteIllimitee: false,
    canal: 'info-retraite.fr (demande unique)',
  },
  cnavpl: {
    label: 'Professions liberales (CNAVPL base)',
    taux: 54,
    conditionRessources: true,
    plafondRessourcesSeul: 24232,
    conditionAgeMin: 55,
    conditionMariageDureeMin: 0,
    perteSiRemariage: true,
    retroactiviteIllimitee: false,
    canal: 'info-retraite.fr + section',
  },
  rafp: {
    label: 'RAFP (additionnelle FP)',
    taux: 50,
    conditionRessources: false,
    conditionAgeMin: 0,
    conditionMariageDureeMin: 4,
    conditionEnfantExempteAge: true,
    perteSiRemariage: true,
    perteSiPacs: true,
    retroactiviteIllimitee: true,
    canal: 'info-retraite.fr',
  },
  ircantec: {
    label: 'Ircantec (contractuels FP)',
    taux: 50,
    conditionRessources: false,
    conditionAgeMin: 50,
    conditionMariageDureeMin: 0,
    perteSiRemariage: true,
    retroactiviteIllimitee: false,
    canal: 'info-retraite.fr',
  },
}

/**
 * Verifie l'eligibilite et estime la reversion pour tous les regimes du defunt.
 */
export function calculerReversion(
  defunt: DefuntInfo,
  survivant: SurvivantInfo,
): ReversionResult {
  const now = new Date()
  const dateDeces = new Date(defunt.dateDeces)
  const moisDepuisDeces = Math.floor((now.getTime() - dateDeces.getTime()) / (30.44 * 24 * 60 * 60 * 1000))

  const ageSurvivant = survivant.ressourcesAnnuelles !== undefined
    ? new Date().getFullYear() - new Date(defunt.dateDeces).getFullYear() + 55 // approximation
    : 65

  const dateMariage = new Date(survivant.dateMariage)
  const dureeMariageAnnees = Math.floor(
    (dateDeces.getTime() - dateMariage.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  )

  // Regimes a verifier : base + complementaires du defunt
  const regimesAVerifier: string[] = [...defunt.regimes]
  if (defunt.regimesComplementaires) {
    regimesAVerifier.push(...defunt.regimesComplementaires)
  } else {
    // Deduire les complementaires depuis les regimes de base
    for (const r of defunt.regimes) {
      if (r === 'cnav' || r === 'ssi' || r === 'msa_salarie') {
        if (!regimesAVerifier.includes('agirc_arrco')) regimesAVerifier.push('agirc_arrco')
      }
      if (r === 'sre' || r === 'cnracl') {
        if (!regimesAVerifier.includes('rafp')) regimesAVerifier.push('rafp')
      }
    }
  }

  const regimes: ReversionRegime[] = []
  let totalMin = 0
  let totalMax = 0

  for (const regimeId of regimesAVerifier) {
    const regle = REGLES[regimeId]
    if (!regle) continue

    const result = verifierEligibilite(regle, regimeId, defunt, survivant, ageSurvivant, dureeMariageAnnees, moisDepuisDeces)
    regimes.push(result)

    if (result.eligible) {
      totalMin += result.montantEstime.min
      totalMax += result.montantEstime.max
    }
  }

  const eligibleGlobal = regimes.some(r => r.eligible)

  // Retroactivite totale
  const retroMin = regimes.filter(r => r.eligible).reduce((s, r) => s + r.montantEstime.min * r.retroactiviteMois, 0)
  const retroMax = regimes.filter(r => r.eligible).reduce((s, r) => s + r.montantEstime.max * r.retroactiviteMois, 0)

  return {
    eligibleGlobal,
    regimes,
    totalEstimeMensuel: { min: Math.round(totalMin), max: Math.round(totalMax) },
    retroactiviteTotale: { min: Math.round(retroMin), max: Math.round(retroMax) },
    alerteRemariage: survivant.remarie || !!survivant.pacse,
    alerteRetroactivite: moisDepuisDeces > 12,
    moisDepuisDeces,
  }
}

function verifierEligibilite(
  regle: RegleReversion,
  regimeId: string,
  defunt: DefuntInfo,
  survivant: SurvivantInfo,
  ageSurvivant: number,
  dureeMariageAnnees: number,
  moisDepuisDeces: number,
): ReversionRegime {
  let eligible = true
  let motif: string | undefined

  // 1. Remariage
  if (regle.perteSiRemariage && survivant.remarie) {
    eligible = false
    motif = 'Remariage : perte du droit a reversion'
  }
  if (regle.perteSiPacs && survivant.pacse) {
    eligible = false
    motif = 'PACS : perte du droit a reversion (fonction publique)'
  }

  // 2. Age
  if (regle.conditionAgeMin && regle.conditionAgeMin > 0 && ageSurvivant < regle.conditionAgeMin) {
    if (regle.conditionEnfantExempteAge && survivant.enfantsACharge >= 2) {
      // Exempte si 2+ enfants a charge (Agirc-Arrco)
    } else if (regle.conditionEnfantExempteAge && survivant.enfantsACharge >= 1 && (regimeId === 'sre' || regimeId === 'cnracl')) {
      // Exempte si 1+ enfant du mariage (FP)
    } else {
      eligible = false
      motif = `Condition d'age non remplie (${regle.conditionAgeMin} ans requis)`
    }
  }

  // 3. Duree de mariage
  if (regle.conditionMariageDureeMin && regle.conditionMariageDureeMin > 0 && dureeMariageAnnees < regle.conditionMariageDureeMin) {
    if (regle.conditionEnfantExempteAge && survivant.enfantsACharge >= 1) {
      // Exempte si enfant du mariage (FP)
    } else {
      eligible = false
      motif = `Duree de mariage insuffisante (${regle.conditionMariageDureeMin} ans requis, ${dureeMariageAnnees} ans)`
    }
  }

  // 4. Conditions de ressources
  let conditionRessourcesOK = true
  if (regle.conditionRessources && regle.plafondRessourcesSeul) {
    if (survivant.ressourcesAnnuelles > regle.plafondRessourcesSeul) {
      eligible = false
      conditionRessourcesOK = false
      motif = `Ressources (${Math.round(survivant.ressourcesAnnuelles)}EUR/an) > plafond (${regle.plafondRessourcesSeul}EUR/an)`
    }
  }

  // Estimation du montant
  let montantMin = 0
  let montantMax = 0
  if (eligible) {
    const pensionDefunt = (defunt.etaitRetraite && defunt.pensionBase)
      ? defunt.pensionBase + (defunt.pensionComplementaire || 0)
      : 0

    if (pensionDefunt > 0) {
      // On a la pension du defunt
      const isComplementaire = ['agirc_arrco', 'rafp', 'ircantec'].includes(regimeId)
      const basePension = isComplementaire
        ? (defunt.pensionComplementaire || pensionDefunt * 0.35)
        : (defunt.pensionBase || pensionDefunt * 0.65)
      montantMin = Math.round(basePension * regle.taux / 100 * 0.9)
      montantMax = Math.round(basePension * regle.taux / 100 * 1.1)
    } else {
      // Pas de pension connue → fourchette large
      const isComplementaire = ['agirc_arrco', 'rafp', 'ircantec'].includes(regimeId)
      if (isComplementaire) {
        montantMin = 100
        montantMax = 500
      } else {
        montantMin = 200
        montantMax = 1000
      }
    }
  }

  // Retroactivite
  const retroMois = regle.retroactiviteIllimitee
    ? moisDepuisDeces
    : Math.min(12, moisDepuisDeces)

  return {
    regime: regimeId,
    label: regle.label,
    taux: regle.taux,
    conditionRessources: regle.conditionRessources,
    conditionAge: !!(regle.conditionAgeMin && regle.conditionAgeMin > 0),
    conditionAgeMin: regle.conditionAgeMin,
    conditionMariage: !!(regle.conditionMariageDureeMin && regle.conditionMariageDureeMin > 0),
    conditionMariageDureeMin: regle.conditionMariageDureeMin,
    eligible,
    motifIneligibilite: motif,
    montantEstime: { min: montantMin, max: montantMax },
    retroactiviteMois: eligible ? retroMois : 0,
    retroactiviteIllimitee: regle.retroactiviteIllimitee,
    canal: regle.canal,
    status: 'todo',
  }
}
