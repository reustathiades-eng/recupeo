// ============================================================
// RÉCUPÉO — OCR local (Tesseract) + Conversion PDF→Images
// ============================================================
// Pipeline : PDF/Image → Images PNG → Tesseract OCR → Texte + score
// Tout reste sur le serveur, aucune donnée ne sort.
// ============================================================
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import * as crypto from 'crypto'

const execAsync = promisify(exec)

/** Résultat OCR pour un document */
export interface OCRResult {
  /** Texte extrait par Tesseract */
  text: string
  /** Score de confiance moyen (0-100) */
  confidence: number
  /** Nombre de pages traitées */
  pageCount: number
  /** Score par page */
  pageScores: Array<{ page: number; confidence: number; charCount: number }>
  /** Le document est-il exploitable en mode texte ? */
  isUsable: boolean
}

/** Seuil en-dessous duquel on considère l'OCR comme non fiable */
const CONFIDENCE_THRESHOLD = 70

/**
 * Extraction NATIVE du texte d'un PDF via pdftotext (poppler).
 * Beaucoup plus rapide et fiable que Tesseract pour les PDF textuels
 * (avis d'imposition téléchargés de impots.gouv, factures, etc.)
 * Retourne null si le PDF est scanné (pas de texte extractible).
 */
async function extractNativePDFText(buffer: Buffer, tmpDir: string): Promise<string | null> {
  const pdfPath = path.join(tmpDir, 'input.pdf')
  await fs.writeFile(pdfPath, buffer)

  try {
    const { stdout } = await execAsync(
      `pdftotext -layout "${pdfPath}" -`,
      { timeout: 10000, maxBuffer: 2 * 1024 * 1024 }
    )
    const text = stdout.trim()

    // Un PDF textuel produit au moins 50 caractères significatifs
    const significantChars = text.replace(/[\s\n\r]/g, '').length
    if (significantChars < 50) return null

    return text
  } catch {
    return null
  }
}

/**
 * Convertit un buffer (PDF ou image) en texte via OCR local.
 * 
 * Flow :
 *   1. Si PDF → pdftoppm → images PNG (une par page)
 *   2. Pour chaque image → Tesseract OCR (fra+eng)
 *   3. Retourne texte concaténé + score de confiance
 *
 * IMPORTANT : utilise un dossier temporaire unique, nettoyé après traitement.
 * Aucun fichier ne persiste sur le serveur.
 */
