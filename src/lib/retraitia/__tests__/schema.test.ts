import { retraitiaSchema } from '../schema'

let passed = 0
let failed = 0

function assert(name: string, condition: boolean, detail?: string) {
  if (condition) { passed++; console.log(`  ✅ ${name}`) }
  else { failed++; console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`) }
}

console.log('\n🧪 TEST: schema.ts — Validation Zod\n')

// Données valides complètes
const validData = {
  birthDate: '1960-05-15', sex: 'M', childrenCount: 3, status: 'retired',
  regimes: ['cnav', 'agirc_arrco'], totalTrimesters: 167, cotisedTrimesters: 160,
  careerStartAge: 18, militaryService: 'no', unemploymentPeriods: 'no',
  maternityOrSickness: 'no', basePension: 1200, complementaryPension: 600,
  retirementDate: '2022-06-01', hasChildrenBonus: 'yes', hasDecote: 'no',
  hasRIS: true, hasEIG: false, hasAgircArrco: true, email: 'test@test.fr',
}

const r1 = retraitiaSchema.safeParse(validData)
assert('Données valides → success', r1.success === true)

// Date invalide
const r2 = retraitiaSchema.safeParse({ ...validData, birthDate: 'invalid' })
assert('Date invalide → échec', r2.success === false)

// Email invalide
const r3 = retraitiaSchema.safeParse({ ...validData, email: 'not-an-email' })
assert('Email invalide → échec', r3.success === false)

// Régimes vides
const r4 = retraitiaSchema.safeParse({ ...validData, regimes: [] })
assert('Régimes vides → échec', r4.success === false)

// Trimestres cotisés > validés
const r5 = retraitiaSchema.safeParse({ ...validData, cotisedTrimesters: 200, totalTrimesters: 150 })
assert('Cotisés > validés → échec', r5.success === false)

// Service militaire = yes mais pas de durée
const r6 = retraitiaSchema.safeParse({ ...validData, militaryService: 'yes' })
assert('Militaire=yes sans durée → échec', r6.success === false)

// Service militaire = yes avec durée
const r7 = retraitiaSchema.safeParse({ ...validData, militaryService: 'yes', militaryDuration: 12 })
assert('Militaire=yes avec durée → success', r7.success === true)

// Retraité sans pension base
const r8 = retraitiaSchema.safeParse({ ...validData, status: 'retired', basePension: undefined })
assert('Retraité sans pension base → échec', r8.success === false)

// Actif sans pension base = OK
const r9 = retraitiaSchema.safeParse({ ...validData, status: 'active', basePension: undefined })
assert('Actif sans pension base → success', r9.success === true)

// Chômage = yes sans durée
const r10 = retraitiaSchema.safeParse({ ...validData, unemploymentPeriods: 'yes' })
assert('Chômage=yes sans durée → échec', r10.success === false)

// Chômage = yes avec durée
const r11 = retraitiaSchema.safeParse({ ...validData, unemploymentPeriods: 'yes', unemploymentDuration: 24 })
assert('Chômage=yes avec durée → success', r11.success === true)

// Nouveau régime cipav
const r12 = retraitiaSchema.safeParse({ ...validData, regimes: ['cipav'] })
assert('Régime cipav → success', r12.success === true)

// Régime invalide
const r13 = retraitiaSchema.safeParse({ ...validData, regimes: ['fake_regime'] })
assert('Régime invalide → échec', r13.success === false)

console.log(`\n📊 Résultat: ${passed} passed, ${failed} failed\n`)
process.exit(failed > 0 ? 1 : 0)
