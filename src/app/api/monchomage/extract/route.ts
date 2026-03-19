// ============================================================
// POST /api/monchomage/extract
// Extraction notification France Travail + bulletins de paie
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { callClaude, callClaudeVision } from '@/lib/anthropic'
import { extractTextFromDocument, pdfToBase64Images, imageToBase64ForVision } from '@/lib/ocr'
import { anonymizeText } from '@/lib/pii-detector'
import {
  extractSystemPrompt, extractVisionSystemPrompt,
  buildOCRExtractionMessage, buildVisionExtractionMessage,
} from '@/lib/monchomage/extract-prompt'
import type {
  MonchomageExtractionResult, MonchomageExtractAPIResponse,
  MonchomageExtractAPIError, ExtractionMode, ExtractedDocument,
} from '@/lib/monchomage/extract-types'
import { track } from '@/lib/analytics'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_TOTAL_SIZE = 50 * 1024 * 1024 // 50Mo (bulletins multiples)
const MAX_VISION_IMAGES = 25
const OCR_CONFIDENCE_THRESHOLD = 55
const ACCEPTED_TYPES = new Set([
  'application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
])

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const visionConsent = formData.get('visionConsent') === 'true'
    const forceVision = formData.get('forceVision') === 'true'

    const files: Array<{ name: string; buffer: Buffer; type: string }> = []
    let totalSize = 0
    for (const [key, value] of formData.entries()) {
      if (key === 'files' && value instanceof File) {
        const file = value as File
        if (!ACCEPTED_TYPES.has(file.type)) return error(400, `Format non supporté : ${file.type}`)
        if (file.size > MAX_FILE_SIZE) return error(400, `"${file.name}" dépasse 10 Mo`)
        totalSize += file.size
        if (totalSize > MAX_TOTAL_SIZE) return error(400, 'Taille totale dépasse 50 Mo')
        const buf = await file.arrayBuffer()
        files.push({ name: file.name, buffer: Buffer.from(buf), type: file.type })
      }
    }
    if (files.length === 0) return error(400, 'Aucun fichier reçu')

    track({ event: 'upload_completed', brique: 'monchomage', file_count: files.length })

    // ─── MODE OCR ───
    if (!forceVision) {
      console.log(`[monchomage-extract] Mode OCR — ${files.length} fichier(s)`)
      const ocrResults: Array<{ fileName: string; ocrText: string; pageCount: number; confidence: number }> = []
      for (const file of files) {
        const ocr = await extractTextFromDocument(file.buffer, file.type, file.name)
        ocrResults.push({ fileName: file.name, ocrText: ocr.text, pageCount: ocr.pageCount, confidence: ocr.confidence })
      }

      const totalChars = ocrResults.reduce((s, r) => s + r.ocrText.replace(/\s/g, '').length, 0)
      const avgConf = totalChars > 0
        ? ocrResults.reduce((s, r) => s + r.confidence * r.ocrText.replace(/\s/g, '').length, 0) / totalChars : 0

      if (avgConf < OCR_CONFIDENCE_THRESHOLD) {
        return NextResponse.json({
          success: false, error: 'Qualité insuffisante pour lecture automatique.',
          needsVisionConsent: true, ocrConfidence: Math.round(avgConf),
        } satisfies MonchomageExtractAPIError, { status: 422 })
      }

      const anonymized = ocrResults.map(doc => {
        const { anonymizedText, detectedCount } = anonymizeText(doc.ocrText)
        if (detectedCount > 0) console.log(`[monchomage-extract] ${doc.fileName}: ${detectedCount} PII`)
        return { fileName: doc.fileName, ocrText: anonymizedText, pageCount: doc.pageCount }
      })

      const totalPages = ocrResults.reduce((s, r) => s + r.pageCount, 0)
      const claudeResponse = await callClaude({
        system: extractSystemPrompt,
        userMessage: buildOCRExtractionMessage(anonymized),
        maxTokens: 8192, temperature: 0.1,
      })

      const extraction = parseResponse(claudeResponse, 'ocr_local', totalPages, Math.round(avgConf))
      track({ event: 'extraction_success', brique: 'monchomage', mode: 'ocr_local', docs: extraction.documents.length })
      return NextResponse.json({ success: true, extraction } satisfies MonchomageExtractAPIResponse)
    }

    // ─── MODE VISION ───
    if (!visionConsent) return error(403, "Consentement requis pour l'analyse IA avancée.")

    console.log(`[monchomage-extract] Mode Vision — ${files.length} fichier(s)`)
    const allImages: Array<{ base64: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' }> = []
    const fileNames: string[] = []
    for (const file of files) {
      fileNames.push(file.name)
      if (file.type === 'application/pdf') {
        const imgs = await pdfToBase64Images(file.buffer)
        allImages.push(...imgs)
      } else {
        allImages.push(await imageToBase64ForVision(file.buffer, file.type))
      }
    }

    const claudeResponse = await callClaudeVision({
      system: extractVisionSystemPrompt,
      images: allImages.slice(0, MAX_VISION_IMAGES),
      textPrompt: buildVisionExtractionMessage(fileNames),
      maxTokens: 8192, temperature: 0.1,
    })

    const extraction = parseResponse(claudeResponse, 'vision_fallback', allImages.length)
    track({ event: 'extraction_success', brique: 'monchomage', mode: 'vision_fallback' })
    return NextResponse.json({ success: true, extraction } satisfies MonchomageExtractAPIResponse)

  } catch (err) {
    console.error('[monchomage-extract] Erreur:', err)
    return error(500, `Erreur extraction : ${err instanceof Error ? err.message : 'Erreur interne'}`)
  }
}

