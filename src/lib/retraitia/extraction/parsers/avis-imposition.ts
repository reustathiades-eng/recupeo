// ============================================================
// RETRAITIA V2 — Parseur regex Avis d'imposition
// ============================================================
// Version simplifiée pour RETRAITIA (seuls RFR, parts, impôt importent)
// Le parseur complet est dans monimpot/regex-extractor.ts

import type { ExtractionAvisImposition } from '../../types'

interface AvisParseResult {
  data: Partial<ExtractionAvisImposition>
  fieldsFound: number
  fieldsTotal: number
  score: number
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/\s/g, '').replace(',', '.')) || 0
}

export function parseAvisImposition(rawText: string): AvisParseResult {
  const text = rawText.normalize('NFC')
  const fieldsTotal = 4 // rfr, parts, impotNet, annee
  let fieldsFound = 0

  const data: Partial<ExtractionAvisImposition> = {}

  // RFR
  const rfrRe = /[Rr]evenu\s*[Ff]iscal\s*de\s*[Rr][eé]f[eé]rence\s*[:.]?\s*([\d\s]+)/i
  const m1 = rfrRe.exec(text)
  if (m1) { data.rfr = parseAmount(m1[1]); fieldsFound++ }

  // Nombre de parts
  const partsRe = /[Nn]ombre\s*de\s*parts?\s*[:.]?\s*(\d[.,]?\d*)/i
  const m2 = partsRe.exec(text)
  if (m2) { data.nombreParts = parseFloat(m2[1].replace(',', '.')); fieldsFound++ }

  // Impôt net
  const impotRe = /[Ii]mp[oô]t\s*(?:sur\s*le\s*revenu\s*)?net\s*[:.]?\s*([\d\s]+)/i
  const m3 = impotRe.exec(text)
  if (m3) { data.impotNet = parseAmount(m3[1]); fieldsFound++ }

  // Année de revenus
  const anneeRe = /[Rr]evenus\s*(?:de\s*l['\u2019]ann[eé]e\s*)?(\d{4})/i
  const m4 = anneeRe.exec(text)
  if (m4) { data.annee = parseInt(m4[1]); fieldsFound++ }

  // Crédit d'impôt emploi domicile
  const ciRe = /[Cc]r[eé]dit\s*d['\u2019]imp[oô]t\s*(?:emploi\s*[àa]\s*domicile|services?\s*[àa]\s*la\s*personne)\s*[:.]?\s*([\d\s]+)/i
  const m5 = ciRe.exec(text)
  if (m5) data.creditImpotEmploiDomicile = parseAmount(m5[1])

  return {
    data,
    fieldsFound,
    fieldsTotal,
    score: Math.round((fieldsFound / fieldsTotal) * 100),
  }
}
