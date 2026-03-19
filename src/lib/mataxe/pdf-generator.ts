// ============================================================
// MATAXE — Générateur PDF (rapport + réclamation fiscale)
// ============================================================
import PDFDocument from 'pdfkit'
import path from 'path'

const C = {
  navy: '#0B1426', emerald: '#00B377', emeraldDark: '#00996A', emeraldBg: '#F0FDF9',
  white: '#FFFFFF', text: '#1E293B', muted: '#64748B', border: '#E2E8F0', bgLight: '#F7F9FC',
  red: '#DC2626',
}

const FONTS_DIR = path.join(process.cwd(), 'assets', 'fonts')

function reg(doc: PDFKit.PDFDocument) {
  doc.registerFont('Body', path.join(FONTS_DIR, 'DMSans-Regular.woff'))
  doc.registerFont('Bold', path.join(FONTS_DIR, 'DMSans-Bold.woff'))
  doc.registerFont('Medium', path.join(FONTS_DIR, 'DMSans-Medium.woff'))
  doc.registerFont('Italic', path.join(FONTS_DIR, 'DMSans-Italic.woff'))
  doc.registerFont('Serif', path.join(FONTS_DIR, 'DejaVuSerif-Regular.ttf'))
  doc.registerFont('SerifBold', path.join(FONTS_DIR, 'DejaVuSerif-Bold.ttf'))
}

function fmt(n: number): string {
  const s = Math.abs(Math.round(n)).toString()
  let r = ''
  for (let i = s.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) r = ' ' + r
    r = s[i] + r
  }
  return n < 0 ? '-' + r : r
}

const W = 495
const TOP = 50
const BOT = 790

function header(doc: PDFKit.PDFDocument, ref: string, pageNum: number) {
  doc.save()
  doc.rect(0, 0, 595.28, 36).fill(C.navy)
  doc.font('Bold').fontSize(7.5).fillColor(C.emerald).text('RECUPEO', TOP, 12, { continued: true })
  doc.font('Body').fillColor('#FFFFFF99').text('  |  recupeo.fr')
  doc.font('Body').fontSize(6.5).fillColor('#FFFFFF55').text(ref + '  |  Page ' + pageNum, TOP, 12, { align: 'right', width: W })
  doc.restore()
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number, ref: string, pg: { n: number }) {
  if (doc.y + needed > BOT) {
    doc.addPage()
    pg.n++
    header(doc, ref, pg.n)
    doc.y = 52
  }
}

