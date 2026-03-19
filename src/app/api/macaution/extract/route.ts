// ============================================================
// POST /api/macaution/extract
// Extraction documentaire hybride — OCR local ou Vision (fallback)
// ============================================================
// Flow de données :
//   1. Recevoir les fichiers en multipart/form-data
//   2. Pour chaque fichier : PDF → images → OCR Tesseract (local)
//   3. Évaluer la qualité OCR (score de confiance)
//   4a. Si OCR fiable (≥70%) :
//       → Détecter PII → Anonymiser → Envoyer texte à Claude → JSON
//   4b. Si OCR non fiable (<70%) :
//       → Retourner needsVisionConsent: true au frontend
//   5. (Retry avec consentement) : Envoyer images à Claude Vision
//       → Claude anonymise lui-même dans sa réponse → JSON
//   6. Retourner le JSON structuré au frontend
//
// RGPD :
//   - Mode OCR : aucune donnée personnelle ne quitte le serveur
//   - Mode Vision : uniquement avec consentement explicite de l'utilisateur
//   - Fichiers traités en mémoire, supprimés immédiatement
//   - Données extraites anonymisées avant retour au frontend
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { callClaude, callClaudeVision } from '@/lib/anthropic'
import { extractTextFromDocument, pdfToBase64Images, imageToBase64ForVision } from '@/lib/ocr'
import { anonymizeText } from '@/lib/pii-detector'
import {
  extractSystemPrompt,
  extractVisionSystemPrompt,
  buildOCRExtractionMessage,
  buildVisionExtractionMessage,
} from '@/lib/macaution/extract-prompt'
import type {
  ExtractionResult,
  ExtractAPIResponse,
  ExtractAPIError,
  ExtractionMode,
} from '@/lib/macaution/extract-types'

