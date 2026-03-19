// ============================================================
// RETRAITIA V2 — Detecteur d'anomalies
// ============================================================
// Compare les resultats du moteur de calcul avec la notification
// du client pour detecter les 41 anomalies cataloguees.
// Source : BRIEF_ANOMALY_DETECTION.md
// ============================================================

import type {
  DetectedAnomaly, DiagnosticResult, DossierScore,
  AnomalyId, AnomalyLevel, ConfidenceLevel,
  CalculResult, DossierFormulaire, DossierExtractions,
} from '../types'
import { ANOMALY_BY_ID } from './catalogue'
import { getEsperanceVie } from '../data'

// ─────────────────────────────────────────────
// Types internes
// ─────────────────────────────────────────────

interface DetectionInput {
  calcul: CalculResult
  formulaire: DossierFormulaire
  extractions: DossierExtractions
}

// ─────────────────────────────────────────────
// Detecteur principal
// ─────────────────────────────────────────────

export function detectAnomalies(input: DetectionInput): DiagnosticResult {
  const { calcul, formulaire, extractions } = input
  const anomalies: DetectedAnomaly[] = []

  // ── N1 : Retraite de base ──
  detectN1Anomalies(anomalies, input)

  // ── N2 : Complementaire ──
  detectN2Anomalies(anomalies, input)

  // ── N4 : Aides (opportunites) ──
  detectN4Anomalies(anomalies, input)

  // ── N5 : Fiscal (opportunites) ──
  detectN5Anomalies(anomalies, input)

  // ── N6 : CSG ──
  detectN6Anomalies(anomalies, input)

  // ── Scoring ──
  const scored = anomalies.map(a => ({
    ...a,
    score: scoreAnomaly(a),
  })).sort((a, b) => b.score - a.score)

  // ── Impact cumule ──
  const birthYear = new Date(formulaire.identite.dateNaissance).getFullYear()
  const sexe = formulaire.identite.sexe
  const dateDepart = formulaire.carriere.retraiteDateDepart

  let impactCumulePasseTotal = 0
  let impactCumuleFuturMin = 0
  let impactCumuleFuturMax = 0

  if (dateDepart) {
    const moisDepuisDepart = monthsDiff(new Date(dateDepart), new Date())
    const esperanceVie = getEsperanceVie(birthYear, sexe)
    const ageActuel = new Date().getFullYear() - birthYear
    const anneesRestantes = Math.max(0, esperanceVie - (ageActuel - 62) + 62 - ageActuel)

    for (const a of scored) {
      impactCumulePasseTotal += a.impactMensuel.max * moisDepuisDepart
      impactCumuleFuturMin += a.impactMensuel.min * 12 * anneesRestantes
      impactCumuleFuturMax += a.impactMensuel.max * 12 * anneesRestantes

      a.impactPasse = Math.round(a.impactMensuel.max * moisDepuisDepart)
      a.impactFutur = {
        min: Math.round(a.impactMensuel.min * 12 * anneesRestantes),
        max: Math.round(a.impactMensuel.max * 12 * anneesRestantes),
      }
    }
  }

  // ── Score global ──
  const erreurs = scored.filter(a => a.categorie !== 'opportunite')
  const nbCertainesOuHautes = erreurs.filter(a =>
    a.confiance === 'CERTAIN' || a.confiance === 'HAUTE_CONFIANCE'
  ).length
  const impactMax = erreurs.reduce((sum, a) => sum + a.impactMensuel.max, 0)

  let scoreGlobal: DossierScore
  if (nbCertainesOuHautes >= 5 || impactMax > 300) scoreGlobal = 'BRONZE'
  else if (nbCertainesOuHautes >= 3 || impactMax > 150) scoreGlobal = 'ARGENT'
  else if (nbCertainesOuHautes >= 1 || impactMax > 50) scoreGlobal = 'OR'
  else scoreGlobal = 'PLATINE'

  // ── Nb par niveau ──
  const nbParNiveau: Record<AnomalyLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  for (const a of scored) {
    nbParNiveau[a.niveau]++
  }

  const impactMensuelMin = scored.reduce((s, a) => s + a.impactMensuel.min, 0)
  const impactMensuelMax = scored.reduce((s, a) => s + a.impactMensuel.max, 0)

  return {
    anomalies: scored,
    scoreGlobal,
    impactMensuelTotal: { min: Math.round(impactMensuelMin), max: Math.round(impactMensuelMax) },
    impactCumulePasseTotal: Math.round(impactCumulePasseTotal),
    impactCumuleFuturTotal: { min: Math.round(impactCumuleFuturMin), max: Math.round(impactCumuleFuturMax) },
    nbParNiveau,
    precisionAudit: calcul.precisionAudit,
    seuilGratuit: impactMensuelMax < 30,
    documentsUtilises: calcul.documentsUtilises,
    dateGeneration: new Date().toISOString(),
  }
}

