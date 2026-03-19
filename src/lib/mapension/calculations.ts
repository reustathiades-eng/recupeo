// ============================================================
// MAPENSION — Calculs purs JS (revalorisation + arriérés)
// ============================================================
// Formule INSEE : Nouveau montant = Ancien montant × (Nouvel indice / Ancien indice)
// Arriérés : récupérables sur 5 ans (art. 2224 Code civil)
//
// Le calcul est PRÉCIS : chaque mois est attribué à la bonne période
// de revalorisation (avant ou après le mois de reval annuel).
// ============================================================
import type { MapensionFormData, MapensionCalculations, YearlyArrear } from './types'
import { getIndexValue, getLatestIndex, getReferenceIndex } from './indices'

const MAX_ARREARS_YEARS = 5

/**
 * Pour une année Y et un mois de revalorisation M, l'indice utilisé
 * est celui publié ~2 mois avant M de l'année Y.
 */
function getRevalIndex(indexType: string, year: number, revalMonth: number): { date: string; value: number } | null {
  const idxMonth = revalMonth >= 3 ? revalMonth - 2 : revalMonth + 10
  const idxYear = revalMonth >= 3 ? year : year - 1
  const indexDate = `${idxYear}-${String(idxMonth).padStart(2, '0')}`
  const value = getIndexValue(indexType as any, indexDate)
  if (!value) return null
  return { date: indexDate, value }
}

