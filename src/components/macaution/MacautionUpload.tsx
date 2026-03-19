'use client'
import { useState, useRef, useCallback } from 'react'
import { track } from '@/lib/analytics'

interface MacautionUploadProps {
  onFilesReady: (files: File[]) => void
  onManualMode: () => void
}

const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp,.heic'
const ACCEPTED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
])
const MAX_FILE_SIZE = 10 * 1024 * 1024   // 10 Mo
const MAX_TOTAL_SIZE = 50 * 1024 * 1024  // 50 Mo
const MAX_FILE_COUNT = 20

const DOC_HINTS = [
  { icon: '📄', label: 'Bail / Contrat de location' },
  { icon: '📋', label: "État des lieux d'entrée" },
  { icon: '📋', label: 'État des lieux de sortie' },
  { icon: '✉️', label: 'Courrier du bailleur (détail des retenues)' },
  { icon: '🧾', label: 'Factures / Devis des travaux' },
  { icon: '📸', label: 'Photos du logement' },
]

export function MacautionUpload({ onFilesReady, onManualMode }: MacautionUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  const validateAndAddFiles = useCallback((newFiles: FileList | File[]) => {
    setError(null)
    const toAdd: File[] = []
    let runningTotal = totalSize

    for (const file of Array.from(newFiles)) {
      // Vérifier le type
      if (!ACCEPTED_TYPES.has(file.type)) {
        setError(`Format non supporté : ${file.name}. Utilisez PDF, JPG, PNG ou WEBP.`)
        continue
      }
      // Vérifier la taille individuelle
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" dépasse 10 Mo.`)
        continue
      }
      // Vérifier la taille totale
      if (runningTotal + file.size > MAX_TOTAL_SIZE) {
        setError('La taille totale dépasse 50 Mo.')
        break
      }
      // Vérifier le nombre max
      if (files.length + toAdd.length >= MAX_FILE_COUNT) {
        setError(`Maximum ${MAX_FILE_COUNT} fichiers.`)
        break
      }
      // Vérifier les doublons
      const isDuplicate = files.some(f => f.name === file.name && f.size === file.size)
      if (isDuplicate) continue

      toAdd.push(file)
      runningTotal += file.size
    }

    if (toAdd.length > 0) {
      setFiles(prev => [...prev, ...toAdd])
    }
  }, [files, totalSize])

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setError(null)
  }

  // Drag & Drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    if (e.type === 'dragleave') setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.length) {
      validateAndAddFiles(e.dataTransfer.files)
    }
  }, [validateAndAddFiles])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      validateAndAddFiles(e.target.files)
      e.target.value = ''  // Reset pour permettre re-upload du même fichier
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') return '📄'
    if (type.startsWith('image/')) return '🖼️'
    return '📎'
  }

  return (
    <section id="upload" className="py-16 bg-white">
      <div className="max-w-[800px] mx-auto px-6">
        <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text text-center mb-3">
          Déposez vos documents
        </h2>
        <p className="text-slate-muted text-center mb-10 max-w-[560px] mx-auto">
          Bail, états des lieux, courrier du bailleur... Notre IA analyse tout et extrait les informations automatiquement.
        </p>

        {/* Zone Drag & Drop */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer ${
            dragActive
              ? 'border-emerald bg-emerald/5 scale-[1.01]'
              : 'border-slate-border hover:border-emerald/50 hover:bg-slate-bg/50'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          {/* Icône centrale */}
          <div className="w-16 h-16 rounded-2xl bg-emerald/10 flex items-center justify-center text-3xl mx-auto mb-5">
            📎
          </div>

          <p className="font-heading font-bold text-slate-text text-lg mb-2">
            Glissez-déposez vos fichiers ici
          </p>
          <p className="text-slate-muted text-sm mb-5">
            PDF, JPG, PNG, WEBP — 10 Mo max par fichier
          </p>

          {/* Boutons */}
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
              className="px-5 py-2.5 bg-slate-text text-white rounded-lg text-sm font-semibold hover:bg-slate-text/90 transition-colors"
            >
              Choisir des fichiers
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); cameraRef.current?.click() }}
              className="px-5 py-2.5 border border-slate-border text-slate-text rounded-lg text-sm font-semibold hover:bg-slate-bg transition-colors md:hidden"
            >
              📷 Prendre en photo
            </button>
          </div>

          {/* Inputs cachés */}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleInputChange}
            className="hidden"
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>

        {/* Erreur */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Liste des fichiers déposés */}
        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-text">
                {files.length} document{files.length > 1 ? 's' : ''} déposé{files.length > 1 ? 's' : ''}{' '}
                <span className="text-slate-muted font-normal">({formatSize(totalSize)})</span>
              </span>
            </div>

            <div className="space-y-2">
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-3 p-3 bg-slate-bg rounded-lg border border-slate-border/50"
                >
                  <span className="text-xl">{getFileIcon(file.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-text truncate">{file.name}</p>
                    <p className="text-xs text-slate-muted">{formatSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-muted hover:text-red-500 transition-colors text-lg"
                    title="Supprimer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aide : quels documents déposer ? */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-sm text-emerald-dark font-semibold hover:underline"
          >
            {showHelp ? '▾' : '▸'} Quels documents déposer ?
          </button>
          {showHelp && (
            <div className="mt-3 grid sm:grid-cols-2 gap-2">
              {DOC_HINTS.map(doc => (
                <div
                  key={doc.label}
                  className="flex items-center gap-2.5 p-2.5 bg-slate-bg rounded-lg text-sm text-slate-text"
                >
                  <span className="text-base">{doc.icon}</span>
                  <span>{doc.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => { track({ event: 'upload_completed', brique: 'macaution', file_count: files.length }); onFilesReady(files) }}
            disabled={files.length === 0}
            className={`cta-primary !text-[17px] !py-[16px] !px-10 ${
              files.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            Analyser mes documents →
          </button>
          <button
            type="button"
            onClick={onManualMode}
            data-manual-mode
            className="text-sm text-slate-muted hover:text-emerald-dark transition-colors"
          >
            Je n&apos;ai pas de documents → Remplir manuellement
          </button>
        </div>
      </div>
    </section>
  )
}
