// ============================================================
// MACAUTION — Calculs purs (déterministes, pas d'IA)
// ============================================================
import type { MacautionFormData, MacautionCalculations, VetusteResult } from './types'
import { VETUSTE_GRID, calculateVetuste, tenantShareAfterVetuste, getMostFavorableItem } from './vetuste'

/**
 * Calcule la différence en mois entre deux dates.
 */
function monthsBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA)
  const b = new Date(dateB)
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
}

/**
 * Calcule la différence en jours entre deux dates.
 */
function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA)
  const b = new Date(dateB)
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Ajoute N mois à une date.
 */
function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

/**
 * Effectue tous les calculs MACAUTION à partir des données du formulaire.
 * Ces calculs sont 100% déterministes (pas d'IA).
 */
export function computeMacautionCalculations(data: MacautionFormData): MacautionCalculations {
  // ─── 1. Durée d'occupation ───
  const occupationMonths = monthsBetween(data.entryDate, data.exitDate)

  // ─── 2. Délai légal de restitution ───
  // Art. 22 al. 5-6 loi 89-462 :
  // - 1 mois si EDL sortie conforme à EDL entrée
  // - 2 mois si différences constatées
  // On considère 2 mois dès qu'il y a des retenues (= différences)
  const hasDeductions = data.depositReturned !== 'total' && data.deductionAmount > 0
  const legalDeadlineDays = hasDeductions ? 60 : 30  // simplifié 1 ou 2 mois

  // Date limite = date de remise des clés + 1 ou 2 mois
  const deadlineMonths = hasDeductions ? 2 : 1
  const legalDeadlineDate = addMonths(data.exitDate, deadlineMonths)

  // ─── 3. Retard de restitution ───
  // La date de référence est : date de restitution (si partielle) ou aujourd'hui (si non restitué)
  const referenceDate = data.depositReturned === 'partial' && data.returnDate
    ? data.returnDate
    : data.depositReturned === 'none'
      ? new Date().toISOString().split('T')[0]
      : data.exitDate // 'total' → pas de retard

  const daysLate = Math.max(0, daysBetween(legalDeadlineDate, referenceDate))
  const monthsLate = daysLate > 0 ? Math.ceil(daysLate / 30) : 0

  // ─── 4. Pénalités de retard ───
  // Art. 22 al. 7 : 10% du loyer mensuel HC par mois de retard commencé
  const latePenalties = monthsLate * Math.round(data.rentAmount * 0.10 * 100) / 100

  // ─── 5. Dépôt excessif ? ───
  // Location vide : max 1 mois HC | Meublé : max 2 mois HC
  const depositLegalMax = data.locationType === 'vide'
    ? data.rentAmount
    : data.rentAmount * 2
  const depositExcessive = data.depositAmount > depositLegalMax
  const depositExcess = depositExcessive
    ? Math.round((data.depositAmount - depositLegalMax) * 100) / 100
    : 0

  // ─── 6. Montant retenu ───
  const amountWithheld = data.depositReturned === 'none'
    ? data.depositAmount
    : data.depositReturned === 'partial'
      ? Math.round((data.depositAmount - (data.returnedAmount || 0)) * 100) / 100
      : 0

  // ─── 7. Calcul de vétusté pour chaque motif de retenue ───
  const occupationYears = occupationMonths / 12
  const vetuste: VetusteResult[] = []

  // Motifs liés à des dégradations physiques (pas loyers/charges/nettoyage)
  const physicalDeductions = data.deductions.filter(d =>
    !['loyers_impayes', 'charges_impayees', 'nettoyage', 'autre'].includes(d)
  )

  for (const deduction of physicalDeductions) {
    const item = getMostFavorableItem(deduction)
    if (!item) continue

    const vetustePercent = calculateVetuste(occupationYears, item)

    // On estime le montant par poste proportionnellement
    // (en l'absence de détail, on répartit équitablement entre les motifs physiques)
    const estimatedCostPerItem = physicalDeductions.length > 0
      ? data.deductionAmount / physicalDeductions.length
      : 0

    const tenantShare = tenantShareAfterVetuste(estimatedCostPerItem, vetustePercent)
    const landlordAbuse = Math.round((estimatedCostPerItem - tenantShare) * 100) / 100

    vetuste.push({
      element: item.element,
      category: deduction,
      lifespanYears: item.lifespanYears,
      franchiseYears: item.franchiseYears,
      annualRate: item.annualRate,
      occupationYears: Math.round(occupationYears * 10) / 10,
      vetustePercent: Math.round(vetustePercent * 10) / 10,
      tenantShare,
      landlordAbuse,
    })
  }

  return {
    occupationMonths,
    legalDeadlineDays,
    legalDeadlineDate,
    daysLate,
    monthsLate,
    latePenalties,
    depositExcessive,
    depositLegalMax,
    depositExcess,
    amountWithheld,
    vetuste: vetuste.length > 0 ? vetuste : undefined,
  }
}
