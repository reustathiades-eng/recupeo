// ============================================================
// RETRAITIA V2 — Generateur PDF rapport (pdfkit)
// ============================================================
// 10 sections. Pattern identique a monimpot/pdf-generator.ts.
// ============================================================

import PDFDocument from 'pdfkit'
import path from 'path'
import fs from 'fs'
import type { DiagnosticResult, CalculResult, DossierFormulaire, DossierExtractions, DetectedAnomaly } from '../types'

const C = {
  navy: '#0B1426', emerald: '#00B377', emeraldDark: '#00996A', emeraldLight: '#E6F9F1',
  white: '#FFFFFF', text: '#1E293B', muted: '#64748B', border: '#E2E8F0', bgLight: '#F7F9FC',
  red: '#DC2626', redLight: '#FEE2E2', amber: '#D97706', blue: '#2563EB', blueLight: '#EFF6FF',
}

const FONTS_DIR = path.join(process.cwd(), 'assets', 'fonts')
const LOGO_PATH = path.join(process.cwd(), 'assets', 'logo-recupeo.png')
const W = 495
const LM = 50 // left margin
const TOP = 60
const BOT = 770

function regFonts(doc: PDFKit.PDFDocument) {
  try {
    doc.registerFont('Body', path.join(FONTS_DIR, 'DMSans-Regular.woff'))
    doc.registerFont('Bold', path.join(FONTS_DIR, 'DMSans-Bold.woff'))
    doc.registerFont('Medium', path.join(FONTS_DIR, 'DMSans-Medium.woff'))
  } catch {
    // Fallback: use built-in Helvetica
  }
}

function fmtN(n: number): string {
  return Math.round(n).toLocaleString('fr-FR')
}

// ─── Input ───

interface ReportInput {
  formulaire: DossierFormulaire
  diagnostic: DiagnosticResult
  calcul: CalculResult
  extractions: DossierExtractions
  dossierId: string
}

// ─── Generateur principal ───

export function generateRetraitiaPDF(input: ReportInput): Buffer {
  const doc = new PDFDocument({ size: 'A4', margin: LM, bufferPages: true })
  regFonts(doc)

  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))

  const { formulaire, diagnostic, calcul, dossierId } = input
  const nom = `${formulaire.identite.prenom} ${formulaire.identite.nom}`
  const ref = dossierId.substring(0, 8).toUpperCase()

  // ── Section 1 : Couverture ──
  drawCover(doc, input, nom, ref)

  // ── Section 2 : Resume executif ──
  doc.addPage()
  drawPageHeader(doc, ref, 'RESUME EXECUTIF')
  drawExecutiveSummary(doc, input, nom)

  // ── Section 4 : Anomalies detaillees ──
  doc.addPage()
  drawPageHeader(doc, ref, 'ANOMALIES DETECTEES')
  drawAnomalies(doc, diagnostic.anomalies)

  // ── Section 5 : Recalcul ──
  if (calcul.cnav?.sam || calcul.cnav?.taux) {
    doc.addPage()
    drawPageHeader(doc, ref, 'RECALCUL DE VOTRE PENSION')
    drawRecalcul(doc, calcul)
  }

  // ── Section 6 : Guide d'action ──
  doc.addPage()
  drawPageHeader(doc, ref, 'GUIDE D\'ACTION')
  drawActionGuide(doc, diagnostic.anomalies)

  // ── Section 9 : Barometre + Section 10 : Mentions legales ──
  doc.addPage()
  drawPageHeader(doc, ref, 'FIABILITE ET MENTIONS LEGALES')
  drawBarometer(doc, diagnostic)
  drawLegalNotice(doc)

  doc.end()
  return Buffer.concat(chunks)
}

// ─── Helpers graphiques ───

