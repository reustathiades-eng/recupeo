// ============================================================
// RETRAITIA V2 — Pipeline d'extraction
// ============================================================
// Suit le pattern MONIMPOT éprouvé :
// 1. extractTextFromDocument (ocr.ts) → pdftotext / Tesseract
// 2. Regex parsers spécifiques retraite (normalisation + validation)
// 3. Claude API texte (fallback)
// 4. Claude Vision (dernier recours)
//
// Zéro dépendance externe supplémentaire.
// ============================================================

import { extractTextFromDocument, type OCRResult } from '@/lib/ocr'
import type { DocumentType, ExtractionMethod, ExtractionConfidence } from '../types'
import { parseRIS } from './parsers/ris'
import { parseNotificationCNAV } from './parsers/notification-cnav'
import { parseAgircArrco } from './parsers/agirc-arrco'
import { parseAvisImposition } from './parsers/avis-imposition'
import { EXTRACTION_PROMPTS } from './prompts'
import { AnonymizationSession } from './anonymizer'
import { callClaude, callClaudeVision } from '@/lib/anthropic'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ExtractionResult {
  success: boolean
  data: Record<string, unknown> | null
  method: ExtractionMethod
  confidence: ExtractionConfidence
  score: number               // 0-100
  ocrConfidence?: number      // score OCR (0-100)
  error?: string
  costEstimate: number        // $ estimé pour cet appel
}

// Seuils — pattern MONIMPOT
const OCR_USABLE_THRESHOLD = 50        // OCR confidence minimum pour tenter regex
const REGEX_SUFFICIENT_THRESHOLD = 70   // regex score minimum pour éviter Claude
const OCR_VISION_THRESHOLD = 30         // en dessous → Vision directement

// ─────────────────────────────────────────────
// Pipeline principal
// ─────────────────────────────────────────────

export async function extractDocument(
  buffer: Buffer,
  fileName: string,
  documentType: DocumentType,
): Promise<ExtractionResult> {

  // ── Étape 1 : Extraction texte via le module OCR existant ──
  // pdftotext (natif, rapide, 95% confidence) → fallback Tesseract
  const mimeType = guessMimeType(fileName)
  let ocrResult: OCRResult

  try {
    ocrResult = await extractTextFromDocument(buffer, mimeType, fileName)
  } catch (err) {
    console.error(`[extraction] OCR failed for ${fileName}:`, err)
    // OCR totalement échoué → Vision directement
    return await extractWithVision(buffer, documentType, fileName)
  }

  // ── Étape 2 : Décision selon la qualité OCR ──

  // Cas 1 : OCR quasi-inutile → Vision directement
  if (ocrResult.confidence < OCR_VISION_THRESHOLD || !ocrResult.isUsable) {
    console.log(`[extraction] OCR trop faible (${ocrResult.confidence}%) → Vision`)
    return await extractWithVision(buffer, documentType, fileName)
  }

  // Cas 2 : OCR exploitable → Regex d'abord
  if (ocrResult.confidence >= OCR_USABLE_THRESHOLD && ocrResult.text.length > 100) {
    const regexResult = runRegexParser(ocrResult.text, documentType)

    if (regexResult && regexResult.score >= REGEX_SUFFICIENT_THRESHOLD) {
      // Regex suffisant → terminé, 0$ API
      console.log(`[extraction] Regex OK (${regexResult.score}%) pour ${documentType}`)
      return {
        success: true,
        data: regexResult.data,
        method: 'regex',
        confidence: regexResult.score >= 90 ? 'high' : 'medium',
        score: regexResult.score,
        ocrConfidence: ocrResult.confidence,
        costEstimate: 0,
      }
    }

    // Regex insuffisant mais texte lisible → Claude API texte
    console.log(`[extraction] Regex faible (${regexResult?.score ?? 0}%) → Claude texte`)
    return await extractWithClaudeText(ocrResult.text, documentType, ocrResult.confidence)
  }

  // Cas 3 : OCR moyen (entre 30 et 50) → tenter Claude texte quand même
  if (ocrResult.text.length > 50) {
    return await extractWithClaudeText(ocrResult.text, documentType, ocrResult.confidence)
  }

  // Fallback ultime
  return await extractWithVision(buffer, documentType, fileName)
}

// ─────────────────────────────────────────────
// Regex parsers (spécialisés par type de document)
// ─────────────────────────────────────────────

function runRegexParser(
  text: string,
  docType: DocumentType,
): { data: Record<string, unknown>; score: number } | null {
  try {
    switch (docType) {
      case 'ris': {
        const r = parseRIS(text)
        return { data: r.data as Record<string, unknown>, score: r.score }
      }
      case 'notification_cnav': {
        const r = parseNotificationCNAV(text)
        return { data: r.data as Record<string, unknown>, score: r.score }
      }
      case 'releve_agirc_arrco': {
        const r = parseAgircArrco(text)
        return { data: r.data as Record<string, unknown>, score: r.score }
      }
      case 'avis_imposition': {
        const r = parseAvisImposition(text)
        return { data: r.data as Record<string, unknown>, score: r.score }
      }
      default:
        return null
    }
  } catch (err) {
    console.error(`[extraction] Regex parser error for ${docType}:`, err)
    return null
  }
}

