// ============================================================
// RETRAITIA V2 — Generateur PDF rapport (pdfkit)
// ============================================================
// 10 sections. Pattern identique a monimpot/pdf-generator.ts.
// ============================================================

import PDFDocument from 'pdfkit'
import path from 'path'
import fs from 'fs'
import type { DiagnosticResult, CalculResult, DossierFormulaire, DossierExtractions, DetectedAnomaly, SimulationResult, RachatResult, ReportVariant, ReversionResult } from '../types'

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
  variant?: ReportVariant
  simulation?: SimulationResult
  rachat?: RachatResult
  reversion?: ReversionResult
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

  // ── Section 7 : Simulations (pre-retraites uniquement) ──
  if (input.variant === 'preretraite' && input.simulation) {
    doc.addPage()
    drawPageHeader(doc, ref, 'SIMULATION DE VOS SCENARIOS DE DEPART')
    drawSimulationTable(doc, input.simulation)
  }

  // ── Section 7b : Rachat de trimestres (pre-retraites) ──
  if (input.variant === 'preretraite' && input.rachat && input.rachat.scenarios.length > 0) {
    doc.addPage()
    drawPageHeader(doc, ref, 'ANALYSE RACHAT DE TRIMESTRES')
    drawRachatAnalysis(doc, input.rachat)
  }

  // ── Section reversion (reversion uniquement) ──
  if (input.variant === 'reversion' && input.reversion) {
    doc.addPage()
    drawPageHeader(doc, ref, 'ELIGIBILITE REVERSION PAR REGIME')
    drawReversionEligibilite(doc, input.reversion)

    doc.addPage()
    drawPageHeader(doc, ref, 'RECAPITULATIF DE VOS DROITS')
    drawReversionRecap(doc, input.reversion)
  }

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


// ─── Sections pre-retraite ───

function drawSimulationTable(doc: PDFKit.PDFDocument, sim: SimulationResult) {
  let y = doc.y + 10

  // Intro
  doc.font('Body').fontSize(10).fillColor(C.text)
  doc.text(`Trimestres actuels : ${sim.trimestresActuels}`, LM, y)
  y += 15
  doc.text(`Age du taux plein : ${sim.ageTauxPlein} ans (${sim.anneeTauxPlein})`, LM, y)
  y += 25

  // Table header
  const cols = ['Age', 'Annee', 'Trim.', 'Taux', 'Decote', 'Base', 'Compl.', 'TOTAL']
  const colW = [40, 45, 40, 45, 45, 60, 60, 65]
  let x = LM

  doc.font('Bold').fontSize(8).fillColor(C.white)
  doc.rect(LM, y, W, 18).fill(C.navy)
  for (let i = 0; i < cols.length; i++) {
    doc.text(cols[i], x + 3, y + 4, { width: colW[i] - 6, align: 'center' })
    x += colW[i]
  }
  y += 18

  // Rows
  for (const s of sim.scenarios) {
    const isRecommande = s.recommande
    if (isRecommande) {
      doc.rect(LM, y, W, 18).fill(C.emeraldLight)
    } else if (sim.scenarios.indexOf(s) % 2 === 0) {
      doc.rect(LM, y, W, 18).fill(C.bgLight)
    }

    doc.font(isRecommande ? 'Bold' : 'Body').fontSize(8).fillColor(C.text)
    x = LM
    const vals = [
      `${s.age} ans`,
      String(s.annee),
      `${s.trimestresTotal}/${s.trimestresRequis}`,
      `${s.taux}%`,
      s.decotePct > 0 ? `-${s.decotePct}%` : s.surcotePct > 0 ? `+${s.surcotePct}%` : '0%',
      `${fmtN(s.pensionBaseMensuelle)}EUR`,
      `${fmtN(s.pensionComplementaireMensuelle)}EUR`,
      `${fmtN(s.pensionTotaleMensuelle)}EUR`,
    ]
    for (let i = 0; i < vals.length; i++) {
      doc.text(vals[i], x + 3, y + 4, { width: colW[i] - 6, align: 'center' })
      x += colW[i]
    }
    y += 18
  }

  // Recommendation
  const rec = sim.scenarioRecommande
  if (rec) {
    y += 15
    doc.font('Bold').fontSize(9).fillColor(C.emeraldDark)
    doc.text(`Recommandation : depart a ${rec.age} ans (${rec.annee})`, LM, y)
    y += 14
    doc.font('Body').fontSize(9).fillColor(C.text)
    if (rec.note) doc.text(rec.note, LM, y)
    y += 14
    const ref62 = sim.scenarios[0]
    if (ref62 && rec.age > ref62.age) {
      const diff = rec.pensionTotaleMensuelle - ref62.pensionTotaleMensuelle
      doc.text(`Ecart vs ${ref62.age} ans : +${fmtN(diff)}EUR/mois`, LM, y)
    }
  }

  doc.y = y + 20
}

