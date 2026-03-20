'use client'

import { useState, useRef, useCallback } from 'react'
import { track } from '@/lib/analytics'

interface Props {
  onExtractionComplete: (data: unknown) => void
  onManualMode: () => void
}

const ACCEPTED = '.pdf,.jpg,.jpeg,.png'
const MAX_SIZE = 10 * 1024 * 1024
const MAX_FILES = 12

type UploadState = 'idle' | 'extracting' | 'error' | 'done'

export function MapaieUpload({ onExtractionComplete, onManualMode }: Props) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<UploadState>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_SIZE) return `"${file.name}" depasse 10 Mo`
    const ext = file.name.toLowerCase().split('.').pop()
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext || '')) return `"${file.name}" : format non supporte`
    return null
  }

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming).slice(0, MAX_FILES)
    for (const f of arr) {
      const err = validateFile(f)
      if (err) { setError(err); return }
    }
    setError(null)
    setFiles(prev => [...prev, ...arr].slice(0, MAX_FILES))
  }, [])

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }, [addFiles])

  const extract = async () => {
    setState('extracting')
    setError(null)
    track({ event: 'mapaie_upload_started', brique: 'mapaie', file_count: files.length })

    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))

      const res = await fetch('/api/mapaie/extract', { method: 'POST', body: formData })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || "Erreur lors de l'extraction")
        setState('error')
        return
      }

      track({ event: 'mapaie_upload_completed', brique: 'mapaie', bulletin_count: files.length })
      setState('done')
      onExtractionComplete(data.extraction)
    } catch {
      setError('Erreur reseau. Veuillez reessayer.')
      setState('error')
    }
  }

  return (
    <section id="upload" className="py-20 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text mb-3">
            Deposez vos bulletins de paie
          </h2>
          <p className="text-slate-muted text-base max-w-[520px] mx-auto">
            Notre IA detecte les erreurs et <strong className="text-emerald">calcule ce que votre employeur vous doit</strong>.
          </p>
        </div>

        {(state === 'idle' || state === 'error') && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all min-h-[180px] flex flex-col items-center justify-center ${
                dragActive ? 'border-emerald bg-emerald/5' : 'border-slate-border hover:border-emerald/40 bg-white'
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
              <div className="text-4xl mb-4">📄</div>
              <p className="font-semibold text-slate-text text-base mb-1">Glissez vos bulletins de paie ici</p>
              <p className="text-sm text-slate-muted">ou cliquez pour selectionner · PDF, JPG, PNG · 10 Mo max · {MAX_FILES} bulletins max</p>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
            )}

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-xl border border-slate-border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{f.type === 'application/pdf' ? '📄' : '📸'}</span>
                      <div>
                        <div className="text-sm font-medium text-slate-text">{f.name}</div>
                        <div className="text-xs text-slate-muted">{(f.size / 1024).toFixed(0)} Ko</div>
                      </div>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-slate-muted hover:text-red-500 text-sm">&#x2715;</button>
                  </div>
                ))}
                <button onClick={extract} className="cta-primary w-full justify-center mt-4">
                  Analyser {files.length} bulletin{files.length > 1 ? 's' : ''} &#8594;
                </button>
              </div>
            )}

            <div className="text-center mt-8">
              <button onClick={onManualMode} className="text-sm text-emerald-dark hover:text-emerald font-medium transition-colors">
                Remplir manuellement sans upload &#8594;
              </button>
            </div>
          </>
        )}

        {state === 'extracting' && (
          <div className="p-8 bg-white rounded-2xl border border-emerald/20 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald/10 flex items-center justify-center">
              <svg className="animate-spin h-7 w-7 text-emerald" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-text mb-1">Analyse de vos bulletins en cours...</p>
            <p className="text-sm text-slate-muted">Detection des anomalies de paie</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-navy/[0.03] rounded-xl border border-navy/10">
          <p className="text-xs text-slate-muted text-center">
            &#128274; Vos bulletins sont analyses localement, anonymises, puis supprimes immediatement. Aucune donnee personnelle ne quitte nos serveurs sans votre consentement.
          </p>
        </div>
      </div>
    </section>
  )
}
