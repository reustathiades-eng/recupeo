// ============================================================
// POST /api/mapaie/extract
// Extraction de bulletin de paie — OCR local ou Vision
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { callClaude, callClaudeVision } from '@/lib/anthropic'
import { extractTextFromDocument, pdfToBase64Images, imageToBase64ForVision } from '@/lib/ocr'
import { anonymizeText } from '@/lib/pii-detector'
import { EXTRACTION_PROMPT } from '@/lib/mapaie/prompts'
import { track } from '@/lib/analytics'
import { percentage, pii } from '@/lib/mapaie/types'
import type {
  Bulletin,
  BulletinLine,
  BulletinPeriod,
  BulletinEmployee,
  BulletinEmployer,
} from '@/lib/mapaie/types'
import type {
  BulletinHeures,
  BulletinConges,
  BulletinRemuneration,
  BulletinCumuls,
} from '@/lib/mapaie/types/bulletin'
import type { ConventionCode } from '@/lib/mapaie/types'
import crypto from 'crypto'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_TOTAL_SIZE = 30 * 1024 * 1024
const MAX_VISION_IMAGES = 20
const OCR_CONFIDENCE_THRESHOLD = 55
const ACCEPTED_TYPES = new Set([
  'application/pdf', 'image/jpeg', 'image/jpg',
  'image/png', 'image/webp',
])

const VALID_CONVENTION_CODES: ConventionCode[] = [
  'IDCC_2216', 'IDCC_1979', 'IDCC_1596', 'IDCC_3248', 'IDCC_0573', 'AUTRE',
]

export interface MapaieExtractAPIResponse {
  success: true
  bulletins: MapaieExtractedBulletin[]
  fileCount: number
  mode: 'ocr_local' | 'vision_fallback'
  ocrConfidence?: number
}

export interface MapaieExtractAPIError {
  success: false
  error: string
  needsVisionConsent?: boolean
  ocrConfidence?: number
}

export interface MapaieExtractedBulletin {
  fileName: string
  bulletin: Partial<Bulletin>
  confidence: number
  warnings: string[]
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const visionConsent = formData.get('visionConsent') === 'true'
    const forceVision = formData.get('forceVision') === 'true'

    // --- Récupérer les fichiers ---
    const files: Array<{ name: string; buffer: Buffer; type: string }> = []
    let totalSize = 0

    for (const [key, value] of formData.entries()) {
      if (key === 'files' && value instanceof File) {
        const file = value as File
        if (!ACCEPTED_TYPES.has(file.type)) {
          return error(400, `Format non supporté : ${file.type}. Formats acceptés : PDF, JPG, PNG, WEBP`)
        }
        if (file.size > MAX_FILE_SIZE) {
          return error(400, `Le fichier "${file.name}" dépasse 10 Mo`)
        }
        totalSize += file.size
        if (totalSize > MAX_TOTAL_SIZE) {
          return error(400, 'La taille totale des fichiers dépasse 30 Mo')
        }
        const arrayBuffer = await file.arrayBuffer()
        files.push({ name: file.name, buffer: Buffer.from(arrayBuffer), type: file.type })
      }
    }

    if (files.length === 0) {
      return error(400, 'Aucun fichier reçu')
    }

    track({ event: 'mapaie_upload_completed', brique: 'mapaie', file_count: files.length })

    // ─── MODE 1 : OCR LOCAL ───
    if (!forceVision) {
      console.log(`[mapaie-extract] Mode OCR — ${files.length} fichier(s)`)

      const ocrResults: Array<{ fileName: string; ocrText: string; pageCount: number; confidence: number; rawHash: string }> = []

      for (const file of files) {
        const ocr = await extractTextFromDocument(file.buffer, file.type, file.name)
        const rawHash = crypto.createHash('sha256').update(ocr.text).digest('hex')
        ocrResults.push({ fileName: file.name, ocrText: ocr.text, pageCount: ocr.pageCount, confidence: ocr.confidence, rawHash })
      }

      const totalChars = ocrResults.reduce((sum, r) => sum + r.ocrText.replace(/\s/g, '').length, 0)
      const avgConfidence = totalChars > 0
        ? ocrResults.reduce((sum, r) => sum + r.confidence * r.ocrText.replace(/\s/g, '').length, 0) / totalChars
        : 0

      console.log(`[mapaie-extract] OCR confiance : ${Math.round(avgConfidence)}%`)

      if (avgConfidence < OCR_CONFIDENCE_THRESHOLD) {
        return NextResponse.json({
          success: false,
          error: 'La qualité du document ne permet pas une lecture automatique fiable.',
          needsVisionConsent: true,
          ocrConfidence: Math.round(avgConfidence),
        } satisfies MapaieExtractAPIError, { status: 422 })
      }

      // Anonymiser et envoyer à Claude
      const bulletins: MapaieExtractedBulletin[] = []

      for (const doc of ocrResults) {
        const { anonymizedText, detectedCount } = anonymizeText(doc.ocrText)
        if (detectedCount > 0) {
          console.log(`[mapaie-extract] ${doc.fileName}: ${detectedCount} PII anonymisée(s)`)
        }

        const userMessage = buildOCRExtractionMessage(doc.fileName, anonymizedText)
        const claudeResponse = await callClaude({
          system: EXTRACTION_PROMPT,
          userMessage,
          maxTokens: 4096,
          temperature: 0.1,
        })

        const { bulletin, warnings } = parseBulletinResponse(claudeResponse, doc.fileName, doc.pageCount, doc.rawHash)
        bulletins.push({ fileName: doc.fileName, bulletin, confidence: doc.confidence, warnings })
      }

      track({ event: 'mapaie_upload_completed', brique: 'mapaie', mode: 'ocr_local', bulletin_count: bulletins.length })
      return NextResponse.json({
        success: true,
        bulletins,
        fileCount: files.length,
        mode: 'ocr_local',
        ocrConfidence: Math.round(avgConfidence),
      } satisfies MapaieExtractAPIResponse)
    }