// ─────────────────────────────────────────────
// N1 — Retraite de base
// ─────────────────────────────────────────────

function detectN1Anomalies(out: DetectedAnomaly[], input: DetectionInput) {
  const { calcul, formulaire, extractions } = input
  const { cnav } = calcul
  if (!cnav) return

  // N1_TRIM_MILITAIRE
  if (formulaire.carriere.serviceMilitaire && extractions.ris) {
    const duree = formulaire.carriere.serviceMilitaireDureeMois || 12
    const trimMilitaire = Math.floor(duree / 3)
    // Chercher si le RIS contient des trimestres "service national"
    const hasServiceNational = extractions.ris.trimestres.some(t =>
      /service|national|militaire/i.test(t.regime)
    )
    if (!hasServiceNational && trimMilitaire > 0) {
      pushAnomaly(out, 'N1_TRIM_MILITAIRE', 'CERTAIN',
        `Service militaire de ${duree} mois = ${trimMilitaire} trimestres non reportes sur le RIS`,
        { min: 10, max: 80 },
      )
    }
  }

  // N1_TRIM_ENFANTS (femmes surtout)
  if (formulaire.enfants.nombreEnfants > 0) {
    const n = formulaire.enfants.nombreEnfants
    pushAnomaly(out, 'N1_TRIM_ENFANTS', 'ESTIMATION',
      `${n} enfant${n > 1 ? 's' : ''} = jusqu'a ${n * 8} trimestres (maternite + education) souvent absents du RIS`,
      { min: 0, max: Math.min(200, n * 25) },
    )
  }

  // N1_MAJORATION_ENFANTS_ABSENTE
  if (formulaire.enfants.nombreEnfants >= 3 && extractions.notificationCnav) {
    if (!extractions.notificationCnav.majorationEnfants) {
      const impact = cnav.pensionBruteMensuelle
        ? Math.round(cnav.pensionBruteMensuelle.value * 0.10)
        : 100
      pushAnomaly(out, 'N1_MAJORATION_ENFANTS_ABSENTE', 'CERTAIN',
        `3+ enfants mais majoration 10% absente de la notification (impact ~${impact}EUR/mois)`,
        { min: Math.round(impact * 0.8), max: impact },
      )
    }
  }

  // N1_SAM_INCORRECT
  if (cnav.sam && cnav.samNotification) {
    const ecart = cnav.sam.value - cnav.samNotification
    const pctEcart = Math.abs(ecart) / cnav.samNotification * 100
    if (pctEcart > 1) {
      const impactMensuel = cnav.taux && cnav.proratisation
        ? Math.abs(ecart * (cnav.taux.value / 100) * cnav.proratisation.value / 12)
        : Math.abs(ecart * 0.004) // approximation
      pushAnomaly(out, 'N1_SAM_INCORRECT', 'HAUTE_CONFIANCE',
        `SAM recalcule ${cnav.sam.value.toFixed(0)}EUR vs notification ${cnav.samNotification.toFixed(0)}EUR (ecart ${pctEcart.toFixed(1)}%)`,
        { min: Math.round(impactMensuel * 0.5), max: Math.round(impactMensuel) },
      )
    }
  }

  // N1_TAUX_INCORRECT
  if (cnav.taux && cnav.tauxNotification) {
    if (Math.abs(cnav.taux.value - cnav.tauxNotification) > 0.01) {
      const ecart = cnav.taux.value - cnav.tauxNotification
      pushAnomaly(out, 'N1_TAUX_INCORRECT', 'CERTAIN',
        `Taux recalcule ${cnav.taux.value}% vs notification ${cnav.tauxNotification}% (ecart ${ecart.toFixed(2)}pp)`,
        { min: 20, max: 200 },
      )
    }
  }

  // N1_SURCOTE_ABSENTE
  if (cnav.surcote && cnav.surcote.trimestres > 0 && extractions.notificationCnav) {
    if (!extractions.notificationCnav.surcote) {
      pushAnomaly(out, 'N1_SURCOTE_ABSENTE', 'CERTAIN',
        `${cnav.surcote.trimestres} trimestres de surcote non appliques (+${cnav.surcote.impact.toFixed(2)}%)`,
        { min: 20, max: 150 },
      )
    }
  }

  // N1_MINIMUM_CONTRIBUTIF
  if (cnav.minimumContributif?.eligible) {
    const complement = cnav.minimumContributif.montant - (cnav.pensionBruteMensuelle?.value ?? 0)
    if (complement > 0) {
      pushAnomaly(out, 'N1_MINIMUM_CONTRIBUTIF', 'HAUTE_CONFIANCE',
        `Pension ${cnav.pensionBruteMensuelle?.value?.toFixed(0)}EUR < minimum contributif ${cnav.minimumContributif.type} ${cnav.minimumContributif.montant.toFixed(0)}EUR`,
        { min: Math.round(complement * 0.8), max: Math.round(complement) },
      )
    }
  }

  // N1_SSI_MIGRATION (independants)
  if (formulaire.carriere.regimes.includes('ssi') && extractions.ris) {
    const annees2019_2020 = extractions.ris.trimestres.filter(t => t.annee >= 2019 && t.annee <= 2020)
    const trimBas = annees2019_2020.some(t => t.trimestresValides < 4)
    if (trimBas) {
      pushAnomaly(out, 'N1_SSI_MIGRATION', 'ESTIMATION',
        `Trimestres faibles en 2019-2020 pour un ex-independant — possible perte lors de la migration RSI`,
        { min: 20, max: 100 },
      )
    }
  }

  // ── Anomalies FP (fonctionnaires) ──
  const fp = calcul.fonctionnaires
  if (fp) {
    // N1_FP_TRAITEMENT_INCORRECT
    if (fp.traitementIndiciaireBrut.value > 0 && extractions.notificationFP?.traitementIndiciaireBrut) {
      const ecart = Math.abs(fp.traitementIndiciaireBrut.value - extractions.notificationFP.traitementIndiciaireBrut)
      if (ecart > 100) {
        pushAnomaly(out, 'N1_FP_TRAITEMENT_INCORRECT', 'HAUTE_CONFIANCE',
          `Traitement indiciaire recalcule ${fp.traitementIndiciaireBrut.value.toFixed(0)}EUR vs notification ${extractions.notificationFP.traitementIndiciaireBrut.toFixed(0)}EUR`,
          { min: 20, max: 200 },
        )
      }
    }

    // N1_FP_BONIFICATION_MANQUANTE
    if (fp.bonifications && fp.bonifications.length > 0 && extractions.notificationFP) {
      const notifBonif = extractions.notificationFP.bonifications || []
      for (const b of fp.bonifications) {
        const found = notifBonif.some((nb: any) => nb.type === b.type)
        if (!found && b.trimestres > 0) {
          pushAnomaly(out, 'N1_FP_BONIFICATION_MANQUANTE', 'ESTIMATION',
            `Bonification "${b.type}" (${b.trimestres} trim) non retrouvee sur la notification`,
            { min: 10, max: 100 },
          )
        }
      }
    }

    // N1_FP_MINIMUM_GARANTI
    if (fp.minimumGaranti?.eligible && fp.minimumGaranti.montant > 0) {
      const complement = fp.minimumGaranti.montant - fp.pensionBruteMensuelle.value
      if (complement > 0) {
        pushAnomaly(out, 'N1_FP_MINIMUM_GARANTI', 'HAUTE_CONFIANCE',
          `Pension FP ${fp.pensionBruteMensuelle.value.toFixed(0)}EUR < minimum garanti ${fp.minimumGaranti.montant.toFixed(0)}EUR`,
          { min: Math.round(complement * 0.8), max: Math.round(complement) },
        )
      }
    }
  }

  // ── N1_MSA_REVALORISATION (Chassaigne) ──
  const msa = calcul.msaExploitant
  if (msa?.chassaigne?.eligible && msa.chassaigne.complement > 0) {
    pushAnomaly(out, 'N1_MSA_REVALORISATION', 'HAUTE_CONFIANCE',
      `Revalorisation Chassaigne applicable : pension actuelle ${msa.chassaigne.montantAvant.toFixed(0)}EUR devrait etre ${msa.chassaigne.montantApres.toFixed(0)}EUR (+${msa.chassaigne.complement.toFixed(0)}EUR/mois)`,
      { min: Math.round(msa.chassaigne.complement * 0.8), max: Math.round(msa.chassaigne.complement) },
    )
  }
}

