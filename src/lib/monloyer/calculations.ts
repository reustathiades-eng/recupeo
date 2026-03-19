// ============================================================
// MONLOYER — Calculs purs (JS, pas d'IA)
// Vérification encadrement des loyers
// ============================================================
import type {
  MonloyerFormData,
  MonloyerCheckResult,
  CheckStatus,
  Territory,
} from './types'
import { findCity, getTerritoryForCity } from './cities'

/** Nombre de mois entre deux dates, plafonné à 36 (prescription 3 ans) */
function monthsBetween(from: string, to: Date): number {
  const start = new Date(from)
  const months =
    (to.getFullYear() - start.getFullYear()) * 12 +
    (to.getMonth() - start.getMonth())
  return Math.max(0, months)
}

/** Calcul complet du diagnostic encadrement loyer */
export function computeMonloyerCheck(data: MonloyerFormData): MonloyerCheckResult {
  const city = findCity(data.city)
  const territory = getTerritoryForCity(data.city)

  if (!city || !territory) {
    throw new Error(`Ville non éligible : ${data.city}`)
  }

  const now = new Date()
  const totalMonths = monthsBetween(data.bailDate, now)
  const maxMonths = Math.min(totalMonths, 36) // prescription 3 ans

  // Loyer de référence majoré (saisi par l'utilisateur)
  const refMajore = data.referenceRentMajore

  // Complément de loyer
  const complement = data.hasComplement === 'yes' && data.complementAmount
    ? data.complementAmount
    : 0

  // DPE F/G → pas de complément de loyer autorisé (loi Climat 2021)
  const dpeWarning = data.dpe === 'F' || data.dpe === 'G'

  // Calcul du dépassement HC (hors complément)
  const excessHC = Math.max(0, data.currentRent - complement - refMajore)

  // Déterminer le statut
  let status: CheckStatus = 'conforme'
  let excessMonthly = 0
  let totalRecoverable = 0

  if (excessHC > 0) {
    // Le loyer HC (hors complément) dépasse le plafond
    status = 'depassement'
    excessMonthly = Math.round(excessHC * 100) / 100
    totalRecoverable = Math.round(excessMonthly * maxMonths * 100) / 100
  } else if (complement > 0) {
    // Le loyer de base est sous le plafond mais un complément est appliqué
    // Vérifier si le complément est possiblement abusif
    // Un complément est suspect si :
    // - DPE F/G (interdit depuis loi Climat)
    // - Le loyer de base est inférieur au loyer de référence majoré (ce qui est normal pour un complément)
    //   MAIS le complément fait dépasser significativement
    if (dpeWarning) {
      status = 'complement_abusif'
      excessMonthly = complement // tout le complément est indu
      totalRecoverable = Math.round(excessMonthly * maxMonths * 100) / 100
    } else {
      // Complément potentiellement légitime mais on alerte quand même
      // car beaucoup de compléments sont abusifs en pratique
      status = 'complement_abusif'
      excessMonthly = complement
      totalRecoverable = Math.round(complement * maxMonths * 100) / 100
    }
  }

  // Calcul prix au m²
  const pricePerSqm = data.surface > 0
    ? Math.round((data.currentRent / data.surface) * 100) / 100
    : 0
  const referencePricePerSqm = data.surface > 0
    ? Math.round((refMajore / data.surface) * 100) / 100
    : 0

  return {
    status,
    territory: territory.id as Territory,
    territoryLabel: territory.label,
    referenceRentMajore: refMajore,
    currentRent: data.currentRent,
    excessMonthly,
    complementAmount: complement,
    totalRecoverable,
    monthsSinceBail: totalMonths,
    maxRecoverableMonths: maxMonths,
    bailDate: data.bailDate,
    surface: data.surface,
    pricePerSqm,
    referencePricePerSqm,
    dpeWarning,
  }
}