    // ─── MODE 2 : CLAUDE VISION ───
    if (!visionConsent) {
      return error(403, "Le consentement est requis pour l'analyse par IA avancée.")
    }

    console.log(`[mapaie-extract] Mode Vision — ${files.length} fichier(s)`)

    const bulletins: MapaieExtractedBulletin[] = []

    for (const file of files) {
      const allImages: Array<{ base64: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' }> = []

      if (file.type === 'application/pdf') {
        const pdfImages = await pdfToBase64Images(file.buffer)
        allImages.push(...pdfImages)
      } else {
        const img = await imageToBase64ForVision(file.buffer, file.type)
        allImages.push(img)
      }

      const imagesToSend = allImages.slice(0, MAX_VISION_IMAGES)
      const textPrompt = buildVisionExtractionMessage(file.name)
      const claudeResponse = await callClaudeVision({
        system: EXTRACTION_PROMPT,
        images: imagesToSend,
        textPrompt,
        maxTokens: 4096,
        temperature: 0.1,
      })

      const rawHash = crypto.createHash('sha256').update(textPrompt).digest('hex')
      const { bulletin, warnings } = parseBulletinResponse(claudeResponse, file.name, imagesToSend.length, rawHash)
      bulletins.push({ fileName: file.name, bulletin, confidence: 85, warnings })
    }

    track({ event: 'mapaie_upload_completed', brique: 'mapaie', mode: 'vision_fallback', bulletin_count: bulletins.length })
    return NextResponse.json({
      success: true,
      bulletins,
      fileCount: files.length,
      mode: 'vision_fallback',
    } satisfies MapaieExtractAPIResponse)

  } catch (err) {
    console.error('[mapaie-extract] Erreur:', err)
    return error(500, `Erreur lors de l'extraction : ${err instanceof Error ? err.message : 'Erreur interne'}`)
  }
}

// ============================================================
// HELPERS
// ============================================================

function buildOCRExtractionMessage(fileName: string, text: string): string {
  return `Bulletin de paie : ${fileName}\n\n${text}`
}

function buildVisionExtractionMessage(fileName: string): string {
  return `Analyse ce bulletin de paie : ${fileName}. Extrait toutes les données structurées selon le format demandé.`
}

