// ============================================================
// POST /api/mabanque/extract
// Extraction de relevé bancaire — OCR local ou Vision
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
} from '@/lib/mabanque/extract-prompt'
import type {
  MabanqueExtractionResult,
  MabanqueExtractAPIResponse,
  MabanqueExtractAPIError,
  ExtractionMode,
  ExtractedFee,
  ExtractedFeeCategory,
} from '@/lib/mabanque/extract-types'
import { track } from '@/lib/analytics'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_TOTAL_SIZE = 30 * 1024 * 1024
const MAX_VISION_IMAGES = 20
const OCR_CONFIDENCE_THRESHOLD = 60
const ACCEPTED_TYPES = new Set([
  'application/pdf', 'image/jpeg', 'image/jpg',
  'image/png', 'image/webp', 'image/heic',
])

const FEE_CATEGORIES: ExtractedFeeCategory[] = [
  'commission_intervention', 'rejet_prelevement', 'rejet_cheque',
  'agios', 'lettre_information', 'frais_tenue_compte',
  'virement_instantane', 'frais_autre',
]

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

    track({ event: 'upload_completed', brique: 'mabanque', file_count: files.length })

    // ─── MODE 1 : OCR LOCAL ───
    if (!forceVision) {
      console.log(`[mabanque-extract] Mode OCR — ${files.length} fichier(s)`)

      const ocrResults: Array<{ fileName: string; ocrText: string; pageCount: number; confidence: number }> = []

      for (const file of files) {
        const ocr = await extractTextFromDocument(file.buffer, file.type, file.name)
        ocrResults.push({ fileName: file.name, ocrText: ocr.text, pageCount: ocr.pageCount, confidence: ocr.confidence })
      }

      const totalChars = ocrResults.reduce((sum, r) => sum + r.ocrText.replace(/\s/g, '').length, 0)
      const avgConfidence = totalChars > 0
        ? ocrResults.reduce((sum, r) => sum + r.confidence * r.ocrText.replace(/\s/g, '').length, 0) / totalChars
        : 0

      console.log(`[mabanque-extract] OCR confiance : ${Math.round(avgConfidence)}%`)

      if (avgConfidence < OCR_CONFIDENCE_THRESHOLD) {
        return NextResponse.json({
          success: false,
          error: 'La qualité du document ne permet pas une lecture automatique fiable.',
          needsVisionConsent: true,
          ocrConfidence: Math.round(avgConfidence),
        } satisfies MabanqueExtractAPIError, { status: 422 })
      }

      // Anonymiser et envoyer à Claude
      const anonymizedDocs = ocrResults.map(doc => {
        const { anonymizedText, detectedCount } = anonymizeText(doc.ocrText)
        if (detectedCount > 0) console.log(`[mabanque-extract] ${doc.fileName}: ${detectedCount} PII anonymisée(s)`)
        return { fileName: doc.fileName, ocrText: anonymizedText, pageCount: doc.pageCount }
      })

      const totalPages = ocrResults.reduce((sum, r) => sum + r.pageCount, 0)
      const userMessage = buildOCRExtractionMessage(anonymizedDocs)
      const claudeResponse = await callClaude({
        system: extractSystemPrompt,
        userMessage,
        maxTokens: 8192,
        temperature: 0.1,
      })

      const extraction = parseExtractionResponse(claudeResponse, 'ocr_local', totalPages, Math.round(avgConfidence))
      track({ event: 'extraction_success', brique: 'mabanque', mode: 'ocr_local', fees_count: extraction.fees.length })
      return NextResponse.json({ success: true, extraction } satisfies MabanqueExtractAPIResponse)
    }

    // ─── MODE 2 : CLAUDE VISION ───
    if (!visionConsent) {
      return error(403, "Le consentement est requis pour l'analyse par IA avancée.")
    }

    console.log(`[mabanque-extract] Mode Vision — ${files.length} fichier(s)`)

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

    const imagesToSend = allImages.slice(0, MAX_VISION_IMAGES)
    const textPrompt = buildVisionExtractionMessage(fileNames)
    const claudeResponse = await callClaudeVision({
      system: extractVisionSystemPrompt,
      images: imagesToSend,
      textPrompt,
      maxTokens: 8192,
      temperature: 0.1,
    })

    const extraction = parseExtractionResponse(claudeResponse, 'vision_fallback', imagesToSend.length)
    track({ event: 'extraction_success', brique: 'mabanque', mode: 'vision_fallback', fees_count: extraction.fees.length })
    return NextResponse.json({ success: true, extraction } satisfies MabanqueExtractAPIResponse)

  } catch (err) {
    console.error('[mabanque-extract] Erreur:', err)
    return error(500, `Erreur lors de l'extraction : ${err instanceof Error ? err.message : 'Erreur interne'}`)
  }
}