// ============================================================
// RAPPORT PDF — Audit Taxe Foncière
// ============================================================
export function generateMataxeReportPDF(report: any, calculations?: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 45, bottom: 40, left: TOP, right: TOP },
      info: {
        Title: 'Rapport d\'audit taxe fonciere - RECUPEO',
        Author: 'RECUPEO - recupeo.fr',
      },
    })
    reg(doc)
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const ref = report.reference || 'TF-' + Date.now().toString(36).toUpperCase()
    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    const pg = { n: 0 }

    // ── PAGE 1 : COUVERTURE ──
    pg.n = 1
    doc.rect(0, 0, 595.28, 841.89).fill(C.navy)
    doc.font('Bold').fontSize(24).fillColor(C.emerald).text('RECUPEO', TOP, 100)
    doc.font('Body').fontSize(10).fillColor('#FFFFFF88').text("L'IA qui recupere ce qu'on vous doit", TOP, 130)
    doc.rect(TOP, 165, 150, 2.5).fill(C.emerald)
    doc.font('Bold').fontSize(28).fillColor(C.white).text("Rapport d'audit", TOP, 200, { width: W })
    doc.font('Bold').fontSize(28).fillColor(C.emerald).text('Taxe fonciere', TOP, 235, { width: W })
    doc.font('Body').fontSize(10).fillColor('#FFFFFF66')
    doc.text('Reference : ' + ref, TOP, 320)
    doc.text('Date : ' + date, TOP, 338)
    doc.text('Document confidentiel', TOP, 356)
    doc.roundedRect(TOP, 410, 220, 30, 4).fill(C.emerald)
    doc.font('Bold').fontSize(10).fillColor(C.navy).text('AUDIT VALEUR LOCATIVE CADASTRALE', TOP + 12, 418)
    doc.font('Italic').fontSize(7).fillColor('#FFFFFF44')
      .text("Ce document est un outil d'aide a la verification. Il ne constitue pas un avis fiscal.", TOP, 760, { width: W, align: 'center' })

    // ── PAGE 2 : BILAN FINANCIER ──
    if (calculations) {
      doc.addPage(); pg.n++
      header(doc, ref, pg.n)
      doc.y = 52
      doc.font('Bold').fontSize(18).fillColor(C.navy).text('Bilan financier', TOP, doc.y)
      doc.rect(TOP, doc.y + 3, 80, 2).fill(C.emerald)
      doc.moveDown(1)

      // Big impact box
      const by = doc.y
      doc.save()
      doc.roundedRect(TOP, by, W, 70, 6).fill(C.emeraldBg).stroke(C.emerald)
      doc.font('Body').fontSize(8.5).fillColor(C.muted).text('Remboursement potentiel sur 4 ans (retroactif)', TOP + 15, by + 10)
      doc.font('Bold').fontSize(28).fillColor(C.emerald)
        .text(fmt(calculations.remboursement4ans || 0) + ' EUR', TOP + 15, by + 27, { width: W - 30 })
      doc.font('Body').fontSize(8).fillColor(C.muted)
        .text('Ecart annuel : ' + fmt(calculations.ecartTaxe || 0) + ' EUR/an x 4 ans', TOP + 15, by + 55)
      doc.restore()
      doc.y = by + 85

      // Table récap
      const rows = [
        ['Surface ponderee estimee', fmt(Math.round(calculations.surfacePondereeEstimee || 0)) + ' m2', ''],
        ['Categorie estimee', 'Cat. ' + (calculations.categorieEstimee || '?') + ' (' + (calculations.categorieLabel || '') + ')', ''],
        ['Coefficient d\'entretien', String(calculations.coeffEntretien || '1.00'), calculations.coeffEntretienLabel || ''],
        ['VLC estimee', fmt(calculations.vlcEstimee || 0) + ' EUR', ''],
        ['Taxe estimee', fmt(calculations.taxeEstimee || 0) + ' EUR', ''],
        ['Taxe payee', fmt((calculations.taxeEstimee || 0) + (calculations.ecartTaxe || 0)) + ' EUR', ''],
        ['Ecart', (calculations.ecartTaxe > 0 ? '+' : '') + fmt(calculations.ecartTaxe || 0) + ' EUR', calculations.ecartTaxePct + '%'],
      ]
      const cw = [240, 150, 105]
      let ty = doc.y
      doc.save()
      doc.rect(TOP, ty, W, 20).fill(C.navy)
      let tx = TOP;
      ['Parametre', 'Valeur', 'Detail'].forEach((h, i) => {
        doc.font('Bold').fontSize(8).fillColor(C.white).text(h, tx + 5, ty + 5, { width: cw[i] - 10 })
        tx += cw[i]
      })
      doc.restore()
      ty += 20
      rows.forEach((row, ri) => {
        doc.save()
        doc.rect(TOP, ty, W, 20).fill(ri % 2 === 0 ? C.bgLight : C.white).stroke(C.border)
        let rx = TOP
        row.forEach((cell, ci) => {
          const isEcart = ri === rows.length - 1 && ci === 1
          doc.font(isEcart ? 'Bold' : 'Body').fontSize(8).fillColor(isEcart ? C.emerald : C.text)
            .text(cell, rx + 5, ty + 5, { width: cw[ci] - 10 })
          rx += cw[ci]
        })
        doc.restore()
        ty += 20
      })
      doc.y = ty + 15
    }

    // ── SECTIONS DU RAPPORT ──
    const sections = report.sections || []
    for (const section of sections) {
      ensureSpace(doc, 120, ref, pg)

      const sy = doc.y
      doc.save()
      doc.rect(TOP, sy, 3.5, 16).fill(C.emerald)
      doc.restore()
      doc.font('Bold').fontSize(12).fillColor(C.navy).text(section.title, TOP + 12, sy + 1, { width: W - 12 })
      doc.moveDown(0.4)

      const paragraphs = (section.content || '').split('\n').filter((p: string) => p.trim())
      for (const p of paragraphs) {
        ensureSpace(doc, 40, ref, pg)
        doc.font('Body').fontSize(9.2).fillColor(C.text).text(p.trim(), TOP, doc.y, {
          width: W, align: 'justify', lineGap: 3,
        })
        doc.moveDown(0.2)
      }
      doc.moveDown(0.8)
    }

    // ── DISCLAIMER ──
    ensureSpace(doc, 80, ref, pg)
    doc.moveDown(1)
    doc.rect(TOP, doc.y, W, 0.5).fill(C.border)
    doc.moveDown(0.5)
    doc.font('Italic').fontSize(7).fillColor(C.muted).text(
      "Cet audit est un outil d'aide a la verification. Il ne constitue pas un avis fiscal. " +
      "Calculs bases sur le CGI (art. 1380-1508) et le BOI-IF-TFB. " +
      "RECUPEO - recupeo.fr - Donnees traitees conformement au RGPD.",
      TOP, doc.y, { width: W, align: 'center', lineGap: 2 }
    )

    doc.end()
  })
}

