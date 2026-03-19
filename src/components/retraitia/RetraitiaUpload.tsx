'use client'
import { useState, useRef, useCallback } from 'react'
import { track } from '@/lib/analytics'

interface RetraitiaUploadProps {
  onFilesReady: (files: File[]) => void
  onManualMode: () => void
}

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp'
const MAX_SIZE = 10 * 1024 * 1024

export function RetraitiaUpload({ onFilesReady, onManualMode }: RetraitiaUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_SIZE) return `"${file.name}" dépasse 10 Mo`
    const ext = file.name.toLowerCase().split('.').pop()
    if (!['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return `"${file.name}" : format non supporté`
    return null
  }

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles)
    for (const f of arr) {
      const err = validateFile(f)
      if (err) { setError(err); return }
    }
    setError(null)
    setFiles(prev => [...prev, ...arr])
  }, [])

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }, [addFiles])

  return (
    <section id="upload" className="py-20 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text mb-3">
            Déposez vos documents retraite
          </h2>
          <p className="text-slate-muted text-base max-w-[500px] mx-auto">
            Notre IA extrait automatiquement vos trimestres, pensions et régimes pour préremplir le formulaire.
          </p>
        </div>

        {/* Types de documents acceptés */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { icon: '📄', title: 'Relevé de carrière (RIS)', desc: 'info-retraite.fr' },
            { icon: '📊', title: 'Estimation Globale (EIG)', desc: 'Courrier CNAV / CARSAT' },
            { icon: '📑', title: 'Relevé Agirc-Arrco', desc: 'agirc-arrco.fr' },
            { icon: '📬', title: 'Notification de retraite', desc: 'Courrier CNAV / CARSAT' },
            { icon: '📋', title: 'Bulletins de salaire', desc: 'Périodes à vérifier' },
            { icon: '🎖️', title: 'Livret militaire / ESS', desc: 'Service national' },
          ].map((d) => (
            <div key={d.title} className="bg-white rounded-xl border border-slate-border p-3 text-center">
              <div className="text-xl mb-1">{d.icon}</div>
              <div className="text-xs font-semibold text-slate-text leading-tight">{d.title}</div>
              <div className="text-[10px] text-slate-muted mt-0.5">{d.desc}</div>
            </div>
          ))}
        </div>

        {/* Zone de dépôt */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all min-h-[180px] flex flex-col items-center justify-center ${
            dragActive
              ? 'border-emerald bg-emerald/5'
              : 'border-slate-border hover:border-emerald/40 bg-white'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            multiple
            onChange={(e) => e.target.files && addFiles(e.target.files)}
            className="hidden"
          />
          <div className="text-4xl mb-4">📎</div>
          <p className="font-semibold text-slate-text text-base mb-1">
            Glissez vos documents ici
          </p>
          <p className="text-sm text-slate-muted">
            ou cliquez pour sélectionner · PDF, JPG, PNG · 10 Mo max par fichier
          </p>

        </div>

        {/* Erreur */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Fichiers ajoutés */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-xl border border-slate-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{f.type === 'application/pdf' ? '📄' : '🖼️'}</span>
                  <div>
                    <div className="text-sm font-medium text-slate-text">{f.name}</div>
                    <div className="text-xs text-slate-muted">{(f.size / 1024).toFixed(0)} Ko</div>
                  </div>
                </div>
                <button onClick={() => removeFile(i)} className="text-slate-muted hover:text-red-500 text-sm">✕</button>
              </div>
            ))}

            <button
              onClick={() => { track({ event: 'upload_completed', brique: 'retraitia', file_count: files.length }); onFilesReady(files) }}
              className="cta-primary w-full justify-center mt-4"
            >
              Analyser {files.length} document{files.length > 1 ? 's' : ''} →
            </button>
          </div>
        )}

        {/* Lien formulaire manuel */}
        <div className="text-center mt-8">
          <button onClick={onManualMode} className="text-sm text-emerald-dark hover:text-emerald font-medium transition-colors">
            Je préfère remplir le formulaire manuellement →
          </button>
        </div>

        {/* Réassurance RGPD */}
        <div className="mt-6 p-4 bg-navy/[0.03] rounded-xl border border-navy/10">
          <p className="text-xs text-slate-muted text-center">
            🔒 Vos documents sont analysés localement (OCR), anonymisés, puis supprimés immédiatement.
            Aucune donnée personnelle ne quitte nos serveurs sans votre consentement.
          </p>
        </div>
      </div>
    </section>
  )
}
