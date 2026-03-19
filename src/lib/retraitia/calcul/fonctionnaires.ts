// ============================================================
// RETRAITIA V2 — Moteur de calcul Fonctionnaires (SRE + CNRACL)
// ============================================================
// Source : BRIEF_MOTEUR_CALCUL.md §3, BRIEF_REGIMES_SPECIFIQUES.md §3-4
// Formule : Traitement indiciaire × 75% × (Trim services + bonif / Trim requis)
// ============================================================

import type {
  CalculFP, ValueWithConfidence, ConfidenceLevel,
  ExtractionRIS, ExtractionNotificationFP, DossierFormulaire,
} from '../types'
import {
  getTrimestresRequis, getMinimumGaranti, getValeurPointIndiceFP,
  CONSTANTES,
} from '../data'

interface CalculFPInput {
  ris?: ExtractionRIS
  notification?: ExtractionNotificationFP
  formulaire: DossierFormulaire
  regime: 'sre' | 'cnracl'
}

function vc<T = number>(value: T, confidence: ConfidenceLevel, source: string): ValueWithConfidence<T> {
  return { value, confidence, source }
}

const FP = CONSTANTES.fonctionnaires

/**
 * Calcul pension fonctionnaire (SRE ou CNRACL).
 */
export function calculerFonctionnaires(input: CalculFPInput): CalculFP {
  const { ris, notification, formulaire, regime } = input
  const { identite, enfants, carriere } = formulaire

  const birthYear = new Date(identite.dateNaissance).getFullYear()
  const trimRequis = getTrimestresRequis(birthYear)

  // ── Indice majoré et traitement ──
  let indiceMajore: ValueWithConfidence<number>
  let traitementBrut: ValueWithConfidence

  if (notification?.indiceMajore) {
    indiceMajore = vc(notification.indiceMajore, 'CERTAIN', 'Notification FP')
    const valeurPt = getValeurPointIndiceFP()
    traitementBrut = vc(
      Math.round(notification.indiceMajore * valeurPt * 12 * 100) / 100,
      'HAUTE_CONFIANCE',
      `Indice ${notification.indiceMajore} × valeur point ${valeurPt}€ × 12`
    )
  } else if (notification?.traitementIndiciaireBrut) {
    traitementBrut = vc(notification.traitementIndiciaireBrut, 'CERTAIN', 'Notification FP')
    const valeurPt = getValeurPointIndiceFP()
    indiceMajore = vc(
      Math.round(notification.traitementIndiciaireBrut / (valeurPt * 12)),
      'HAUTE_CONFIANCE',
      `Déduit du traitement brut / (valeur point × 12)`
    )
  } else {
    // Pas de notification FP → estimation impossible
    indiceMajore = vc(0, 'ESTIMATION', 'Non disponible — notification FP requise')
    traitementBrut = vc(0, 'ESTIMATION', 'Non disponible — notification FP requise')
  }

  // ── Trimestres de services ──
  let trimServices: ValueWithConfidence<number>
  if (notification?.trimestresServices) {
    trimServices = vc(notification.trimestresServices, 'CERTAIN', 'Notification FP')
  } else if (ris) {
    // Compter les trimestres du régime FP dans le RIS
    const fpTrim = (ris.trimestres || [])
      .filter((a: any) => {
        const reg = (a.regime || '').toLowerCase()
        return reg.includes('sre') || reg.includes('cnracl') || reg.includes('état')
          || reg.includes('territoriale') || reg.includes('hospitalière')
      })
      .reduce((sum: number, a: any) => sum + (a.trimestres || 0), 0)
    trimServices = vc(fpTrim, 'HAUTE_CONFIANCE', 'Déduit du RIS (trimestres FP)')
  } else {
    trimServices = vc(0, 'ESTIMATION', 'Non disponible')
  }

  // ── Bonifications ──
  const bonifications: { type: string; trimestres: number }[] = []
  if (notification?.bonifications) {
    bonifications.push(...notification.bonifications)
  }
  // Bonifications enfants (ancien dispositif : femmes, enfants nés avant 2004)
  if (identite.sexe === 'F' && enfants.nombreEnfants > 0) {
    // Simplifié : 2 trim/enfant pour les enfants nés avant 2004
    const bonifEnfants = enfants.nombreEnfants * 2
    bonifications.push({ type: 'enfants', trimestres: bonifEnfants })
  }

  const totalTrimAvecBonif = trimServices.value + bonifications.reduce((s, b) => s + b.trimestres, 0)
  const trimRequisVal = trimRequis ?? 170

  // ── Proratisation ──
  const proratBrute = totalTrimAvecBonif / trimRequisVal
  const prorat = Math.min(1, proratBrute)
  const proratisation = vc(
    Math.round(prorat * 10000) / 10000,
    trimServices.confidence,
    `${totalTrimAvecBonif} / ${trimRequisVal}`
  )

  // ── Taux de liquidation ──
  // Tous régimes confondus pour le taux
  const trimTousRegimes = ris
    ? (ris.totalTrimestresValides || totalTrimAvecBonif)
    : totalTrimAvecBonif

  let tauxPct = FP.taux_plein_pct // 75%
  let decoteInfo: { trimestres: number; impact: number } | undefined
  let surcoteInfo: { trimestres: number; impact: number } | undefined

  const trimManquants = Math.max(0, trimRequisVal - trimTousRegimes)
  if (trimManquants > 0) {
    const trimDecote = Math.min(trimManquants, 20)
    const decotePct = trimDecote * FP.decote_par_trimestre_taux // 1.25% par trim sur le taux
    tauxPct = FP.taux_plein_pct - decotePct
    decoteInfo = {
      trimestres: trimDecote,
      impact: Math.round(decotePct * 100) / 100,
    }
  }

  const trimSupp = Math.max(0, trimTousRegimes - trimRequisVal)
  if (trimSupp > 0 && trimManquants === 0) {
    const surcotePct = trimSupp * FP.surcote_par_trimestre
    tauxPct = FP.taux_plein_pct + surcotePct
    surcoteInfo = {
      trimestres: trimSupp,
      impact: Math.round(surcotePct * 100) / 100,
    }
  }

  const taux = vc(
    Math.round(tauxPct * 100) / 100,
    trimServices.confidence,
    decoteInfo
      ? `75% - ${decoteInfo.impact}% (décote ${decoteInfo.trimestres} trim)`
      : surcoteInfo
        ? `75% + ${surcoteInfo.impact}% (surcote ${surcoteInfo.trimestres} trim)`
        : `Taux plein 75%`
  )

  // ── Pension brute ──
  const pensionAnnuelle = traitementBrut.value > 0
    ? Math.round(traitementBrut.value * (tauxPct / 100) * prorat * 100) / 100
    : 0
  const pensionMensuelle = Math.round(pensionAnnuelle / 12 * 100) / 100

  const confidence: ConfidenceLevel = notification ? 'HAUTE_CONFIANCE' : 'ESTIMATION'

  // ── NBI ──
  let nbi: ValueWithConfidence<number> | undefined
  if (notification?.nbi) {
    nbi = vc(notification.nbi, 'CERTAIN', 'Notification FP')
  }

  // ── Majoration enfants ──
  let majorationEnfants: { applicable: boolean; montant: number } | undefined
  if (enfants.nombreEnfants >= 3) {
    majorationEnfants = {
      applicable: true,
      montant: Math.round(pensionMensuelle * 0.10 * 100) / 100,
    }
  }

  // ── Minimum garanti ──
  const anneesServices = Math.floor(trimServices.value / 4)
  const mgMensuel = getMinimumGaranti(anneesServices)
  let minimumGaranti: { eligible: boolean; montant: number } | undefined
  if (pensionMensuelle > 0 && pensionMensuelle < mgMensuel && trimManquants === 0) {
    minimumGaranti = { eligible: true, montant: Math.round(mgMensuel * 100) / 100 }
  } else {
    minimumGaranti = { eligible: false, montant: 0 }
  }

  return {
    regime,
    indiceMajore,
    traitementIndiciaireBrut: traitementBrut,
    tauxLiquidation: taux,
    trimestresServices: trimServices,
    trimestresRequis: trimRequisVal,
    bonifications,
    proratisation,
    pensionBruteAnnuelle: vc(pensionAnnuelle, confidence, `Traitement × ${tauxPct}% × ${prorat}`),
    pensionBruteMensuelle: vc(pensionMensuelle, confidence, `${pensionAnnuelle}€ / 12`),
    decote: decoteInfo,
    surcote: surcoteInfo,
    majorationEnfants,
    minimumGaranti,
    nbi,
  }
}