export async function extractTextFromDocument(
  buffer: Buffer,
  mimeType: string,
  originalName?: string
): Promise<OCRResult> {
  // Créer un dossier temporaire unique
  const tmpDir = path.join(os.tmpdir(), `recupeo-ocr-${crypto.randomUUID()}`)
  await fs.mkdir(tmpDir, { recursive: true })

  try {
    let imagePaths: string[] = []

    if (mimeType === 'application/pdf') {
      // 1. Essayer l'extraction NATIVE (pdftotext) — rapide et fiable pour les PDF textuels
      const nativeText = await extractNativePDFText(buffer, tmpDir)
      if (nativeText && nativeText.length > 100) {
        // PDF textuel détecté — pas besoin de Tesseract !
        console.log('[ocr] PDF textuel détecté (' + nativeText.length + ' chars) — extraction native')
        const pageBreaks = nativeText.split('\f').filter(p => p.trim().length > 0)
        const pageCount = Math.max(pageBreaks.length, 1)
        return {
          text: pageBreaks.map((p, i) => '--- PAGE ' + (i + 1) + ' ---\n' + p.trim()).join('\n\n'),
          confidence: 95,  // pdftotext est très fiable sur les PDF textuels
          pageCount,
          pageScores: pageBreaks.map((p, i) => ({
            page: i + 1,
            confidence: 95,
            charCount: p.replace(/\s/g, '').length,
          })),
          isUsable: true,
        }
      }

      // 2. Sinon, PDF scanné → pipeline images + Tesseract
      imagePaths = await pdfToImages(buffer, tmpDir)
    } else if (mimeType.startsWith('image/')) {
      // Image directe → sauvegarder temporairement
      const ext = mimeType === 'image/png' ? 'png' : 'jpg'
      const imgPath = path.join(tmpDir, `page-1.${ext}`)
      await fs.writeFile(imgPath, buffer)
      imagePaths = [imgPath]
    } else {
      throw new Error(`Type de fichier non supporté pour l'OCR : ${mimeType}`)
    }

    if (imagePaths.length === 0) {
      return { text: '', confidence: 0, pageCount: 0, pageScores: [], isUsable: false }
    }

    // OCR chaque page
    const pageResults: Array<{ page: number; text: string; confidence: number; charCount: number }> = []

    for (let i = 0; i < imagePaths.length; i++) {
      const result = await ocrImage(imagePaths[i])
      pageResults.push({
        page: i + 1,
        text: result.text,
        confidence: result.confidence,
        charCount: result.text.replace(/\s/g, '').length,
      })
    }

    // Calculer le score global (moyenne pondérée par nombre de caractères)
    const totalChars = pageResults.reduce((sum, p) => sum + p.charCount, 0)
    const weightedConfidence = totalChars > 0
      ? pageResults.reduce((sum, p) => sum + p.confidence * p.charCount, 0) / totalChars
      : 0

    const fullText = pageResults.map(p => {
      return `--- PAGE ${p.page} ---\n${p.text}`
    }).join('\n\n')

    return {
      text: fullText,
      confidence: Math.round(weightedConfidence),
      pageCount: imagePaths.length,
      pageScores: pageResults.map(p => ({
        page: p.page,
        confidence: p.confidence,
        charCount: p.charCount,
      })),
      isUsable: weightedConfidence >= CONFIDENCE_THRESHOLD,
    }
  } finally {
    // NETTOYAGE — toujours supprimer le dossier temporaire
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  }
}

/**
 * Convertit un PDF en images PNG via pdftoppm (poppler-utils).
 * Résolution : 300 DPI (bon compromis qualité/taille pour OCR).
 */
async function pdfToImages(pdfBuffer: Buffer, tmpDir: string): Promise<string[]> {
  const pdfPath = path.join(tmpDir, 'document.pdf')
  await fs.writeFile(pdfPath, pdfBuffer)

  const outputPrefix = path.join(tmpDir, 'page')

  // pdftoppm : -png pour format PNG, -r 300 pour 300 DPI
  await execAsync(
    `pdftoppm -png -r 300 "${pdfPath}" "${outputPrefix}"`,
    { timeout: 60000 } // 60s max
  )

  // Lister les images générées (page-01.png, page-02.png, ...)
  const files = await fs.readdir(tmpDir)
  const imageFiles = files
    .filter(f => f.startsWith('page-') && f.endsWith('.png'))
    .sort()
    .map(f => path.join(tmpDir, f))

  // Supprimer le PDF original immédiatement
  await fs.unlink(pdfPath).catch(() => {})

  return imageFiles
}

/**
 * OCR une image via Tesseract.
 * Retourne le texte + score de confiance moyen.
 */
async function ocrImage(imagePath: string): Promise<{ text: string; confidence: number }> {
  const outputBase = imagePath.replace(/\.[^.]+$/, '') + '_ocr'

  try {
    // Tesseract avec français + anglais, mode PSM 3 (auto page segmentation)
    // --oem 3 = LSTM + legacy (meilleur résultat)
    // tsv output pour récupérer les scores de confiance
    await execAsync(
      `tesseract "${imagePath}" "${outputBase}" -l fra+eng --oem 3 --psm 3 tsv`,
      { timeout: 30000 }
    )

    // Lire le fichier TSV pour extraire confiance
    const tsvContent = await fs.readFile(`${outputBase}.tsv`, 'utf-8')
    const { text, confidence } = parseTesseractTSV(tsvContent)

    return { text, confidence }
  } catch (error) {
    // Si Tesseract échoue, retourner un score 0
    console.error(`[OCR] Erreur Tesseract sur ${path.basename(imagePath)}:`, error)
    return { text: '', confidence: 0 }
  } finally {
    // Nettoyer les fichiers de sortie Tesseract
    await fs.unlink(`${outputBase}.tsv`).catch(() => {})
    await fs.unlink(`${outputBase}.txt`).catch(() => {})
  }
}

