// ============================================================
// MONIMPÔT V2 — Générateur PDF (rapport + réclamation)
// O7 — Amélioré : logo, graphique barres, coordonnées centre
// ============================================================
import PDFDocument from 'pdfkit'
import path from 'path'
import fs from 'fs'

const C = {
  navy: '#0B1426', emerald: '#00B377', emeraldDark: '#00996A', emeraldLight: '#E6F9F1',
  white: '#FFFFFF', text: '#1E293B', muted: '#64748B', border: '#E2E8F0', bgLight: '#F7F9FC',
  red: '#DC2626', redLight: '#FEE2E2', amber: '#D97706',
}

const FONTS_DIR = path.join(process.cwd(), 'assets', 'fonts')
const LOGO_PATH = path.join(process.cwd(), 'assets', 'logo-recupeo.png')

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

function pageHeader(doc: PDFKit.PDFDocument, ref: string, pageNum: number) {
  doc.save()
  doc.rect(0, 0, 595.28, 36).fill(C.navy)
  // Logo petit en haut à gauche si disponible
  try {
    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, 12, 4, { width: 28, height: 28 })
    }
  } catch { /* ignore */ }
  doc.font('Bold').fontSize(7.5).fillColor(C.emerald).text('RECUPEO', 46, 12, { continued: true })
  doc.font('Body').fillColor('#FFFFFF99').text('  |  recupeo.fr')
  doc.font('Body').fontSize(6.5).fillColor('#FFFFFF55').text(ref + '  |  Page ' + pageNum, TOP, 12, { align: 'right', width: W })
  doc.restore()
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number, ref: string, pg: { n: number }) {
  if (doc.y + needed > BOT) {
    doc.addPage()
    pg.n++
    pageHeader(doc, ref, pg.n)
    doc.y = 52
  }
}

function sectionTitle(doc: PDFKit.PDFDocument, text: string, ref: string, pg: { n: number }) {
  ensureSpace(doc, 40, ref, pg)
  doc.moveDown(0.5)
  doc.rect(TOP, doc.y, 4, 16).fill(C.emerald)
  doc.font('Bold').fontSize(13).fillColor(C.navy).text(text, TOP + 12, doc.y + 1)
  doc.moveDown(0.8)
}

// O7 — Graphique en barres horizontales : impôt payé vs optimisé
function drawBarChart(doc: PDFKit.PDFDocument, impotPaye: number, impotOptimise: number) {
  const y0 = doc.y
  const chartW = W - 40
  const barH = 28
  const labelW = 110
  const barMaxW = chartW - labelW - 80
  const maxVal = Math.max(impotPaye, 1)

  // Background
  doc.roundedRect(TOP, y0, W, 100, 6).fill(C.bgLight)

  // Titre
  doc.font('Bold').fontSize(9).fillColor(C.navy)
  doc.text('Comparaison visuelle', TOP + 16, y0 + 10)

  // Barre impôt payé (rouge)
  const bar1Y = y0 + 30
  const bar1W = Math.max(20, Math.round((impotPaye / maxVal) * barMaxW))
  doc.font('Body').fontSize(8).fillColor(C.muted).text('Impot paye', TOP + 16, bar1Y + 7, { width: labelW })
  doc.roundedRect(TOP + labelW, bar1Y, bar1W, barH, 4).fill(C.red)
  doc.font('Bold').fontSize(9).fillColor(C.red).text(fmt(impotPaye) + ' EUR', TOP + labelW + bar1W + 8, bar1Y + 8)

  // Barre impôt optimisé (vert)
  const bar2Y = y0 + 64
  const bar2W = Math.max(20, Math.round((impotOptimise / maxVal) * barMaxW))
  doc.font('Body').fontSize(8).fillColor(C.muted).text('Impot optimise', TOP + 16, bar2Y + 7, { width: labelW })
  doc.roundedRect(TOP + labelW, bar2Y, bar2W, barH, 4).fill(C.emerald)
  doc.font('Bold').fontSize(9).fillColor(C.emeraldDark).text(fmt(impotOptimise) + ' EUR', TOP + labelW + bar2W + 8, bar2Y + 8)

  doc.y = y0 + 112
}

