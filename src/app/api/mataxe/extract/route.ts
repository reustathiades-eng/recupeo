// ============================================================
// POST /api/mataxe/extract
// Extraction du formulaire 6675-M — OCR local ou Vision
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
} from '@/lib/mataxe/extract-prompt'
import type {
  MataxeExtractionResult,
  MataxeExtractAPIResponse,
  MataxeExtractAPIError,
  ExtractionMode,
  ExtractedRoom,
  ExtractedEquipment,
  ExtractedDependency,
} from '@/lib/mataxe/extract-types'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_TOTAL_SIZE = 30 * 1024 * 1024
const MAX_VISION_IMAGES = 15
const OCR_CONFIDENCE_THRESHOLD = 65
const ACCEPTED_TYPES = new Set([
  'application/pdf', 'image/jpeg', 'image/jpg',
  'image/png', 'image/webp', 'image/heic',
])

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

    // ─── MODE 1 : OCR LOCAL ───
    if (!forceVision) {
      console.log(`[mataxe-extract] Mode OCR — ${files.length} fichier(s)`)

      const ocrResults: Array<{ fileName: string; ocrText: string; pageCount: number; confidence: number }> = []

      for (const file of files) {
        const ocr = await extractTextFromDocument(file.buffer, file.type, file.name)
        ocrResults.push({ fileName: file.name, ocrText: ocr.text, pageCount: ocr.pageCount, confidence: ocr.confidence })
      }

      const totalChars = ocrResults.reduce((sum, r) => sum + r.ocrText.replace(/\s/g, '').length, 0)
      const avgConfidence = totalChars > 0
        ? ocrResults.reduce((sum, r) => sum + r.confidence * r.ocrText.replace(/\s/g, '').length, 0) / totalChars
        : 0

      console.log(`[mataxe-extract] OCR confiance : ${Math.round(avgConfidence)}%`)

      if (avgConfidence < OCR_CONFIDENCE_THRESHOLD) {
        return NextResponse.json({
          success: false,
          error: 'La qualité du document ne permet pas une lecture automatique fiable.',
          needsVisionConsent: true,
          ocrConfidence: Math.round(avgConfidence),
        } satisfies MataxeExtractAPIError, { status: 422 })
      }

      // Anonymiser et envoyer à Claude
      const anonymizedDocs = ocrResults.map(doc => {
        const { anonymizedText, detectedCount } = anonymizeText(doc.ocrText)
        if (detectedCount > 0) console.log(`[mataxe-extract] ${doc.fileName}: ${detectedCount} PII anonymisée(s)`)
        return { fileName: doc.fileName, ocrText: anonymizedText, pageCount: doc.pageCount }
      })

      const userMessage = buildOCRExtractionMessage(anonymizedDocs)
      const claudeResponse = await callClaude({
        system: extractSystemPrompt,
        userMessage,
        maxTokens: 8192,
        temperature: 0.1,
      })

      const extraction = parseExtractionResponse(claudeResponse, 'ocr_local', Math.round(avgConfidence))
      return NextResponse.json({ success: true, extraction } satisfies MataxeExtractAPIResponse)
    }

    // ─── MODE 2 : CLAUDE VISION ───
    if (!visionConsent) {
      return error(403, "Le consentement est requis pour l'analyse par IA avancée.")
    }

    console.log(`[mataxe-extract] Mode Vision — ${files.length} fichier(s)`)

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

    const extraction = parseExtractionResponse(claudeResponse, 'vision_fallback')
    return NextResponse.json({ success: true, extraction } satisfies MataxeExtractAPIResponse)

  } catch (err) {
    console.error('[mataxe-extract] Erreur:', err)
    return error(500, `Erreur lors de l'extraction : ${err instanceof Error ? err.message : 'Erreur interne'}`)
  }
}

// ============================================================
// HELPERS
// ============================================================

