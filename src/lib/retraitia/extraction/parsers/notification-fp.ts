// ============================================================
// Parseur regex — Titre de pension SRE / Décompte CNRACL
// ============================================================
// Extrait : indice majoré, traitement indiciaire, taux,
// trimestres, bonifications, pension brute, date d'effet.
// ============================================================

import type { ExtractionNotificationFP } from '../../types'

/**
 * Parse un titre de pension SRE ou un décompte de pension CNRACL.
 * Retourne null si le texte ne correspond pas.
 */
export function parseNotificationFP(text: string): ExtractionNotificationFP | null {
  if (!text || text.length < 100) return null

  const t = text.replace(/\s+/g, ' ')
  const tLow = t.toLowerCase()

  // Détecter le régime
  let regime: 'sre' | 'cnracl' = 'sre'
  if (tLow.includes('cnracl') || tLow.includes('caisse nationale de retraites des agents des collectivités')
    || tLow.includes('retraite publique') || tLow.includes('décompte définitif')) {
    regime = 'cnracl'
  } else if (tLow.includes('sre') || tLow.includes('service des retraites de l\'état')
    || tLow.includes('titre de pension') || tLow.includes('ensap')) {
    regime = 'sre'
  } else if (!tLow.includes('indice') && !tLow.includes('traitement')) {
    return null // Probablement pas un document FP
  }

  const result: ExtractionNotificationFP = { regime }

  // ── Indice majoré ──
  const indiceMatch = t.match(/indice\s*(?:major[ée]|nouveau)?\s*:?\s*(\d{3,4})/i)
  if (indiceMatch) {
    result.indiceMajore = parseInt(indiceMatch[1])
  }

  // ── Traitement indiciaire brut (annuel ou mensuel) ──
  const traitementMatch = t.match(/traitement\s*(?:indiciaire)?\s*(?:brut)?\s*(?:annuel|mensuel)?\s*:?\s*([\d\s,.]+)\s*€/i)
  if (traitementMatch) {
    const val = parseFloat(traitementMatch[1].replace(/\s/g, '').replace(',', '.'))
    // Si < 5000, c'est probablement mensuel → × 12
    result.traitementIndiciaireBrut = val < 5000 ? val * 12 : val
  }

  // ── Taux de liquidation ──
  const tauxMatch = t.match(/taux\s*(?:de\s*)?(?:liquidation|pension)\s*:?\s*([\d,.]+)\s*%/i)
  if (tauxMatch) {
    result.tauxLiquidation = parseFloat(tauxMatch[1].replace(',', '.'))
  }

  // ── Trimestres de services ──
  const trimServicesMatch = t.match(/(?:durée\s*(?:de\s*)?services?|trimestres?\s*(?:de\s*)?services?)\s*:?\s*(\d+)/i)
  if (trimServicesMatch) {
    result.trimestresServices = parseInt(trimServicesMatch[1])
  }

  // ── Trimestres requis ──
  const trimRequisMatch = t.match(/(?:durée\s*(?:de\s*)?(?:référence|requise|d'assurance\s*requise))\s*:?\s*(\d+)/i)
  if (trimRequisMatch) {
    result.trimestresRequis = parseInt(trimRequisMatch[1])
  }

  // ── Pension brute mensuelle ──
  const pensionMensMatch = t.match(/pension\s*(?:brute)?\s*(?:mensuelle)?\s*:?\s*([\d\s,.]+)\s*€\s*(?:par\s*mois|\/\s*mois|mensuel)/i)
  if (pensionMensMatch) {
    result.pensionBruteMensuelle = parseFloat(pensionMensMatch[1].replace(/\s/g, '').replace(',', '.'))
  }

  // ── Pension brute annuelle ──
  const pensionAnnMatch = t.match(/pension\s*(?:brute)?\s*(?:annuelle)?\s*:?\s*([\d\s,.]+)\s*€\s*(?:par\s*an|\/\s*an|annuel)/i)
  if (pensionAnnMatch) {
    result.pensionBruteAnnuelle = parseFloat(pensionAnnMatch[1].replace(/\s/g, '').replace(',', '.'))
  }
  // Fallback : montant seul après "pension"
  if (!result.pensionBruteMensuelle && !result.pensionBruteAnnuelle) {
    const fallback = t.match(/pension\s*(?:brute|nette|civile)?\s*(?:de\s*retraite)?\s*:?\s*([\d\s,.]+)\s*€/i)
    if (fallback) {
      const val = parseFloat(fallback[1].replace(/\s/g, '').replace(',', '.'))
      if (val > 3000) {
        result.pensionBruteAnnuelle = val
        result.pensionBruteMensuelle = Math.round(val / 12 * 100) / 100
      } else {
        result.pensionBruteMensuelle = val
        result.pensionBruteAnnuelle = Math.round(val * 12 * 100) / 100
      }
    }
  }

  // ── Date d'effet ──
  const dateMatch = t.match(/(?:date\s*d'effet|effet\s*(?:au|à\s*compter\s*du|le))\s*:?\s*(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/i)
  if (dateMatch) {
    result.dateEffet = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`
  }

  // ── NBI ──
  const nbiMatch = t.match(/(?:NBI|nouvelle\s*bonification\s*indiciaire)\s*:?\s*(\d+)/i)
  if (nbiMatch) {
    result.nbi = parseInt(nbiMatch[1])
  }

  // ── RAFP ──
  const rafpMatch = t.match(/RAFP\s*:?\s*([\d,.]+)\s*€/i)
  if (rafpMatch) {
    result.montantRAFP = parseFloat(rafpMatch[1].replace(',', '.'))
  }

  // ── Nom / Prénom ──
  const nomMatch = t.match(/(?:Monsieur|Madame|M\.|Mme)\s+([A-ZÉÈÊËÀÂÙÛÎÏÔÇ][a-zéèêëàâùûîïôç]+(?:\s+[A-ZÉÈÊËÀÂÙÛÎÏÔÇ][a-zéèêëàâùûîïôç]+)?)/i)
  if (nomMatch) {
    const parts = nomMatch[1].split(/\s+/)
    if (parts.length >= 2) {
      result.prenom = parts[0]
      result.nom = parts.slice(1).join(' ')
    }
  }

  // Vérifier qu'on a extrait quelque chose d'utile
  if (!result.indiceMajore && !result.traitementIndiciaireBrut && !result.pensionBruteMensuelle) {
    return null
  }

  return result
}
