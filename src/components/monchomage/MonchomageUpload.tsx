'use client'
import { useState, useRef, useCallback } from 'react'
import { track } from '@/lib/analytics'
import type { MonchomageExtractionResult } from '@/lib/monchomage/extract-types'

interface Props {
  onExtractionComplete: (extraction: MonchomageExtractionResult) => void
  onManualMode: () => void
}

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp'
const MAX_SIZE = 10 * 1024 * 1024
type UploadState = 'idle' | 'extracting' | 'vision_consent' | 'error'

export function MonchomageUpload({ onExtractionComplete, onManualMode }: Props) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<UploadState>('idle')
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_SIZE) return `"${file.name}" dépasse 10 Mo`
    const ext = file.name.toLowerCase().split('.').pop()
    if (!['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return `"${file.name}" : format non supporté`
    return null
  }

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles)
    for (const f of arr) { const err = validateFile(f); if (err) { setError(err); return } }
    setError(null)
    setFiles(prev => [...prev, ...arr])
  }, [])

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }, [addFiles])

  const extract = async (forceVision = false, visionConsent = false) => {
    setState('extracting'); setError(null)
    track({ event: 'upload_started', brique: 'monchomage', file_count: files.length })
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      if (forceVision) fd.append('forceVision', 'true')
      if (visionConsent) fd.append('visionConsent', 'true')
      const res = await fetch('/api/monchomage/extract', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.success) {
        if (data.needsVisionConsent) { setOcrConfidence(data.ocrConfidence); setState('vision_consent'); return }
        setError(data.error || "Erreur d'extraction"); setState('error'); return
      }
      track({ event: 'extraction_success', brique: 'monchomage', mode: data.extraction.mode })
      onExtractionComplete(data.extraction)
    } catch { setError('Erreur réseau.'); setState('error') }
  }

  return (
    <section id="upload" className="py-20 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text mb-3">
            Déposez vos documents France Travail
          </h2>
          <p className="text-slate-muted text-base max-w-[520px] mx-auto">
            Notre IA extrait automatiquement les données de votre notification, attestation employeur ou bulletins de paie.
          </p>
        </div>

        {/* Types de documents */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { icon: '📋', title: 'Notification de droits', desc: 'Courrier France Travail (ARE)', highlight: true },
            { icon: '📄', title: 'Attestation employeur', desc: 'Document remis par l\'employeur', highlight: false },
            { icon: '💰', title: 'Bulletins de paie', desc: 'Derniers 12-24 mois', highlight: false },
          ].map(d => (
            <div key={d.title} className={`rounded-xl border p-3 text-center ${d.highlight ? 'bg-emerald/5 border-emerald/30' : 'bg-white border-slate-border'}`}>
              <div className="text-xl mb-1">{d.icon}</div>
              <div className="text-xs font-semibold text-slate-text leading-tight">{d.title}</div>
              <div className="text-[10px] text-slate-muted mt-0.5">{d.desc}</div>
              {d.highlight && <div className="text-[9px] text-emerald font-bold mt-1">RECOMMANDÉ</div>}
            </div>
          ))}
        </div>

        {/* Drop zone */}
        {(state === 'idle' || state === 'error') && (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all min-h-[180px] flex flex-col items-center justify-center ${dragActive ? 'border-emerald bg-emerald/5' : 'border-slate-border hover:border-emerald/40 bg-white'}`}
            >
              <input ref={inputRef} type="file" accept={ACCEPTED} multiple onChange={e => e.target.files && addFiles(e.target.files)} className="hidden" />
              <div className="text-4xl mb-4">📎</div>
              <p className="font-semibold text-slate-text text-base mb-1">Glissez vos documents ici</p>
              <p className="text-sm text-slate-muted">ou cliquez pour sélectionner · PDF, JPG, PNG · 10 Mo max/fichier</p>
            </div>

            {error && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-xl border border-slate-border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{f.type === 'application/pdf' ? '📄' : '📸'}</span>
                      <div><div className="text-sm font-medium text-slate-text">{f.name}</div><div className="text-xs text-slate-muted">{(f.size / 1024).toFixed(0)} Ko</div></div>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-slate-muted hover:text-red-500 text-sm">✕</button>
                  </div>
                ))}
                <button onClick={() => extract()} className="cta-primary w-full justify-center mt-4">
                  Analyser {files.length} document{files.length > 1 ? 's' : ''} →
                </button>
              </div>
            )}
          </>
        )}

        {/* Extracting */}
        {state === 'extracting' && (
          <div className="p-8 bg-white rounded-2xl border border-emerald/20 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald/10 flex items-center justify-center">
              <svg className="animate-spin h-7 w-7 text-emerald" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            </div>
            <p className="text-base font-semibold text-slate-text mb-3">Analyse de vos documents en cours...</p>
            <div className="space-y-2">
              {['Identification du type de document', 'Extraction des montants et dates', 'Lecture des bulletins de paie', 'Anonymisation des données personnelles'].map((m, i) => (
                <p key={i} className="text-xs text-slate-muted animate-pulse" style={{ animationDelay: `${i * 2}s` }}>{m}...</p>
              ))}
            </div>
          </div>
        )}

        {/* Vision consent */}
        {state === 'vision_consent' && (
          <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-200">
            <div className="text-center mb-4">
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-heading font-bold text-slate-text text-lg mb-1">Document difficile à lire</h3>
              <p className="text-sm text-slate-muted">Confiance OCR : {ocrConfidence}%. Notre IA avancée peut analyser directement les images.</p>
            </div>
            <div className="p-3 bg-yellow-100/50 rounded-xl mb-4">
              <p className="text-xs text-yellow-800">Les images seront envoyées à l&apos;IA pour lecture visuelle. Les données personnelles sont anonymisées dans le rapport.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => extract(true, true)} className="cta-primary flex-1 justify-center">Autoriser l&apos;analyse avancée</button>
              <button onClick={() => { setState('idle'); onManualMode() }} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-slate-muted border border-slate-border hover:border-slate-text/30 transition-all">Remplir manuellement</button>
            </div>
          </div>
        )}

        {/* Manual mode link */}
        {(state === 'idle' || state === 'error') && (
          <div className="text-center mt-8">
            <button onClick={onManualMode} className="text-sm text-emerald-dark hover:text-emerald font-medium transition-colors">
              Je n&apos;ai pas mes documents sous la main — remplir manuellement →
            </button>
          </div>
        )}

        {/* Help */}
        {(state === 'idle' || state === 'error') && (
          <div className="mt-6 p-4 bg-navy/[0.03] rounded-xl border border-navy/10">
            <p className="text-xs font-semibold text-slate-text mb-1">💡 Où trouver vos documents ?</p>
            <p className="text-xs text-slate-muted leading-relaxed">
              <strong>Notification de droits :</strong> Espace personnel France Travail → Mes allocations → Notification d&apos;ouverture de droits (PDF).
              <strong> Attestation employeur :</strong> Espace France Travail → Mes documents.
              <strong> Bulletins :</strong> Votre espace RH ou vos archives.
            </p>
          </div>
        )}

        <div className="mt-4 p-4 bg-navy/[0.03] rounded-xl border border-navy/10">
          <p className="text-xs text-slate-muted text-center">🔒 Vos documents sont analysés localement (OCR), anonymisés, puis supprimés immédiatement.</p>
        </div>
      </div>
    </section>
  )
}