/**
 * Parse la sortie TSV de Tesseract pour extraire texte et confiance.
 * Format TSV : level  page_num  block_num  par_num  line_num  word_num  left  top  width  height  conf  text
 */
function parseTesseractTSV(tsv: string): { text: string; confidence: number } {
  const lines = tsv.trim().split('\n')
  if (lines.length <= 1) return { text: '', confidence: 0 }

  const words: string[] = []
  const confidences: number[] = []
  let currentLine = -1
  let currentPar = -1

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t')
    if (cols.length < 12) continue

    const level = parseInt(cols[0])
    const parNum = parseInt(cols[3])
    const lineNum = parseInt(cols[4])
    const conf = parseInt(cols[10])
    const text = cols[11]?.trim()

    // Nouveau paragraphe → saut de ligne double
    if (level === 5 && parNum !== currentPar && words.length > 0) {
      words.push('\n')
      currentPar = parNum
    }

    // Nouveau ligne → saut de ligne
    if (level === 5 && lineNum !== currentLine && words.length > 0) {
      if (words[words.length - 1] !== '\n') {
        words.push('\n')
      }
      currentLine = lineNum
    }

    // Mot avec du texte
    if (text && text.length > 0 && conf >= 0) {
      words.push(text)
      // Ne compter que les mots avec confiance réelle (pas -1)
      if (conf > 0) {
        confidences.push(conf)
      }
    }
  }

  const fullText = words.join(' ')
    .replace(/ \n /g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const avgConfidence = confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0

  return { text: fullText, confidence: Math.round(avgConfidence) }
}

/**
 * Convertit une image en base64 pour Claude Vision (fallback).
 * Redimensionne à 1568px max (recommandation Anthropic).
 */
export async function imageToBase64ForVision(
  buffer: Buffer,
  mimeType: string
): Promise<{ base64: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' }> {
  // Pour le redimensionnement, on utilise convert (ImageMagick) s'il est disponible
  // Sinon on envoie tel quel
  const tmpDir = path.join(os.tmpdir(), `recupeo-vision-${crypto.randomUUID()}`)
  await fs.mkdir(tmpDir, { recursive: true })

  try {
    const inputPath = path.join(tmpDir, `input.${mimeType === 'image/png' ? 'png' : 'jpg'}`)
    const outputPath = path.join(tmpDir, 'output.jpg')
    await fs.writeFile(inputPath, buffer)

    // Tenter un redimensionnement avec convert (ImageMagick)
    try {
      await execAsync(
        `convert "${inputPath}" -resize "1568x1568>" -quality 85 "${outputPath}"`,
        { timeout: 10000 }
      )
      const resizedBuffer = await fs.readFile(outputPath)
      return {
        base64: resizedBuffer.toString('base64'),
        mediaType: 'image/jpeg',
      }
    } catch {
      // ImageMagick pas dispo → envoyer tel quel
      return {
        base64: buffer.toString('base64'),
        mediaType: (mimeType === 'image/png' ? 'image/png' : mimeType === 'image/webp' ? 'image/webp' : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp',
      }
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  }
}

/**
 * Convertit un PDF entier en images base64 pour Claude Vision (fallback).
 */
export async function pdfToBase64Images(
  pdfBuffer: Buffer
): Promise<Array<{ base64: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' }>> {
  const tmpDir = path.join(os.tmpdir(), `recupeo-pdf-vision-${crypto.randomUUID()}`)
  await fs.mkdir(tmpDir, { recursive: true })

  try {
    const imagePaths = await pdfToImages(pdfBuffer, tmpDir)
    const results: Array<{ base64: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' }> = []

    for (const imgPath of imagePaths) {
      const imgBuffer = await fs.readFile(imgPath)
      const converted = await imageToBase64ForVision(imgBuffer, 'image/png')
      results.push(converted)
    }

    return results
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  }
}
