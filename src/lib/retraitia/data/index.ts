// ============================================================
// RETRAITIA V2 — Data index (export centralisé)
// ============================================================
// Charge les tables JSON et expose des fonctions d'accès typées.
// ============================================================

import trimestresRequisData from './trimestres-requis.json'
import ageLegalData from './age-legal.json'
import passData from './pass.json'
import nbAnneesSamData from './nb-annees-sam.json'
import valeurPointAAData from './valeur-point-agirc-arrco.json'
import baremesCsgData from './baremes-csg.json'
import minimumContributifData from './minimum-contributif.json'
import majorationsEnfantsData from './majorations-enfants.json'
import esperanceVieData from './esperance-vie.json'
import reversionSeuilsData from './reversion-seuils.json'
import aspaCssData from './aspa-css.json'
import constantesCalculData from './constantes-calcul.json'
import carsatAdressesData from './carsat-adresses.json'
import paysAccordsData from './pays-accords.json'
import coefficientsRevalorisationData from './coefficients-revalorisation.json'
import regimesComplementairesData from './regimes-complementaires.json'

// ─────────────────────────────────────────────
// Fonctions d'accès typées
// ─────────────────────────────────────────────

/**
 * Retourne les trimestres requis pour une génération.
 * Prend en compte la suspension LFSS 2026.
 * @returns null si en attente de textes (post mars 1965)
 */
export function getTrimestresRequis(birthYear: number, birthMonth: number = 6): number | null {
  const d = trimestresRequisData.data as Record<string, any>

  // Cas spéciaux avec subdivision par mois
  if (birthYear === 1961) {
    if (birthMonth <= 8) return d['1961_S1']?.value ?? 168
    return d['1961_S2']?.value ?? 169
  }
  if (birthYear === 1963) {
    if (birthMonth <= 3) return d['1963_T1']?.value ?? 170
    return d['1963_S2']?.value ?? 170
  }
  if (birthYear === 1965) {
    if (birthMonth <= 3) return d['1965_T1']?.value ?? 170
    return null // EN ATTENTE
  }
  if (birthYear > 1965) return null // EN ATTENTE

  if (birthYear === 1964) return d['1964']?.value ?? 170

  // Cas simples (valeur directe)
  const key = String(birthYear)
  const val = d[key]
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'value' in val) return val.value
  
  // Fallback
  if (birthYear <= 1949) return 150
  if (birthYear <= 1954) return 165
  return 166
}

/**
 * Retourne l'âge légal de départ en mois.
 * @returns null si en attente de textes
 */
export function getAgeLegalMois(birthYear: number, birthMonth: number = 6): number | null {
  const d = ageLegalData.data as Record<string, any>

  if (birthYear === 1961) {
    if (birthMonth <= 8) return d['1961_S1']?.value ?? 744
    return d['1961_S2']?.value ?? 747
  }
  if (birthYear === 1963) {
    if (birthMonth <= 3) return d['1963_T1']?.value ?? 753
    return d['1963_S2']?.value ?? 753
  }
  if (birthYear === 1965) {
    if (birthMonth <= 3) return d['1965_T1']?.value ?? 753
    return null
  }
  if (birthYear > 1965) return null

  if (birthYear === 1962) return d['1962']?.value ?? 750
  if (birthYear === 1964) return d['1964']?.value ?? 753

  // Avant la réforme 2023
  if (birthYear <= 1960) return 744 // 62 ans
  return 744
}

/** Âge du taux plein automatique (67 ans = 804 mois) */
export const AGE_TAUX_PLEIN_AUTO = ageLegalData.ageTauxPleinAuto || 804

/**
 * Retourne le PASS pour une année donnée.
 */
export function getPASS(year: number): number | null {
  const d = passData.data as Record<string, number>
  return d[String(year)] ?? null
}

/**
 * Retourne le nombre de meilleures années pour le calcul du SAM.
 */
export function getNbAnneesSAM(birthYear: number): number {
  if (birthYear >= 1948) return 25
  const d = nbAnneesSamData.data as Record<string, number>
  return d[String(birthYear)] ?? 25
}

/**
 * Retourne la valeur de service du point Agirc-Arrco.
 */
export function getValeurPointAA(year: number): number | null {
  const d = valeurPointAAData.service as Record<string, number>
  return d[String(year)] ?? null
}