function drawPageHeader(doc: PDFKit.PDFDocument, ref: string, title: string) {
  doc.save()
  doc.rect(0, 0, 595.28, 36).fill(C.navy)
  try { if (fs.existsSync(LOGO_PATH)) doc.image(LOGO_PATH, 12, 4, { width: 28, height: 28 }) } catch {}
  doc.font('Bold').fontSize(7.5).fillColor(C.emerald).text('RECUPEO', 46, 12)
  doc.font('Body').fontSize(6.5).fillColor(C.white).text(`Ref: ${ref}`, 480, 14, { align: 'right', width: 80 })
  doc.restore()
  doc.font('Bold').fontSize(16).fillColor(C.navy).text(title, LM, TOP)
  doc.moveTo(LM, TOP + 22).lineTo(LM + W, TOP + 22).strokeColor(C.emerald).lineWidth(2).stroke()
  doc.y = TOP + 35
}

function drawCover(doc: PDFKit.PDFDocument, input: ReportInput, nom: string, ref: string) {
  doc.rect(0, 0, 595.28, 842).fill(C.navy)
  try { if (fs.existsSync(LOGO_PATH)) doc.image(LOGO_PATH, 220, 80, { width: 160 }) } catch {}

  doc.font('Bold').fontSize(28).fillColor(C.white).text('RAPPORT D\'AUDIT RETRAITE', LM, 260, { width: W, align: 'center' })
  doc.moveTo(220, 300).lineTo(380, 300).strokeColor(C.emerald).lineWidth(3).stroke()

  doc.font('Body').fontSize(13).fillColor('#94A3B8')
  doc.text(`Prepare pour : ${nom}`, LM, 330, { width: W, align: 'center' })
  doc.text(`Ne(e) le ${input.formulaire.identite.dateNaissance}`, { width: W, align: 'center' })
  doc.text(`Reference : ${ref}`, { width: W, align: 'center' })
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, { width: W, align: 'center' })

  // Score
  const d = input.diagnostic
  const scoreColors: Record<string, string> = { BRONZE: '#DC2626', ARGENT: '#EA580C', OR: '#D97706', PLATINE: '#00B377' }
  const y = 450
  doc.roundedRect(180, y, 240, 120, 12).fillAndStroke(C.white, C.border)
  doc.font('Body').fontSize(10).fillColor(C.muted).text('Score de fiabilite', 180, y + 12, { width: 240, align: 'center' })
  doc.font('Bold').fontSize(32).fillColor(scoreColors[d.scoreGlobal] || C.red).text(d.scoreGlobal, 180, y + 30, { width: 240, align: 'center' })
  doc.font('Body').fontSize(10).fillColor(C.text).text(`${d.anomalies.length} anomalies detectees`, 180, y + 72, { width: 240, align: 'center' })
  doc.text(`Impact : ~${fmtN(d.impactMensuelTotal.max)}EUR/mois`, 180, y + 86, { width: 240, align: 'center' })

  doc.font('Body').fontSize(9).fillColor('#64748B').text(`Precision de l'audit : ${d.precisionAudit}%`, LM, 610, { width: W, align: 'center' })
  doc.text(`Documents analyses : ${d.documentsUtilises.length}`, { width: W, align: 'center' })
  doc.font('Body').fontSize(8).fillColor('#475569').text('recupeo.fr/retraitia', LM, 760, { width: W, align: 'center' })
}

function drawExecutiveSummary(doc: PDFKit.PDFDocument, input: ReportInput, nom: string) {
  const d = input.diagnostic
  const f = input.formulaire
  let y = doc.y + 10

  doc.font('Bold').fontSize(11).fillColor(C.text).text('Profil', LM, y)
  y += 18
  doc.font('Body').fontSize(9).fillColor(C.muted)
  doc.text(`${nom} · Ne(e) en ${new Date(f.identite.dateNaissance).getFullYear()} · ${f.enfants.nombreEnfants} enfants`, LM, y)
  y += 14
  if (f.carriere.retraiteDateDepart) {
    doc.text(`Depart en retraite : ${f.carriere.retraiteDateDepart}`, LM, y)
    y += 14
  }

  y += 10
  doc.font('Bold').fontSize(11).fillColor(C.text).text('Resultats de l\'audit', LM, y)
  y += 18
  doc.font('Body').fontSize(9).fillColor(C.muted)
  doc.text(`Score : ${d.scoreGlobal} · ${d.anomalies.length} anomalies detectees`, LM, y); y += 14

  const certaines = d.anomalies.filter(a => a.confiance === 'CERTAIN').length
  const hautes = d.anomalies.filter(a => a.confiance === 'HAUTE_CONFIANCE').length
  const estimees = d.anomalies.filter(a => a.confiance === 'ESTIMATION').length
  doc.text(`${certaines} verifiees · ${hautes} calculees · ${estimees} estimees`, LM, y); y += 20

  doc.font('Bold').fontSize(11).fillColor(C.text).text('Impact financier', LM, y); y += 18
  doc.font('Body').fontSize(9).fillColor(C.muted)
  doc.text(`Manque a gagner mensuel : ${fmtN(d.impactMensuelTotal.min)} a ${fmtN(d.impactMensuelTotal.max)}EUR/mois`, LM, y); y += 14
  if (d.impactCumulePasseTotal > 0) {
    doc.text(`Deja perdu : ~${fmtN(d.impactCumulePasseTotal)}EUR`, LM, y); y += 14
  }
  doc.text(`Impact futur estime : ${fmtN(d.impactCumuleFuturTotal.min)} a ${fmtN(d.impactCumuleFuturTotal.max)}EUR`, LM, y)
}