// ─────────────────────────────────────────────
// Claude API texte (fallback regex)
// ─────────────────────────────────────────────

async function extractWithClaudeText(
  rawText: string,
  docType: DocumentType,
  ocrConfidence: number,
): Promise<ExtractionResult> {
  const prompt = EXTRACTION_PROMPTS[docType]
  if (!prompt) {
    return {
      success: false, data: null, method: 'claude_text',
      confidence: 'low', score: 0, ocrConfidence,
      error: `Pas de prompt pour ${docType}`, costEstimate: 0,
    }
  }

  const anonymizer = new AnonymizationSession()
  const safeText = anonymizer.anonymize(rawText)

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const systemExtra = attempt > 0
        ? '\nATTENTION : ta derniere reponse etait invalide. JSON strict uniquement, aucun texte autour, pas de backticks.'
        : ''

      const response = await callClaude({
        system: prompt.system + systemExtra,
        userMessage: prompt.buildUserMessage(safeText),
        maxTokens: 4096,
        temperature: 0,
      })

      const data = parseClaudeJSON(response)
      const deanonymized = anonymizer.deanonymize(data)

      return {
        success: true,
        data: deanonymized,
        method: 'claude_text',
        confidence: attempt === 0 ? 'medium' : 'low',
        score: attempt === 0 ? 80 : 60,
        ocrConfidence,
        costEstimate: 0.005 * (attempt + 1),
      }
    } catch (err) {
      if (attempt === 0) {
        console.warn(`[extraction] Claude texte attempt 1 failed for ${docType}, retrying...`)
        continue
      }
      console.error(`[extraction] Claude texte failed after retry for ${docType}:`, err)
    }
  }

  return {
    success: false, data: null, method: 'claude_text',
    confidence: 'low', score: 0, ocrConfidence,
    error: 'Extraction Claude texte echouee apres 2 tentatives',
    costEstimate: 0.01,
  }
}

// ─────────────────────────────────────────────
// Claude Vision (dernier recours)
// ─────────────────────────────────────────────

async function extractWithVision(
  buffer: Buffer,
  docType: DocumentType,
  fileName: string,
): Promise<ExtractionResult> {
  const prompt = EXTRACTION_PROMPTS[docType]
  if (!prompt) {
    return {
      success: false, data: null, method: 'claude_vision',
      confidence: 'low', score: 0,
      error: `Pas de prompt pour ${docType}`, costEstimate: 0,
    }
  }

  const anonymizer = new AnonymizationSession()

  try {
    // callClaudeVision n'accepte que image/jpeg, image/png, image/webp
    // Pour les PDF, on envoie comme image (les PDF d'une page fonctionnent)
    // Pour les PDF multi-pages, on passe par OCR+texte en amont
    const ext = fileName.toLowerCase().split('.').pop()
    let mediaType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
    if (ext === 'png') mediaType = 'image/png'
    else if (ext === 'webp') mediaType = 'image/webp'

    // Pour les PDF, on ne peut pas envoyer directement en Vision.
    // On tente Claude texte avec le peu de texte OCR disponible, ou on échoue proprement.
    if (ext === 'pdf') {
      return {
        success: false, data: null, method: 'claude_vision',
        confidence: 'low', score: 0,
        error: 'PDF non lisible — veuillez uploader un PDF numerique ou une photo du document',
        costEstimate: 0,
      }
    }

    const base64 = buffer.toString('base64')

    const response = await callClaudeVision({
      system: prompt.system,
      images: [{ base64, mediaType }],
      textPrompt: prompt.buildUserMessage('(voir le document ci-joint)'),
      maxTokens: 4096,
      temperature: 0,
    })

    const data = parseClaudeJSON(response)

    return {
      success: true,
      data: anonymizer.deanonymize(data),
      method: 'claude_vision',
      confidence: 'medium',
      score: 70,
      costEstimate: 0.03,
    }
  } catch (err) {
    console.error(`[extraction] Claude Vision failed for ${docType}:`, err)
    return {
      success: false, data: null, method: 'claude_vision',
      confidence: 'low', score: 0,
      error: 'Extraction Vision echouee',
      costEstimate: 0.03,
    }
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function guessMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop()
  switch (ext) {
    case 'pdf': return 'application/pdf'
    case 'png': return 'image/png'
    case 'jpg': case 'jpeg': return 'image/jpeg'
    case 'webp': return 'image/webp'
    default: return 'application/pdf'
  }
}

function parseClaudeJSON(response: string): Record<string, unknown> {
  let jsonStr = response.trim()
  // Strip markdown code fences
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  // Strip any leading/trailing non-JSON text
  const firstBrace = jsonStr.indexOf('{')
  const lastBrace = jsonStr.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1)
  }
  return JSON.parse(jsonStr)
}
