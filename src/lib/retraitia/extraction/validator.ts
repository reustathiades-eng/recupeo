// ============================================================
// RETRAITIA — Refus intelligent (validation post-extraction)
// ============================================================
// Après extraction, valide que le document est :
// 1. Lisible (extraction réussie avec score suffisant)
// 2. Du bon type (pas un bulletin de salaire à la place d'un RIS)
// 3. Complet (champs essentiels présents)
//
// Retourne un objet structuré pour le frontend avec :
// - level : 'accepted' | 'illisible' | 'mauvais_type' | 'incomplet'
// - message client, conseils, champs manquants
// ============================================================

import type { DocumentType } from '../types'

// ─── Types ───

export type RejectionLevel = 'accepted' | 'illisible' | 'mauvais_type' | 'incomplet'

export interface ValidationResult {
  level: RejectionLevel
  accepted: boolean
  /** Titre du message (ex: "Document illisible") */
  title: string
  /** Message explicatif */
  message: string
  /** Champs manquants (niveau 3 uniquement) */
  missingFields?: string[]
  /** Conseils pour corriger */
  tips?: string[]
  /** Résumé de l'extraction (si accepté ou incomplet) */
  summary?: string
}

// ─── Labels des documents ───

const DOC_LABELS: Partial<Record<DocumentType, string>> = {
  ris: 'Relevé Individuel de Situation (RIS)',
  notification_cnav: 'Notification de pension CNAV',
  releve_agirc_arrco: 'Relevé de points Agirc-Arrco',
  releve_mensualites: 'Relevé de mensualités',
  avis_imposition: `Avis d'imposition`,
  attestation_fiscale: 'Attestation fiscale retraite',
  eig: 'Estimation Indicative Globale (EIG)',
  notification_msa: 'Notification de pension MSA',
  notification_sre: 'Titre de pension SRE',
  notification_cnracl: 'Titre de pension CNRACL',
  paiements_agirc_arrco: 'Relevé de paiements Agirc-Arrco',
  releve_cnavpl: 'Relevé CNAVPL',
}

const DOC_SOURCES: Partial<Record<DocumentType, string>> = {
  ris: 'info-retraite.fr',
  notification_cnav: 'lassuranceretraite.fr',
  releve_agirc_arrco: 'agirc-arrco.fr',
  releve_mensualites: 'lassuranceretraite.fr',
  avis_imposition: 'impots.gouv.fr',
  attestation_fiscale: 'info-retraite.fr',
  eig: 'info-retraite.fr',
  notification_msa: 'msa.fr',
  notification_sre: 'ensap.gouv.fr',
  notification_cnracl: 'cnracl.retraites.fr',
}

// ─── Mots-clés pour détecter le type réel du document ───

const TYPE_KEYWORDS: Partial<Record<DocumentType, string[]>> = {
  ris: ['relevé individuel', 'relevé de situation', 'votre carrière', 'trimestres', 'régime général'],
  notification_cnav: ['notification', 'pension de retraite', 'montant mensuel', 'date d\'effet'],
  releve_agirc_arrco: ['agirc', 'arrco', 'points de retraite', 'relevé de points'],
  avis_imposition: ['avis d\'imposition', 'revenu fiscal', 'impôt sur le revenu', 'direction générale des finances'],
  releve_mensualites: ['mensualités', 'paiement', 'montant net'],
  attestation_fiscale: ['attestation fiscale', 'montant déclaré'],
  eig: ['estimation indicative', 'âge de départ', 'scénario'],
}

// Mots-clés de documents courants (pour détecter le mauvais type)
const WRONG_DOC_KEYWORDS: Array<{ keywords: string[]; label: string }> = [
  { keywords: ['bulletin de salaire', 'bulletin de paie', 'salaire brut', 'net à payer'], label: 'bulletin de salaire' },
  { keywords: ['fiche de paie'], label: 'fiche de paie' },
  { keywords: ['relevé de compte', 'solde au'], label: 'relevé de compte bancaire' },
  { keywords: ['carte vitale', 'attestation de droits'], label: 'attestation de droits Ameli' },
  { keywords: ['attestation employeur', 'certificat de travail'], label: 'certificat de travail' },
  { keywords: ['contrat de travail'], label: 'contrat de travail' },
  { keywords: ['facture', 'devis'], label: 'facture ou devis' },
  { keywords: ['ordonnance', 'prescription'], label: 'ordonnance médicale' },
]