function drawAnomalies(doc: PDFKit.PDFDocument, anomalies: DetectedAnomaly[]) {
  let y = doc.y + 10
  const confBadge: Record<string, string> = { CERTAIN: '🟢 Verifie', HAUTE_CONFIANCE: '🔵 Calcule', ESTIMATION: '🟡 Estime' }
  const confColor: Record<string, string> = { CERTAIN: C.emerald, HAUTE_CONFIANCE: C.blue, ESTIMATION: C.amber }

  for (const [i, a] of anomalies.entries()) {
    if (y > BOT - 80) { doc.addPage(); drawPageHeader(doc, '', 'ANOMALIES (SUITE)'); y = doc.y + 10 }

    // Box
    const boxH = 65
    doc.roundedRect(LM, y, W, boxH, 6).fillAndStroke(C.bgLight, C.border)

    // Numero + label
    doc.font('Bold').fontSize(9).fillColor(C.text).text(`#${i + 1} ${a.label}`, LM + 10, y + 8, { width: W - 120 })

    // Badge confiance
    doc.font('Body').fontSize(7).fillColor(confColor[a.confiance] || C.muted).text(confBadge[a.confiance] || a.confiance, LM + W - 100, y + 8)

    // Detail
    doc.font('Body').fontSize(7.5).fillColor(C.muted).text(a.detail, LM + 10, y + 22, { width: W - 20, lineBreak: true })

    // Impact
    doc.font('Bold').fontSize(8).fillColor(C.red).text(`${fmtN(a.impactMensuel.min)}-${fmtN(a.impactMensuel.max)}EUR/mois`, LM + 10, y + boxH - 16)
    doc.font('Body').fontSize(7).fillColor(C.muted).text(`${a.organisme} · ${a.delaiEstime}`, LM + 200, y + boxH - 16)

    y += boxH + 6
  }
}

function drawRecalcul(doc: PDFKit.PDFDocument, calcul: CalculResult) {
  let y = doc.y + 10
  const c = calcul.cnav
  if (!c) return

  doc.font('Body').fontSize(9).fillColor(C.muted)

  if (c.sam) {
    doc.font('Bold').fontSize(9).fillColor(C.text).text('SAM (Salaire Annuel Moyen)', LM, y); y += 14
    doc.font('Body').fontSize(8).fillColor(C.muted).text(`Recalcule : ${fmtN(c.sam.value)}EUR`, LM + 10, y); y += 12
    if (c.samNotification) { doc.text(`Notification : ${fmtN(c.samNotification)}EUR`, LM + 10, y); y += 12 }
    y += 8
  }

  if (c.taux) {
    doc.font('Bold').fontSize(9).fillColor(C.text).text('Taux de liquidation', LM, y); y += 14
    doc.font('Body').fontSize(8).fillColor(C.muted).text(`Recalcule : ${c.taux.value}%`, LM + 10, y); y += 12
    if (c.tauxNotification) { doc.text(`Notification : ${c.tauxNotification}%`, LM + 10, y); y += 12 }
    if (c.decote) { doc.text(`Decote : ${c.decote.trimestres} trimestres (-${c.decote.impact.toFixed(2)}%)`, LM + 10, y); y += 12 }
    if (c.surcote) { doc.text(`Surcote : ${c.surcote.trimestres} trimestres (+${c.surcote.impact.toFixed(2)}%)`, LM + 10, y); y += 12 }
    y += 8
  }

  if (c.pensionBruteMensuelle) {
    doc.font('Bold').fontSize(9).fillColor(C.text).text('Pension mensuelle brute recalculee', LM, y); y += 14
    doc.font('Bold').fontSize(12).fillColor(C.emerald).text(`${fmtN(c.pensionBruteMensuelle.value)}EUR/mois`, LM + 10, y)
  }
}

