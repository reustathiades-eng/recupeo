// ============================================================
// MONLOYER — Générateur PDF courriers (format LRAR)
// Pattern réutilisé de RETRAITIA
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

const LW = 485 // largeur utile (A4 - marges)

interface LetterData {
  title: string
  type: string
  content: string
}

interface ClientInfo {
  tenantName?: string
  tenantAddress?: string
  landlordName?: string
  landlordAddress?: string
  city?: string
}

/**
 * Génère un PDF contenant les 3 courriers MONLOYER (format LRAR).
 */
export function generateMonloyerLettersPDF(
  letters: {
    mise_en_demeure?: LetterData
    saisine_cdc?: LetterData
    signalement_prefecture?: LetterData
  },
  clientInfo?: ClientInfo
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 55, right: 55 },
      info: {
        Title: 'Courriers encadrement des loyers - RECUPEO',
        Author: 'RECUPEO - recupeo.fr',
      },
    })
    reg(doc)
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const letterTypes: Array<{ key: string; data: LetterData; destName: string; destAddress: string }> = []

    if (letters.mise_en_demeure) {
      letterTypes.push({
        key: 'mise_en_demeure',
        data: letters.mise_en_demeure,
        destName: clientInfo?.landlordName || '[NOM DU BAILLEUR]',
        destAddress: clientInfo?.landlordAddress || '[ADRESSE DU BAILLEUR]',
      })
    }
    if (letters.saisine_cdc) {
      letterTypes.push({
        key: 'saisine_cdc',
        data: letters.saisine_cdc,
        destName: 'Commission Departementale de Conciliation',
        destAddress: clientInfo?.city
          ? 'Prefecture de ' + clientInfo.city
          : '[PREFECTURE DU DEPARTEMENT]',
      })
    }
    if (letters.signalement_prefecture) {
      letterTypes.push({
        key: 'signalement_prefecture',
        data: letters.signalement_prefecture,
        destName: 'Monsieur/Madame le/la Prefet(e)',
        destAddress: clientInfo?.city
          ? 'Prefecture de ' + clientInfo.city
          : '[PREFECTURE DU DEPARTEMENT]',
      })
    }

    letterTypes.forEach((lt, idx) => {
      const letter = lt.data
      if (idx > 0) doc.addPage()

      // LRAR mention (top right)
      doc.font('Bold').fontSize(7.5).fillColor(C.red)
        .text(letter.type || 'Lettre recommandee avec accuse de reception', 55, 50, { align: 'right', width: LW })

      // Expéditeur (top left)
      doc.font('Body').fontSize(9).fillColor(C.text)
      doc.text(clientInfo?.tenantName || '[NOM PRENOM DU LOCATAIRE]', 55, 75)
      doc.text(clientInfo?.tenantAddress || '[ADRESSE DU LOCATAIRE]', 55, doc.y)

      // Destinataire (right side)
      doc.font('Bold').fontSize(9).fillColor(C.text)
      doc.text(lt.destName, 300, 125, { width: 240 })
      doc.font('Body').text(lt.destAddress, 300, doc.y, { width: 240 })

      // Date
      const lieu = clientInfo?.city || '[VILLE]'
      const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      doc.font('Body').fontSize(9).fillColor(C.text)
        .text(lieu + ', le ' + dateStr, 300, 190, { width: 240, align: 'right' })

      // Objet
      doc.font('Bold').fontSize(9.5).fillColor(C.navy)
        .text('Objet : ' + letter.title, 55, 220, { width: LW })
      doc.rect(55, doc.y + 4, LW, 0.5).fill(C.border)
      doc.moveDown(0.8)

      // Contenu - paragraphe par paragraphe
      const content = (letter.content || '').replace(/\\n/g, '\n')
      const paragraphs = content.split('\n').filter((p: string) => p.trim())
      for (const para of paragraphs) {
        doc.font('Serif').fontSize(9.5).fillColor(C.text)
          .text(para.trim(), 55, doc.y, { width: LW, align: 'justify', lineGap: 3 })
        doc.moveDown(0.3)
      }

      // Signature
      doc.moveDown(1.5)
      doc.font('Serif').fontSize(9.5).fillColor(C.text)
        .text(clientInfo?.tenantName || '[NOM PRENOM]', 300, doc.y, { width: 240, align: 'right' })
      doc.font('Italic').fontSize(7.5).fillColor(C.muted)
        .text('(Signature)', 300, doc.y + 3, { width: 240, align: 'right' })

      // Footer RECUPEO
      doc.font('Italic').fontSize(6.5).fillColor(C.muted)
        .text('Document genere par RECUPEO - recupeo.fr - Outil d\'aide, ne constitue pas un avis juridique', 55, 790, { width: LW, align: 'center' })
    })

    doc.end()
  })
}