// ============================================================
function parseResponse(raw: string, mode: ExtractionMode, pageCount: number, ocrConf?: number): MonchomageExtractionResult {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)

  let p: Record<string, any>
  try { p = JSON.parse(cleaned.trim()) } catch {
    console.error('[monchomage-extract] JSON parse error')
    return emptyExtraction(mode, pageCount, ocrConf)
  }

  const notif = p.notification || {}
  const emploi = p.emploi || {}
  const bull = p.bulletins || {}

  return {
    mode, ocrConfidence: ocrConf, pageCount,
    documents: Array.isArray(p.documents) ? p.documents.map((d: any): ExtractedDocument => ({
      type: ['notification_droits', 'attestation_employeur', 'bulletin_paie'].includes(d.type) ? d.type : 'autre',
      confidence: d.confidence || 'low', fileName: d.fileName || '', summary: d.summary || '',
    })) : [],
    notification: {
      ajBrute: num(notif.aj_brute), sjr: num(notif.sjr),
      dureeIndemnisation: numInt(notif.duree_indemnisation),
      degressivite: ['yes', 'no'].includes(notif.degressivite) ? notif.degressivite : 'unknown',
      dateNotification: str(notif.date_notification), identifiantFT: str(notif.identifiant_ft),
    },
    emploi: {
      typeRupture: str(emploi.type_rupture), typeContrat: str(emploi.type_contrat),
      dateFinContrat: str(emploi.date_fin_contrat), employeur: str(emploi.employeur),
      salaireBrutMoyen: num(emploi.salaire_brut_moyen), primesDetectees: num(emploi.primes_detectees),
      moisTravailles: numInt(emploi.mois_travailles),
    },
    bulletins: {
      count: numInt(bull.count) || 0,
      salaires: Array.isArray(bull.salaires) ? bull.salaires.map((s: any) => ({ mois: s.mois || '', brut: Number(s.brut) || 0 })) : [],
      totalBrut: num(bull.total_brut) || 0,
      primesIdentifiees: Array.isArray(bull.primes_identifiees) ? bull.primes_identifiees.map((pr: any) => ({ label: pr.label || '', montant: Number(pr.montant) || 0 })) : [],
      arretsMaladie: numInt(bull.arrets_maladie),
      conventionCollective: str(bull.convention_collective),
    },
    warnings: Array.isArray(p.warnings) ? p.warnings.map(String) : [],
  }
}

function num(v: unknown): number | null { const n = Number(v); return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null }
function numInt(v: unknown): number | null { const n = Number(v); return isFinite(n) && n > 0 ? Math.round(n) : null }
function str(v: unknown): string | null { return typeof v === 'string' && v.length > 0 && v !== 'null' ? v : null }

function emptyExtraction(mode: ExtractionMode, pageCount: number, ocrConf?: number): MonchomageExtractionResult {
  return {
    mode, ocrConfidence: ocrConf, pageCount, documents: [],
    notification: { ajBrute: null, sjr: null, dureeIndemnisation: null, degressivite: 'unknown', dateNotification: null, identifiantFT: null },
    emploi: { typeRupture: null, typeContrat: null, dateFinContrat: null, employeur: null, salaireBrutMoyen: null, primesDetectees: null, moisTravailles: null },
    bulletins: { count: 0, salaires: [], totalBrut: 0, primesIdentifiees: [], arretsMaladie: null, conventionCollective: null },
    warnings: ["Impossible d'analyser les documents — remplissez le formulaire manuellement"],
  }
}

function error(status: number, msg: string) {
  return NextResponse.json({ success: false, error: msg } satisfies MonchomageExtractAPIError, { status })
}