function drawActionGuide(doc: PDFKit.PDFDocument, anomalies: DetectedAnomaly[]) {
  let y = doc.y + 10
  const actions = anomalies.filter(a => a.categorie !== 'opportunite')

  doc.font('Body').fontSize(9).fillColor(C.muted).text(
    `${actions.length} demarches a effectuer. Commencez par les anomalies au plus fort impact.`, LM, y
  )
  y += 20

  for (const [i, a] of actions.entries()) {
    if (y > BOT - 50) { doc.addPage(); drawPageHeader(doc, '', 'GUIDE D\'ACTION (SUITE)'); y = doc.y + 10 }

    doc.font('Bold').fontSize(9).fillColor(C.text).text(`${i + 1}. ${a.label}`, LM, y); y += 14
    doc.font('Body').fontSize(8).fillColor(C.muted)
    doc.text(`Organisme : ${a.organisme}`, LM + 10, y); y += 11
    doc.text(`Canal : message en ligne (copier-coller depuis votre espace client)`, LM + 10, y); y += 11
    doc.text(`Delai estime : ${a.delaiEstime}`, LM + 10, y); y += 11
    doc.text(`Difficulte : ${a.faciliteCorrection}`, LM + 10, y); y += 16
  }
}

function drawBarometer(doc: PDFKit.PDFDocument, d: DiagnosticResult) {
  let y = doc.y + 10
  doc.font('Bold').fontSize(11).fillColor(C.text).text('Barometre de fiabilite', LM, y); y += 18
  doc.font('Body').fontSize(8).fillColor(C.muted)
  doc.text(`Precision de l'audit : ${d.precisionAudit}%`, LM, y); y += 12
  doc.text(`Documents analyses : ${d.documentsUtilises.join(', ')}`, LM, y); y += 12
  doc.text(`Date de generation : ${new Date(d.dateGeneration).toLocaleDateString('fr-FR')}`, LM, y); y += 12
  doc.text('Methodologie : recalcul deterministe base sur les formules officielles CNAV, Agirc-Arrco et CSS.', LM, y, { width: W }); y += 20
  doc.text('Limites : les estimations dependent de la completude des documents fournis. Les niveaux de confiance sont indiques pour chaque anomalie.', LM, y, { width: W })
  doc.y = y + 30
}

function drawLegalNotice(doc: PDFKit.PDFDocument) {
  let y = doc.y + 10
  if (y > BOT - 100) { doc.addPage(); y = TOP }
  doc.font('Bold').fontSize(11).fillColor(C.text).text('Mentions legales', LM, y); y += 18
  doc.font('Body').fontSize(7).fillColor(C.muted)
  const text = `RECUPEO n'est ni avocat, ni mandataire, ni intermediaire en operations de retraite. RECUPEO est un outil d'aide a l'analyse et un assistant administratif automatise. Le client reste le signataire de tout courrier et de toute demarche. Les calculs sont bases sur les formules officielles et les donnees fournies par le client. En cas de doute, le client est invite a consulter un professionnel du droit ou sa caisse de retraite. Conformement a l'article L.377-1 du Code de la Securite Sociale, tout intermediaire remunere faisant les demarches retraite a la place du client est passible de sanctions. RECUPEO ne fait pas les demarches a la place du client : il fournit les outils, le client agit.`
  doc.text(text, LM, y, { width: W, lineGap: 2 })
}
