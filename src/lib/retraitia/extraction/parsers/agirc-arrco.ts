// ============================================================
// RETRAITIA V2 — Parseur regex Agirc-Arrco
// ============================================================

import type { ExtractionAgircArrco } from '../../types'

interface AAParseResult {
  data: Partial<ExtractionAgircArrco>
  fieldsFound: number
  fieldsTotal: number
  score: number
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/\s/g, '').replace(',', '.')) || 0
}

export function parseAgircArrco(rawText: string): AAParseResult {
  const text = rawText.normalize('NFC')
  const fieldsTotal = 3 // totalPoints, pointsParAnnee, pensionAnnuelle
  let fieldsFound = 0

  const pointsParAnnee: Array<{ annee: number; points: number; type: 'cotises' | 'gratuits' | 'gmp' }> = []

  // Ligne points : année | employeur/description | points
  const ligneRe = /(\d{4})\s+(.+?)\s+([\d\s]+[.,]?\d*)\s*(?:points?)?/gm
  let match: RegExpExecArray | null

  while ((match = ligneRe.exec(text)) !== null) {
    const annee = parseInt(match[1])
    if (annee < 1950 || annee > 2030) continue

    const desc = match[2].toLowerCase()
    const points = parseAmount(match[3])
    if (points <= 0) continue

    let type: 'cotises' | 'gratuits' | 'gmp' = 'cotises'
    if (/ch[oô]mage|maladie|maternit|invalidit|gratuit/i.test(desc)) type = 'gratuits'
    if (/gmp|garantie/i.test(desc)) type = 'gmp'

    pointsParAnnee.push({ annee, points, type })
  }

  if (pointsParAnnee.length > 0) fieldsFound++

  // Total points
  const totalRe = /[Tt]otal\s*(?:des\s*)?[Pp]oints\s*[:.]?\s*([\d\s]+[.,]?\d*)/i
  const totalMatch = totalRe.exec(text)
  let totalPoints = 0
  if (totalMatch) {
    totalPoints = parseAmount(totalMatch[1])
    fieldsFound++
  } else {
    totalPoints = pointsParAnnee.reduce((sum, p) => sum + p.points, 0)
    if (pointsParAnnee.length > 0) fieldsFound++
  }

  // Pension annuelle
  const pensionRe = /[Pp]ension\s*(?:annuelle|compl[eé]mentaire)\s*[:.]?\s*([\d\s]+[.,]\d{2})\s*(?:€|EUR)/i
  const pensionMatch = pensionRe.exec(text)
  let pensionAnnuelle = 0
  if (pensionMatch) {
    pensionAnnuelle = parseAmount(pensionMatch[1])
    fieldsFound++
  }

  // Majorations
  const majRe = /[Mm]ajoration\s*(?:pour\s*)?(?:enfants?|famille)/i
  const majorationEnfants = majRe.test(text)

  // Malus
  const malusRe = /[Cc]oefficient\s*(?:de\s*)?[Ss]olidarit[eé]|[Mm]alus|minoration\s*temporaire/i
  const malus = malusRe.test(text)

  const data: Partial<ExtractionAgircArrco> = {
    totalPoints,
    pointsParAnnee,
    valeurPoint: 0, // sera rempli depuis les données de référence
    pensionAnnuelle,
    majorationEnfants,
    malus,
  }

  return {
    data,
    fieldsFound,
    fieldsTotal,
    score: Math.round((fieldsFound / fieldsTotal) * 100),
  }
}
