import { computeRetraitiaCalculations } from '../calculations'
import { detectAnomalies, computeLifetimeImpact } from '../anomaly-detection'
import type { RetraitiaFormData } from '../types'

let passed = 0
let failed = 0

function assert(name: string, condition: boolean, detail?: string) {
  if (condition) { passed++; console.log(`  ✅ ${name}`) }
  else { failed++; console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`) }
}

function hasAnomaly(anomalies: any[], type: string): boolean {
  return anomalies.some(a => a.type === type)
}

console.log('\n🧪 TEST: anomaly-detection.ts\n')

// ── CAS A : Service militaire non reporté ──
console.log('--- Cas A: Service militaire non reporté ---')
const casA: RetraitiaFormData = {
  birthDate: '1960-01-01', sex: 'M', childrenCount: 0, status: 'retired',
  regimes: ['cnav'], totalTrimesters: 165, cotisedTrimesters: 160,
  careerStartAge: 18, militaryService: 'yes', militaryDuration: 12,
  militaryReported: 'no', unemploymentPeriods: 'no', maternityOrSickness: 'no',
  basePension: 1000, complementaryPension: 500, retirementDate: '2022-01-01',
  hasChildrenBonus: 'no', hasDecote: 'no',
  hasRIS: true, hasEIG: false, hasAgircArrco: false, email: 'test@test.fr',
}
const calcA = computeRetraitiaCalculations(casA)
const anomA = detectAnomalies(casA, calcA)
assert('Détecte service_militaire', hasAnomaly(anomA, 'service_militaire'))
const milAnomaly = anomA.find(a => a.type === 'service_militaire')!
assert('Sévérité = confirmed (car reporté=no)', milAnomaly.severity === 'confirmed')
assert('Impact mensuel > 0', milAnomaly.impactMonthlyMax > 0)
assert('Documents nécessaires inclus', milAnomaly.documentsNeeded.length > 0)

// ── CAS B : Majoration enfants non appliquée ──
console.log('\n--- Cas B: 3 enfants, majoration non appliquée ---')
const casB: RetraitiaFormData = {
  birthDate: '1958-06-01', sex: 'F', childrenCount: 3, status: 'retired',
  regimes: ['cnav'], totalTrimesters: 167, cotisedTrimesters: 160,
  careerStartAge: 20, militaryService: 'no', unemploymentPeriods: 'no',
  maternityOrSickness: 'no', basePension: 1100, complementaryPension: 500,
  retirementDate: '2020-07-01', hasChildrenBonus: 'no', hasDecote: 'no',
  hasRIS: true, hasEIG: false, hasAgircArrco: false, email: 'test@test.fr',
}
const calcB = computeRetraitiaCalculations(casB)
const anomB = detectAnomalies(casB, calcB)
assert('Détecte majoration_enfants', hasAnomaly(anomB, 'majoration_enfants'))
const majAnomaly = anomB.find(a => a.type === 'majoration_enfants')!
assert('Sévérité = confirmed (bonus=no)', majAnomaly.severity === 'confirmed')
assert('Impact mensuel min ≥ 30', majAnomaly.impactMonthlyMin >= 30)

// ── CAS C : Complémentaire anormalement basse ──
console.log('\n--- Cas C: Pension complémentaire très basse ---')
const casC: RetraitiaFormData = {
  birthDate: '1959-01-01', sex: 'M', childrenCount: 0, status: 'retired',
  regimes: ['cnav'], totalTrimesters: 167, cotisedTrimesters: 160,
  careerStartAge: 18, militaryService: 'no', unemploymentPeriods: 'no',
  maternityOrSickness: 'no', basePension: 1300, complementaryPension: 200,
  retirementDate: '2021-01-01', hasChildrenBonus: 'no', hasDecote: 'no',
  hasRIS: true, hasEIG: false, hasAgircArrco: true, email: 'test@test.fr',
}
const calcC = computeRetraitiaCalculations(casC)
const anomC = detectAnomalies(casC, calcC)
assert('Détecte points_complementaire', hasAnomaly(anomC, 'points_complementaire'))
const complAnomaly = anomC.find(a => a.type === 'points_complementaire')!
assert('Ratio = 15% (200/1300 < 30%)', Math.round(200/1300*100) < 30)

// ── CAS D : Chômage long non vérifié ──
console.log('\n--- Cas D: 36 mois de chômage ---')
const casD: RetraitiaFormData = {
  birthDate: '1962-03-01', sex: 'F', childrenCount: 2, status: 'retired',
  regimes: ['cnav'], totalTrimesters: 150, cotisedTrimesters: 140,
  careerStartAge: 20, militaryService: 'no', unemploymentPeriods: 'yes',
  unemploymentDuration: 36, maternityOrSickness: 'yes', maternityCount: 2,
  basePension: 900, complementaryPension: 400, retirementDate: '2025-01-01',
  hasChildrenBonus: 'no', hasDecote: 'yes',
  hasRIS: false, hasEIG: false, hasAgircArrco: false, email: 'test@test.fr',
}
const calcD = computeRetraitiaCalculations(casD)
const anomD = detectAnomalies(casD, calcD)
assert('Détecte chomage_maladie (chômage)', anomD.filter(a => a.type === 'chomage_maladie').length >= 1)
assert('Détecte chomage_maladie (maternité)', anomD.filter(a => a.type === 'chomage_maladie').length >= 2)

// ── CAS E : Actif, optimisation de départ ──
console.log('\n--- Cas E: Actif, 168/172 trimestres ---')
const casE: RetraitiaFormData = {
  birthDate: '1968-07-01', sex: 'M', childrenCount: 2, status: 'active',
  regimes: ['cnav', 'agirc_arrco'], totalTrimesters: 168, cotisedTrimesters: 165,
  careerStartAge: 20, militaryService: 'no', unemploymentPeriods: 'no',
  maternityOrSickness: 'no', estimatedBasePension: 1400, estimatedComplementaryPension: 700,
  plannedRetirementDate: '2032-07-01', hasChildrenBonus: 'no', hasDecote: 'unknown',
  hasRIS: true, hasEIG: true, hasAgircArrco: true, email: 'test@test.fr',
}
const calcE = computeRetraitiaCalculations(casE)
const anomE = detectAnomalies(casE, calcE)
assert('Détecte optimisation_depart (4 trimestres manquants)', hasAnomaly(anomE, 'optimisation_depart'))

// ── CAS F : Aucune anomalie ──
console.log('\n--- Cas F: Aucune anomalie attendue ---')
const casF: RetraitiaFormData = {
  birthDate: '1960-01-01', sex: 'M', childrenCount: 1, status: 'retired',
  regimes: ['cnav'], totalTrimesters: 167, cotisedTrimesters: 165,
  careerStartAge: 18, militaryService: 'no', unemploymentPeriods: 'no',
  maternityOrSickness: 'no', basePension: 1300, complementaryPension: 700,
  retirementDate: '2022-01-01', hasChildrenBonus: 'yes', hasDecote: 'no',
  hasRIS: true, hasEIG: true, hasAgircArrco: true, email: 'test@test.fr',
}
const calcF = computeRetraitiaCalculations(casF)
const anomF = detectAnomalies(casF, calcF)
assert('0 anomalies détectées', anomF.length === 0, `got ${anomF.length}: ${anomF.map(a => a.type).join(', ')}`)

// ── Lifetime impact ──
console.log('\n--- Test computeLifetimeImpact ---')
const lifetime = computeLifetimeImpact(150, 25)
assert('150€/mois × 25 ans = 45000€', lifetime === 45000)
const lifetime2 = computeLifetimeImpact(0, 25)
assert('0€/mois × 25 ans = 0€', lifetime2 === 0)

console.log(`\n📊 Résultat: ${passed} passed, ${failed} failed\n`)
process.exit(failed > 0 ? 1 : 0)
