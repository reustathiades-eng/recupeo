// ============================================================
// MONIMPÔT V3 — Extraction regex (Zero API) — V3.1 HARDENED
// 15 regex spécifiques + 1 générique + 80+ mappings
// + Normalisation OCR + Inférence champs manquants + Scoring recalibré
// ============================================================

import type { AvisImpositionExtracted } from './extract-types'

// ─── TYPES ───

interface RegexExtractionResult {
  extraction: AvisImpositionExtracted
  rawCases: Record<string, number>
  method: 'regex'
  fieldsFound: number
  fieldsTotal: number
}

// ─── NORMALISATION OCR ───
// Corrige les erreurs Tesseract les plus courantes AVANT les regex

function normalizeOCRText(text: string): string {
  let t = text

  // 1. Normalisation unicode — accents composés → précomposés
  t = t.normalize('NFC')

  // 2. Remplacement caractères OCR confondus
  // é/è/ê souvent mangés par Tesseract
  t = t.replace(/Imp[ée]t/gi, 'Impôt')
  t = t.replace(/IMP[ÔOQ0]T/g, 'IMPÔT')
  t = t.replace(/REVENU[S]?\s+DE\s+R[EÉ]F[EÉ]R[EÉ]NCE/gi, 'REVENU FISCAL DE RÉFÉRENCE')
  t = t.replace(/R[EÉ]F[EÉ]RENCE/gi, 'RÉFÉRENCE')
  t = t.replace(/Pr[eé]l[eè]vement/gi, 'Prélèvement')
  t = t.replace(/d[eé]j[aà]/gi, 'déjà')
  t = t.replace(/vers[eé]/gi, 'versé')
  t = t.replace(/D[eé]clar/gi, 'Déclar')
  t = t.replace(/C[eé]libataire/gi, 'Célibataire')
  t = t.replace(/Mari[eé]/gi, 'Marié')
  t = t.replace(/Divorc[eé]/gi, 'Divorcé')
  t = t.replace(/S[eé]par[eé]/gi, 'Séparé')

  // 3. Codes fiscaux mal lus par OCR
  // J→d, J→j, J→I sont courants
  t = t.replace(/\(1Ad\)/g, '(1AJ)')
  t = t.replace(/\(1Bd\)/g, '(1BJ)')
  t = t.replace(/\(1AI\)(?!\s*€?\s*\d)/g, '(1AJ)')  // 1AI sans montant = probablement 1AJ
  t = t.replace(/\(1BI\)/g, '(1BJ)')
  t = t.replace(/\(1aj\)/g, '(1AJ)')
  t = t.replace(/\(1bj\)/g, '(1BJ)')
  // S→5, 0→O dans les codes
  t = t.replace(/\(7U[Ff]\)/g, '(7UF)')
  t = t.replace(/\(7D[Bb]\)/g, '(7DB)')
  t = t.replace(/\(6N[Ss5]\)/g, '(6NS)')

  // 4. € souvent mal lu
  t = t.replace(/[€ É£]\s*$/gm, '€')  // Fin de ligne
  t = t.replace(/(\d)\s*[É£E]\b/g, '$1 €')  // Après un nombre

  // 5. Espaces dans les montants (normaliser)
  // "28 000" → OK, mais "28000" → OK aussi
  // "28.000" → "28 000" (format français)
  t = t.replace(/(\d)\.(\d{3})\b/g, '$1 $2')

  // 6. MONTANT RESTANT A PAYER / PAYE (OCR coupe souvent)
  t = t.replace(/RESTANT\s+[AÀ]\s+PAYE\b/gi, 'RESTANT À PAYER')

  return t
}

// ─── 80+ MAPPINGS : Code fiscal → champ structuré ───

interface CaseMapping {
  code: string
  field?: keyof AvisImpositionExtracted | string
  caseField?: string
  label: string
}