/**
 * Retourne le prix d'achat du point Agirc-Arrco.
 */
export function getPrixAchatPointAA(year: number): number | null {
  const d = valeurPointAAData.achat as Record<string, number>
  return d[String(year)] ?? null
}

/**
 * Détermine le taux de CSG applicable selon le RFR et le nombre de parts.
 */
export function getTauxCSG(rfr: number, nombreParts: number, annee: number = 2025): {
  taux: number
  label: 'exoneration' | 'taux_reduit' | 'taux_median' | 'taux_normal'
} {
  const seuils = (baremesCsgData.seuils as any)[String(annee)]
  if (!seuils) return { taux: 8.3, label: 'taux_normal' }

  // Calcul du seuil pour le nombre de parts
  const getSeuilForParts = (bareme: any): number => {
    if (nombreParts <= 1) return bareme['1_part']
    if (nombreParts <= 1.5) return bareme['1.5_parts']
    if (nombreParts <= 2) return bareme['2_parts']
    if (nombreParts <= 2.5) return bareme['2.5_parts']
    if (nombreParts <= 3) return bareme['3_parts']
    // Au-delà de 3 parts : interpolation
    const base = bareme['3_parts']
    const supp = bareme['demi_part_supp']
    return base + Math.ceil((nombreParts - 3) * 2) * supp
  }

  if (rfr <= getSeuilForParts(seuils.exoneration)) return { taux: 0, label: 'exoneration' }
  if (rfr <= getSeuilForParts(seuils.taux_reduit)) return { taux: 3.8, label: 'taux_reduit' }
  if (rfr <= getSeuilForParts(seuils.taux_median)) return { taux: 6.6, label: 'taux_median' }
  return { taux: 8.3, label: 'taux_normal' }
}

/**
 * Retourne le minimum contributif applicable.
 */
export function getMinimumContributif(annee: number = 2025): {
  simple: number
  majore: number
  plafond: number
  seuilTrimCotises: number
} {
  const d = (minimumContributifData.data as any)[String(annee)]
  if (!d) return { simple: 752.60, majore: 912.04, plafond: 1367.51, seuilTrimCotises: 120 }
  return {
    simple: d.simple,
    majore: d.majore,
    plafond: d.plafond,
    seuilTrimCotises: d.seuil_trim_cotises,
  }
}

/**
 * Retourne l'espérance de vie résiduelle à 62 ans.
 */
export function getEsperanceVie(birthYear: number, sexe: 'M' | 'F'): number {
  const d = esperanceVieData.data as Record<string, { M: number; F: number }>
  // Trouver la génération la plus proche
  const decades = [1940, 1945, 1950, 1955, 1960, 1965, 1970]
  let closest = 'default'
  for (const dec of decades) {
    if (birthYear >= dec) closest = String(dec)
  }
  const entry = d[closest] || d['default']
  return entry[sexe]
}

/**
 * Vérifie si un pays a un accord bilatéral avec la France.
 */
export function hasAccordBilateral(pays: string): boolean {
  return (paysAccordsData.accords_bilateraux as string[])
    .some(p => p.toLowerCase() === pays.toLowerCase())
}

/**
 * Retourne le coefficient de revalorisation pour un salaire perçu une année donnée.
 * Le salaire est multiplié par ce coefficient pour obtenir sa valeur revalorisée.
 * Source : circulaire CNAV du 19/12/2025, applicable depuis le 01/01/2026.
 * @returns coefficient, ou 1.0 si l'année n'est pas dans la table
 */
export function getCoefficientRevalorisation(annee: number): number {
  const d = coefficientsRevalorisationData.data as Record<string, number>
  return d[String(annee)] ?? 1.0
}

/**
 * Calcule le SAM (Salaire Annuel Moyen) à partir des salaires annuels.
 * Sélectionne les N meilleures années (revalorisées et plafonnées au PASS).
 * @param salaires - tableau [{annee, salaire}]
 * @param birthYear - année de naissance (pour déterminer N)
 * @returns { sam, meilleuresAnnees }
 */