// ─────────────────────────────────────────────
// N2 — Complementaire
// ─────────────────────────────────────────────

function detectN2Anomalies(out: DetectedAnomaly[], input: DetectionInput) {
  const { calcul, formulaire, extractions } = input
  if (!calcul.agircArrco) return

  // N2_POINTS_MANQUANTS
  if (extractions.ris && extractions.agircArrco?.pointsParAnnee) {
    const risAnnees = new Set(extractions.ris.trimestres.map(t => t.annee))
    const aaAnnees = new Set(extractions.agircArrco.pointsParAnnee.map(p => p.annee))
    const manquantes = [...risAnnees].filter(a => !aaAnnees.has(a) && a >= 1962 && a <= 2024)
    if (manquantes.length > 0) {
      pushAnomaly(out, 'N2_POINTS_MANQUANTS', 'CERTAIN',
        `${manquantes.length} annees cotisees au RG sans points Agirc-Arrco: ${manquantes.slice(0, 5).join(', ')}${manquantes.length > 5 ? '...' : ''}`,
        { min: manquantes.length * 3, max: manquantes.length * 15 },
      )
    }
  }

  // N2_MAJORATION_AA
  if (formulaire.enfants.nombreEnfants >= 3 && extractions.agircArrco) {
    if (!extractions.agircArrco.majorationEnfants) {
      const impact = calcul.agircArrco.pensionMensuelle
        ? Math.round(calcul.agircArrco.pensionMensuelle.value * 0.10)
        : 40
      pushAnomaly(out, 'N2_MAJORATION_AA', 'ESTIMATION',
        `3+ enfants mais majoration 10% Agirc-Arrco non visible sur le releve (impact ~${impact}EUR/mois)`,
        { min: Math.round(impact * 0.5), max: impact },
      )
    }
  }

  // N2_MALUS_NON_LEVE
  if (calcul.agircArrco.malus?.actif) {
    const dateFin = calcul.agircArrco.malus.dateFin
    if (dateFin && new Date(dateFin) < new Date()) {
      pushAnomaly(out, 'N2_MALUS_NON_LEVE', 'CERTAIN',
        `Malus -10% toujours actif alors que les 3 ans sont depasses (fin prevue: ${dateFin})`,
        { min: 30, max: calcul.agircArrco.malus.impact },
      )
    }
  }

  // N2_GMP
  if (calcul.agircArrco.gmpVerification) {
    const gmp = calcul.agircArrco.gmpVerification
    const impact = gmp.pointsManquants * 1.44 / 12 // valeur approx du point / 12
    pushAnomaly(out, 'N2_GMP', 'HAUTE_CONFIANCE',
      `GMP non attribuee pour ${gmp.anneesConcernees.length} annees (${gmp.pointsManquants} points manquants)`,
      { min: Math.round(impact * 0.5), max: Math.round(impact) },
    )
  }

  // ── N2_RAFP_MANQUANT ──
  const compls = calcul.complementaires || []
  const rafp = compls.find(c => c.regime === 'rafp')
  if (rafp && rafp.totalPoints.value === 0 && formulaire.carriere.regimes.some(r => r === 'sre' || r === 'cnracl')) {
    pushAnomaly(out, 'N2_RAFP_MANQUANT', 'ESTIMATION',
      `Fonctionnaire sans points RAFP detectes depuis 2005 — verifier le releve`,
      { min: 5, max: 50 },
    )
  }

  // ── N2_IRCANTEC_OUBLIE ──
  const ircantec = compls.find(c => c.regime === 'ircantec')
  if (!ircantec && extractions.ris) {
    // Chercher des periodes contractuelles dans le RIS (regime general + FP)
    const hasContractuel = (extractions.ris.trimestres || []).some((a: any) => {
      const reg = (a.regime || '').toLowerCase()
      return (reg.includes('ircantec') || reg.includes('contractuel'))
    })
    if (hasContractuel) {
      pushAnomaly(out, 'N2_IRCANTEC_OUBLIE', 'ESTIMATION',
        `Periodes contractuelles FP detectees dans le RIS mais pas de releve Ircantec`,
        { min: 10, max: 80 },
      )
    }
  }

  // ── N2_RCI_CONVERSION ──
  const rci = compls.find(c => c.regime === 'rci')
  if (rci && formulaire.carriere.regimes.includes('ssi')) {
    // On signale systematiquement la verification pour les ex-independants
    pushAnomaly(out, 'N2_RCI_CONVERSION', 'ESTIMATION',
      `Ex-independant : verifier que les points RCI ont ete correctement convertis lors de la migration 2020`,
      { min: 5, max: 50 },
    )
  }

}