const CASE_MAPPINGS: CaseMapping[] = [
  // Étape 3 : Revenus du travail
  { code: '1AJ', field: 'salairesTraitements', label: 'Salaires déclarant 1' },
  { code: '1BJ', field: 'salairesDeclarant2', label: 'Salaires déclarant 2' },
  { code: '1AP', label: 'Heures sup exonérées D1' },
  { code: '1BP', label: 'Heures sup exonérées D2' },
  { code: '1AS', field: 'pensionsRetraite', label: 'Pensions retraite D1' },
  { code: '1BS', field: 'pensionsDeclarant2', label: 'Pensions retraite D2' },
  { code: '1AZ', label: 'Pension invalidité D1' },
  { code: '1BZ', label: 'Pension invalidité D2' },
  { code: '1AI', label: 'Rente viagère D1' },
  { code: '1AW', label: 'Rente viagère D1 (bis)' },
  { code: '1GB', label: 'Revenus gérant art. 62' },
  // Frais professionnels
  { code: '1AK', caseField: 'fraisReels1AK', label: 'Frais réels D1' },
  { code: '1BK', label: 'Frais réels D2' },
  // Capitaux
  { code: '2DC', label: 'Dividendes' },
  { code: '2TR', label: 'Intérêts et produits' },
  { code: '2TS', label: 'Revenus intérêts' },
  { code: '2AB', label: 'Crédits impôt RCM' },
  { code: '2CK', label: 'PFU déjà versé' },
  { code: '2BH', label: 'Revenus capitaux barème' },
  { code: '2DH', label: 'Rachat assurance-vie' },
  { code: '2EE', label: 'Produits assurance-vie' },
  // Plus-values
  { code: '3VG', field: 'plusValues', label: 'Plus-values mobilières' },
  { code: '3VH', label: 'Moins-values reportables' },
  { code: '3VZ', label: 'Plus-values immobilières' },
  // Foncier
  { code: '4BE', label: 'Micro-foncier brut' },
  { code: '4BA', label: 'Revenus fonciers nets' },
  { code: '4BB', label: 'Déficit foncier imputable' },
  { code: '4BC', label: 'Déficit foncier sur revenus fonciers' },
  { code: '4BD', label: 'Déficits antérieurs non déduits' },
  // Micro-BIC / BNC
  { code: '5ND', label: 'Micro-BIC ventes' },
  { code: '5NP', label: 'Micro-BIC services' },
  { code: '5HQ', label: 'Micro-BNC recettes' },
  { code: '5KO', label: 'Micro-BIC ventes (conjoint)' },
  { code: '5KP', label: 'Micro-BNC recettes (conjoint)' },
  { code: '5NK', label: 'BIC réel' },
  // Charges déductibles
  { code: '6EL', caseField: 'pensionVersee6EL', label: 'Pension alimentaire enfant' },
  { code: '6EM', label: 'Pension alimentaire enfant (bis)' },
  { code: '6GI', label: 'Pension alimentaire ex-conjoint' },
  { code: '6GJ', label: 'Pension alimentaire ex-conjoint (bis)' },
  { code: '6GP', label: 'Pension enfant garde alternée' },
  { code: '6GU', label: 'Prestation compensatoire' },
  { code: '6NS', caseField: 'per6NS', label: 'PER individuel D1' },
  { code: '6NT', label: 'PER individuel D2' },
  { code: '6PS', label: 'PERP/Madelin D1' },
  { code: '6PT', label: 'PERP/Madelin D2' },
  { code: '6RS', label: 'PERCO D1' },
  { code: '6RT', label: 'PERCO D2' },
  { code: '6DE', label: 'CSG déductible' },
  { code: '6DD', label: 'Déductions diverses' },
  // Réductions et crédits
  { code: '7UF', caseField: 'dons7UF', label: 'Dons associations intérêt général' },
  { code: '7UD', caseField: 'dons7UD', label: 'Dons aide personnes (75%)' },
  { code: '7DB', caseField: 'emploiDomicile7DB', label: 'Emploi salarié domicile' },
  { code: '7DQ', label: 'Emploi domicile première fois' },
  { code: '7GA', caseField: 'gardeEnfant7GA', label: 'Garde enfant 1' },
  { code: '7GB', label: 'Garde enfant 2' },
  { code: '7GC', label: 'Garde enfant 3' },
  { code: '7EA', label: 'Enfants collège' },
  { code: '7EC', label: 'Enfants lycée' },
  { code: '7EF', label: 'Enfants supérieur' },
  { code: '7CD', caseField: 'ehpad7CD', label: 'Hébergement EHPAD' },
  { code: '7CE', label: 'Hébergement EHPAD (conjoint)' },
  { code: '7UR', label: 'Cotisations syndicales' },
  { code: '7TD', label: 'Intérêts prêt étudiant' },
  { code: '7WJ', label: 'Prestation compensatoire réduction' },
  // Investissements
  { code: '7CF', caseField: 'investPME7CF', label: 'Investissement PME' },
  { code: '7CQ', label: 'Pinel métropole' },
  { code: '7CR', label: 'Pinel outre-mer' },
  { code: '7GH', label: 'Investissement outre-mer' },
  { code: '7HK', label: 'Investissement outre-mer (2)' },
  { code: '7WN', label: 'Investissement forestier' },
  { code: '7RN', label: 'Rénovation énergétique' },
  { code: '7RW', label: 'Rénovation énergétique (2)' },
  { code: '7ZQ', label: 'Borne recharge électrique' },
  { code: '7ZR', label: 'Borne recharge électrique (2)' },
  // Divers
  { code: '8TK', label: 'Revenus étrangers imposables' },
  { code: '8UU', label: 'Comptes étrangers' },
]