export function calculerSAM(
  salaires: Array<{ annee: number; salaire: number }>,
  birthYear: number,
): {
  sam: number
  meilleuresAnnees: Array<{ annee: number; salaire: number; salaireRevalorise: number; plafonne: boolean }>
} {
  const nbAnnees = getNbAnneesSAM(birthYear)

  // Revaloriser et plafonner chaque salaire
  const revalorisees = salaires
    .filter(s => s.salaire > 0)
    .map(s => {
      const coeff = getCoefficientRevalorisation(s.annee)
      const pass = getPASS(s.annee)
      const salaireRevalorise = s.salaire * coeff
      const plafond = pass ? pass * coeff : Infinity
      const plafonne = salaireRevalorise > plafond
      return {
        annee: s.annee,
        salaire: s.salaire,
        salaireRevalorise: plafonne ? plafond : salaireRevalorise,
        plafonne,
      }
    })
    .sort((a, b) => b.salaireRevalorise - a.salaireRevalorise)

  // Prendre les N meilleures
  const meilleuresAnnees = revalorisees.slice(0, nbAnnees)
  const totalRevalorise = meilleuresAnnees.reduce((sum, a) => sum + a.salaireRevalorise, 0)
  const sam = meilleuresAnnees.length > 0 ? totalRevalorise / meilleuresAnnees.length : 0

  return { sam: Math.round(sam * 100) / 100, meilleuresAnnees }
}


// ─────────────────────────────────────────────
// Données régimes complémentaires et FP
// ─────────────────────────────────────────────

export const REGIMES_COMPL = regimesComplementairesData

/** Valeur du point RAFP */
export function getValeurPointRAFP(): number {
  return regimesComplementairesData.rafp.valeur_service_point_2025
}

/** Valeur du point Ircantec */
export function getValeurPointIrcantec(): number {
  return regimesComplementairesData.ircantec.valeur_service_point_2025
}

/** Valeur du point RCI (indépendants) */
export function getValeurPointRCI(): number {
  return regimesComplementairesData.rci.valeur_service_point_2025
}

/** Valeur du point CNAVPL (base libéraux) */
export function getValeurPointCNAVPL(): number {
  return regimesComplementairesData.cnavpl_base.valeur_service_point_2025
}

/** Forfaitaire annuel MSA exploitants */
export function getMSAForfaitaireAnnuel(): number {
  return regimesComplementairesData.msa_exploitant.forfaitaire_annuel_2025
}

/** Valeur du point MSA proportionnelle */
export function getMSAValeurPointProportionnelle(): number {
  return regimesComplementairesData.msa_exploitant.valeur_service_point_proportionnelle_2025
}

/** Seuil Chassaigne (mensuel) */
export function getSeuilChassaigne(): number {
  return regimesComplementairesData.msa_exploitant.chassaigne.seuil_mensuel_2025
}

/** Minimum garanti FP (mensuel, selon durée en années) */
export function getMinimumGaranti(anneesServices: number): number {
  const mg = regimesComplementairesData.minimum_garanti_fp
  if (anneesServices <= 0) return 0
  if (anneesServices <= 15) return mg.montant_15_ans * anneesServices / 15
  if (anneesServices <= 40) return mg.montant_15_ans + (mg.montant_40_ans - mg.montant_15_ans) * (anneesServices - 15) / 25
  return mg.montant_40_ans
}

/** Valeur du point d'indice FP */
export function getValeurPointIndiceFP(): number {
  return regimesComplementairesData.minimum_garanti_fp.valeur_point_indice_fp_2025
}

/** Constantes FP */
export const CONSTANTES_FP = regimesComplementairesData.minimum_garanti_fp

// ─────────────────────────────────────────────
// Exports bruts (pour accès direct aux données complètes)
// ─────────────────────────────────────────────

export const DATA = {
  trimestresRequis: trimestresRequisData,
  ageLegal: ageLegalData,
  pass: passData,
  nbAnneesSam: nbAnneesSamData,
  valeurPointAA: valeurPointAAData,
  baremesCsg: baremesCsgData,
  minimumContributif: minimumContributifData,
  majorationsEnfants: majorationsEnfantsData,
  esperanceVie: esperanceVieData,
  reversionSeuils: reversionSeuilsData,
  aspaCss: aspaCssData,
  constantesCalcul: constantesCalculData,
  carsatAdresses: carsatAdressesData,
  paysAccords: paysAccordsData,
  coefficientsRevalorisation: coefficientsRevalorisationData,
  regimesComplementaires: regimesComplementairesData,
} as const

export const CONSTANTES = constantesCalculData