/** Taille max par fichier : 10 Mo */
const MAX_FILE_SIZE = 10 * 1024 * 1024
/** Taille max totale : 50 Mo */
const MAX_TOTAL_SIZE = 50 * 1024 * 1024
/** Max images pour Claude Vision (limites de tokens) */
const MAX_VISION_IMAGES = 20
/** Seuil de confiance OCR pour éviter le fallback Vision */
const OCR_CONFIDENCE_THRESHOLD = 70
/** Formats acceptés */
const ACCEPTED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
])

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // --- Paramètre : consentement Vision ---
    const visionConsent = formData.get('visionConsent') === 'true'
    const forceVision = formData.get('forceVision') === 'true'

    // --- Récupérer les fichiers ---
    const files: Array<{ name: string; buffer: Buffer; type: string }> = []
    let totalSize = 0

    for (const [key, value] of formData.entries()) {
      if (key === 'files' && value instanceof File) {
        const file = value as File

        // Valider le type
        if (!ACCEPTED_TYPES.has(file.type)) {
          return error(400, `Format non supporté : ${file.type}. Formats acceptés : PDF, JPG, PNG, WEBP, HEIC`)
        }

        // Valider la taille
        if (file.size > MAX_FILE_SIZE) {
          return error(400, `Le fichier "${file.name}" dépasse 10 Mo`)
        }

        totalSize += file.size
        if (totalSize > MAX_TOTAL_SIZE) {
          return error(400, 'La taille totale des fichiers dépasse 50 Mo')
        }

        const arrayBuffer = await file.arrayBuffer()
        files.push({
          name: file.name,
          buffer: Buffer.from(arrayBuffer),
          type: file.type,
        })
      }
    }

    if (files.length === 0) {
      return error(400, 'Aucun fichier reçu')
    }

    // ============================================================
    // MODE 1 : OCR LOCAL (par défaut, RGPD-safe)
    // ============================================================
    if (!forceVision) {
      console.log(`[extract] Mode OCR local — ${files.length} fichier(s)`)

      const ocrResults: Array<{
        fileName: string
        ocrText: string
        pageCount: number
        confidence: number
      }> = []

      for (const file of files) {
        const ocr = await extractTextFromDocument(file.buffer, file.type, file.name)
        ocrResults.push({
          fileName: file.name,
          ocrText: ocr.text,
          pageCount: ocr.pageCount,
          confidence: ocr.confidence,
        })
      }

      // Score global de confiance OCR
      const totalChars = ocrResults.reduce((sum, r) => sum + r.ocrText.replace(/\s/g, '').length, 0)
      const avgConfidence = totalChars > 0
        ? ocrResults.reduce((sum, r) => sum + r.confidence * r.ocrText.replace(/\s/g, '').length, 0) / totalChars
        : 0

      console.log(`[extract] OCR confiance moyenne : ${Math.round(avgConfidence)}%`)

      // Si OCR pas fiable → demander consentement Vision
      if (avgConfidence < OCR_CONFIDENCE_THRESHOLD) {
        console.log(`[extract] OCR insuffisant (${Math.round(avgConfidence)}%) — demande consentement Vision`)
        return NextResponse.json({
          success: false,
          error: 'La qualité des documents ne permet pas une lecture automatique fiable.',
          needsVisionConsent: true,
          ocrConfidence: Math.round(avgConfidence),
        } satisfies ExtractAPIError, { status: 422 })
      }

      // OCR fiable → anonymiser et envoyer à Claude (texte)
      const anonymizedDocs = ocrResults.map(doc => {
        const { anonymizedText, detectedCount } = anonymizeText(doc.ocrText)
        console.log(`[extract] ${doc.fileName}: ${detectedCount} PII anonymisée(s)`)
        return {
          fileName: doc.fileName,
          ocrText: anonymizedText,
          pageCount: doc.pageCount,
        }
      })

      const userMessage = buildOCRExtractionMessage(anonymizedDocs)
      const claudeResponse = await callClaude({
        system: extractSystemPrompt,
        userMessage,
        maxTokens: 8192,
        temperature: 0.1,
      })

      const extraction = parseExtractionResponse(claudeResponse, 'ocr_local', Math.round(avgConfidence))

      return NextResponse.json({
        success: true,
        extraction,
      } satisfies ExtractAPIResponse)
    }

    // ============================================================
    // MODE 2 : CLAUDE VISION (fallback avec consentement)
    // ============================================================
    if (!visionConsent) {
      return error(403, 'Le consentement est requis pour l\'analyse par IA avancée.')
    }

    console.log(`[extract] Mode Vision (consentement donné) — ${files.length} fichier(s)`)

    // Convertir tous les fichiers en images base64
    const allImages: Array<{ base64: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' }> = []
    const fileNames: string[] = []

    for (const file of files) {
      fileNames.push(file.name)

      if (file.type === 'application/pdf') {
        const pdfImages = await pdfToBase64Images(file.buffer)
        allImages.push(...pdfImages)
      } else {
        const img = await imageToBase64ForVision(file.buffer, file.type)
        allImages.push(img)
      }
    }

    // Limiter le nombre d'images
    const imagesToSend = allImages.slice(0, MAX_VISION_IMAGES)
    if (allImages.length > MAX_VISION_IMAGES) {
      console.warn(`[extract] ${allImages.length} images, limité à ${MAX_VISION_IMAGES}`)
    }

    const textPrompt = buildVisionExtractionMessage(fileNames)
    const claudeResponse = await callClaudeVision({
      system: extractVisionSystemPrompt,
      images: imagesToSend,
      textPrompt,
      maxTokens: 8192,
      temperature: 0.1,
    })

    const extraction = parseExtractionResponse(claudeResponse, 'vision_fallback')

    return NextResponse.json({
      success: true,
      extraction,
    } satisfies ExtractAPIResponse)

  } catch (err) {
    console.error('[extract] Erreur:', err)
    const message = err instanceof Error ? err.message : 'Erreur interne'
    return error(500, `Erreur lors de l'extraction : ${message}`)
  }
}

// ============================================================
// HELPERS
// ============================================================