// Index rapide code → mapping
const CASE_MAP_INDEX = new Map<string, CaseMapping>()
for (const m of CASE_MAPPINGS) {
  CASE_MAP_INDEX.set(m.code, m)
}

// ─── 15 REGEX SPÉCIFIQUES (champs structurels fixes) ───
// V3.1 : patterns plus tolérants aux erreurs OCR (accents optionnels)

function extractSpecificFields(text: string): Partial<AvisImpositionExtracted> {
  const result: Partial<AvisImpositionExtracted> = {}

  // Helper : extraire un montant (€ optionnel pour gérer les OCR tronqués)
  function amt(patterns: string[], flags = 'i'): number {
    for (const p of patterns) {
      // Pattern avec € explicite
      const m1 = text.match(new RegExp(p + '[\\s\\n:]*([\\d\\s]+)\\s*€', flags))
      if (m1) {
        const v = parseInt(m1[1].replace(/\s/g, ''), 10)
        if (!isNaN(v) && v >= 0) return v
      }
      // Pattern sans € (OCR tronqué ou mal lu)
      const m2 = text.match(new RegExp(p + '[\\s\\n:]*([\\d\\s]{1,15})(?:\\s*€|\\s*$|\\n)', flags + 'm'))
      if (m2) {
        const v = parseInt(m2[1].replace(/\s/g, ''), 10)
        if (!isNaN(v) && v > 0) return v
      }
    }
    return 0
  }

  // Helper nombre (sans €)
  function num(patterns: string[], flags = 'i'): number {
    for (const p of patterns) {
      const m = text.match(new RegExp(p + '[\\s\\n:]*([\\d.,]+)', flags))
      if (m) {
        const v = parseFloat(m[1].replace(/\s/g, '').replace(',', '.'))
        if (!isNaN(v) && v >= 0) return v
      }
    }
    return 0
  }

  // 1. Année des revenus (très tolérant)
  const anneeMatch = text.match(/(?:REVENUS?|IMP[ÔO]T SUR LE REVENU|AVIS D['']?IMP[ÔO]T)[^\n]*?(\d{4})/i)
    || text.match(/[Rr]evenus?\s+(?:de\s+)?(?:l['']?ann[ée]e\s+)?(\d{4})/)
    || text.match(/SUR LES REVENUS?\s+(?:DE\s+)?(\d{4})/i)
    || text.match(/\(Revenus?\s+de\s+l['']?ann[ée]e\s+(\d{4})\)/i)
  if (anneeMatch) {
    const a = parseInt(anneeMatch[1], 10)
    if (a >= 2020 && a < 2030) result.annee = a
  }

  // 2. Numéro fiscal (13 chiffres, avec ou sans espaces)
  const nfMatch = text.match(/(?:n[°o]\s*fiscal|identifiant\s*fiscal|num[ée]ro\s*fiscal)[^\d]*(\d[\d\s]{11,17})/i)
  if (nfMatch) {
    const digits = nfMatch[1].replace(/\s/g, '')
    if (digits.length === 13) result.numeroFiscal = digits
  }

  // 3. Numéro d'avis
  const naMatch = text.match(/(?:n[°o]\s*d['']?avis|r[ée]f[ée]rence\s*d['']?avis)[^\d]*(\d[\d\s]{10,})/i)
  if (naMatch) result.numeroAvis = naMatch[1].replace(/\s/g, '')

  // 4. Situation familiale (tolérant : accents optionnels)
  const sitMatch = text.match(/(?:situation\s+(?:de\s+)?famille|situation\s+familiale)[^\n]*?\b(Mari[ée]|Pacs[ée]|C[ée]libataire|Divorc[ée]|Veuf|Veuve|S[ée]par[ée])/i)
  if (sitMatch) {
    const s = sitMatch[1].toLowerCase()
    if (s.includes('mari') || s.includes('pacs')) result.situationFamiliale = 'M'
    else if (s.includes('lib')) result.situationFamiliale = 'C'
    else if (s.includes('divor') || s.includes('par')) result.situationFamiliale = 'D'
    else if (s.includes('veuf') || s.includes('veuve')) result.situationFamiliale = 'V'
  }

  // 5. Nombre de parts
  const partsVal = num(['(?:nombre de parts|parts?\s+fiscales?)'])
  if (partsVal > 0 && partsVal <= 20) result.nbPartsDeclarees = partsVal

  // 6. Nombre de personnes à charge
  const pchVal = num(['(?:personnes?\s+[àa]\s+charge|pers\\.?\\s*[àa]\\s*charge)'])
  if (pchVal >= 0) result.nbPersonnesCharge = Math.round(pchVal)

  // 7. Revenu brut global
  result.revenuBrutGlobal = amt([
    'REVENU BRUT GLOBAL',
    'Revenu brut global',
    'revenu\\s+brut\\s+global',
  ])

  // 8. Revenu net imposable
  result.revenuNetImposable = amt([
    'REVENU NET IMPOSABLE',
    'Revenu net imposable',
    'revenu\\s+net\\s+imposable',
  ])

  // 9. RFR (très tolérant aux variantes OCR)
  result.rfr = amt([
    'REVENU FISCAL DE R[ÉE]F[ÉE]RENCE',
    'Revenu fiscal de r[ée]f[ée]rence',
    'FISCAL DE REF',
    'fiscal de r[ée]f',
  ])

  // 10. Impôt brut
  result.impotBrut = amt([
    'Imp[ôo]t\\s+(?:sur le revenu\\s+)?brut',
    'IMP[ÔO]T\\s+(?:SUR LE REVENU\\s+)?BRUT',
    'revenu\\s+brut\\s+(?=\\d)',  // "impôt sur le revenu brut 1550"
  ])

  // 11. Décote / plafonnement
  const decote = amt(['D[ée]cote', 'Plafonnement'])
  if (decote > 0) result.decotePlafonnement = decote

  // 12. Impôt net (V3.1 : tolère "IMPOT" sans accent)
  result.impotNet = amt([
    'IMP[ÔO]T\\s+NET\\b',
    'Imp[ôo]t\\s+net\\b',
    'IMPOT\\s+NET\\b',
  ])

  // 13. Impôt net avant crédits
  result.impotNetAvantCredits = amt([
    'Imp[ôo]t\\s+net\\s+avant\\s+cr[ée]dits',
    'AVANT\\s+CR[ÉE]DITS',
  ])

  // 14. Prélèvement à la source (V3.1 : très tolérant)
  const pas = amt([
    'Pr[ée]l[èe]vement\\s+[àa]\\s+la\\s+source\\s+d[ée]j[àa]\\s+vers[ée]',
    'Pr[ée]l[èe]vement\\s+[àa]\\s+la\\s+source',
    'Retenue\\s+[àa]\\s+la\\s+source',
    'PAS\\s+d[ée]j[àa]\\s+vers[ée]',
    'source\\s+d[ée]j[àa]',
  ])
  if (pas > 0) result.prelevementSource = pas

  // 15. Solde à payer / Restitution (V3.1 : tolère PAYE/PAYER)
  const restAPayer = amt([
    'MONTANT\\s+RESTANT\\s+[ÀA]\\s+PAYE[R]?',
    'RESTE?\\s+[ÀA]\\s+PAYE[R]?',
    'RESTANT\\s+D[ÛU]',
  ])
  const restitution = amt([
    'MONTANT\\s+DE\\s+VOTRE\\s+RESTITUTION',
    'RESTITUTION',
  ])
  const aucunMontant = /AUCUN\s+MONTANT\s+RESTANT/i.test(text)

  if (restitution > 0) {
    result.soldeAPayer = -restitution
  } else if (aucunMontant) {
    result.soldeAPayer = 0
  } else if (restAPayer > 0) {
    result.soldeAPayer = restAPayer
  } else if (result.impotNet !== undefined && result.prelevementSource) {
    result.soldeAPayer = result.impotNet - result.prelevementSource
  }

  // Bonus : réductions et crédits
  const totalRC = amt([
    'Total\\s+des\\s+r[ée]ductions\\s+et\\s+cr[ée]dits',
    'TOTAL\\s+DES\\s+IMPUTATIONS',
    'Total\\s+r[ée]ductions',
  ])
  if (totalRC > 0) result.totalReductionsCredits = totalRC

  // Cases cochées (booléens) — V3.1 : plus tolérant
  result.caseT = /case\s*T\s*[:=]?\s*(oui|coch[ée]|✓|x)/i.test(text) ||
    /\bparent\s+isol[ée]/i.test(text) ||
    /\(T\)\s*(oui|coch[ée])/i.test(text)
  result.caseL = /case\s*L\s*[:=]?\s*(oui|coch[ée]|✓|x)/i.test(text)

  return result
}