// ============================================================
// RAPPORT PDF
// ============================================================
export function generateMonimpotReportPDF(report: any, calculations?: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 45, bottom: 40, left: TOP, right: TOP },
      info: { Title: 'Rapport audit fiscal - RECUPEO', Author: 'RECUPEO - recupeo.fr' },
    })
    reg(doc)
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const ref = 'IMP-' + Date.now().toString(36).toUpperCase()
    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    const pg = { n: 0 }

    // Les valeurs du rapport (buildReport) font foi — elles utilisent
    // la somme des optimisations plafonnée par l'impôt payé (plus fiable que le barème)

    // ── PAGE 1 : COUVERTURE ──
    pg.n = 1
    doc.rect(0, 0, 595.28, 841.89).fill(C.navy)

    // O7 — Logo en couverture
    try {
      if (fs.existsSync(LOGO_PATH)) {
        doc.image(LOGO_PATH, TOP, 60, { width: 70, height: 70 })
        doc.font('Bold').fontSize(28).fillColor(C.emerald).text('RECUPEO', TOP + 80, 78)
        doc.font('Body').fontSize(10).fillColor('#FFFFFF88').text("L'IA qui recupere ce qu'on vous doit", TOP + 80, 112)
      } else {
        doc.font('Bold').fontSize(28).fillColor(C.emerald).text('RECUPEO', TOP, 80)
        doc.font('Body').fontSize(10).fillColor('#FFFFFF88').text("L'IA qui recupere ce qu'on vous doit", TOP, 112)
      }
    } catch {
      doc.font('Bold').fontSize(28).fillColor(C.emerald).text('RECUPEO', TOP, 80)
      doc.font('Body').fontSize(10).fillColor('#FFFFFF88').text("L'IA qui recupere ce qu'on vous doit", TOP, 112)
    }

    doc.rect(TOP, 150, 150, 2.5).fill(C.emerald)
    doc.font('Bold').fontSize(30).fillColor(C.white).text("Rapport d'audit", TOP, 185, { width: W })
    doc.font('Bold').fontSize(30).fillColor(C.emerald).text("Impot sur le revenu", TOP, 222, { width: W })

    doc.font('Body').fontSize(10).fillColor('#FFFFFF66')
    doc.text('Reference : ' + ref, TOP, 310)
    doc.text('Date : ' + date, TOP, 328)
    doc.text('Document confidentiel', TOP, 346)

    doc.roundedRect(TOP, 390, 280, 30, 4).fill(C.emerald)
    doc.font('Bold').fontSize(10).fillColor(C.navy).text('AUDIT DECLARATION DE REVENUS', TOP + 12, 398)

    // O7 — Encadré économie sur couverture (plus visible)
    if (report?.economie_totale) {
      doc.roundedRect(TOP, 470, W, 120, 8).lineWidth(2).strokeColor(C.emerald).stroke()
      doc.font('Body').fontSize(11).fillColor('#FFFFFF88').text("Economie annuelle estimee", TOP, 488, { width: W, align: 'center' })
      doc.font('Bold').fontSize(52).fillColor(C.emerald).text(fmt(report.economie_totale) + ' EUR', TOP, 510, { width: W, align: 'center' })
      if (report.economie_3ans) {
        doc.font('Body').fontSize(11).fillColor('#FFFFFF66').text('soit ' + fmt(report.economie_3ans) + ' EUR sur 3 ans corrigibles', TOP, 565, { width: W, align: 'center' })
      }
    }

    doc.font('Italic').fontSize(7).fillColor('#FFFFFF44')
      .text("Ce document est un outil d'aide a la verification. Il ne constitue pas un avis fiscal.", TOP, 760, { width: W, align: 'center' })

    // ── PAGE 2 : SYNTHÈSE + GRAPHIQUE ──
    doc.addPage(); pg.n++
    pageHeader(doc, ref, pg.n)
    doc.y = 52

    sectionTitle(doc, 'Synthese executive', ref, pg)
    if (report?.synthese) {
      doc.font('Body').fontSize(10).fillColor(C.text).text(report.synthese, TOP, doc.y, { width: W, lineGap: 3 })
      doc.moveDown(1)
    }

    // O7 — Graphique en barres visuelles
    if (report?.impot_actuel !== undefined && report?.impot_optimise !== undefined) {
      ensureSpace(doc, 130, ref, pg)
      drawBarChart(doc, report.impot_actuel, report.impot_optimise)
      doc.moveDown(0.5)
    }

    // Bilan chiffré (tableau)
    if (report?.impot_actuel !== undefined) {
      ensureSpace(doc, 80, ref, pg)
      const y0 = doc.y
      doc.roundedRect(TOP, y0, W, 60, 6).fill(C.bgLight)
      doc.font('Body').fontSize(9).fillColor(C.muted).text('Impot paye', TOP + 20, y0 + 10)
      doc.font('Bold').fontSize(16).fillColor(C.text).text(fmt(report.impot_actuel) + ' EUR', TOP + 20, y0 + 26)
      doc.font('Body').fontSize(9).fillColor(C.muted).text('Impot optimise', TOP + 200, y0 + 10)
      doc.font('Bold').fontSize(16).fillColor(C.emerald).text(fmt(report.impot_optimise) + ' EUR', TOP + 200, y0 + 26)
      doc.font('Body').fontSize(9).fillColor(C.muted).text('Economie', TOP + 380, y0 + 10)
      doc.font('Bold').fontSize(16).fillColor(C.emeraldDark).text(fmt(report.economie_totale) + ' EUR', TOP + 380, y0 + 26)
      doc.y = y0 + 72
    }

    // ── ANALYSE PAR POSTE ──
    if (report?.analyse_par_poste?.length) {
      sectionTitle(doc, 'Analyse par poste', ref, pg)

      for (const poste of report.analyse_par_poste) {
        ensureSpace(doc, 90, ref, pg)
        const y0 = doc.y

        const barColor = (poste.economie || 0) > 300 ? C.emerald : (poste.economie || 0) > 100 ? C.amber : C.border
        doc.rect(TOP, y0, 3, 84).fill(barColor)

        doc.font('Bold').fontSize(10).fillColor(C.navy).text(poste.poste || 'Poste', TOP + 12, y0)
        doc.font('Body').fontSize(8).fillColor(C.muted).text('Case ' + (poste.case_a_modifier || 'N/A') + ' | ' + (poste.reference_cgi || ''), TOP + 12, y0 + 14)
        doc.font('Body').fontSize(9).fillColor(C.text)
        doc.text('Actuel : ' + (poste.situation_actuelle || ''), TOP + 12, y0 + 28, { width: W - 24 })
        doc.text('Optimise : ' + (poste.situation_optimisee || ''), TOP + 12, doc.y + 2, { width: W - 24 })

        if (poste.economie) {
          doc.font('Bold').fontSize(10).fillColor(C.emeraldDark)
          doc.text('Economie : ' + fmt(poste.economie) + ' EUR', TOP + 350, y0, { align: 'right', width: 145 })
        }

        doc.y = Math.max(doc.y + 12, y0 + 84)
        doc.rect(TOP + 12, doc.y, W - 24, 0.5).fill(C.border)
        doc.moveDown(0.4)
      }
    }

    // ── COMPARAISON MULTI-ANNÉES ──
    if (report?.comparaison_annuelle) {
      sectionTitle(doc, 'Comparaison multi-annees', ref, pg)
      doc.font('Body').fontSize(9).fillColor(C.text).text(report.comparaison_annuelle, TOP, doc.y, { width: W, lineGap: 3 })
      doc.moveDown(1)
    }

    // ── RECOMMANDATIONS ──
    if (report?.recommandations?.length) {
      sectionTitle(doc, 'Recommandations', ref, pg)
      for (const rec of report.recommandations) {
        ensureSpace(doc, 20, ref, pg)
        doc.font('Body').fontSize(9).fillColor(C.text)
        doc.text('  •  ' + rec, TOP + 8, doc.y, { width: W - 20 })
        doc.moveDown(0.3)
      }
    }

    // ── DISCLAIMER ──
    ensureSpace(doc, 50, ref, pg)
    doc.moveDown(1)
    doc.rect(TOP, doc.y, W, 0.5).fill(C.border)
    doc.moveDown(0.5)
    doc.font('Italic').fontSize(7).fillColor(C.muted)
    doc.text("Ce document est un outil d'aide a la verification de votre declaration de revenus. Il ne constitue pas un conseil fiscal personnalise et ne se substitue pas a l'avis d'un expert-comptable ou d'un avocat fiscaliste. Les calculs sont bases sur le bareme progressif 2026 et les plafonds legaux en vigueur. RECUPEO - recupeo.fr", TOP, doc.y, { width: W, lineGap: 2 })

    doc.end()
  })
}

