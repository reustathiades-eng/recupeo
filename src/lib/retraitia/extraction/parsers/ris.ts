// ============================================================
// RETRAITIA V2 — Parseur regex RIS
// ============================================================

import type { ExtractionRIS, TrimestreRIS } from '../../types'

interface RISParseResult {
  data: Partial<ExtractionRIS>
  fieldsFound: number
  fieldsTotal: number
  score: number
}

function normalizeText(text: string): string {
  let t = text.normalize('NFC')
  t = t.replace(/[Tt]rim[e.]stres?/gi, 'Trimestres')
  t = t.replace(/R[eé]gime\s*g[eé]n[eé]ral/gi, 'Regime general')
  t = t.replace(/S[eé]curit[eé]\s*[Ss]ociale/gi, 'Securite Sociale')
  t = t.replace(/(\d)\.(\d{3})\b/g, '$1 $2')
  return t
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/\s/g, '').replace(',', '.')) || 0
}

export function parseRIS(rawText: string): RISParseResult {
  const text = normalizeText(rawText)
  const fieldsTotal = 4 // trimestres[], totalValides, totalCotises, regimesPresents
  let fieldsFound = 0

  const trimestres: TrimestreRIS[] = []
  const regimesSet = new Set<string>()

  // Extraction lignes carrière : année | régime/employeur | trimestres | salaire
  const ligneRe = /(\d{4})\s+(.+?)\s+(\d{1,4})\s+([\d\s]+(?:[.,]\d{2})?)\s*(?:€|EUR)?/gm
  let match: RegExpExecArray | null

  while ((match = ligneRe.exec(text)) !== null) {
    const annee = parseInt(match[1])
    if (annee < 1950 || annee > 2030) continue

    const regimeStr = match[2].trim()
    const trimVal = Math.min(parseInt(match[3]) || 0, 8) // max 8 par an (validés tous régimes)
    const salaire = parseAmount(match[4])

    regimesSet.add(regimeStr)
    trimestres.push({
      annee,
      regime: regimeStr,
      trimestresValides: Math.min(trimVal, 4),
      trimestresCotises: Math.min(trimVal, 4),
      trimestresAssimiles: 0,
      salaire: salaire > 0 ? salaire : undefined,
    })
  }

  if (trimestres.length > 0) fieldsFound++

  // Total trimestres
  const totalRe = /[Tt]otal\s*(?:des\s*)?[Tt]rimestres\s*[:.]?\s*(\d{1,3})/i
  const totalMatch = totalRe.exec(text)
  let totalTrimestresValides = 0
  if (totalMatch) {
    totalTrimestresValides = parseInt(totalMatch[1])
    fieldsFound++
  } else if (trimestres.length > 0) {
    totalTrimestresValides = trimestres.reduce((sum, t) => sum + t.trimestresValides, 0)
    fieldsFound++
  }

  // Total cotisés
  const cotisesRe = /[Tt]rimestres\s*[Cc]otis[eé]s\s*[:.]?\s*(\d{1,3})/i
  const cotisesMatch = cotisesRe.exec(text)
  let totalTrimestresCotises = 0
  if (cotisesMatch) {
    totalTrimestresCotises = parseInt(cotisesMatch[1])
    fieldsFound++
  } else {
    totalTrimestresCotises = trimestres.reduce((sum, t) => sum + t.trimestresCotises, 0)
    if (trimestres.length > 0) fieldsFound++
  }

  // Régimes
  if (regimesSet.size > 0) fieldsFound++

  const data: Partial<ExtractionRIS> = {
    trimestres,
    totalTrimestresValides,
    totalTrimestresCotises,
    regimesPresents: Array.from(regimesSet),
    premiereAnnee: trimestres.length > 0 ? Math.min(...trimestres.map(t => t.annee)) : 0,
    derniereAnnee: trimestres.length > 0 ? Math.max(...trimestres.map(t => t.annee)) : 0,
  }

  return {
    data,
    fieldsFound,
    fieldsTotal,
    score: Math.round((fieldsFound / fieldsTotal) * 100),
  }
}