// ─── 1 REGEX GÉNÉRIQUE : capture TOUTES les cases ───

function extractAllCases(text: string): Record<string, number> {
  const cases: Record<string, number> = {}

  // Pattern 1 : "(CODE)" suivi d'un montant
  const genericPattern = /\(([A-Z0-9]{1,4})\)\s*[\n\s]*([+-]?\d[\d\s]*)\s*€?/g
  let match
  while ((match = genericPattern.exec(text)) !== null) {
    const code = match[1]
    const val = parseInt(match[2].replace(/\s/g, ''), 10)
    if (!isNaN(val) && val > 0 && CASE_MAP_INDEX.has(code)) {
      cases[code] = val
    }
  }

  // Pattern 2 : "case CODE" ou "CODE :" suivi d'un montant
  const altPattern = /(?:case\s+)?([A-Z0-9]{1,4})\s*[:=]\s*([+-]?\d[\d\s]*)\s*€?/g
  while ((match = altPattern.exec(text)) !== null) {
    const code = match[1]
    if (!cases[code] && CASE_MAP_INDEX.has(code)) {
      const val = parseInt(match[2].replace(/\s/g, ''), 10)
      if (!isNaN(val) && val > 0) cases[code] = val
    }
  }

  // Pattern 3 : colonnes alignées "1AJ    35 000"
  const colPattern = /\b([0-9][A-Z]{1,2}[A-Z0-9]?)\s{2,}(\d[\d\s]{0,10})\b/g
  while ((match = colPattern.exec(text)) !== null) {
    const code = match[1]
    if (!cases[code] && CASE_MAP_INDEX.has(code)) {
      const val = parseInt(match[2].replace(/\s/g, ''), 10)
      if (!isNaN(val) && val > 0) cases[code] = val
    }
  }

  // Pattern 4 (V3.1) : "Déclarant 1 (CODE) MONTANT €" — format courant avis
  const declPattern = /[Dd][ée]clarant\s*\d?\s*\(([A-Z0-9]{1,4})\)\s*[\n\s]*(\d[\d\s]*)\s*€?/g
  while ((match = declPattern.exec(text)) !== null) {
    const code = match[1]
    if (!cases[code]) {
      const val = parseInt(match[2].replace(/\s/g, ''), 10)
      if (!isNaN(val) && val > 0) cases[code] = val
    }
  }

  return cases
}

