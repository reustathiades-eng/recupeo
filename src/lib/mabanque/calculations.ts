// ============================================================
// MABANQUE — Calculs (vérification plafonds, trop-perçu)
// ============================================================
import { PLAFONDS } from './constants'
import type { MabanqueFormData } from './types'

// ─── Déterminer si le client est éligible au statut fragile ───

export function isFragileEligible(data: MabanqueFormData): boolean {
  return (
    data.surendettement === 'yes' ||
    data.inscritFCC === 'yes' ||
    data.incidentsMultiples === 'yes'
  )
}

// ─── Déterminer si le statut fragile est appliqué ───

export function isFragileApplied(data: MabanqueFormData): boolean {
  return data.clientFragile === 'yes'
}

// ─── Déterminer le profil de plafonnement ───

export type ProfilPlafond = 'standard' | 'fragile' | 'fragile_offre'

export function getProfilPlafond(data: MabanqueFormData): ProfilPlafond {
  if (data.offreSpecifique === 'yes') return 'fragile_offre'
  if (data.clientFragile === 'yes') return 'fragile'
  return 'standard'
}

// ─── Plafonds applicables selon le profil ───

export function getPlafondCommission(profil: ProfilPlafond) {
  if (profil === 'standard') return PLAFONDS.commissionIntervention.standard
  return PLAFONDS.commissionIntervention.fragile
}

export function getPlafondGlobalMensuel(profil: ProfilPlafond): number | null {
  if (profil === 'fragile_offre') return PLAFONDS.fraisFragileGlobal.offreSpecifiqueMois
  if (profil === 'fragile') return PLAFONDS.fraisFragileGlobal.parMois
  return null // pas de plafond global pour les clients standard
}

// ─── Calcul excès commissions d'intervention ───

export function calculExcesCommissions(data: MabanqueFormData, profil: ProfilPlafond): number {
  const plafond = getPlafondCommission(profil)
  let exces = 0

  // Excès par opération : si le montant moyen par opération dépasse le plafond
  if (data.commissionsNombre > 0) {
    const moyenneParOp = data.commissionsIntervention / data.commissionsNombre
    if (moyenneParOp > plafond.parOperation) {
      exces += (moyenneParOp - plafond.parOperation) * data.commissionsNombre
    }
  }

  // Excès mensuel : si le total dépasse le plafond mensuel
  const excesMensuel = Math.max(0, data.commissionsIntervention - plafond.parMois)

  // On prend le maximum des deux (le plus avantageux pour le client)
  return Math.max(exces, excesMensuel)
}

// ─── Calcul excès rejets de prélèvement ───

export function calculExcesRejetsPrelevement(data: MabanqueFormData): number {
  if (data.rejetsPrelevementNombre <= 0 || data.rejetsPrelevement <= 0) return 0
  const moyenneParRejet = data.rejetsPrelevement / data.rejetsPrelevementNombre
  if (moyenneParRejet > PLAFONDS.rejetPrelevement) {
    return (moyenneParRejet - PLAFONDS.rejetPrelevement) * data.rejetsPrelevementNombre
  }
  return 0
}

// ─── Calcul total trop-perçu mensuel ───

export interface TropPercuDetail {
  excesCommissions: number
  excesRejets: number
  excesFraisNonJustifies: number
  tropPercuMensuel: number
  tropPercuAnnuel: number
  tropPercu5ans: number
}

export function calculTropPercu(data: MabanqueFormData): TropPercuDetail {
  const profil = getProfilPlafond(data)

  const excesCommissions = calculExcesCommissions(data, profil)
  const excesRejets = calculExcesRejetsPrelevement(data)
  const excesFraisNonJustifies = data.autresFrais || 0

  let tropPercuMensuel = excesCommissions + excesRejets + excesFraisNonJustifies

  // Si client fragile, vérifier aussi le plafond global
  const plafondGlobal = getPlafondGlobalMensuel(profil)
  if (plafondGlobal !== null) {
    const totalIncidents = data.commissionsIntervention + data.rejetsPrelevement + data.rejetsCheque + data.lettresInformation
    const excesGlobal = Math.max(0, totalIncidents - plafondGlobal)
    // Prendre le maximum entre l'excès détaillé et l'excès global
    tropPercuMensuel = Math.max(tropPercuMensuel, excesGlobal)
  }

  // Arrondir à 2 décimales
  tropPercuMensuel = Math.round(tropPercuMensuel * 100) / 100

  return {
    excesCommissions: Math.round(excesCommissions * 100) / 100,
    excesRejets: Math.round(excesRejets * 100) / 100,
    excesFraisNonJustifies: Math.round(excesFraisNonJustifies * 100) / 100,
    tropPercuMensuel,
    tropPercuAnnuel: Math.round(tropPercuMensuel * 12 * 100) / 100,
    tropPercu5ans: Math.round(tropPercuMensuel * 12 * 5 * 100) / 100,
  }
}
