import { computeRetraitiaCalculations } from '../calculations'
import type { RetraitiaFormData } from '../types'

let passed = 0
let failed = 0

function assert(name: string, condition: boolean, detail?: string) {
  if (condition) { passed++; console.log(`  ✅ ${name}`) }
  else { failed++; console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`) }
}

function approx(a: number, b: number, tolerance = 1) { return Math.abs(a - b) <= tolerance }

console.log('\n🧪 TEST: calculations.ts\n')

// ── CAS 1 : Retraité homme 1960, taux plein, 3 enfants ──
console.log('--- Cas 1: Retraité homme 1960, taux plein, 3 enfants ---')
const cas1: RetraitiaFormData = {
  birthDate: '1960-05-15', sex: 'M', childrenCount: 3, status: 'retired',
  regimes: ['cnav'], totalTrimesters: 167, cotisedTrimesters: 160,
  careerStartAge: 18, militaryService: 'no', unemploymentPeriods: 'no',
  maternityOrSickness: 'no', basePension: 1200, complementaryPension: 600,
  retirementDate: '2022-06-01', hasChildrenBonus: 'no', hasDecote: 'no',
  hasRIS: true, hasEIG: false, hasAgircArrco: true, email: 'test@test.fr',
}
const r1 = computeRetraitiaCalculations(cas1)
assert('birthYear = 1960', r1.birthYear === 1960)
assert('trimestresRequis = 167', r1.trimestresRequis === 167)
assert('trimestresManquants = 0 (taux plein)', r1.trimestresManquants === 0)
assert('tauxTheorique = 50 (taux plein)', r1.tauxTheorique === 50)
assert('majorationEnfants = true (3 enfants)', r1.majorationEnfants === true)
assert('majorationMontant > 0', r1.majorationMontant > 0, `got ${r1.majorationMontant}`)
assert('majorationMontant ≈ 180 (120 base + 60 compl)', approx(r1.majorationMontant, 180, 10), `got ${r1.majorationMontant}`)
assert('pensionTotaleDeclaree = 1800', r1.pensionTotaleDeclaree === 1800)
assert('esperanceVieRetraite = 23 (homme, 62 ans)', r1.esperanceVieRetraite === 23)
assert('decoteMontant = 0 (taux plein)', r1.decoteMontant === 0)

// ── CAS 2 : Retraitée femme 1965, trimestres manquants, décote ──
console.log('\n--- Cas 2: Retraitée femme 1965, 160/172 trimestres ---')
const cas2: RetraitiaFormData = {
  birthDate: '1965-09-10', sex: 'F', childrenCount: 1, status: 'retired',
  regimes: ['cnav', 'agirc_arrco'], totalTrimesters: 160, cotisedTrimesters: 155,
  careerStartAge: 20, militaryService: 'no', unemploymentPeriods: 'yes',
  unemploymentDuration: 18, maternityOrSickness: 'yes', maternityCount: 1,
  basePension: 900, complementaryPension: 400, retirementDate: '2029-04-01',
  hasChildrenBonus: 'unknown', hasDecote: 'yes',
  hasRIS: true, hasEIG: true, hasAgircArrco: true, email: 'test@test.fr',
}
const r2 = computeRetraitiaCalculations(cas2)
assert('birthYear = 1965', r2.birthYear === 1965)
assert('trimestresRequis = 172', r2.trimestresRequis === 172)
assert('trimestresManquants = 12', r2.trimestresManquants === 12)
assert('tauxTheorique < 50', r2.tauxTheorique < 50, `got ${r2.tauxTheorique}`)
assert('majorationEnfants = false (1 enfant)', r2.majorationEnfants === false)
assert('majorationMontant = 0', r2.majorationMontant === 0)
assert('decoteMontant > 0', r2.decoteMontant > 0, `got ${r2.decoteMontant}`)
assert('pensionTotaleDeclaree = 1300', r2.pensionTotaleDeclaree === 1300)
assert('esperanceVieRetraite = 25 (femme, 64 ans)', r2.esperanceVieRetraite === 25)

// ── CAS 3 : Actif 1970, encore en activité ──
console.log('\n--- Cas 3: Actif homme 1970, 140 trimestres ---')
const cas3: RetraitiaFormData = {
  birthDate: '1970-01-01', sex: 'M', childrenCount: 4, status: 'active',
  regimes: ['cnav'], totalTrimesters: 140, cotisedTrimesters: 138,
  careerStartAge: 22, militaryService: 'yes', militaryDuration: 10,
  militaryReported: 'unknown', unemploymentPeriods: 'no', maternityOrSickness: 'no',
  estimatedBasePension: 1100, estimatedComplementaryPension: 500,
  plannedRetirementDate: '2034-01-01', hasChildrenBonus: 'unknown', hasDecote: 'unknown',
  hasRIS: false, hasEIG: false, hasAgircArrco: false, email: 'test@test.fr',
}
const r3 = computeRetraitiaCalculations(cas3)
assert('trimestresRequis = 172 (1970)', r3.trimestresRequis === 172)
assert('trimestresManquants = 32', r3.trimestresManquants === 32)
assert('majorationEnfants = true (4 enfants)', r3.majorationEnfants === true)
assert('majorationMontant > 0', r3.majorationMontant > 0, `got ${r3.majorationMontant}`)
assert('pensionTotaleDeclaree = 1600', r3.pensionTotaleDeclaree === 1600)
assert('ageLegal = 64', r3.ageLegal === 64)
assert('esperanceVieRetraite = 21 (homme 64)', r3.esperanceVieRetraite === 21)

// ── CAS 4 : Minimum contributif ──
console.log('\n--- Cas 4: Minimum contributif ---')
const cas4: RetraitiaFormData = {
  birthDate: '1959-06-01', sex: 'F', childrenCount: 0, status: 'retired',
  regimes: ['cnav'], totalTrimesters: 167, cotisedTrimesters: 125,
  careerStartAge: 16, militaryService: 'no', unemploymentPeriods: 'no',
  maternityOrSickness: 'no', basePension: 700, complementaryPension: 200,
  retirementDate: '2021-07-01', hasChildrenBonus: 'no', hasDecote: 'no',
  hasRIS: true, hasEIG: false, hasAgircArrco: false, email: 'test@test.fr',
}
const r4 = computeRetraitiaCalculations(cas4)
assert('minimumContributifEligible = true', r4.minimumContributifEligible === true, `pension base ${cas4.basePension} < MiCo majoré 903.94, total ${r4.pensionTotaleDeclaree} < plafond 1410.89`)
assert('taux plein (167/167)', r4.trimestresManquants === 0)

console.log(`\n📊 Résultat: ${passed} passed, ${failed} failed\n`)
process.exit(failed > 0 ? 1 : 0)