// ============================================================
// HELPERS
// ============================================================

function parseExtractionResponse(
  raw: string,
  mode: ExtractionMode,
  pageCount: number,
  ocrConfidence?: number
): MabanqueExtractionResult {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
  cleaned = cleaned.trim()

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('[mabanque-extract] JSON parse error:', cleaned.substring(0, 300))
    return emptyExtraction(mode, pageCount, ocrConfidence)
  }

  // Parser les frais
  const rawFees = Array.isArray(parsed.fees) ? parsed.fees : []
  const fees: ExtractedFee[] = rawFees
    .filter((f: any) => f && f.category !== 'non_frais')
    .map((f: any): ExtractedFee => ({
      date: typeof f.date === 'string' ? f.date : '',
      label: typeof f.label === 'string' ? f.label : '',
      amount: Math.abs(Number(f.amount) || 0),
      category: FEE_CATEGORIES.includes(f.category) ? f.category : 'frais_autre',
      confidence: (['high', 'medium', 'low'].includes(f.confidence) ? f.confidence : 'low') as ExtractedFee['confidence'],
    }))
    .filter((f: ExtractedFee) => f.amount > 0)

  // Construire le résumé catégorisé
  const summary = buildSummary(fees)

  return {
    mode,
    ocrConfidence,
    banqueDetectee: typeof parsed.banque === 'string' ? parsed.banque : null,
    periodeDebut: typeof parsed.periode_debut === 'string' ? parsed.periode_debut : null,
    periodeFin: typeof parsed.periode_fin === 'string' ? parsed.periode_fin : null,
    titulaire: '[TITULAIRE]',
    fees,
    summary,
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : [],
    pageCount,
  }
}

function buildSummary(fees: ExtractedFee[]): MabanqueExtractionResult['summary'] {
  const byCategory = (cat: ExtractedFeeCategory) => fees.filter(f => f.category === cat)

  const commissions = byCategory('commission_intervention')
  const rejets = byCategory('rejet_prelevement')
  const cheques = byCategory('rejet_cheque')
  const agios = byCategory('agios')
  const lettres = byCategory('lettre_information')
  const tenue = byCategory('frais_tenue_compte')
  const virInst = byCategory('virement_instantane')
  const autres = byCategory('frais_autre')

  const sum = (arr: ExtractedFee[]) => Math.round(arr.reduce((s, f) => s + f.amount, 0) * 100) / 100

  const autresFraisTotal = sum(autres) + sum(virInst)
  const autresFraisLabels = [...autres, ...virInst].map(f => f.label).filter(Boolean)

  const total = sum(commissions) + sum(rejets) + sum(cheques) + sum(agios) + sum(lettres) + sum(tenue) + autresFraisTotal

  return {
    commissionsIntervention: sum(commissions),
    commissionsNombre: commissions.length,
    rejetsPrelevement: sum(rejets),
    rejetsPrelevementNombre: rejets.length,
    rejetsCheque: sum(cheques),
    agios: sum(agios),
    lettresInformation: sum(lettres),
    fraisTenueCompte: sum(tenue),
    autresFrais: autresFraisTotal,
    autresFraisLabels,
    totalFraisMois: Math.round(total * 100) / 100,
    virementInstantaneFacture: virInst.length > 0,
  }
}

function emptyExtraction(mode: ExtractionMode, pageCount: number, ocrConfidence?: number): MabanqueExtractionResult {
  return {
    mode,
    ocrConfidence,
    banqueDetectee: null,
    periodeDebut: null,
    periodeFin: null,
    titulaire: null,
    fees: [],
    summary: {
      commissionsIntervention: 0, commissionsNombre: 0,
      rejetsPrelevement: 0, rejetsPrelevementNombre: 0,
      rejetsCheque: 0, agios: 0, lettresInformation: 0,
      fraisTenueCompte: 0, autresFrais: 0, autresFraisLabels: [],
      totalFraisMois: 0, virementInstantaneFacture: false,
    },
    warnings: ["Impossible d'analyser le relevé — remplissez le formulaire manuellement"],
    pageCount,
  }
}

function error(status: number, message: string) {
  return NextResponse.json({ success: false, error: message } satisfies MabanqueExtractAPIError, { status })
}
