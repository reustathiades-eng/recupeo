'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

// ─── Types ───

interface UploadResult {
  success: boolean
  rejected?: boolean
  method?: string
  confidence?: string
  score?: number
  summary?: string
  error?: string
  rejectionReason?: string
  validation?: {
    level: 'accepted' | 'illisible' | 'mauvais_type' | 'incomplet'
    accepted: boolean
    title: string
    message: string
    missingFields?: string[]
    tips?: string[]
    summary?: string
  }
}

interface DocumentUploaderProps {
  /** Type du document attendu (ris, notification_cnav, etc.) */
  documentType: string
  /** Label affiché ("Relevé de carrière (RIS)") */
  documentLabel: string
  /** ID du dossier */
  dossierId: string
  /** Callback après upload réussi */
  onSuccess: (result: UploadResult) => void
  /** Callback en cas d'erreur */
  onError?: (error: string) => void
  /** Fermer le composant */
  onClose: () => void
}

interface FileItem {
  id: string
  file: File
  preview: string
  name: string
  size: number
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 Mo
const MAX_FILES = 20
const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.heic'
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic']

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Composant principal ───

export function DocumentUploader({
  documentType,
  documentLabel,
  dossierId,
  onSuccess,
  onError,
  onClose,
}: DocumentUploaderProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)
  const dragItemRef = useRef<number | null>(null)

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.preview.startsWith('blob:')) URL.revokeObjectURL(f.preview)
      })
    }
  }, [files])

  // ─── Validation fichier ───
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} dépasse la taille maximale de 10 Mo`
    }
    const ext = file.name.toLowerCase().split('.').pop()
    if (!ext || !['pdf', 'jpg', 'jpeg', 'png', 'heic'].includes(ext)) {
      return `${file.name} : format non supporté. Formats acceptés : PDF, JPG, PNG`
    }
    return null
  }, [])

  // ─── Ajout de fichiers ───
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles)
    const errors: string[] = []

    // Vérifier limite
    if (files.length + arr.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} fichiers par upload`)
      return
    }

    const items: FileItem[] = []
    for (const file of arr) {
      const err = validateFile(file)
      if (err) {
        errors.push(err)
        continue
      }

      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const preview = isPDF ? '' : URL.createObjectURL(file)

      items.push({
        id: generateId(),
        file,
        preview,
        name: file.name,
        size: file.size,
      })
    }

    if (errors.length > 0) {
      setError(errors.join('\n'))
    } else {
      setError(null)
    }

    setFiles(prev => [...prev, ...items])
  }, [files.length, validateFile])

  // ─── Drag & Drop zone ───
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items?.length) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files)
    }
  }, [addFiles])

  // ─── Reorder drag (liste de fichiers) ───
  const handleItemDragStart = useCallback((index: number) => {
    dragItemRef.current = index
  }, [])

  const handleItemDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragItemRef.current === null || dragItemRef.current === index) return

    setFiles(prev => {
      const updated = [...prev]
      const item = updated.splice(dragItemRef.current!, 1)[0]
      updated.splice(index, 0, item)
      dragItemRef.current = index
      return updated
    })
  }, [])

  const handleItemDragEnd = useCallback(() => {
    dragItemRef.current = null
  }, [])

  // ─── Supprimer un fichier ───
  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id)
      if (item?.preview.startsWith('blob:')) URL.revokeObjectURL(item.preview)
      return prev.filter(f => f.id !== id)
    })
    setError(null)
    setResult(null)
  }, [])

  // ─── Upload ───
  const handleUpload = useCallback(async () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      // Si un seul fichier PDF → upload direct
      // Si plusieurs fichiers (photos) → on les envoie un par un pour assemblage serveur
      // Pour le MVP, on envoie le premier fichier (ou le PDF)
      const mainFile = files.length === 1
        ? files[0].file
        : files[0].file // TODO: assemblage multi-photos côté serveur

      const formData = new FormData()
      formData.append('file', mainFile)
      formData.append('dossierId', dossierId)
      formData.append('documentType', documentType)

      // Si multi-fichiers images, ajouter les fichiers additionnels
      if (files.length > 1) {
        files.forEach((f, i) => {
          if (i > 0) formData.append(`page_${i}`, f.file)
        })
        formData.append('multiPage', 'true')
        formData.append('pageCount', String(files.length))
      }

      // Simuler le progress (XHR natif pour progress réel)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval)
            return 85
          }
          return prev + Math.random() * 15
        })
      }, 300)

      const res = await fetch('/api/retraitia/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || `Erreur ${res.status}`)
        setResult({ success: false, error: data.error, rejectionReason: data.rejectionReason })
        onError?.(data.error || 'Erreur upload')
        return
      }

      setResult(data)
      if (data.success) {
        onSuccess(data)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur réseau'
      setError(msg)
      onError?.(msg)
    } finally {
      setUploading(false)
    }
  }, [files, dossierId, documentType, onSuccess, onError])

  // ─── Rendu ───
  const hasImages = files.some(f => f.preview)
  const hasPDF = files.some(f => f.file.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Uploader un document</h3>
            <p className="text-xs text-slate-500 mt-0.5">{documentLabel}</p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Résultat d'extraction (succès) */}
          {result?.success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-emerald-800 mb-1">✅ Document analysé avec succès</p>
              {result.summary && (
                <p className="text-xs text-emerald-700">{result.summary}</p>
              )}
              {result.confidence && (
                <p className="text-xs text-emerald-600 mt-1">Confiance : {result.confidence}</p>
              )}
            </div>
          )}

          {/* Résultat d'extraction (refus intelligent — 3 niveaux) */}
          {result && !result.success && result.validation && (
            <div className={`rounded-xl p-4 mb-4 border ${
              result.validation.level === 'incomplet'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm font-semibold mb-1 ${
                result.validation.level === 'incomplet' ? 'text-amber-800' : 'text-red-800'
              }`}>
                {result.validation.level === 'illisible' && '❌ '}
                {result.validation.level === 'mauvais_type' && '❌ '}
                {result.validation.level === 'incomplet' && '⚠️ '}
                {result.validation.title}
              </p>
              <p className={`text-xs mb-2 ${
                result.validation.level === 'incomplet' ? 'text-amber-700' : 'text-red-700'
              }`}>
                {result.validation.message}
              </p>

              {/* Champs manquants (niveau 3) */}
              {result.validation.missingFields && result.validation.missingFields.length > 0 && (
                <div className="mt-2 space-y-1">
                  {result.validation.missingFields.map((field, i) => (
                    <p key={i} className="text-xs text-amber-700">• ❌ {field}</p>
                  ))}
                </div>
              )}

              {/* Résumé partiel (niveau 3) */}
              {result.validation.summary && (
                <p className="text-xs text-slate-500 mt-2 italic">{result.validation.summary}</p>
              )}

              {/* Conseils */}
              {result.validation.tips && result.validation.tips.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200/50">
                  <p className={`text-xs font-medium mb-1 ${
                    result.validation.level === 'incomplet' ? 'text-amber-700' : 'text-red-700'
                  }`}>💡 Comment corriger :</p>
                  {result.validation.tips.map((tip, i) => (
                    <p key={i} className="text-xs text-slate-600">• {tip}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Erreur générique (sans validation structurée) */}
          {result && !result.success && !result.validation && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-red-800 mb-1">❌ Erreur</p>
              <p className="text-xs text-red-700">{result.error || 'Une erreur est survenue'}</p>
            </div>
          )}

          {/* Erreur générique */}
          {error && !result && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-amber-800 whitespace-pre-line">{error}</p>
            </div>
          )}

          {/* Zone de drop si pas encore de fichiers */}
          {files.length === 0 && !result?.success && (
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-200
                ${isDragging
                  ? 'border-emerald bg-emerald/5 scale-[1.01]'
                  : 'border-slate-200 hover:border-emerald/50 hover:bg-slate-50'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-4xl mb-3">{isDragging ? '📥' : '📄'}</div>
              <p className="text-sm font-medium text-slate-700">
                {isDragging ? 'Déposez ici' : 'Glissez votre document ici'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                ou cliquez pour sélectionner un fichier
              </p>
              <p className="text-xs text-slate-300 mt-3">
                PDF, JPG, PNG • Max 10 Mo par fichier
              </p>
              {/* Bouton mobile */}
              <div className="mt-4 flex justify-center gap-2 sm:hidden">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  className="text-sm font-semibold px-4 py-2.5 rounded-xl bg-emerald text-[#060D1B] active:scale-95 transition-transform"
                >
                  📤 Choisir un fichier
                </button>
              </div>
            </div>
          )}

          {/* Input file caché */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files)
              e.target.value = '' // reset pour pouvoir re-sélectionner
            }}
          />

          {/* Liste des fichiers sélectionnés */}
          {files.length > 0 && !result?.success && (
            <div className="mt-2">
              {files.length > 1 && (
                <p className="text-xs text-slate-500 mb-2">
                  📱 {files.length} pages — glissez pour réordonner
                </p>
              )}
              <div className="space-y-2">
                {files.map((item, index) => (
                  <div
                    key={item.id}
                    draggable={files.length > 1}
                    onDragStart={() => handleItemDragStart(index)}
                    onDragOver={(e) => handleItemDragOver(e, index)}
                    onDragEnd={handleItemDragEnd}
                    className={`
                      flex items-center gap-3 p-2.5 rounded-lg border border-slate-100
                      bg-white hover:bg-slate-50 transition-colors
                      ${files.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''}
                    `}
                  >
                    {/* Grip handle */}
                    {files.length > 1 && (
                      <span className="text-slate-300 text-xs select-none">⠿</span>
                    )}
                    {/* Page number */}
                    {files.length > 1 && (
                      <span className="text-xs font-mono text-slate-400 w-5 text-center">
                        {index + 1}
                      </span>
                    )}
                    {/* Thumbnail */}
                    {item.preview ? (
                      <img
                        src={item.preview}
                        alt={`Page ${index + 1}`}
                        className="w-10 h-12 object-cover rounded border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-12 flex items-center justify-center bg-red-50 rounded border border-red-200 text-xs font-bold text-red-400">
                        PDF
                      </div>
                    )}
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">{formatSize(item.size)}</p>
                    </div>
                    {/* Remove */}
                    {!uploading && (
                      <button
                        onClick={() => removeFile(item.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
                        aria-label={`Supprimer ${item.name}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Bouton ajouter d'autres fichiers */}
              {!uploading && !result && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs text-emerald font-medium hover:underline"
                >
                  + Ajouter d'autres pages
                </button>
              )}
            </div>
          )}

          {/* Barre de progression */}
          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Upload et analyse en cours…</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                {progress < 50
                  ? 'Upload du document…'
                  : progress < 85
                    ? 'Extraction des données…'
                    : 'Finalisation…'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer — boutons */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          {result?.success ? (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald text-[#060D1B] hover:bg-emerald-dark active:scale-[0.98] transition-all"
            >
              ✅ Terminé
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-5 py-3 rounded-xl font-medium text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={result && !result.success ? () => { setFiles([]); setResult(null); setError(null) } : handleUpload}
                disabled={files.length === 0 || uploading}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald text-[#060D1B] hover:bg-emerald-dark disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
              >
                {uploading
                  ? '⏳ Analyse en cours…'
                  : result && !result.success
                    ? '🔄 Réessayer'
                    : `📤 Envoyer${files.length > 1 ? ` (${files.length} pages)` : ''}`
                }
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