export function computeMapensionCalculations(data: MapensionFormData): MapensionCalculations {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // 1. Indice de référence
  let referenceIndexDate: string
  let referenceIndexValue: number

  if (data.referenceIndex && data.referenceIndex > 0) {
    referenceIndexValue = data.referenceIndex
    const [y, m] = data.judgmentDate.split('-').map(Number)
    referenceIndexDate = `${y}-${String(m).padStart(2, '0')}`
  } else {
    const ref = getReferenceIndex(data.indexType, data.judgmentDate)
    if (!ref) {
      referenceIndexDate = data.judgmentDate.substring(0, 7)
      referenceIndexValue = 100
    } else {
      referenceIndexDate = ref.date
      referenceIndexValue = ref.value
    }
  }

  // 2. Pension revalorisée actuelle
  const latest = getLatestIndex(data.indexType)
  const currentIndexDate = latest?.date || `${currentYear}-${String(currentMonth).padStart(2, '0')}`
  const currentIndexValue = latest?.value || 110

  const revaluedAmount = Math.round(
    data.initialAmount * (currentIndexValue / referenceIndexValue) * 100
  ) / 100

  const revaluationPct = Math.round(
    ((currentIndexValue - referenceIndexValue) / referenceIndexValue) * 100 * 10
  ) / 10

  const currentPaid = data.currentAmountPaid || data.initialAmount
  const monthlyGap = Math.round((revaluedAmount - currentPaid) * 100) / 100
  const annualGap = Math.round(monthlyGap * 12 * 100) / 100

  // 3. Arriérés PRÉCIS — mois par mois, avec le bon indice
  const judgmentYear = parseInt(data.judgmentDate.split('-')[0])
  const judgmentMonth = parseInt(data.judgmentDate.split('-')[1]) || 6
  const revalMonth = data.revaluationMonth || judgmentMonth

  // Date de prescription : 5 ans en arrière depuis maintenant
  const prescriptionDate = new Date()
  prescriptionDate.setFullYear(prescriptionDate.getFullYear() - MAX_ARREARS_YEARS)
  const prescYear = prescriptionDate.getFullYear()
  const prescMonth = prescriptionDate.getMonth() + 1

  // Première revalorisation : 1 an après le jugement, au mois de reval
  const firstRevalYear = judgmentYear + 1

  // Construire la table des montants dus par période de revalorisation
  // Période 0 : du jugement au premier mois de reval → montant initial
  // Période N (year Y) : du mois de reval de Y au mois de reval de Y+1 → montant revalorisé Y
  interface Period {
    year: number
    indexDate: string
    indexValue: number
    amountDue: number
    startYear: number
    startMonth: number
    endYear: number
    endMonth: number
  }

  const periods: Period[] = []

  for (let year = firstRevalYear; year <= currentYear; year++) {
    const idx = getRevalIndex(data.indexType, year, revalMonth)
    if (!idx) continue

    const amountDue = Math.round(
      data.initialAmount * (idx.value / referenceIndexValue) * 100
    ) / 100

    const startMonth = revalMonth
    const startYear = year
    // Fin de période : mois de reval de l'année suivante - 1, ou maintenant si c'est l'année en cours
    let endYear: number, endMonth: number
    if (year === currentYear) {
      endYear = currentYear
      endMonth = currentMonth
    } else {
      endYear = year + 1
      endMonth = revalMonth - 1
      if (endMonth <= 0) { endMonth = 12; endYear-- }
    }

    periods.push({
      year, indexDate: idx.date, indexValue: idx.value, amountDue,
      startYear, startMonth, endYear, endMonth,
    })
  }

  // Calculer les arriérés par année civile
  const arrearsByYearMap: Record<number, YearlyArrear> = {}
  let totalArrears = 0

  for (const period of periods) {
    const gap = Math.max(0, Math.round((period.amountDue - currentPaid) * 100) / 100)
    if (gap <= 0) continue

    // Itérer sur chaque mois de cette période
    let y = period.startYear
    let m = period.startMonth
    while (y < period.endYear || (y === period.endYear && m <= period.endMonth)) {
      // Vérifier que ce mois n'est pas prescrit
      if (y > prescYear || (y === prescYear && m >= prescMonth)) {
        // Vérifier qu'on ne dépasse pas le mois actuel
        if (y < currentYear || (y === currentYear && m <= currentMonth)) {
          if (!arrearsByYearMap[y]) {
            arrearsByYearMap[y] = {
              year: y, month: revalMonth,
              indexDate: period.indexDate, indexValue: period.indexValue,
              amountDue: period.amountDue, amountPaid: currentPaid,
              monthlyGap: gap, monthsInYear: 0, yearlyArrear: 0,
            }
          }
          arrearsByYearMap[y].monthsInYear++
          arrearsByYearMap[y].yearlyArrear = Math.round((arrearsByYearMap[y].yearlyArrear + gap) * 100) / 100
          totalArrears += gap

          // Si le montant dû change en cours d'année (reval en milieu d'année), maj les infos
          if (period.amountDue > arrearsByYearMap[y].amountDue) {
            arrearsByYearMap[y].amountDue = period.amountDue
            arrearsByYearMap[y].indexDate = period.indexDate
            arrearsByYearMap[y].indexValue = period.indexValue
            arrearsByYearMap[y].monthlyGap = gap
          }
        }
      }

      // Mois suivant
      m++
      if (m > 12) { m = 1; y++ }
    }
  }

  totalArrears = Math.round(totalArrears * 100) / 100
  const arrearsByYear = Object.values(arrearsByYearMap).sort((a, b) => a.year - b.year)

  return {
    currentRevaluedAmount: revaluedAmount,
    referenceIndexDate, referenceIndexValue,
    currentIndexDate, currentIndexValue, revaluationPct,
    monthlyGap, annualGap, arrearsByYear, totalArrears,
    arrearsYears: arrearsByYear.length,
    prescriptionDate: prescriptionDate.toISOString().split('T')[0],
    hasArrears: totalArrears > 0,
    usesARIPA: data.usesARIPA === 'yes',
    isCreditor: data.userRole === 'creditor',
  }
}

export function estimateArrears(
  initialAmount: number, revaluedAmount: number,
  currentPaid: number, yearsWithoutRevaluation: number
): number {
  const currentGap = revaluedAmount - currentPaid
  if (currentGap <= 0) return 0
  const avgGap = currentGap * 0.6
  const years = Math.min(yearsWithoutRevaluation, MAX_ARREARS_YEARS)
  return Math.round(avgGap * 12 * years * 100) / 100
}
