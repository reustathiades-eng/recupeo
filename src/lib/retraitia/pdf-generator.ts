// ============================================================
// RETRAITIA — Générateur PDF professionnel v3
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

const W = 495 // usable width (A4 - margins)
const TOP = 50
const BOT = 790 // max Y before footer zone

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
// RAPPORT PDF
// ============================================================
export function generateReportPDF(report: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 45, bottom: 40, left: TOP, right: TOP },
      info: {
        Title: "Rapport d'audit retraite - RECUPEO",
        Author: 'RECUPEO - recupeo.fr',
      },
    })
    reg(doc)
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const ref = report.reference || 'RET-' + Date.now().toString(36).toUpperCase()
    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    const pg = { n: 0 }

    // ── PAGE 1 : COUVERTURE ──
    pg.n = 1
    doc.rect(0, 0, 595.28, 841.89).fill(C.navy)
    doc.font('Bold').fontSize(24).fillColor(C.emerald).text('RECUPEO', TOP, 100)
    doc.font('Body').fontSize(10).fillColor('#FFFFFF88').text("L'IA qui recupere ce qu'on vous doit", TOP, 130)
    doc.rect(TOP, 165, 150, 2.5).fill(C.emerald)
    doc.font('Bold').fontSize(28).fillColor(C.white).text("Rapport d'audit", TOP, 200, { width: W })
    doc.font('Bold').fontSize(28).fillColor(C.emerald).text('Pension de retraite', TOP, 235, { width: W })
    doc.font('Body').fontSize(10).fillColor('#FFFFFF66')
    doc.text('Reference : ' + ref, TOP, 320)
    doc.text('Date : ' + date, TOP, 338)
    doc.text('Document confidentiel', TOP, 356)
    doc.roundedRect(TOP, 410, 180, 30, 4).fill(C.emerald)
    doc.font('Bold').fontSize(10).fillColor(C.navy).text('AUDIT PERSONNALISE', TOP + 15, 418)
    doc.font('Italic').fontSize(7).fillColor('#FFFFFF44')
      .text("Ce document est un outil d'aide a l'analyse. Il ne constitue pas un avis juridique.", TOP, 760, { width: W, align: 'center' })

    // ── PAGE 2 : BILAN FINANCIER ──
    const fs = report.financial_summary
    if (fs) {
      doc.addPage(); pg.n++
      header(doc, ref, pg.n)
      doc.y = 52
      doc.font('Bold').fontSize(18).fillColor(C.navy).text('Bilan financier', TOP, doc.y)
      doc.rect(TOP, doc.y + 3, 80, 2).fill(C.emerald)
      doc.moveDown(1)

      // Big impact box
      const by = doc.y
      doc.save()
      doc.roundedRect(TOP, by, W, 80, 6).fill(C.emeraldBg).stroke(C.emerald)
      doc.font('Body').fontSize(8.5).fillColor(C.muted).text('Impact total estime sur votre esperance de vie', TOP + 15, by + 10)
      doc.font('Bold').fontSize(30).fillColor(C.emerald)
        .text(fmt(fs.impact_lifetime_min || 0) + ' - ' + fmt(fs.impact_lifetime_max || 0) + ' EUR', TOP + 15, by + 27, { width: W - 30 })
      doc.font('Body').fontSize(8).fillColor(C.muted)
        .text('Soit ' + (fs.impact_monthly_min||0) + '-' + (fs.impact_monthly_max||0) + ' EUR/mois x ' + (fs.life_expectancy_years||'?') + ' ans', TOP + 15, by + 60)
      doc.restore()
      doc.y = by + 95

      // Table
      const rows = [
        ['Pension declaree', (fs.pension_declared_monthly||0) + ' EUR/mois', ''],
        ['Impact mensuel', '+' + (fs.impact_monthly_min||0) + ' EUR/mois', '+' + (fs.impact_monthly_max||0) + ' EUR/mois'],
        ['Impact annuel', '+' + (fs.impact_annual_min||0) + ' EUR/an', '+' + (fs.impact_annual_max||0) + ' EUR/an'],
        ['Impact esperance de vie', '+' + fmt(fs.impact_lifetime_min||0) + ' EUR', '+' + fmt(fs.impact_lifetime_max||0) + ' EUR'],
      ]
      const cw = [240, 127, 128]
      let ty = doc.y
      // Header row
      doc.save()
      doc.rect(TOP, ty, W, 20).fill(C.navy)
      let tx = TOP;
      ['Poste', 'Minimum', 'Maximum'].forEach((h, i) => {
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
          doc.font(ci === 2 ? 'Bold' : 'Body').fontSize(8).fillColor(C.text)
            .text(cell, rx + 5, ty + 5, { width: cw[ci] - 10 })
          rx += cw[ci]
        })
        doc.restore()
        ty += 20
      })
      doc.y = ty + 10
    }

    // ── SECTIONS DU RAPPORT (flux continu) ──
    const sections = report.sections || []
    for (const section of sections) {
      ensureSpace(doc, 120, ref, pg) // au minimum 120pt pour titre + début texte

      // Titre section
      const sy = doc.y
      doc.save()
      doc.rect(TOP, sy, 3.5, 16).fill(C.emerald)
      doc.restore()
      doc.font('Bold').fontSize(12).fillColor(C.navy).text(section.title, TOP + 12, sy + 1, { width: W - 12 })
      doc.moveDown(0.4)

      // Contenu - on écrit paragraphe par paragraphe
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

    // ── PROCHAINES ETAPES ──
    if (report.next_steps && report.next_steps.length > 0) {
      ensureSpace(doc, 150, ref, pg)
      doc.font('Bold').fontSize(14).fillColor(C.navy).text('Prochaines etapes', TOP, doc.y)
      doc.rect(TOP, doc.y + 3, 80, 2).fill(C.emerald)
      doc.moveDown(1)

      for (const step of report.next_steps) {
        ensureSpace(doc, 60, ref, pg)
        const sty = doc.y
        doc.save()
        doc.circle(TOP + 10, sty + 10, 10).fill(C.emerald)
        doc.font('Bold').fontSize(10).fillColor(C.white).text(String(step.step), TOP + 3, sty + 4, { width: 14, align: 'center' })
        doc.restore()
        doc.font('Bold').fontSize(10).fillColor(C.navy).text(step.action, TOP + 28, sty + 2, { width: W - 28 })
        doc.font('Body').fontSize(8.5).fillColor(C.text).text(step.detail, TOP + 28, doc.y + 1, { width: W - 28 })
        if (step.deadline) doc.font('Medium').fontSize(7.5).fillColor(C.emerald).text('Delai : ' + step.deadline, TOP + 28, doc.y + 1)
        doc.moveDown(0.6)
      }
    }

    // ── DISCLAIMER ──
    ensureSpace(doc, 80, ref, pg)
    doc.moveDown(1)
    doc.rect(TOP, doc.y, W, 0.5).fill(C.border)
    doc.moveDown(0.5)
    doc.font('Italic').fontSize(7).fillColor(C.muted).text(
      "Cet audit est un outil d'aide a l'analyse. Il ne constitue pas un avis juridique. " +
      "Calculs bases sur le Code de la Securite Sociale et la reforme 2023. " +
      "RECUPEO - recupeo.fr - Donnees traitees conformement au RGPD.",
      TOP, doc.y, { width: W, align: 'center', lineGap: 2 }
    )

    doc.end()
  })
}

