// ============================================================
// RETRAITIA V2 — Parseur regex Notification CNAV/CARSAT
// ============================================================

import type { ExtractionNotificationCNAV } from '../../types'

interface NotifParseResult {
  data: Partial<ExtractionNotificationCNAV>
  fieldsFound: number
  fieldsTotal: number
  score: number
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/\s/g, '').replace(',', '.')) || 0
}

export function parseNotificationCNAV(rawText: string): NotifParseResult {
  const text = rawText.normalize('NFC')
  const fieldsTotal = 8 // montant, sam, taux, trimRetenus, trimRequis, proratisation, majoration, dateEffet
  let fieldsFound = 0

  const data: Partial<ExtractionNotificationCNAV> = {}

  // Montant brut mensuel
  const montantRe = /[Mm]ontant\s*(?:brut|mensuel|de\s*(?:la|votre)\s*pension)\s*[:.]?\s*([\d\s]+[.,]\d{2})\s*(?:€|EUR)/i
  const m1 = montantRe.exec(text)
  if (m1) { data.montantMensuelBrut = parseAmount(m1[1]); fieldsFound++ }

  // SAM
  const samRe = /[Ss]alaire\s*[Aa]nnuel\s*[Mm]oyen\s*[:.]?\s*([\d\s]+[.,]\d{2})\s*(?:€|EUR)?/i
  const m2 = samRe.exec(text)
  if (m2) { data.sam = parseAmount(m2[1]); fieldsFound++ }

  // Taux de liquidation
  const tauxRe = /[Tt]aux\s*(?:de\s*liquidation)?\s*[:.]?\s*(\d{2}[.,]\d{1,4})\s*%/i
  const m3 = tauxRe.exec(text)
  if (m3) { data.taux = parseFloat(m3[1].replace(',', '.')); fieldsFound++ }

  // Trimestres retenus
  const trimRetenusRe = /[Tt]rimestres?\s*(?:retenus?|valid[eé]s?|pris\s*en\s*compte)\s*[:.]?\s*(\d{1,3})/i
  const m4 = trimRetenusRe.exec(text)
  if (m4) { data.trimestresRetenus = parseInt(m4[1]); fieldsFound++ }

  // Trimestres requis
  const trimRequisRe = /[Tt]rimestres?\s*(?:requis|n[eé]cessaires|exig[eé]s)\s*[:.]?\s*(\d{1,3})/i
  const m5 = trimRequisRe.exec(text)
  if (m5) { data.trimestresRequis = parseInt(m5[1]); fieldsFound++ }

  // Proratisation
  if (data.trimestresRetenus && data.trimestresRequis) {
    data.proratisation = Math.min(1, data.trimestresRetenus / data.trimestresRequis)
    fieldsFound++
  }

  // Majoration enfants
  const majorationRe = /[Mm]ajoration\s*(?:pour\s*)?(?:enfants?|3\s*enfants)/i
  data.majorationEnfants = majorationRe.test(text)
  if (majorationRe.test(text)) {
    const majMontantRe = /[Mm]ajoration\s*(?:pour\s*)?(?:enfants?)[^:]*[:.]?\s*([\d\s]+[.,]\d{2})\s*(?:€|EUR)/i
    const m6 = majMontantRe.exec(text)
    if (m6) data.majorationEnfantsMontant = parseAmount(m6[1])
    fieldsFound++
  }

  // Décote / Surcote
  const decoteRe = /[Dd][eé]cote\s*[:.]?\s*(\d+)\s*trimestres?/i
  const m7 = decoteRe.exec(text)
  if (m7) { data.decote = true; data.decoteTrimestres = parseInt(m7[1]) }
  else { data.decote = false }

  const surcoteRe = /[Ss]urcote\s*[:.]?\s*(\d+)\s*trimestres?/i
  const m8 = surcoteRe.exec(text)
  if (m8) { data.surcote = true; data.surcoteTrimestres = parseInt(m8[1]) }
  else { data.surcote = false }

  // Minimum contributif
  data.minimumContributif = /[Mm]inimum\s*[Cc]ontributif/i.test(text)

  // Date d'effet
  const dateRe = /[Dd]ate\s*d['\u2019]effet\s*[:.]?\s*(\d{2}\/\d{2}\/\d{4})/i
  const m9 = dateRe.exec(text)
  if (m9) { data.dateEffet = m9[1]; fieldsFound++ }

  // Montant net
  const netRe = /[Mm]ontant\s*net\s*[:.]?\s*([\d\s]+[.,]\d{2})\s*(?:€|EUR)/i
  const m10 = netRe.exec(text)
  if (m10) data.montantMensuelNet = parseAmount(m10[1])

  // Taux CSG
  const csgRe = /[Cc][Ss][Gg]\s*[:.]?\s*(\d[.,]\d+)\s*%/i
  const m11 = csgRe.exec(text)
  if (m11) data.tauxCSG = parseFloat(m11[1].replace(',', '.'))

  return {
    data,
    fieldsFound,
    fieldsTotal,
    score: Math.round((fieldsFound / fieldsTotal) * 100),
  }
}