function parseBulletinResponse(
  raw: string,
  fileName: string,
  pageCount: number,
  rawTextHash: string,
): { bulletin: Partial<Bulletin>; warnings: string[] } {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
  cleaned = cleaned.trim()

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('[mapaie-extract] JSON parse error:', cleaned.substring(0, 300))
    return {
      bulletin: emptyBulletin(pageCount, rawTextHash),
      warnings: [`Impossible d'analyser le bulletin "${fileName}" — remplissez le formulaire manuellement`],
    }
  }

  const warnings: string[] = []
  const rawOcrConfidence = typeof parsed.ocrConfidence === 'number' ? parsed.ocrConfidence : 0.7
  const clampedConfidence = Math.max(0, Math.min(1, rawOcrConfidence))

  // Période
  const rawPeriode = (parsed.periode ?? {}) as Record<string, unknown>
  const periode: BulletinPeriod = {
    mois: Number(rawPeriode.mois) || 0,
    annee: Number(rawPeriode.annee) || 0,
    dateDebut: typeof rawPeriode.dateDebut === 'string' ? rawPeriode.dateDebut : '',
    dateFin: typeof rawPeriode.dateFin === 'string' ? rawPeriode.dateFin : '',
  }
  if (!periode.mois || !periode.annee) warnings.push('Période non lisible')

  // Salarié — PII remplacées par des placeholders
  const rawSalarie = (parsed.salarie ?? {}) as Record<string, unknown>
  const salarie: BulletinEmployee = {
    nom: pii('[NOM]'),
    prenom: pii('[PRENOM]'),
    matricule: pii(typeof rawSalarie.matricule === 'string' ? rawSalarie.matricule : ''),
    numeroSecu: pii(null),
    dateEntree: typeof rawSalarie.dateEntree === 'string' ? rawSalarie.dateEntree : '',
    dateNaissance: pii(null),
    qualification: typeof rawSalarie.qualification === 'string' ? rawSalarie.qualification : null,
    coefficient: typeof rawSalarie.coefficient === 'number' ? rawSalarie.coefficient : null,
    classification: typeof rawSalarie.classification === 'string' ? rawSalarie.classification : null,
  }

  // Employeur
  const rawEmployeur = (parsed.employeur ?? {}) as Record<string, unknown>
  const rawConvention = typeof rawEmployeur.conventionCollective === 'string'
    ? rawEmployeur.conventionCollective
    : 'AUTRE'
  const conventionCode: ConventionCode = VALID_CONVENTION_CODES.includes(rawConvention as ConventionCode)
    ? (rawConvention as ConventionCode)
    : 'AUTRE'
  const employeur: BulletinEmployer = {
    raisonSociale: typeof rawEmployeur.raisonSociale === 'string' ? rawEmployeur.raisonSociale : '',
    siret: pii(''),
    codeNAF: typeof rawEmployeur.codeNAF === 'string' ? rawEmployeur.codeNAF : '',
    adresse: '',
    conventionCollective: conventionCode,
    idcc: typeof rawEmployeur.idcc === 'string' ? rawEmployeur.idcc : '',
  }

  // Heures
  const rawHeures = (parsed.heures ?? {}) as Record<string, unknown>
  const heures: BulletinHeures = {
    heuresNormales: Number(rawHeures.heuresNormales) || 151.67,
    heuresSup25: Number(rawHeures.heuresSup25) || 0,
    heuresSup50: Number(rawHeures.heuresSup50) || 0,
    heuresNuit: Number(rawHeures.heuresNuit) || 0,
    heuresDimanche: Number(rawHeures.heuresDimanche) || 0,
    heuresFeriees: Number(rawHeures.heuresFeriees) || 0,
    totalHeures: Number(rawHeures.totalHeures) || Number(rawHeures.heuresNormales) || 151.67,
  }

  // Rémunération
  const rawRem = (parsed.remuneration ?? {}) as Record<string, unknown>
  const remuneration: BulletinRemuneration = {
    salaireBase: Number(rawRem.salaireBase) || 0,
    brutAvantCotisations: Number(rawRem.brutAvantCotisations) || 0,
    totalCotisationsSalariales: Number(rawRem.totalCotisationsSalariales) || 0,
    totalCotisationsPatronales: 0,
    netImposable: Number(rawRem.netImposable) || 0,
    netAPayer: Number(rawRem.netAPayer) || 0,
    prelevement: typeof rawRem.prelevement === 'number' ? rawRem.prelevement : null,
    netVerse: Number(rawRem.netAPayer) || 0,
  }
  if (!remuneration.salaireBase) warnings.push('Salaire de base non détecté')

  // Congés
  const rawConges = (parsed.conges ?? {}) as Record<string, unknown>
  const conges: BulletinConges = {
    acquisMois: Number(rawConges.acquisMois) || 0,
    prisMois: Number(rawConges.prisMois) || 0,
    soldeConges: Number(rawConges.soldeConges) || 0,
    compteurRTT: typeof rawConges.compteurRTT === 'number' ? rawConges.compteurRTT : null,
    compteurReposCompensateur: null,
  }

  // Cumuls
  const rawCumuls = (parsed.cumuls ?? {}) as Record<string, unknown>
  const cumuls: BulletinCumuls = {
    brutCumule: Number(rawCumuls.brutCumule) || 0,
    netImposableCumule: Number(rawCumuls.netImposableCumule) || 0,
    heuresSupCumulees: Number(rawCumuls.heuresSupCumulees) || 0,
    congesAcquisCumules: 0,
    congesPrisCumules: 0,
  }

  const rawTempsTravail = parsed.tempsTravail
  const tempsTravail: Bulletin['tempsTravail'] =
    rawTempsTravail === 'TEMPS_PARTIEL' ? 'TEMPS_PARTIEL' : 'TEMPS_PLEIN'

  const bulletin: Partial<Bulletin> = {
    id: crypto.randomUUID(),
    periode,
    salarie,
    employeur,
    heures,
    conges,
    lignes: [],
    remuneration,
    cumuls,
    ancienneteAnnees: Number(rawSalarie.ancienneteAnnees) || 0,
    tempsTravail,
    tauxActivite: typeof parsed.tauxActivite === 'number'
      ? percentage(Math.max(0, Math.min(1, parsed.tauxActivite)))
      : null,
    metadata: {
      sourceDocumentId: fileName,
      ocrConfidence: percentage(clampedConfidence),
      extractedAt: new Date().toISOString(),
      verifiedAt: null,
      pageCount,
      rawTextHash,
    },
  }

  return { bulletin, warnings }
}

function emptyBulletin(pageCount: number, rawTextHash: string): Partial<Bulletin> {
  return {
    id: crypto.randomUUID(),
    lignes: [] as BulletinLine[],
    metadata: {
      sourceDocumentId: '',
      ocrConfidence: percentage(0),
      extractedAt: new Date().toISOString(),
      verifiedAt: null,
      pageCount,
      rawTextHash,
    },
  }
}

function error(status: number, message: string) {
  return NextResponse.json({ success: false, error: message } satisfies MapaieExtractAPIError, { status })
}
