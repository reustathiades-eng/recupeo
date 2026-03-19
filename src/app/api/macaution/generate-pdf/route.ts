// ============================================================
// POST /api/macaution/generate-pdf
// Génération PDF (rapport ou courriers)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import PDFDocument from 'pdfkit'

export async function POST(request: NextRequest) {
  try {
    const { diagnosticId, type = 'report' } = await request.json()
    if (!diagnosticId) {
      return NextResponse.json({ success: false, error: 'diagnosticId requis' }, { status: 400 })
    }

    // 1. Récupérer le rapport
    const payload = await getPayload({ config })
    const reports = await payload.find({
      collection: 'reports',
      where: { diagnostic: { equals: diagnosticId } },
      limit: 1,
    })

    if (reports.docs.length === 0) {
      return NextResponse.json({ success: false, error: 'Rapport introuvable' }, { status: 404 })
    }

    const reportDoc = reports.docs[0]
    const reportContent = reportDoc.reportContent as any
    const letters = reportDoc.generatedLetters as any

    // 2. Générer le PDF
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 50, right: 50 },
        info: {
          Title: type === 'report' ? 'Rapport MACAUTION — RÉCUPÉO' : 'Courriers MACAUTION — RÉCUPÉO',
          Author: 'RÉCUPÉO — recupeo.fr',
        },
      })

      const chunks: Buffer[] = []
      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      if (type === 'report' && reportContent) {
        generateReportPDF(doc, reportContent)
      } else if (type === 'letters' && letters) {
        generateLettersPDF(doc, letters)
      } else {
        doc.fontSize(14).text('Contenu non disponible.')
      }

      doc.end()
    })

    // 3. Retourner le PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="RECUPEO-${type === 'report' ? 'rapport' : 'courriers'}-macaution.pdf"`,
      },
    })

  } catch (error) {
    console.error('[MACAUTION] Erreur génération PDF:', error)
    return NextResponse.json({ success: false, error: 'Erreur génération PDF' }, { status: 500 })
  }
}

// ─── Génération du rapport en PDF ───

function generateReportPDF(doc: PDFKit.PDFDocument, report: any) {
  const green = '#00B377'
  const navy = '#0B1426'
  const gray = '#64748B'

  // ─ En-tête
  doc.fontSize(10).fillColor(green).text('RÉCUPÉO', { align: 'right' })
  doc.fontSize(8).fillColor(gray).text('recupeo.fr — L\'IA qui récupère ce qu\'on vous doit', { align: 'right' })
  doc.moveDown(2)

  // ─ Titre
  doc.fontSize(22).fillColor(navy).text(report.title || 'Rapport d\'audit — Dépôt de garantie', { align: 'left' })
  doc.moveDown(0.3)
  doc.fontSize(9).fillColor(gray).text(`Généré le ${new Date().toLocaleDateString('fr-FR')} | Référence : ${report.reference || 'MAC-' + Date.now().toString(36).toUpperCase()}`)
  doc.moveDown(0.5)

  // ─ Ligne de séparation
  doc.strokeColor(green).lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown(1.5)

  // ─ Bilan financier (encadré)
  if (report.financial_summary) {
    const fs = report.financial_summary
    doc.save()
    const boxY = doc.y
    doc.roundedRect(50, boxY, 495, 90, 5).fillColor('#F0FDF9').fill()
    doc.fillColor(navy).fontSize(11).text('Bilan financier', 65, boxY + 12, { underline: true })
    doc.fontSize(9).fillColor(gray)
    doc.text(`Dépôt versé : ${fs.deposit_paid}€  |  Restitué : ${fs.amount_returned}€  |  Retenu : ${fs.amount_withheld}€`, 65, boxY + 32)
    doc.text(`Retenues abusives : ${fs.abusive_deductions}€  |  Pénalités : ${fs.late_penalties}€`, 65, boxY + 48)
    doc.fontSize(13).fillColor(green).text(`Total récupérable : ${fs.total_recoverable}€`, 65, boxY + 66, { bold: true } as any)
    doc.restore()
    doc.y = boxY + 100
  }

  // ─ Sections du rapport
  if (report.sections) {
    for (const section of report.sections) {
      if (doc.y > 680) doc.addPage()
      doc.moveDown(0.8)
      doc.fontSize(13).fillColor(navy).text(section.title, { underline: false })
      doc.moveDown(0.4)
      doc.fontSize(9.5).fillColor('#1E293B').text(section.content, { align: 'justify', lineGap: 3 })
    }
  }

  // ─ Prochaines étapes
  if (report.next_steps && report.next_steps.length > 0) {
    if (doc.y > 620) doc.addPage()
    doc.moveDown(1.5)
    doc.fontSize(13).fillColor(navy).text('Prochaines étapes')
    doc.moveDown(0.5)
    for (const step of report.next_steps) {
      doc.fontSize(10).fillColor(green).text(`Étape ${step.step} — ${step.action}`, { continued: false })
      doc.fontSize(9).fillColor(gray).text(step.detail)
      if (step.deadline) doc.fontSize(8).fillColor(gray).text(`Délai : ${step.deadline}`)
      doc.moveDown(0.5)
    }
  }

  // ─ Disclaimer
  if (doc.y > 650) doc.addPage()
  doc.moveDown(2)
  doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown(0.5)
  doc.fontSize(7).fillColor(gray).text(
    'Ce rapport est un outil d\'aide à l\'analyse. Il ne constitue pas un avis juridique et ne remplace pas le conseil d\'un avocat. ' +
    'Calculs basés sur le droit français en vigueur (loi 89-462, loi ALUR, grille de vétusté FNAIM). ' +
    'RÉCUPÉO — recupeo.fr — Données traitées conformément au RGPD.',
    { align: 'center', lineGap: 2 }
  )
}

// ─── Génération des courriers en PDF ───

function generateLettersPDF(doc: PDFKit.PDFDocument, letters: any) {
  const navy = '#0B1426'
  const gray = '#64748B'

  const letterTypes = [
    { key: 'mise_en_demeure', data: letters.mise_en_demeure },
    { key: 'saisine_cdc', data: letters.saisine_cdc },
    { key: 'requete_tribunal', data: letters.requete_tribunal },
  ]

  for (let i = 0; i < letterTypes.length; i++) {
    const letter = letterTypes[i].data
    if (!letter) continue

    if (i > 0) doc.addPage()

    // Type de courrier
    doc.fontSize(8).fillColor(gray).text(letter.type || '', { align: 'right' })
    doc.moveDown(1)

    // Titre
    doc.fontSize(16).fillColor(navy).text(letter.title, { align: 'center' })
    doc.moveDown(1.5)

    // Contenu
    const content = (letter.content || '').replace(/\\n/g, '\n')
    doc.fontSize(10).fillColor('#1E293B').text(content, {
      align: 'left',
      lineGap: 4,
      paragraphGap: 8,
    })

    // Pied de page
    doc.moveDown(2)
    doc.fontSize(7).fillColor(gray).text(
      'Document généré par RÉCUPÉO — recupeo.fr — Ce courrier est un modèle à adapter à votre situation.',
      { align: 'center' }
    )
  }
}
