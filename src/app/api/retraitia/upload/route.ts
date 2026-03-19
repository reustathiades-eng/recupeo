// ============================================================
// POST /api/retraitia/upload
// Upload un document, lance l'extraction, met à jour le dossier
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { extractDocument, type ExtractionResult } from '@/lib/retraitia/extraction/pipeline'
import type { DocumentType } from '@/lib/retraitia/types'
import { validateExtraction, type ValidationResult } from '@/lib/retraitia/extraction/validator'

const ALLOWED_TYPES: DocumentType[] = [
  'ris', 'notification_cnav', 'releve_agirc_arrco',
  'releve_mensualites', 'avis_imposition', 'attestation_fiscale',
  'eig', 'notification_msa', 'notification_sre', 'notification_cnracl',
  'paiements_agirc_arrco', 'releve_cnavpl',
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const dossierId = formData.get('dossierId') as string | null
    const documentType = formData.get('documentType') as DocumentType | null

    if (!file || !dossierId || !documentType) {
      return NextResponse.json({ error: 'Fichier, dossierId et documentType requis' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(documentType)) {
      return NextResponse.json({ error: 'Type de document non reconnu' }, { status: 400 })
    }

    // Vérification taille (max 20 MB)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 20 Mo)' }, { status: 400 })
    }

    // Vérification extension
    const ext = file.name.toLowerCase().split('.').pop()
    if (!['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
      return NextResponse.json({
        error: 'Format non supporté. Formats acceptés : PDF, JPG, PNG',
        rejectionReason: 'format_invalide',
      }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Vérifier que le dossier existe
    let dossier: any
    try {
      dossier = await payload.findByID({ collection: 'retraitia-dossiers', id: dossierId })
    } catch {
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
    }

    // Marquer le document comme "uploading"
    const docs = (dossier.documents || []) as any[]
    const docIndex = docs.findIndex((d: any) => d.type === documentType)
    if (docIndex >= 0) {
      docs[docIndex] = { ...docs[docIndex], status: 'uploading', fileName: file.name }
    } else {
      docs.push({ type: documentType, status: 'uploading', fileName: file.name, obligatoire: false })
    }
    await payload.update({
      collection: 'retraitia-dossiers',
      id: dossierId,
      data: { documents: docs, status: dossier.status === 'created' ? 'collecting' : dossier.status },
    })

    // Lancer l'extraction
    const buffer = Buffer.from(await file.arrayBuffer())
    let result: ExtractionResult

    try {
      result = await extractDocument(buffer, file.name, documentType)
    } catch (err) {
      console.error(`[upload] Extraction error for ${documentType}:`, err)
      // Marquer comme erreur
      const updDocs = (dossier.documents || []) as any[]
      const idx = updDocs.findIndex((d: any) => d.type === documentType)
      if (idx >= 0) updDocs[idx] = { ...updDocs[idx], status: 'error' }
      await payload.update({ collection: 'retraitia-dossiers', id: dossierId, data: { documents: updDocs } })

      return NextResponse.json({
        error: 'Extraction échouée. Essayez avec un autre format de document.',
        rejectionReason: 'extraction_failed',
      }, { status: 422 })
    }

    // ── Validation post-extraction (refus intelligent) ──
    const ocrText = result.data ? undefined : undefined // OCR text not passed through; validation uses extracted data
    const validation = validateExtraction(
      documentType,
      result.success,
      result.score,
      result.data,
    )

    // Si le document est refusé, retourner le refus structuré
    if (!validation.accepted) {
      // Marquer comme erreur dans le dossier
      const rejDocs = [...docs]
      const rIdx = rejDocs.findIndex((d: any) => d.type === documentType)
      if (rIdx >= 0) {
        rejDocs[rIdx] = {
          ...rejDocs[rIdx],
          status: 'error',
          rejectionLevel: validation.level,
          rejectionReason: validation.title,
        }
      }
      await payload.update({
        collection: 'retraitia-dossiers',
        id: dossierId,
        data: { documents: rejDocs },
      })

      return NextResponse.json({
        success: false,
        rejected: true,
        validation,
        method: result.method,
        score: result.score,
      })
    }

    // Mettre à jour le dossier avec les résultats
    const finalDocs = [...docs]
    const fIdx = finalDocs.findIndex((d: any) => d.type === documentType)
    if (fIdx >= 0) {
      finalDocs[fIdx] = {
        ...finalDocs[fIdx],
        status: 'extracted',
        extractedAt: new Date().toISOString(),
        extractionConfidence: result.score,
      }
    }

    // Stocker les données extraites
    const extractions = (dossier.extractions || {}) as Record<string, unknown>
    if (result.success && result.data) {
      // Mapper le type de document vers la clé d'extraction
      const extractionKeyMap: Partial<Record<DocumentType, string>> = {
        ris: 'ris',
        notification_cnav: 'notificationCnav',
        releve_agirc_arrco: 'agircArrco',
        avis_imposition: 'avisImposition',
        releve_mensualites: 'mensualites',
      }
      const key = extractionKeyMap[documentType]
      if (key) {
        extractions[key] = result.data
      }
      // Mettre à jour les métadonnées d'extraction
      const methods = (extractions.extractionMethods || {}) as Record<string, string>
      const confidences = (extractions.extractionConfidences || {}) as Record<string, string>
      methods[documentType] = result.method
      confidences[documentType] = result.confidence
      extractions.extractionMethods = methods
      extractions.extractionConfidences = confidences
    }

    await payload.update({
      collection: 'retraitia-dossiers',
      id: dossierId,
      data: {
        documents: finalDocs,
        extractions,
      },
    })

    return NextResponse.json({
      success: true,
      rejected: false,
      validation,
      method: result.method,
      confidence: result.confidence,
      score: result.score,
      costEstimate: result.costEstimate,
      summary: validation.summary || buildExtractionSummary(documentType, result.data),
    })
  } catch (err) {
    console.error('[retraitia/upload] Error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Résumé lisible pour le frontend
function buildExtractionSummary(docType: DocumentType, data: Record<string, unknown> | null): string {
  if (!data) return ''
  switch (docType) {
    case 'ris': {
      const d = data as any
      const trimestres = d.totalTrimestresValides || d.trimestres?.length || '?'
      const annees = d.derniereAnnee && d.premiereAnnee
        ? `${d.premiereAnnee}-${d.derniereAnnee}`
        : '?'
      return `${trimestres} trimestres · ${annees}`
    }
    case 'notification_cnav': {
      const d = data as any
      const montant = d.montantMensuelBrut ? `${d.montantMensuelBrut.toFixed(2)}€/mois` : '?'
      const taux = d.taux ? `taux ${d.taux}%` : ''
      return [montant, taux].filter(Boolean).join(' · ')
    }
    case 'releve_agirc_arrco': {
      const d = data as any
      return `${d.totalPoints || '?'} points`
    }
    case 'avis_imposition': {
      const d = data as any
      return `RFR ${d.rfr || '?'}€ · ${d.nombreParts || '?'} parts`
    }
    default:
      return 'Document extrait'
  }
}