// ─────────────────────────────────────────────
// N4 — Aides (opportunites)
// ─────────────────────────────────────────────

function detectN4Anomalies(out: DetectedAnomaly[], input: DetectionInput) {
  const { formulaire, extractions } = input
  const birthYear = new Date(formulaire.identite.dateNaissance).getFullYear()
  const age = new Date().getFullYear() - birthYear

  // N4_EXONERATION_TF
  if (age >= 75 && formulaire.carriere.proprietaire && extractions.avisImposition) {
    if (extractions.avisImposition.rfr < 12500) {
      pushAnomaly(out, 'N4_EXONERATION_TF', 'ESTIMATION',
        `75+ ans, proprietaire, RFR ${extractions.avisImposition.rfr}EUR < seuil exoneration`,
        { min: 25, max: 170 },
      )
    }
  }

  // N5_CREDIT_IMPOT_EMPLOI_DOMICILE
  if (formulaire.carriere.emploiDomicile && extractions.avisImposition) {
    if (!extractions.avisImposition.creditImpotEmploiDomicile) {
      pushAnomaly(out, 'N5_CREDIT_IMPOT_EMPLOI_DOMICILE', 'ESTIMATION',
        `Emploi a domicile declare mais credit d'impot non visible sur l'avis`,
        { min: 42, max: 500 },
      )
    }
  }
}