// ─── Validation principale ───

export function validateExtraction(
  documentType: DocumentType,
  extractionSuccess: boolean,
  extractionScore: number,
  extractedData: Record<string, unknown> | null,
  ocrText?: string,
): ValidationResult {
  const label = DOC_LABELS[documentType] || documentType
  const source = DOC_SOURCES[documentType] || ''

  // ── Niveau 1 : Document illisible ──
  if (!extractionSuccess || extractionScore < 20 || !extractedData) {
    return {
      level: 'illisible',
      accepted: false,
      title: 'Document illisible',
      message: `Nous n'arrivons pas à lire ce document. Cela peut être dû à une photo floue, un scan de mauvaise qualité, ou un fichier corrompu.`,
      tips: [
        'Prenez la photo dans un endroit bien éclairé',
        'Posez le document à plat sur une surface claire',
        'Assurez-vous que tout le texte est visible et net',
        'Évitez les reflets et les ombres',
        'Si possible, téléchargez le PDF directement depuis le site',
      ],
    }
  }

  // ── Niveau 2 : Mauvais type de document ──
  if (ocrText) {
    const textLower = ocrText.toLowerCase()

    // Vérifier si le document correspond au type attendu
    const expectedKeywords = TYPE_KEYWORDS[documentType] || []
    const matchesExpected = expectedKeywords.some(kw => textLower.includes(kw.toLowerCase()))

    if (!matchesExpected && expectedKeywords.length > 0) {
      // Essayer de détecter quel type de document c'est réellement
      const detected = WRONG_DOC_KEYWORDS.find(w =>
        w.keywords.some(kw => textLower.includes(kw.toLowerCase()))
      )

      // Aussi checker si c'est un autre type de doc retraite
      let detectedRetraiteType: string | null = null
      for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
        if (type !== documentType && keywords?.some(kw => textLower.includes(kw.toLowerCase()))) {
          detectedRetraiteType = DOC_LABELS[type as DocumentType] || type
          break
        }
      }

      const detectedLabel = detected?.label || detectedRetraiteType || 'un autre type de document'

      return {
        level: 'mauvais_type',
        accepted: false,
        title: `Ce document ne semble pas être un ${label}`,
        message: `Nous avons détecté ${detectedLabel} alors que nous attendons un ${label}.`,
        tips: [
          `Le ${label} se trouve sur ${source}`,
          'Connectez-vous avec FranceConnect pour y accéder',
          'Consultez le guide pas-à-pas pour le récupérer',
        ],
      }
    }
  }

  // ── Niveau 3 : Document incomplet ──
  const missingFields = checkCompleteness(documentType, extractedData)

  if (missingFields.length > 0) {
    return {
      level: 'incomplet',
      accepted: false,
      title: 'Document incomplet',
      message: `Nous avons bien reconnu votre ${label}, mais il manque des informations essentielles.`,
      missingFields,
      tips: [
        'Si vous avez téléchargé le PDF en ligne : retéléchargez-le en vérifiant que le téléchargement est complet',
        'Si vous avez photographié un document papier : vérifiez que toutes les pages sont incluses',
        'Le document doit être complet, de la première à la dernière page',
      ],
      summary: buildPartialSummary(documentType, extractedData),
    }
  }

  // ── Accepté ──
  return {
    level: 'accepted',
    accepted: true,
    title: `Document accepté — ${label}`,
    message: 'Le document a été analysé avec succès.',
    summary: buildSummary(documentType, extractedData),
  }
}

// ─── Vérification de complétude par type ───