function parseExtractionResponse(raw: string, mode: ExtractionMode, ocrConfidence?: number): MataxeExtractionResult {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
  cleaned = cleaned.trim()

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('[mataxe-extract] JSON parse error:', cleaned.substring(0, 200))
    return emptyExtraction(mode, ocrConfidence)
  }

  const ext = (parsed.extracted || {}) as Record<string, any>
  const field = <T>(name: string): { value: T | null; confidence: 'high' | 'medium' | 'low'; source: string } => {
    const f = ext[name]
    if (!f) return { value: null, confidence: 'low', source: '' }
    return {
      value: (f.value !== undefined && f.value !== null && f.value !== 'null') ? f.value : null,
      confidence: (['high', 'medium', 'low'].includes(f.confidence) ? f.confidence : 'low') as any,
      source: typeof f.source === 'string' ? f.source : '',
    }
  }

  return {
    mode,
    documents: Array.isArray(parsed.documents) ? parsed.documents.map((d: any) => ({
      type: d.type || 'autre',
      confidence: d.confidence || 'low',
      pageCount: d.pageCount || 1,
      summary: d.summary || '',
      fileName: d.fileName || '',
    })) : [],
    extracted: {
      communeCode: field('communeCode'),
      communeName: field('communeName'),
      parcelleRef: field('parcelleRef'),
      localRef: field('localRef'),
      ownerName: field('ownerName'),
      address: field('address'),
      cadastralCategory: field('cadastralCategory'),
      categoryLabel: field('categoryLabel'),
      tarifM2: field('tarifM2'),
      coeffEntretien: field('coeffEntretien'),
      coeffEntretienLabel: field('coeffEntretienLabel'),
      coeffSituation: field('coeffSituation'),
      surfaceReelle: field('surfaceReelle'),
      surfacePonderee: field('surfacePonderee'),
      surfaceEquipements: field('surfaceEquipements'),
      surfaceDependances: field('surfaceDependances'),
      vlcBrute: field('vlcBrute'),
      vlcRevisee: field('vlcRevisee'),
      baseNette: field('baseNette'),
      taxAmount: field('taxAmount'),
      tauxCommunal: field('tauxCommunal'),
      tauxIntercommunal: field('tauxIntercommunal'),
      teom: field('teom'),
    },
    rooms: Array.isArray(parsed.rooms) ? parsed.rooms.map((r: any): ExtractedRoom => ({
      name: r.name || '',
      rawSurface: Number(r.rawSurface) || 0,
      coefficient: Number(r.coefficient) || 1,
      weightedSurface: Number(r.weightedSurface) || 0,
      confidence: r.confidence || 'low',
    })) : null,
    equipments: Array.isArray(parsed.equipments) ? parsed.equipments.map((e: any): ExtractedEquipment => ({
      name: e.name || '',
      sqMetersAdded: Number(e.sqMetersAdded) || 0,
      confidence: e.confidence || 'low',
    })) : null,
    dependencies: Array.isArray(parsed.dependencies) ? parsed.dependencies.map((d: any): ExtractedDependency => ({
      name: d.name || '',
      rawSurface: Number(d.rawSurface) || 0,
      weightedSurface: Number(d.weightedSurface) || 0,
      coefficient: Number(d.coefficient) || 0,
      confidence: d.confidence || 'low',
    })) : null,
    missingDocuments: Array.isArray(parsed.missingDocuments) ? parsed.missingDocuments.map(String) : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String) : [],
    ocrConfidence,
  }
}

function emptyExtraction(mode: ExtractionMode, ocrConfidence?: number): MataxeExtractionResult {
  const empty = <T>(): { value: T | null; confidence: 'low'; source: string } => ({ value: null, confidence: 'low', source: '' })
  return {
    mode,
    documents: [],
    extracted: {
      communeCode: empty(), communeName: empty(), parcelleRef: empty(), localRef: empty(),
      ownerName: empty(), address: empty(),
      cadastralCategory: empty(), categoryLabel: empty(), tarifM2: empty(),
      coeffEntretien: empty(), coeffEntretienLabel: empty(), coeffSituation: empty(),
      surfaceReelle: empty(), surfacePonderee: empty(), surfaceEquipements: empty(), surfaceDependances: empty(),
      vlcBrute: empty(), vlcRevisee: empty(), baseNette: empty(),
      taxAmount: empty(), tauxCommunal: empty(), tauxIntercommunal: empty(), teom: empty(),
    },
    rooms: null,
    equipments: null,
    dependencies: null,
    missingDocuments: ["Impossible d'analyser les documents fournis"],
    warnings: ["L'extraction a échoué — veuillez remplir le formulaire manuellement"],
    ocrConfidence,
  }
}

function error(status: number, message: string) {
  return NextResponse.json({ success: false, error: message } satisfies MataxeExtractAPIError, { status })
}
