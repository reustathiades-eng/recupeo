// ============================================================
// RETRAITIA V2 — Génération PDF courrier LRAR (pdfkit)
// ============================================================
// Génère un courrier formel avec références juridiques,
// prêt à l'envoi en recommandé.
// ============================================================

import PDFDocument from 'pdfkit'
import path from 'path'

const FONTS_DIR = path.join(process.cwd(), 'assets', 'fonts')

interface LRARPdfInput {
  expediteur: {
    nom: string
    adresse: string
    codePostal: string
    ville: string
    nir?: string
  }
  destinataire: {
    nom: string
    adresse: string
    codePostal: string
    ville: string
  }
  objet: string
  corps: string
  referencesJuridiques?: string[]
  date?: string
}

/**
 * Génère un PDF de courrier LRAR formel.
 */
export function generateLRARPdf(input: LRARPdfInput): Buffer {
  const doc = new PDFDocument({ size: 'A4', margin: 70 })
  const chunks: Buffer[] = []
  doc.on('data', (c: Buffer) => chunks.push(c))

  try {
    doc.registerFont('Body', path.join(FONTS_DIR, 'DMSans-Regular.woff'))
    doc.registerFont('Bold', path.join(FONTS_DIR, 'DMSans-Bold.woff'))
  } catch {
    // Fallback built-in
  }

  const LM = 70
  const W = 455
  const dateStr = input.date || new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // ── Expéditeur (haut gauche) ──
  doc.font('Body').fontSize(10).fillColor('#1E293B')
  doc.text(input.expediteur.nom, LM, 70)
  doc.text(input.expediteur.adresse)
  doc.text(`${input.expediteur.codePostal} ${input.expediteur.ville}`)
  if (input.expediteur.nir) {
    doc.text(`N° SS : ${input.expediteur.nir}`)
  }

  // ── Destinataire (droite) ──
  const destX = 320
  doc.text(input.destinataire.nom, destX, 140)
  doc.text(input.destinataire.adresse, destX)
  doc.text(`${input.destinataire.codePostal} ${input.destinataire.ville}`, destX)

  // ── Date et lieu ──
  doc.text(`Fait le ${dateStr}`, LM, 220)

  // ── Mention LRAR ──
  doc.font('Bold').fontSize(10)
  doc.text('Lettre recommandée avec accusé de réception', LM, 245)

  // ── Objet ──
  doc.moveDown(1)
  doc.font('Bold').fontSize(10).text(`Objet : ${input.objet}`, LM)

  // ── Corps ──
  doc.moveDown(1)
  doc.font('Body').fontSize(10)
  doc.text(input.corps, LM, doc.y, { width: W, lineGap: 4 })

  // ── Références juridiques ──
  if (input.referencesJuridiques && input.referencesJuridiques.length > 0) {
    doc.moveDown(1)
    doc.font('Bold').fontSize(9).text('Références juridiques :', LM)
    doc.font('Body').fontSize(9)
    for (const ref of input.referencesJuridiques) {
      doc.text(`• ${ref}`, LM + 10, doc.y, { width: W - 10 })
    }
  }

  // ── Formule de politesse ──
  doc.moveDown(2)
  doc.font('Body').fontSize(10)
  doc.text(`Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`, LM, doc.y, { width: W })

  // ── Signature ──
  doc.moveDown(2)
  doc.text(input.expediteur.nom, LM)

  // ── Pied de page ──
  doc.fontSize(7).fillColor('#94A3B8')
  doc.text(
    `Document généré par RÉCUPÉO (recupeo.fr) — Service d'aide à l'analyse de pension. RÉCUPÉO n'est ni avocat, ni mandataire.`,
    LM, 770, { width: W, align: 'center' }
  )

  doc.end()
  return Buffer.concat(chunks)
}