/** Parse la réponse JSON de Claude */
function parseExtractionResponse(
  raw: string,
  mode: ExtractionMode,
  ocrConfidence?: number
): ExtractionResult {
  // Nettoyer d'éventuels backticks markdown
  let cleaned = raw.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  cleaned = cleaned.trim()

  let parsed: Record<string, unknown>

  try {
    parsed = JSON.parse(cleaned)
  } catch (e) {
    console.error('[extract] Erreur parsing JSON Claude:', cleaned.substring(0, 200))
    // Retourner une extraction vide plutôt que crasher
    return emptyExtraction(mode, ocrConfidence)
  }

  // Construire le résultat typé (avec fallbacks si des champs manquent)
  const result: ExtractionResult = {
    mode,
    documents: Array.isArray(parsed.documents) ? parsed.documents.map((d: Record<string, unknown>) => ({
      type: validateDocType(d.type as string),
      confidence: validateConfidence(d.confidence as string),
      pageCount: typeof d.pageCount === 'number' ? d.pageCount : 1,
      summary: typeof d.summary === 'string' ? d.summary : '',
      fileName: typeof d.fileName === 'string' ? d.fileName : '',
    })) : [],
    extracted: parseExtractedFields(parsed.extracted as Record<string, unknown> || {}),
    edlComparison: Array.isArray(parsed.edlComparison)
      ? parsed.edlComparison.map((c: Record<string, unknown>) => ({
          room: String(c.room || ''),
          entryState: String(c.entryState || ''),
          exitState: String(c.exitState || ''),
          degradation: Boolean(c.degradation),
          vetusteApplicable: Boolean(c.vetusteApplicable),
          comment: String(c.comment || ''),
        }))
      : null,
    missingDocuments: Array.isArray(parsed.missingDocuments)
      ? parsed.missingDocuments.map(String)
      : [],
    warnings: Array.isArray(parsed.warnings)
      ? parsed.warnings.map(String)
      : [],
    ocrConfidence,
  }

  return result
}

/** Parse les champs extracted avec fallbacks */
function parseExtractedFields(raw: Record<string, unknown>) {
  const field = <T>(name: string): { value: T | null; confidence: 'high' | 'medium' | 'low'; source: string } => {
    const f = raw[name] as Record<string, unknown> | undefined
    if (!f) return { value: null, confidence: 'low', source: '' }
    return {
      value: (f.value !== undefined && f.value !== null && f.value !== 'null') ? f.value as T : null,
      confidence: validateConfidence(f.confidence as string),
      source: typeof f.source === 'string' ? f.source : '',
    }
  }

  return {
    locationType: field<'vide' | 'meuble'>('locationType'),
    rentAmount: field<number>('rentAmount'),
    depositAmount: field<number>('depositAmount'),
    entryDate: field<string>('entryDate'),
    exitDate: field<string>('exitDate'),
    depositReturned: field<'total' | 'partial' | 'none'>('depositReturned'),
    returnedAmount: field<number>('returnedAmount'),
    returnDate: field<string>('returnDate'),
    deductions: field<string[]>('deductions'),
    deductionAmount: field<number>('deductionAmount'),
    hasInvoices: field<'yes' | 'no' | 'partial'>('hasInvoices'),
    entryDamages: field<'yes' | 'no' | 'no_edl'>('entryDamages'),
  }
}

/** Valide un type de document */
function validateDocType(t: string): 'bail' | 'edl_entree' | 'edl_sortie' | 'courrier_bailleur' | 'facture' | 'photo' | 'autre' {
  const valid = ['bail', 'edl_entree', 'edl_sortie', 'courrier_bailleur', 'facture', 'photo', 'autre']
  return valid.includes(t) ? t as ReturnType<typeof validateDocType> : 'autre'
}

/** Valide un niveau de confiance */
function validateConfidence(c: string): 'high' | 'medium' | 'low' {
  const valid = ['high', 'medium', 'low']
  return valid.includes(c) ? c as 'high' | 'medium' | 'low' : 'low'
}

/** Extraction vide (fallback en cas d'erreur) */
function emptyExtraction(mode: ExtractionMode, ocrConfidence?: number): ExtractionResult {
  const emptyField = <T>(): { value: T | null; confidence: 'low'; source: string } => ({
    value: null, confidence: 'low', source: '',
  })

  return {
    mode,
    documents: [],
    extracted: {
      locationType: emptyField(),
      rentAmount: emptyField(),
      depositAmount: emptyField(),
      entryDate: emptyField(),
      exitDate: emptyField(),
      depositReturned: emptyField(),
      returnedAmount: emptyField(),
      returnDate: emptyField(),
      deductions: emptyField(),
      deductionAmount: emptyField(),
      hasInvoices: emptyField(),
      entryDamages: emptyField(),
    },
    edlComparison: null,
    missingDocuments: ['Impossible d\'analyser les documents fournis'],
    warnings: ['L\'extraction a échoué — veuillez réessayer ou utiliser le formulaire manuel'],
    ocrConfidence,
  }
}

/** Helper réponse erreur */
function error(status: number, message: string) {
  return NextResponse.json(
    { success: false, error: message } satisfies ExtractAPIError,
    { status }
  )
}