// ============================================================
// RÉCLAMATION FISCALE PDF
// ============================================================
export function generateMataxeReclamationPDF(reclamation: any, inputData?: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 55, right: 55 },
      info: {
        Title: 'Reclamation fiscale taxe fonciere - RECUPEO',
        Author: 'RECUPEO - recupeo.fr',
      },
    })
    reg(doc)
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const lw = 485

    // ── PAGE 1 : RÉCLAMATION FISCALE ──
    // LRAR mention
    doc.font('Bold').fontSize(7.5).fillColor(C.red)
      .text('Lettre recommandee avec accuse de reception', 55, 50, { align: 'right', width: lw })

    // Expéditeur
    doc.font('Body').fontSize(9).fillColor(C.text)
    doc.text('[NOM PRENOM]', 55, 75)
    doc.text('[ADRESSE COMPLETE]', 55, doc.y)

    // Destinataire
    doc.font('Bold').fontSize(9).fillColor(C.text)
    doc.text(reclamation.destinataire || 'Service des Impots Fonciers', 300, 115, { width: 240 })
    doc.font('Body').text(inputData?.commune ? 'de ' + inputData.commune : '[COMMUNE]', 300, doc.y, { width: 240 })

    // Date
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    doc.font('Body').fontSize(9).fillColor(C.text)
      .text('[VILLE], le ' + dateStr, 300, 175, { width: 240, align: 'right' })

    // Objet
    doc.font('Bold').fontSize(9.5).fillColor(C.navy)
      .text('Objet : Reclamation contentieuse — Taxe fonciere sur les proprietes baties', 55, 210, { width: lw })
    doc.rect(55, doc.y + 4, lw, 0.5).fill(C.border)
    doc.moveDown(0.8)

    // Contenu du courrier
    const content = (reclamation.courrier || '').replace(/\\n/g, '\n')
    const paragraphs = content.split('\n').filter((p: string) => p.trim())
    for (const para of paragraphs) {
      doc.font('Serif').fontSize(9.5).fillColor(C.text)
        .text(para.trim(), 55, doc.y, { width: lw, align: 'justify', lineGap: 3 })
      doc.moveDown(0.3)
    }

    // Signature
    doc.moveDown(1.5)
    doc.font('Serif').fontSize(9.5).fillColor(C.text)
      .text('[NOM PRENOM]', 300, doc.y, { width: 240, align: 'right' })
    doc.font('Italic').fontSize(7.5).fillColor(C.muted)
      .text('(Signature)', 300, doc.y + 3, { width: 240, align: 'right' })

    // ── PAGE 2 : GUIDE 6675-M ──
    if (reclamation.guide6675M) {
      doc.addPage()
      doc.font('Bold').fontSize(14).fillColor(C.navy)
        .text('Guide : Obtenir le formulaire 6675-M', 55, 55, { width: lw })
      doc.rect(55, doc.y + 4, 120, 2).fill(C.emerald)
      doc.moveDown(1)

      const guide = (reclamation.guide6675M || '').replace(/\\n/g, '\n')
      const guideParas = guide.split('\n').filter((p: string) => p.trim())
      for (const para of guideParas) {
        doc.font('Body').fontSize(9.5).fillColor(C.text)
          .text(para.trim(), 55, doc.y, { width: lw, lineGap: 3 })
        doc.moveDown(0.3)
      }
    }

    // ── PAGE 3 : PIÈCES JUSTIFICATIVES ──
    if (reclamation.piecesJustificatives && reclamation.piecesJustificatives.length > 0) {
      doc.addPage()
      doc.font('Bold').fontSize(14).fillColor(C.navy)
        .text('Pieces justificatives a joindre', 55, 55, { width: lw })
      doc.rect(55, doc.y + 4, 120, 2).fill(C.emerald)
      doc.moveDown(1)

      reclamation.piecesJustificatives.forEach((piece: string, i: number) => {
        doc.font('Body').fontSize(9.5).fillColor(C.text)
          .text((i + 1) + '. ' + piece, 70, doc.y, { width: lw - 15 })
        doc.moveDown(0.3)
      })
    }

    // Disclaimer
    doc.moveDown(2)
    doc.rect(55, doc.y, lw, 0.5).fill(C.border)
    doc.moveDown(0.5)
    doc.font('Italic').fontSize(7).fillColor(C.muted).text(
      "Document genere par RECUPEO (recupeo.fr). Outil d'aide a la verification, ne constitue pas un avis fiscal. RGPD.",
      55, doc.y, { width: lw, align: 'center' }
    )

    doc.end()
  })
}