// ─────────────────────────────────────────────
// N5 — Fiscal (opportunites)
// ─────────────────────────────────────────────

function detectN5Anomalies(out: DetectedAnomaly[], input: DetectionInput) {
  const { formulaire } = input
  const birthYear = new Date(formulaire.identite.dateNaissance).getFullYear()
  const age = new Date().getFullYear() - birthYear

  if (formulaire.carriere.ancienCombattant && age >= 75) {
    pushAnomaly(out, 'N5_DEMI_PART_ANCIEN_COMBATTANT', 'ESTIMATION',
      `Ancien combattant 75+ ans = demi-part fiscale supplementaire`,
      { min: 17, max: 125 },
    )
  }

  if (formulaire.carriere.invalidite && (formulaire.carriere.tauxInvalidite ?? 0) >= 80) {
    pushAnomaly(out, 'N5_DEMI_PART_INVALIDITE', 'ESTIMATION',
      `Invalidite 80%+ = demi-part fiscale supplementaire`,
      { min: 17, max: 125 },
    )
  }

  if (formulaire.enfants.parentIsole) {
    pushAnomaly(out, 'N5_DEMI_PART_PARENT_ISOLE', 'ESTIMATION',
      `Parent isole ayant eleve seul(e) un enfant 5+ ans = demi-part`,
      { min: 17, max: 125 },
    )
  }
}

// ─────────────────────────────────────────────
// N6 — CSG
// ─────────────────────────────────────────────

function detectN6Anomalies(out: DetectedAnomaly[], input: DetectionInput) {
  const { calcul } = input
  if (!calcul.csg) return

  if (calcul.csg.ecart && calcul.csg.ecart > 0 && calcul.csg.impactMensuel) {
    pushAnomaly(out, 'N6_CSG_TROP_ELEVEE', 'CERTAIN',
      `Taux CSG applique ${calcul.csg.tauxApplique}% vs theorique ${calcul.csg.tauxTheorique}% (RFR ${calcul.csg.rfr}EUR, ${calcul.csg.nombreParts} parts)`,
      { min: Math.round(calcul.csg.impactMensuel * 0.9), max: Math.round(calcul.csg.impactMensuel) },
    )
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function pushAnomaly(
  out: DetectedAnomaly[],
  id: AnomalyId,
  confiance: ConfidenceLevel,
  detail: string,
  impact: { min: number; max: number },
) {
  const def = ANOMALY_BY_ID[id]
  if (!def) return

  out.push({
    id,
    niveau: def.niveau,
    categorie: def.categorie,
    label: def.label,
    description: def.description,
    detail,
    confiance,
    source: def.donneesNecessaires.join(' + '),
    impactMensuel: impact,
    organisme: def.organisme,
    faciliteCorrection: def.faciliteCorrection,
    delaiEstime: def.delaiEstime,
    score: 0, // sera calcule apres
    crossSell: def.crossSell,
  })
}

function scoreAnomaly(a: DetectedAnomaly): number {
  let score = 0
  // Impact financier (0-50)
  score += Math.min(50, a.impactMensuel.max / 10)
  // Confiance (0-30)
  if (a.confiance === 'CERTAIN') score += 30
  else if (a.confiance === 'HAUTE_CONFIANCE') score += 20
  else score += 10
  // Facilite (0-20)
  if (a.faciliteCorrection === 'simple') score += 20
  else if (a.faciliteCorrection === 'moyen') score += 10
  else score += 5
  return Math.round(score)
}

function monthsDiff(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
}
