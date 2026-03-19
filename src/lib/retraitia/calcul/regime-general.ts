// ============================================================
// RETRAITIA V2 — Moteur de calcul régime général (CNAV)
// ============================================================
// Source : BRIEF_MOTEUR_CALCUL.md §2
// Formules : SAM, taux, proratisation, majorations, MiCo
// ============================================================

import type {
  CalculCNAV, ValueWithConfidence, ConfidenceLevel,
  ExtractionRIS, ExtractionNotificationCNAV, DossierFormulaire,
} from '../types'
import {
  calculerSAM, getTrimestresRequis, getAgeLegalMois,
  AGE_TAUX_PLEIN_AUTO, getMinimumContributif,
  CONSTANTES,
} from '../data'

// ─────────────────────────────────────────────
// Types internes
// ─────────────────────────────────────────────

interface CalculInput {
  ris?: ExtractionRIS
  notification?: ExtractionNotificationCNAV
  formulaire: DossierFormulaire
}

function vc<T = number>(value: T, confidence: ConfidenceLevel, source: string): ValueWithConfidence<T> {
  return { value, confidence, source }
}

// ─────────────────────────────────────────────
// Calcul principal
// ─────────────────────────────────────────────

export function calculerRegimeGeneral(input: CalculInput): CalculCNAV {
  const { ris, notification, formulaire } = input
  const { identite, enfants, carriere } = formulaire

  const birthYear = new Date(identite.dateNaissance).getFullYear()
  const birthMonth = new Date(identite.dateNaissance).getMonth() + 1
  const trimRequis = getTrimestresRequis(birthYear, birthMonth) ?? 170

  const result: CalculCNAV = {
    trimestresRequis: trimRequis,
  } as CalculCNAV

  // ── SAM ──
  if (ris && ris.trimestres.length > 0) {
    const salaires = ris.trimestres
      .filter(t => t.salaire && t.salaire > 0)
      .map(t => ({ annee: t.annee, salaire: t.salaire! }))

    if (salaires.length > 0) {
      const samResult = calculerSAM(salaires, birthYear)
      result.sam = vc(samResult.sam, 'HAUTE_CONFIANCE', 'Recalcul SAM a partir du RIS + coefficients revalorisation 2026')
      result.meilleuresAnnees = samResult.meilleuresAnnees
    }
  }

  // Comparer avec la notification
  if (notification?.sam) {
    result.samNotification = notification.sam
    if (result.sam && Math.abs(result.sam.value - notification.sam) / notification.sam > 0.01) {
      // Ecart > 1% -> signaler
      result.sam = vc(
        result.sam.value,
        'HAUTE_CONFIANCE',
        `SAM recalcule: ${result.sam.value.toFixed(2)}EUR vs notification: ${notification.sam.toFixed(2)}EUR (ecart ${((result.sam.value - notification.sam) / notification.sam * 100).toFixed(1)}%)`
      )
    }
  }

  // ── Trimestres ──
  if (ris) {
    const trimRG = ris.trimestres.reduce((sum, t) => sum + t.trimestresValides, 0)
    result.trimestresRetenus = vc(trimRG, 'HAUTE_CONFIANCE', 'Somme des trimestres RIS au regime general')
  } else if (notification?.trimestresRetenus) {
    result.trimestresRetenus = vc(notification.trimestresRetenus, 'CERTAIN', 'Notification de pension')
  }

  // ── Taux de liquidation ──
  if (result.trimestresRetenus) {
    const trimTousRegimes = ris
      ? ris.totalTrimestresValides
      : (notification?.trimestresRetenus ?? 0)

    const ageLegalMois = getAgeLegalMois(birthYear, birthMonth) ?? 753

    // Date de depart
    let ageAuDepartMois = 0
    if (carriere.retraiteDateDepart) {
      const dateNaiss = new Date(identite.dateNaissance)
      const dateDepart = new Date(carriere.retraiteDateDepart)
      ageAuDepartMois = (dateDepart.getFullYear() - dateNaiss.getFullYear()) * 12
        + (dateDepart.getMonth() - dateNaiss.getMonth())
    } else if (notification?.dateEffet) {
      const parts = notification.dateEffet.split('/')
      if (parts.length === 3) {
        const dateDepart = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
        const dateNaiss = new Date(identite.dateNaissance)
        ageAuDepartMois = (dateDepart.getFullYear() - dateNaiss.getFullYear()) * 12
          + (dateDepart.getMonth() - dateNaiss.getMonth())
      }
    }

    const c = CONSTANTES.cnav

    // Decote
    if (trimTousRegimes < trimRequis && ageAuDepartMois > 0 && ageAuDepartMois < AGE_TAUX_PLEIN_AUTO) {
      const trimManquantsDuree = trimRequis - trimTousRegimes
      const trimManquantsAge = Math.floor((AGE_TAUX_PLEIN_AUTO - ageAuDepartMois) / 3)
      const trimManquants = Math.min(trimManquantsDuree, trimManquantsAge)
      const trimDecote = Math.max(0, Math.min(c.max_trimestres_decote, trimManquants))
      const taux = c.taux_plein - (trimDecote * c.decote_par_trimestre)

      result.taux = vc(Math.max(c.taux_minimum, taux), 'CERTAIN', `Taux avec decote: ${trimDecote} trimestres manquants`)
      result.decote = { trimestres: trimDecote, impact: trimDecote * c.decote_par_trimestre }
    }
    // Surcote
    else if (trimTousRegimes > trimRequis && ageAuDepartMois > ageLegalMois) {
      const trimApresAgeLegal = Math.floor((ageAuDepartMois - ageLegalMois) / 3)
      const trimAuDela = trimTousRegimes - trimRequis
      const trimSurcote = Math.min(trimApresAgeLegal, trimAuDela)
      const surcotePct = trimSurcote * c.surcote_par_trimestre

      result.taux = vc(c.taux_plein, 'CERTAIN', `Taux plein avec surcote +${surcotePct.toFixed(2)}%`)
      result.surcote = { trimestres: trimSurcote, impact: surcotePct }
    }
    // Taux plein
    else if (trimTousRegimes >= trimRequis) {
      result.taux = vc(c.taux_plein, 'CERTAIN', 'Taux plein atteint')
    }
  }

  // Comparer taux avec notification
  if (notification?.taux) {
    result.tauxNotification = notification.taux
  }

  // ── Proratisation ──
  if (result.trimestresRetenus) {
    const prorat = Math.min(1, result.trimestresRetenus.value / trimRequis)
    result.proratisation = vc(
      Math.round(prorat * 10000) / 10000,
      'CERTAIN',
      `${result.trimestresRetenus.value}/${trimRequis} trimestres`
    )
  }

  // ── Pension brute ──
  if (result.sam && result.taux && result.proratisation) {
    const pensionAnnuelle = result.sam.value * (result.taux.value / 100) * result.proratisation.value
    let pensionMensuelle = pensionAnnuelle / 12

    // Surcote
    if (result.surcote) {
      pensionMensuelle *= (1 + result.surcote.impact / 100)
    }

    result.pensionBruteAnnuelle = vc(
      Math.round(pensionAnnuelle * 100) / 100,
      'HAUTE_CONFIANCE',
      `SAM ${result.sam.value.toFixed(2)} x taux ${result.taux.value}% x prorat ${result.proratisation.value.toFixed(4)}`
    )
    result.pensionBruteMensuelle = vc(
      Math.round(pensionMensuelle * 100) / 100,
      'HAUTE_CONFIANCE',
      'Pension annuelle / 12'
    )
  }

  // ── Majoration enfants ──
  if (enfants.nombreEnfants >= 3 && result.pensionBruteMensuelle) {
    const montant = Math.round(result.pensionBruteMensuelle.value * 0.10 * 100) / 100
    result.majorationEnfants = { applicable: true, montant }
  } else {
    result.majorationEnfants = { applicable: false, montant: 0 }
  }

  // ── Minimum contributif ──
  if (result.taux && result.taux.value >= 50 && result.pensionBruteMensuelle) {
    const mico = getMinimumContributif()
    const trimCotises = ris
      ? ris.totalTrimestresCotises
      : (result.trimestresRetenus?.value ?? 0)

    const type = trimCotises >= mico.seuilTrimCotises ? 'majore' as const : 'simple' as const
    const montantMico = type === 'majore' ? mico.majore : mico.simple

    // Proratiser le MiCo
    const micoProratise = result.proratisation
      ? montantMico * result.proratisation.value
      : montantMico

    if (result.pensionBruteMensuelle.value < micoProratise) {
      // Verifier le plafond toutes pensions
      const totalPensions = (carriere.totalPensionsMensuelles ?? result.pensionBruteMensuelle.value)
      if (totalPensions < mico.plafond) {
        result.minimumContributif = {
          eligible: true,
          type,
          montant: Math.round(micoProratise * 100) / 100,
        }
      }
    }
  }

  return result
}
