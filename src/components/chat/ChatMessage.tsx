'use client'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  let displayContent = content

  if (role === 'assistant' && content.trim()) {
    try {
      let clean = content.trim()
      if (clean.startsWith('```json')) clean = clean.slice(7)
      if (clean.startsWith('```')) clean = clean.slice(3)
      if (clean.endsWith('```')) clean = clean.slice(0, -3)
      clean = clean.trim()
      const parsed = JSON.parse(clean)
      if (parsed.message) displayContent = parsed.message
    } catch {
      // Essayer d'extraire "message" du JSON partiel (streaming)
      const idx = content.indexOf('"message"')
      if (idx !== -1) {
        const colonIdx = content.indexOf(':', idx + 9)
        if (colonIdx !== -1) {
          const quoteStart = content.indexOf('"', colonIdx + 1)
          if (quoteStart !== -1) {
            // Trouver la fin du string JSON (guillemet non-escaped)
            let i = quoteStart + 1
            let extracted = ''
            while (i < content.length) {
              if (content[i] === '\\' && i + 1 < content.length) {
                if (content[i + 1] === 'n') extracted += '\n'
                else if (content[i + 1] === '"') extracted += '"'
                else extracted += content[i + 1]
                i += 2
              } else if (content[i] === '"') {
                break
              } else {
                extracted += content[i]
                i++
              }
            }
            if (extracted) displayContent = extracted
          }
        }
      }
    }
  }

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        role === 'user'
          ? 'bg-emerald/10 text-navy rounded-br-md'
          : 'bg-white border border-slate-100 text-slate-text rounded-bl-md shadow-sm'
      }`}>
        {displayContent}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-emerald/60 rounded-full ml-1 animate-pulse" />
        )}
      </div>
    </div>
  )
}