// ─── INFÉRENCE DES CHAMPS MANQUANTS ───
// V3.1 : Si on a certains champs, on peut calculer les manquants

function inferMissingFields(ext: AvisImpositionExtracted, rawCases: Record<string, number>): void {
  // Somme des revenus détaillés
  const totalSalaires = (ext.salairesTraitements || 0) + (ext.salairesDeclarant2 || 0)
  const totalPensions = (ext.pensionsRetraite || 0) + (ext.pensionsDeclarant2 || 0)
  const totalRevenus = totalSalaires + totalPensions +
    (ext.revenusCapitaux || 0) + (ext.revenusFonciers || 0) +
    (ext.microBIC || 0) + (ext.microBNC || 0)

  // RBG : si manquant, = somme des revenus détaillés
  if (ext.revenuBrutGlobal === 0 && totalRevenus > 0) {
    ext.revenuBrutGlobal = totalRevenus
    ext.warnings.push('RBG inféré depuis revenus détaillés.')
  }

  // RNI : si manquant, = RBG × 0.9 (abattement 10%)
  if (ext.revenuNetImposable === 0 && ext.revenuBrutGlobal > 0) {
    if ((ext.casesRenseignees.fraisReels1AK ?? 0) > 0) {
      ext.revenuNetImposable = ext.revenuBrutGlobal - (ext.casesRenseignees.fraisReels1AK ?? 0)
    } else {
      ext.revenuNetImposable = Math.round(ext.revenuBrutGlobal * 0.9)
    }
    ext.warnings.push('RNI inféré depuis RBG.')
  }

  // RFR : si manquant, = RNI (+ capitaux PFU si applicable)
  if (ext.rfr === 0 && ext.revenuNetImposable > 0) {
    ext.rfr = ext.revenuNetImposable
    if (ext.revenusCapitaux && ext.revenusCapitaux > 0 && !ext.casesRenseignees.case2OP) {
      ext.rfr += ext.revenusCapitaux
    }
    ext.warnings.push('RFR inféré depuis RNI.')
  }

  // PAS : si impotNet et solde connus, PAS = impotNet - solde
  if ((!ext.prelevementSource || ext.prelevementSource === 0) &&
      ext.impotNet > 0 && ext.soldeAPayer !== undefined && ext.soldeAPayer !== ext.impotNet) {
    const inferredPAS = ext.impotNet - ext.soldeAPayer
    if (inferredPAS > 0) {
      ext.prelevementSource = inferredPAS
      ext.warnings.push('PAS inféré depuis impôt net - solde.')
    }
  }

  // Solde : si impotNet et PAS connus
  if (ext.soldeAPayer === 0 && ext.impotNet > 0 && ext.prelevementSource && ext.prelevementSource > 0) {
    ext.soldeAPayer = ext.impotNet - ext.prelevementSource
  }

  // Situation familiale : si 2 salaires, probablement couple
  if (ext.situationFamiliale === 'C' && ext.salairesDeclarant2 && ext.salairesDeclarant2 > 0) {
    ext.situationFamiliale = 'M'
  }

  // Inférence situation depuis les parts : >= 2 parts sans enfants connus → couple probable
  if (ext.situationFamiliale === 'C' && ext.nbPartsDeclarees >= 2 && ext.nbPersonnesCharge === 0) {
    ext.situationFamiliale = 'M'
  }

  // Inférence enfants depuis les parts quand nbPersonnesCharge = 0
  if (ext.nbPersonnesCharge === 0 && ext.nbPartsDeclarees > 0) {
    const baseParts = (ext.situationFamiliale === 'M' || ext.situationFamiliale === 'O') ? 2 : 1
    const remaining = ext.nbPartsDeclarees - baseParts
    if (remaining > 0) {
      // 1er et 2e enfant = 0.5 part chacun, 3e+ = 1 part chacun
      // remaining <= 1 → 1 ou 2 enfants (0.5 chacun)
      // remaining > 1 → 2 enfants + (remaining - 1) enfants supplémentaires
      if (remaining <= 1) {
        ext.nbPersonnesCharge = Math.round(remaining / 0.5)
      } else {
        ext.nbPersonnesCharge = 2 + Math.round(remaining - 1)
      }
    }
  }
}