// ============================================================
// RÉCLAMATION PDF
// O7 — Ajout coordonnées centre des impôts
// ============================================================
export function generateMonimpotReclamationPDF(reclamation: any, sensitiveData?: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      info: { Title: 'Reclamation contentieuse - RECUPEO', Author: 'RECUPEO - recupeo.fr' },
    })
    reg(doc)
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const pageW = 475

    // O7 — Logo en haut de la réclamation
    try {
      if (fs.existsSync(LOGO_PATH)) {
        doc.image(LOGO_PATH, 60, 25, { width: 24, height: 24 })
        doc.font('Bold').fontSize(8).fillColor(C.emerald).text('RECUPEO', 88, 31)
      }
    } catch { /* ignore */ }

    // En-tête expéditeur
    const expY = 65
    if (reclamation?.expediteur) {
      const exp = reclamation.expediteur
      doc.font('Body').fontSize(10).fillColor(C.text)
      doc.text(exp.nom || '[NOM PRENOM]', 60, expY)
      doc.text(exp.adresse || '[ADRESSE]')
      if (exp.numero_fiscal) doc.text('N. fiscal : ' + exp.numero_fiscal)
      if (exp.numero_avis) doc.text('N. avis : ' + exp.numero_avis)
    } else {
      doc.font('Body').fontSize(10).fillColor(C.text)
      doc.text(sensitiveData?.nom || '[NOM PRENOM]', 60, expY)
      doc.text(sensitiveData?.adresse || '[ADRESSE]')
      doc.text((sensitiveData?.codePostal ? sensitiveData.codePostal + ' ' : '') + (sensitiveData?.ville || ''))
      if (sensitiveData?.numeroFiscal) {
        doc.text('N. fiscal : ' + sensitiveData.numeroFiscal)
      } else {
        doc.text('N. fiscal : [VOTRE NUMERO FISCAL]')
      }
      if (sensitiveData?.numeroAvis) {
        doc.text('N. avis : ' + sensitiveData.numeroAvis)
      }
    }

    // O7 — Destinataire avec coordonnées centre des impôts
    doc.moveDown(1.5)
    if (reclamation?.destinataire) {
      doc.font('Body').fontSize(10).fillColor(C.text)
      doc.text(reclamation.destinataire, 300, doc.y, { width: 235, align: 'left' })
    } else {
      doc.font('Body').fontSize(10).fillColor(C.text)
      doc.text('Service des Impots des Particuliers', 300, doc.y, { width: 235, align: 'left' })
      if (sensitiveData?.adresseCentre) {
        doc.text(sensitiveData.adresseCentre, 300, doc.y, { width: 235, align: 'left' })
      } else {
        doc.text('[ADRESSE DE VOTRE CENTRE DES IMPOTS]', 300, doc.y, { width: 235, align: 'left' })
        doc.font('Italic').fontSize(7).fillColor(C.muted)
        doc.text('(voir votre avis d\'imposition)', 300, doc.y, { width: 235, align: 'left' })
      }
    }

    // Date + lieu
    doc.moveDown(2)
    const dateFr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    doc.font('Body').fontSize(10).fillColor(C.muted).text('A ' + (sensitiveData?.ville || '[VILLE]') + ', le ' + dateFr, 60, doc.y, { width: pageW, align: 'right' })

    // Objet
    doc.moveDown(1.5)
    doc.font('Bold').fontSize(10).fillColor(C.navy).text('Objet : ' + (reclamation?.objet || 'Reclamation contentieuse — Impot sur le revenu'), 60, doc.y, { width: pageW })
    doc.moveDown(0.3)
    if (reclamation?.envoi) {
      doc.font('Italic').fontSize(8).fillColor(C.muted).text('Envoi : ' + reclamation.envoi, 60, doc.y)
    } else {
      doc.font('Italic').fontSize(8).fillColor(C.muted).text('Envoi recommande : LRAR ou messagerie securisee impots.gouv.fr', 60, doc.y)
    }

    // Corps
    doc.moveDown(1.5)
    if (reclamation?.corps) {
      // Remplacer les placeholders par les valeurs saisies par le client
      let corps = reclamation.corps as string
      // L'en-tête (expéditeur/destinataire/date/objet) est déjà écrit par le PDF ci-dessus
      // → on ne garde que le corps à partir de "Madame, Monsieur"
      const mmIdx = corps.indexOf('Madame, Monsieur')
      if (mmIdx > 0) corps = corps.substring(mmIdx)
      if (sensitiveData?.nom) {
        corps = corps.replace(/\[Vos nom et prénom\]/g, sensitiveData.nom)
        corps = corps.replace(/\[NOM PRENOM\]/g, sensitiveData.nom)
      }
      if (sensitiveData?.adresse) {
        corps = corps.replace(/\[Votre adresse\]/g, sensitiveData.adresse)
        corps = corps.replace(/\[ADRESSE\]/g, sensitiveData.adresse)
      }
      if (sensitiveData?.ville || sensitiveData?.codePostal) {
        const cpVille = (sensitiveData?.codePostal ? sensitiveData.codePostal + ' ' : '') + (sensitiveData?.ville || '')
        corps = corps.replace(/\[VILLE\]/g, cpVille.trim())
        corps = corps.replace(/A \[VILLE\], le/g, 'A ' + (sensitiveData?.ville || '[VILLE]') + ', le')
      }
      if (sensitiveData?.numeroFiscal) {
        corps = corps.replace(/\[VOTRE N° FISCAL[^\]]*\]/g, sensitiveData.numeroFiscal)
      }
      if (sensitiveData?.numeroAvis) {
        corps = corps.replace(/\[N° AVIS\]/g, sensitiveData.numeroAvis)
      }
      if (sensitiveData?.adresseCentre) {
        corps = corps.replace(/\[ADRESSE DE VOTRE CENTRE DES IMPÔTS[^\]]*\]/g, sensitiveData.adresseCentre)
      }
      doc.font('Body').fontSize(10).fillColor(C.text).text(corps, 60, doc.y, { width: pageW, lineGap: 3 })
    }

    // Pièces jointes
    if (reclamation?.pieces_jointes?.length) {
      doc.moveDown(1.5)
      doc.font('Bold').fontSize(9).fillColor(C.navy).text('Pieces jointes :', 60, doc.y)
      doc.moveDown(0.3)
      for (const pj of reclamation.pieces_jointes) {
        doc.font('Body').fontSize(9).fillColor(C.text).text('  - ' + pj, 60, doc.y)
        doc.moveDown(0.2)
      }
    }

    // Footer RECUPEO
    doc.font('Italic').fontSize(7).fillColor(C.muted)
    doc.text('Document genere par RECUPEO - recupeo.fr — Ce modele est fourni a titre indicatif.', 60, 780, { width: pageW, align: 'center' })

    doc.end()
  })
}