function drawRachatAnalysis(doc: PDFKit.PDFDocument, rachat: RachatResult) {
  let y = doc.y + 10

  doc.font('Body').fontSize(10).fillColor(C.text)
  doc.text(`Trimestres manquants : ${rachat.trimestresManquants}`, LM, y)
  y += 15
  doc.text(`Trimestres rachetables (etudes) : ${rachat.trimestresRachetables}`, LM, y)
  y += 25

  for (const s of rachat.scenarios) {
    // Box par scenario
    const h = 70
    const bgColor = s.rentable ? C.emeraldLight : C.bgLight
    doc.rect(LM, y, W, h).fill(bgColor)
    doc.rect(LM, y, W, h).stroke(s.rentable ? C.emeraldDark : C.border)

    doc.font('Bold').fontSize(9).fillColor(C.text)
    const optionLabel = s.option === 'taux' ? 'Option taux seul' : 'Option taux + duree'
    doc.text(`${s.nbTrimestres} trimestre(s) — ${optionLabel}`, LM + 10, y + 8)

    doc.font('Body').fontSize(8).fillColor(C.muted)
    doc.text(`Cout estime : ${fmtN(s.coutEstime)}EUR`, LM + 10, y + 22)
    doc.text(`Gain : +${fmtN(s.gainMensuel)}EUR/mois`, LM + 10, y + 34)
    doc.text(`Temps de retour : ${s.tempsRetourAnnees} ans`, LM + 10, y + 46)

    // Badge rentable
    doc.font('Bold').fontSize(9).fillColor(s.rentable ? C.emeraldDark : C.red)
    doc.text(s.rentable ? 'RENTABLE' : 'PAS RENTABLE', LM + W - 100, y + 28, { width: 80, align: 'right' })

    y += h + 10
    if (y > BOT - 80) { doc.addPage(); y = TOP }
  }

  // Recommandation finale
  y += 10
  doc.font('Bold').fontSize(9).fillColor(C.navy)
  doc.text('Recommandation :', LM, y)
  y += 14
  doc.font('Body').fontSize(9).fillColor(C.text)
  doc.text(rachat.recommandation, LM, y, { width: W })

  doc.y = y + 30
}


// ─── Sections reversion ───