// ─── ASSEMBLAGE : Mapper cases capturées → AvisImpositionExtracted ───

function mapCasesToExtraction(
  specific: Partial<AvisImpositionExtracted>,
  rawCases: Record<string, number>
): AvisImpositionExtracted {
  const ext: AvisImpositionExtracted = {
    annee: specific.annee || new Date().getFullYear() - 1,
    numeroFiscal: specific.numeroFiscal,
    numeroAvis: specific.numeroAvis,
    situationFamiliale: specific.situationFamiliale || 'C',
    nbPartsDeclarees: specific.nbPartsDeclarees || 1,
    nbPersonnesCharge: specific.nbPersonnesCharge || 0,
    caseT: specific.caseT || false,
    caseL: specific.caseL || false,
    revenuBrutGlobal: specific.revenuBrutGlobal || 0,
    revenuNetImposable: specific.revenuNetImposable || 0,
    rfr: specific.rfr || 0,
    impotBrut: specific.impotBrut || 0,
    decotePlafonnement: specific.decotePlafonnement,
    totalReductionsCredits: specific.totalReductionsCredits || 0,
    impotNetAvantCredits: specific.impotNetAvantCredits || 0,
    impotNet: specific.impotNet || 0,
    prelevementSource: specific.prelevementSource,
    soldeAPayer: specific.soldeAPayer || 0,
    salairesTraitements: specific.salairesTraitements,
    salairesDeclarant2: specific.salairesDeclarant2,
    pensionsRetraite: specific.pensionsRetraite,
    pensionsDeclarant2: specific.pensionsDeclarant2,
    revenusCapitaux: specific.revenusCapitaux,
    revenusFonciers: specific.revenusFonciers,
    revenusFonciersBruts: specific.revenusFonciersBruts,
    microFoncier: specific.microFoncier,
    plusValues: specific.plusValues,
    microBIC: specific.microBIC,
    microBNC: specific.microBNC,
    deficitsFonciers: specific.deficitsFonciers,
    casesRenseignees: {
      fraisReels1AK: 0, pensionVersee6EL: 0, dons7UF: 0, dons7UD: 0,
      emploiDomicile7DB: 0, gardeEnfant7GA: 0, ehpad7CD: 0, per6NS: 0,
      case2OP: false, investPME7CF: 0,
    },
    confidence: 0,
    warnings: [],
  }

  // Mapper les cases capturées
  for (const [code, val] of Object.entries(rawCases)) {
    const mapping = CASE_MAP_INDEX.get(code)
    if (!mapping) continue
    if (mapping.field) {
      const f = mapping.field as keyof AvisImpositionExtracted
      if (f in ext && (ext[f] === 0 || ext[f] === undefined)) {
        (ext as any)[f] = val
      }
    }
    if (mapping.caseField) {
      (ext.casesRenseignees as any)[mapping.caseField] = val
    }
  }

  // 2OP : booléen
  if ('2OP' in rawCases) ext.casesRenseignees.case2OP = true

  // Revenus de capitaux : somme
  const revCap = (rawCases['2DC'] || 0) + (rawCases['2TR'] || 0) + (rawCases['2TS'] || 0) + (rawCases['2BH'] || 0)
  if (revCap > 0 && !ext.revenusCapitaux) ext.revenusCapitaux = revCap

  // Micro-foncier
  if (rawCases['4BE'] && rawCases['4BE'] > 0) {
    ext.microFoncier = true
    ext.revenusFonciersBruts = rawCases['4BE']
    ext.revenusFonciers = Math.round(rawCases['4BE'] * 0.7)
  }
  if (rawCases['4BA'] && rawCases['4BA'] > 0 && !ext.revenusFonciers) {
    ext.microFoncier = false
    ext.revenusFonciers = rawCases['4BA']
  }

  // Micro-BIC / BNC
  if (rawCases['5ND']) ext.microBIC = rawCases['5ND']
  if (rawCases['5KO'] && !ext.microBIC) ext.microBIC = rawCases['5KO']
  if (rawCases['5HQ']) ext.microBNC = rawCases['5HQ']
  if (rawCases['4BD']) ext.deficitsFonciers = rawCases['4BD']

  return ext
}

