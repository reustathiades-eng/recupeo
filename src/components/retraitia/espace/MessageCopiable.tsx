'use client'
import { useState } from 'react'

interface MessageCopiableProps {
  objet: string
  corps: string
  organisme: string
  guideEnvoi: string
}

export function MessageCopiable({ objet, corps, organisme, guideEnvoi }: MessageCopiableProps) {
  const [copied, setCopied] = useState(false)

  const fullText = `Objet : ${objet}\n\n${corps}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = fullText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <div>
          <p className="text-xs text-slate-muted">Destinataire</p>
          <p className="text-sm font-medium text-slate-text">{organisme}</p>
        </div>
        <button
          onClick={handleCopy}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
            copied
              ? 'bg-emerald/10 text-emerald'
              : 'bg-emerald text-[#060D1B] hover:bg-emerald-light'
          }`}
        >
          {copied ? '✅ Copie !' : '📋 Copier le message'}
        </button>
      </div>

      {/* Objet */}
      <div className="px-4 py-2 border-b border-slate-100">
        <p className="text-xs text-slate-muted">Objet</p>
        <p className="text-sm text-slate-text">{objet}</p>
      </div>

      {/* Corps */}
      <div className="px-4 py-3">
        <pre className="text-sm text-slate-text whitespace-pre-wrap font-sans leading-relaxed">
          {corps}
        </pre>
      </div>

      {/* Guide d'envoi */}
      <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
        <p className="text-xs font-medium text-blue-700 mb-1">📖 Ou envoyer ce message ?</p>
        <p className="text-xs text-blue-600">{guideEnvoi}</p>
      </div>
    </div>
  )
}
