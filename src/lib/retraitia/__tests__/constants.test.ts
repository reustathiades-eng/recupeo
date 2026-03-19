import { getRequirements, MINIMUM_CONTRIBUTIF, MAJORATION_ENFANTS, ESPERANCE_VIE } from '../constants'

let passed = 0
let failed = 0

function assert(name: string, condition: boolean, detail?: string) {
  if (condition) { passed++; console.log(`  ✅ ${name}`) }
  else { failed++; console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`) }
}

console.log('\n🧪 TEST: constants.ts — getRequirements\n')

// Post-réforme 2023
const r1960 = getRequirements(1960)
assert('1960 → 167 trimestres', r1960.trimestres === 167)
assert('1960 → 62 ans (744 mois)', r1960.ageLegalMois === 744)

const r1961jan = getRequirements(1961, 3) // mars
assert('1961 janv-août → 168 trimestres', r1961jan.trimestres === 168)
assert('1961 janv-août → 62a3m (747 mois)', r1961jan.ageLegalMois === 747)

const r1961sep = getRequirements(1961, 10) // octobre
assert('1961 sept-déc → 169 trimestres', r1961sep.trimestres === 169)
assert('1961 sept-déc → 62a6m (750 mois)', r1961sep.ageLegalMois === 750)

const r1963 = getRequirements(1963)
assert('1963 → 170 trimestres', r1963.trimestres === 170)
assert('1963 → 63 ans (756 mois)', r1963.ageLegalMois === 756)

const r1967 = getRequirements(1967)
assert('1967 → 172 trimestres', r1967.trimestres === 172)
assert('1967 → 64 ans (768 mois)', r1967.ageLegalMois === 768)

const r1975 = getRequirements(1975)
assert('1975 (>1967) → 172 trimestres', r1975.trimestres === 172)
assert('1975 → 64 ans', r1975.ageLegalMois === 768)

const r1955 = getRequirements(1955)
assert('1955 (≤1957) → 166 trimestres', r1955.trimestres === 166)

console.log('\n🧪 TEST: constants.ts — Valeurs de référence\n')

assert('MiCo base = 756.29', MINIMUM_CONTRIBUTIF.base === 756.29)
assert('MiCo majoré = 903.94', MINIMUM_CONTRIBUTIF.majore === 903.94)
assert('MiCo plafond = 1410.89', MINIMUM_CONTRIBUTIF.plafond === 1410.89)
assert('Majoration seuil = 3 enfants', MAJORATION_ENFANTS.seuilEnfants === 3)
assert('Majoration taux base = 10%', MAJORATION_ENFANTS.tauxBase === 10)
assert('Espérance vie homme 64 = 21', ESPERANCE_VIE.homme64 === 21)
assert('Espérance vie femme 64 = 25', ESPERANCE_VIE.femme64 === 25)

console.log(`\n📊 Résultat: ${passed} passed, ${failed} failed\n`)
process.exit(failed > 0 ? 1 : 0)