// ============================================================
// COURRIERS PDF
// ============================================================
export function generateLettersPDF(letters: any, clientInfo?: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 55, right: 55 },
      info: {
        Title: 'Courriers de reclamation retraite - RECUPEO',
        Author: 'RECUPEO - recupeo.fr',
      },
    })
    reg(doc)
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const lw = 485
    const letterTypes = [
      { key: 'reclamation_carsat', data: letters.reclamation_carsat },
      { key: 'saisine_cra', data: letters.saisine_cra },
      { key: 'saisine_mediateur', data: letters.saisine_mediateur },
    ].filter(l => l.data)

    letterTypes.forEach((lt, idx) => {
      const letter = lt.data
      if (idx > 0) doc.addPage()

      // LRAR mention (top right)
      doc.font('Bold').fontSize(7.5).fillColor(C.red)
        .text(letter.type || 'Lettre recommandee avec accuse de reception', 55, 50, { align: 'right', width: lw })

      // Expediteur (top left)
      doc.font('Body').fontSize(9).fillColor(C.text)
      doc.text(clientInfo?.name || '[NOM PRENOM]', 55, 75)
      doc.text(clientInfo?.address || '[ADRESSE COMPLETE]', 55, doc.y)
      if (clientInfo?.nir) doc.text('NIR : ' + clientInfo.nir, 55, doc.y)

      // Destinataire (right side)
      doc.font('Bold').fontSize(9).fillColor(C.text)
      if (lt.key === 'reclamation_carsat') {
        doc.text(clientInfo?.carsat || '[CARSAT DE RATTACHEMENT]', 300, 125, { width: 240 })
      } else if (lt.key === 'saisine_cra') {
        doc.text('Commission de Recours Amiable', 300, 125, { width: 240 })
        doc.font('Body').text(clientInfo?.carsat || '[CARSAT DE RATTACHEMENT]', 300, doc.y, { width: 240 })
      } else {
        doc.text("Mediateur de l'Assurance Retraite", 300, 125, { width: 240 })
        doc.font('Body').text('CNAV - 75951 Paris Cedex 19', 300, doc.y, { width: 240 })
      }

      // Date
      const lieu = clientInfo?.city || '[VILLE]'
      const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      doc.font('Body').fontSize(9).fillColor(C.text)
        .text(lieu + ', le ' + dateStr, 300, 190, { width: 240, align: 'right' })

      // Objet
      doc.font('Bold').fontSize(9.5).fillColor(C.navy)
        .text('Objet : ' + letter.title, 55, 220, { width: lw })
      doc.rect(55, doc.y + 4, lw, 0.5).fill(C.border)
      doc.moveDown(0.8)

      // Contenu - paragraphe par paragraphe pour gerer la pagination proprement
      const content = (letter.content || '').replace(/\\n/g, '\n')
      const paragraphs = content.split('\n').filter((p: string) => p.trim())
      for (const para of paragraphs) {
        doc.font('Serif').fontSize(9.5).fillColor(C.text)
          .text(para.trim(), 55, doc.y, { width: lw, align: 'justify', lineGap: 3 })
        doc.moveDown(0.3)
      }

      // Signature (flow naturel, pas de position fixe)
      doc.moveDown(1.5)
      doc.font('Serif').fontSize(9.5).fillColor(C.text)
        .text(clientInfo?.name || '[NOM PRENOM]', 300, doc.y, { width: 240, align: 'right' })
      doc.font('Italic').fontSize(7.5).fillColor(C.muted)
        .text('(Signature)', 300, doc.y + 3, { width: 240, align: 'right' })
    })

    doc.end()
  })
}