// ─── VALIDATION CROISÉE ───

function validateRegexExtraction(ext: AvisImpositionExtracted): void {
  // RNI vs RBG cohérence
  if (ext.revenuNetImposable > 0 && ext.revenuBrutGlobal > 0 &&
      ext.revenuNetImposable === ext.revenuBrutGlobal &&
      (ext.casesRenseignees.fraisReels1AK ?? 0) === 0) {
    const sal = (ext.salairesTraitements || 0) + (ext.salairesDeclarant2 || 0)
    if (sal > 0) {
      ext.revenuNetImposable = Math.round(ext.revenuBrutGlobal * 0.9)
      ext.warnings.push('RNI corrigé : abattement 10%.')
    }
  }

  // Solde vs impôt net
  if (ext.prelevementSource && ext.prelevementSource > 0 && ext.soldeAPayer === ext.impotNet) {
    ext.soldeAPayer = ext.impotNet - ext.prelevementSource
  }

  // impotNet négatif
  if (ext.impotNet < 0) {
    if (!ext.prelevementSource) ext.prelevementSource = -ext.impotNet
    ext.impotNet = 0
  }

  // Parts
  if (ext.nbPartsDeclarees < 1) ext.nbPartsDeclarees = 1
  if (ext.nbPartsDeclarees > 20) ext.nbPartsDeclarees = 20
}