function checkCompleteness(docType: DocumentType, data: Record<string, unknown>): string[] {
  const missing: string[] = []

  switch (docType) {
    case 'ris': {
      const d = data as any
      if (!d.carriere || !Array.isArray(d.carriere) || d.carriere.length === 0) {
        missing.push('Aucune année de carrière détectée — le tableau carrière est absent ou illisible')
      }
      if (!d.totalTrimestresValides && !d.recapTrimestres) {
        missing.push('Le récapitulatif des trimestres est absent')
      }
      break
    }
    case 'notification_cnav': {
      const d = data as any
      if (!d.montantMensuelBrut && !d.montantMensuelNet) {
        missing.push('Le montant de la pension est absent')
      }
      if (!d.dateEffet) {
        missing.push(`La date d'effet de la pension est absente`)
      }
      if (!d.taux && !d.sam) {
        missing.push('Le détail du calcul (SAM, taux, trimestres) est absent — vérifiez que toutes les pages sont incluses')
      }
      break
    }
    case 'releve_agirc_arrco': {
      const d = data as any
      if (!d.totalPoints && (!d.pointsParAnnee || !Array.isArray(d.pointsParAnnee) || d.pointsParAnnee.length === 0)) {
        missing.push('Aucun point de retraite complémentaire détecté')
      }
      break
    }
    case 'avis_imposition': {
      const d = data as any
      if (!d.rfr && d.rfr !== 0) {
        missing.push('Le Revenu Fiscal de Référence (RFR) est absent')
      }
      if (!d.nombreParts) {
        missing.push('Le nombre de parts fiscales est absent')
      }
      break
    }
    case 'releve_mensualites': {
      const d = data as any
      if (!d.montantNet && !d.paiements) {
        missing.push('Aucun montant de paiement détecté')
      }
      break
    }
    case 'attestation_fiscale': {
      const d = data as any
      if (!d.montantAnnuel) {
        missing.push('Le montant annuel déclaré est absent')
      }
      if (!d.annee) {
        missing.push(`L'année concernée est absente`)
      }
      break
    }
    case 'eig': {
      const d = data as any
      if (!d.scenarios || !Array.isArray(d.scenarios) || d.scenarios.length === 0) {
        missing.push(`Aucun scénario de départ détecté — vérifiez que l'EIG est complet`)
      }
      break
    }
    case 'notification_sre':
    case 'notification_cnracl': {
      const d = data as any
      if (!d.montantPension && !d.montantMensuel) {
        missing.push('Le montant de la pension est absent')
      }
      if (!d.indice && !d.indiceMajore) {
        missing.push(`L'indice est absent`)
      }
      break
    }
    case 'notification_msa': {
      const d = data as any
      if (!d.montantPension && !d.montantMensuel) {
        missing.push('Le montant de la pension est absent')
      }
      break
    }
    // Pour les types sans vérification spécifique, on accepte
    default:
      break
  }

  return missing
}

// ─── Résumés ───

function buildSummary(docType: DocumentType, data: Record<string, unknown>): string {
  const d = data as any
  switch (docType) {
    case 'ris': {
      const parts: string[] = []
      if (d.premiereAnnee && d.derniereAnnee) parts.push(`Période : ${d.premiereAnnee}–${d.derniereAnnee}`)
      if (d.carriere?.length) parts.push(`${d.carriere.length} années de carrière`)
      if (d.totalTrimestresValides) parts.push(`${d.totalTrimestresValides} trimestres`)
      if (d.regimesAffilies?.length) parts.push(`Régimes : ${d.regimesAffilies.join(', ')}`)
      return parts.join(' · ')
    }
    case 'notification_cnav': {
      const parts: string[] = []
      if (d.montantMensuelBrut) parts.push(`${Number(d.montantMensuelBrut).toFixed(2)} €/mois brut`)
      if (d.taux) parts.push(`taux ${d.taux}%`)
      if (d.trimestresRetenus) parts.push(`${d.trimestresRetenus} trim. retenus`)
      if (d.dateEffet) parts.push(`effet ${d.dateEffet}`)
      return parts.join(' · ')
    }
    case 'releve_agirc_arrco': {
      const parts: string[] = []
      if (d.totalPoints) parts.push(`${d.totalPoints} points`)
      if (d.pointsParAnnee?.length) parts.push(`${d.pointsParAnnee.length} années`)
      return parts.join(' · ')
    }
    case 'avis_imposition': {
      const parts: string[] = []
      if (d.rfr || d.rfr === 0) parts.push(`RFR ${d.rfr} €`)
      if (d.nombreParts) parts.push(`${d.nombreParts} parts`)
      if (d.annee) parts.push(`année ${d.annee}`)
      return parts.join(' · ')
    }
    default:
      return 'Document extrait'
  }
}

function buildPartialSummary(docType: DocumentType, data: Record<string, unknown>): string {
  const full = buildSummary(docType, data)
  return full ? `Données partiellement détectées : ${full}` : 'Données insuffisantes'
}