function drawReversionEligibilite(doc: PDFKit.PDFDocument, rev: ReversionResult) {
  let y = doc.y + 10

  doc.font('Body').fontSize(10).fillColor(C.text)
  doc.text(`Deces il y a ${rev.moisDepuisDeces} mois`, LM, y)
  y += 15

  if (rev.alerteRemariage) {
    doc.font('Bold').fontSize(9).fillColor(C.red)
    doc.text('Le remariage ou PACS entraine la perte du droit a reversion dans la plupart des regimes.', LM, y, { width: W })
    y += 25
  }

  if (rev.alerteRetroactivite) {
    doc.font('Body').fontSize(9).fillColor(C.amber)
    doc.text(`Attention : la retroactivite est limitee a 12 mois pour les regimes de base. En faisant votre demande maintenant, vous preservez le maximum de vos droits.`, LM, y, { width: W })
    y += 30
  }

  // Box par regime
  for (const r of rev.regimes) {
    const h = 75
    const bg = r.eligible ? C.emeraldLight : '#FEF2F2'
    const border = r.eligible ? C.emeraldDark : '#FECACA'
    doc.rect(LM, y, W, h).fill(bg)
    doc.rect(LM, y, W, h).stroke(border)

    // Header
    doc.font('Bold').fontSize(10).fillColor(C.navy)
    doc.text(r.label, LM + 10, y + 8, { width: W - 120 })

    // Badge
    doc.font('Bold').fontSize(9).fillColor(r.eligible ? C.emeraldDark : C.red)
    doc.text(r.eligible ? 'ELIGIBLE' : 'NON ELIGIBLE', LM + W - 100, y + 8, { width: 80, align: 'right' })

    doc.font('Body').fontSize(8).fillColor(C.muted)
    if (r.eligible) {
      doc.text(`Taux : ${r.taux}%`, LM + 10, y + 24)
      doc.text(`Estimation : ${fmtN(r.montantEstime.min)} - ${fmtN(r.montantEstime.max)}EUR/mois`, LM + 10, y + 36)
      doc.text(`Retroactivite : ${r.retroactiviteIllimitee ? 'illimitee' : r.retroactiviteMois + ' mois'}`, LM + 10, y + 48)
      doc.text(`Canal : ${r.canal}`, LM + 10, y + 60)
    } else {
      doc.text(`Motif : ${r.motifIneligibilite || 'Non eligible'}`, LM + 10, y + 28)
    }

    y += h + 8
    if (y > BOT - 90) { doc.addPage(); drawPageHeader(doc, '', 'ELIGIBILITE (suite)'); y = doc.y + 10 }
  }

  doc.y = y + 10
}

function drawReversionRecap(doc: PDFKit.PDFDocument, rev: ReversionResult) {
  let y = doc.y + 10

  // Tableau recap
  doc.font('Bold').fontSize(8).fillColor(C.white)
  doc.rect(LM, y, W, 18).fill(C.navy)
  const cols = ['Regime', 'Taux', 'Estimation mensuelle', 'Retroactivite']
  const colW = [180, 60, 130, 125]
  let x = LM
  for (let i = 0; i < cols.length; i++) {
    doc.text(cols[i], x + 5, y + 4, { width: colW[i] - 10, align: i === 0 ? 'left' : 'center' })
    x += colW[i]
  }
  y += 18

  for (const r of rev.regimes.filter(r => r.eligible)) {
    doc.rect(LM, y, W, 18).fill(rev.regimes.indexOf(r) % 2 === 0 ? C.bgLight : C.white)
    doc.font('Body').fontSize(8).fillColor(C.text)
    x = LM
    const vals = [
      r.label,
      `${r.taux}%`,
      `${fmtN(r.montantEstime.min)} - ${fmtN(r.montantEstime.max)}EUR`,
      r.retroactiviteIllimitee ? 'illimitee' : `${r.retroactiviteMois} mois`,
    ]
    for (let i = 0; i < vals.length; i++) {
      doc.text(vals[i], x + 5, y + 4, { width: colW[i] - 10, align: i === 0 ? 'left' : 'center' })
      x += colW[i]
    }
    y += 18
  }

  // Total
  y += 5
  doc.rect(LM, y, W, 24).fill(C.navy)
  doc.font('Bold').fontSize(10).fillColor(C.white)
  doc.text('TOTAL REVERSION ESTIMEE', LM + 10, y + 6)
  doc.text(`${fmtN(rev.totalEstimeMensuel.min)} - ${fmtN(rev.totalEstimeMensuel.max)}EUR/mois`, LM + W - 200, y + 6, { width: 180, align: 'right' })
  y += 30

  // Retroactivite totale
  if (rev.retroactiviteTotale.max > 0) {
    doc.font('Body').fontSize(9).fillColor(C.text)
    doc.text(`Retroactivite totale estimee : ${fmtN(rev.retroactiviteTotale.min)} - ${fmtN(rev.retroactiviteTotale.max)}EUR`, LM, y)
    y += 20
  }

  doc.y = y + 10
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


/**
 * Genere 2 rapports PDF pour un pack couple.
 * Retourne un tableau de 2 buffers (un par dossier).
 */
export function generateCoupleReports(
  inputs: [ReportInput, ReportInput]
): [Buffer, Buffer] {
  return [
    generateRetraitiaPDF({ ...inputs[0], variant: 'retraite' }),
    generateRetraitiaPDF({ ...inputs[1], variant: 'retraite' }),
  ]
}