// ─── CALCUL CONFIANCE (V3.1 : recalibré) ───

function computeConfidence(ext: AvisImpositionExtracted, fieldsFound: number): number {
  let score = 0

  // ═══ CHAMPS CRITIQUES (15 pts chacun) ═══
  if (ext.annee > 2020 && ext.annee < 2030) score += 15
  if (ext.revenuNetImposable > 0) score += 15
  if (ext.rfr > 0) score += 15
  if (ext.nbPartsDeclarees >= 1) score += 10
  // impotNet = 0 valide pour non imposable
  if (ext.impotNet > 0 || (ext.revenuNetImposable > 0 && ext.impotNet === 0)) score += 10

  // ═══ CHAMPS UTILES (7 pts chacun) ═══
  if (ext.revenuBrutGlobal > 0) score += 7
  if (ext.impotBrut > 0) score += 5
  if (ext.prelevementSource && ext.prelevementSource > 0) score += 5
  if (ext.salairesTraitements || ext.pensionsRetraite) score += 7
  if (ext.situationFamiliale && ext.situationFamiliale !== 'C') score += 3

  // ═══ COHÉRENCE (bonus) ═══
  if (ext.revenuBrutGlobal > 0 && ext.revenuNetImposable > 0 &&
      ext.revenuNetImposable <= ext.revenuBrutGlobal) score += 3
  if (ext.impotBrut > 0 && ext.impotNet <= ext.impotBrut) score += 2

  // ═══ CASES RENSEIGNÉES (bonus) ═══
  const casesCount = Object.values(ext.casesRenseignees)
    .filter(v => v !== 0 && v !== false && v !== undefined).length
  score += Math.min(casesCount * 2, 8)

  // Plafonner à 95%
  return Math.min(score, 95)
}

// ─── POINT D'ENTRÉE PRINCIPAL ───

export function extractWithRegex(ocrText: string): RegexExtractionResult {
  // V3.1 : Normaliser le texte OCR avant les regex
  const normalizedText = normalizeOCRText(ocrText)

  // 1. Extraction des champs spécifiques (15 regex)
  const specific = extractSpecificFields(normalizedText)

  // 2. Extraction générique de toutes les cases
  const rawCases = extractAllCases(normalizedText)

  // 3. Assemblage
  const extraction = mapCasesToExtraction(specific, rawCases)

  // 4. Inférence des champs manquants (V3.1)
  inferMissingFields(extraction, rawCases)

  // 5. Validation croisée
  validateRegexExtraction(extraction)

  // 6. Comptage des champs trouvés
  const fieldsFound = Object.values(specific).filter(v => v !== undefined && v !== 0 && v !== '' && v !== false).length
    + Object.keys(rawCases).length
  const fieldsTotal = 15 + CASE_MAPPINGS.length

  // 7. Confiance (V3.1 : recalibrée)
  extraction.confidence = computeConfidence(extraction, fieldsFound)

  return {
    extraction,
    rawCases,
    method: 'regex',
    fieldsFound,
    fieldsTotal,
  }
}

// ─── DÉTERMINER SI L'EXTRACTION REGEX EST SUFFISANTE ───

export function isRegexExtractionSufficient(result: RegexExtractionResult): boolean {
  const ext = result.extraction
  // Critères minimaux : confiance >= 50% + RNI et RFR trouvés
  // Note : impotNet=0 est VALIDE (non imposable par QF, décote, etc.)
  return (
    ext.confidence >= 50 &&
    ext.revenuNetImposable > 0 &&
    ext.rfr > 0
  )
}

// ─── EXPORTS ───

export { CASE_MAPPINGS, CASE_MAP_INDEX }
export type { RegexExtractionResult, CaseMapping }
