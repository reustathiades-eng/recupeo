// ============================================================
// RETRAITIA V2 — Pack Tribunal : ZIP export + chronologie
// ============================================================
// Génère un ZIP contenant : docs uploadés, courriers envoyés,
// AR reçus, chronologie PDF du dossier.
// ============================================================

import PDFDocument from 'pdfkit'
import path from 'path'

const FONTS_DIR = path.join(process.cwd(), 'assets', 'fonts')

interface ChronologieEntry {
  date: string
  label: string
  detail: string
  type: 'anomalie' | 'message' | 'lrar' | 'ar' | 'cra' | 'mediateur' | 'correction' | 'autre'
}

interface TribunalInput {
  dossierId: string
  clientName: string
  chronologie: ChronologieEntry[]
}

/**
 * Génère le PDF chronologie du dossier pour le tribunal.
 * Liste exhaustive et datée de toutes les démarches.
 */
export function generateChronologiePdf(input: TribunalInput): Buffer {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const chunks: Buffer[] = []
  doc.on('data', (c: Buffer) => chunks.push(c))

  try {
    doc.registerFont('Body', path.join(FONTS_DIR, 'DMSans-Regular.woff'))
    doc.registerFont('Bold', path.join(FONTS_DIR, 'DMSans-Bold.woff'))
  } catch { /* fallback */ }

  const LM = 50
  const W = 495

  // ── Titre ──
  doc.font('Bold').fontSize(16).fillColor('#0B1426')
  doc.text('CHRONOLOGIE DU DOSSIER', LM, 50, { align: 'center', width: W })
  doc.moveDown(0.5)
  doc.font('Body').fontSize(10).fillColor('#64748B')
  doc.text(`${input.clientName} — Dossier ${input.dossierId.substring(0, 8).toUpperCase()}`, LM, doc.y, { align: 'center', width: W })
  doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, LM, doc.y, { align: 'center', width: W })

  doc.moveDown(2)

  // ── Entrées chronologiques ──
  const sorted = [...input.chronologie].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const icons: Record<string, string> = {
    anomalie: 'DÉTECTION',
    message: 'MESSAGE',
    lrar: 'LRAR',
    ar: 'AR REÇU',
    cra: 'CRA',
    mediateur: 'MÉDIATEUR',
    correction: 'CORRECTION',
    autre: 'ÉVÉNEMENT',
  }

  for (const entry of sorted) {
    if (doc.y > 720) {
      doc.addPage()
    }

    const dateFormatted = new Date(entry.date).toLocaleDateString('fr-FR')

    // Date + badge type
    doc.font('Bold').fontSize(9).fillColor('#0B1426')
    doc.text(`${dateFormatted}`, LM, doc.y)
    doc.font('Body').fontSize(8).fillColor('#00B377')
    doc.text(`  [${icons[entry.type] || 'ÉVÉNEMENT'}]`, LM + 80, doc.y - 11)

    // Label
    doc.font('Bold').fontSize(10).fillColor('#1E293B')
    doc.text(entry.label, LM + 20, doc.y + 2, { width: W - 20 })

    // Détail
    if (entry.detail) {
      doc.font('Body').fontSize(9).fillColor('#64748B')
      doc.text(entry.detail, LM + 20, doc.y, { width: W - 20 })
    }

    // Séparateur
    doc.moveDown(0.5)
    doc.strokeColor('#E2E8F0').lineWidth(0.5)
    doc.moveTo(LM, doc.y).lineTo(LM + W, doc.y).stroke()
    doc.moveDown(0.5)
  }

  // ── Pied de page ──
  doc.fontSize(7).fillColor('#94A3B8')
  doc.text(
    `RÉCUPÉO — Ce document retrace les démarches effectuées. Il peut être présenté au tribunal.`,
    LM, 770, { width: W, align: 'center' }
  )

  doc.end()
  return Buffer.concat(chunks)
}

/**
 * Construit la chronologie d'un dossier à partir de ses données.
 */
export function buildChronologie(dossier: any): ChronologieEntry[] {
  const entries: ChronologieEntry[] = []

  // Paiement
  const paiements = (dossier.paiements || []) as any[]
  for (const p of paiements) {
    entries.push({
      date: p.paidAt,
      label: `Paiement ${p.pack}`,
      detail: `Montant : ${(p.amount / 100).toFixed(2)}€`,
      type: 'autre',
    })
  }

  // Diagnostic
  if (dossier.diagnostic) {
    const diag = dossier.diagnostic as any
    if (diag.generatedAt || dossier.updatedAt) {
      entries.push({
        date: diag.generatedAt || dossier.updatedAt,
        label: `Diagnostic généré : ${dossier.nbAnomalies || 0} anomalie(s)`,
        detail: `Score : ${dossier.scoreGlobal || '—'}`,
        type: 'anomalie',
      })
    }
  }

  // Démarches
  const demarches = (dossier.demarches || []) as any[]
  for (const d of demarches) {
    if (d.messageSentAt) {
      entries.push({
        date: d.messageSentAt,
        label: `Message envoyé à ${d.organisme || '—'}`,
        detail: d.anomalieLabel || d.anomalyId || '',
        type: 'message',
      })
    }
    if (d.lrarSentAt) {
      entries.push({
        date: d.lrarSentAt,
        label: `LRAR envoyé à ${d.organisme || '—'}`,
        detail: `Tracking : ${d.lrarTrackingId || '—'}`,
        type: 'lrar',
      })
    }
    if (d.arReceivedAt) {
      entries.push({
        date: d.arReceivedAt,
        label: `AR reçu de ${d.organisme || '—'}`,
        detail: '',
        type: 'ar',
      })
    }
    if (d.correctedAt) {
      entries.push({
        date: d.correctedAt,
        label: `Anomalie corrigée par ${d.organisme || '—'}`,
        detail: d.anomalieLabel || '',
        type: 'correction',
      })
    }
  }

  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
