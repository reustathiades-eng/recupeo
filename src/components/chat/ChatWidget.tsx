'use client'
// ============================================================
// RÉCUPÉO — Chat IA Widget (flottant, toutes les pages)
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChatMessage } from './ChatMessage'
import { useAuth } from '@/components/auth/useAuth'
import { track } from '@/lib/analytics'
import { SUGGESTIONS, WELCOME } from '@/lib/chat/constants'
import type { ChatMessage as ChatMsg, ChatCTA, ChatContext } from '@/lib/chat/types'

function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function detectBrique(pathname: string): string | undefined {
  const briques = ['macaution', 'monloyer', 'retraitia', 'mataxe', 'mapension', 'mabanque', 'monchomage', 'monimpot']
  for (const b of briques) {
    if (pathname.startsWith(`/${b}`)) return b
  }
  return undefined
}

function getPageKey(pathname: string): string {
  if (pathname.startsWith('/mon-espace')) return 'mon-espace'
  const brique = detectBrique(pathname)
  return brique || 'home'
}

export function ChatWidget() {
  const pathname = usePathname()
  const router = useRouter()
  const { authenticated, user } = useAuth()

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [cta, setCta] = useState<ChatCTA | null>(null)
  const [pulse, setPulse] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const pageKey = getPageKey(pathname)
  const currentBrique = detectBrique(pathname)

  // Scroll auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingId])

  // Focus input on open
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Init suggestions + welcome on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMsg = WELCOME[pageKey] || WELCOME.home
      setMessages([{
        id: generateId(),
        role: 'assistant',
        content: welcomeMsg,
        timestamp: Date.now(),
      }])
      setSuggestions(SUGGESTIONS[pageKey] || SUGGESTIONS.home)
    }
  }, [open, pageKey, messages.length])

  // Pulse toutes les 30s
  useEffect(() => {
    if (open) { setPulse(false); return }
    const interval = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 2000)
    }, 30_000)
    return () => clearInterval(interval)
  }, [open])

  const buildContext = useCallback((): ChatContext => ({
    currentPage: pathname,
    currentBrique,
    userId: user?.id,
    userName: user?.firstName,
    usedBriques: [], // TODO: fetch from dashboard
  }), [pathname, currentBrique, user])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: ChatMsg = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    }

    const assistantId = generateId()
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setStreamingId(assistantId)
    setSuggestions([])
    setCta(null)

    // Add empty assistant message for streaming
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }])

    track({ event: 'chat_message_sent', brique: pageKey })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          context: buildContext(),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur' }))
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: err.error || 'Erreur. Réessayez.' } : m
        ))
        setLoading(false)
        setStreamingId(null)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))

            if (event.type === 'chunk' && event.content) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + event.content } : m
              ))
            } else if (event.type === 'done') {
              if (event.suggestions?.length) setSuggestions(event.suggestions)
              if (event.cta) setCta(event.cta)
            } else if (event.type === 'error') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: event.content || 'Erreur.' } : m
              ))
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      console.error('[CHAT] Error:', err)
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: 'Désolé, une erreur est survenue. Réessayez.' } : m
      ))
    } finally {
      setLoading(false)
      setStreamingId(null)
    }
  }

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    track({ event: next ? 'chat_opened' : 'chat_closed', brique: pageKey })
  }

  // Ne pas afficher sur /admin ou /api
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return null

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/30 z-[998]" onClick={() => setOpen(false)} />
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-0 right-0 md:bottom-24 md:right-6 z-[999]
          w-full h-[100dvh] md:w-[400px] md:h-[600px] md:rounded-2xl
          bg-slate-bg border border-slate-200 shadow-2xl flex flex-col overflow-hidden
          
        ">
          {/* Header */}
          <div className="bg-navy px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-bold">Conseiller RÉCUPÉO</p>
                <p className="text-white/40 text-[11px]">Assistant IA</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white p-1 transition-colors"
              aria-label="Fermer le chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {messages.map(msg => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                isStreaming={msg.id === streamingId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* CTA */}
          {cta && (
            <div className="px-4 pb-2">
              <button
                onClick={() => {
                  track({ event: 'chat_cta_clicked', brique: pageKey, url: cta.url })
                  router.push(cta.url)
                  setOpen(false)
                }}
                className="w-full py-2.5 bg-emerald text-navy text-sm font-bold rounded-xl hover:bg-emerald/90 transition-colors"
              >
                {cta.label}
              </button>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && !loading && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    track({ event: 'chat_suggestion_clicked', brique: pageKey })
                    sendMessage(s)
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-navy font-medium hover:border-emerald/50 hover:bg-emerald/5 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(input) }}
                placeholder="Posez votre question..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-navy placeholder:text-slate-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald disabled:opacity-50 transition-all"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-emerald rounded-xl flex items-center justify-center hover:bg-emerald/90 transition-colors disabled:opacity-50 flex-shrink-0"
                aria-label="Envoyer"
              >
                <svg className="w-4 h-4 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-slate-muted/60 text-center mt-2">
              Assistant IA — Ne remplace pas un professionnel du droit.
            </p>
          </div>
        </div>
      )}

      {/* FAB Button */}
      {!open && (
        <button
          onClick={handleToggle}
          className={`fixed bottom-6 right-6 z-[997] w-14 h-14 bg-emerald rounded-full shadow-lg flex items-center justify-center hover:bg-emerald/90 hover:scale-105 transition-all ${
            pulse ? 'animate-pulse ring-4 ring-emerald/30' : ''
          }`}
          aria-label="Ouvrir le chat"
        >
          <svg className="w-6 h-6 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
    </>
  )
}
