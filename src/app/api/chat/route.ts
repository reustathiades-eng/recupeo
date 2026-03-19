// ============================================================
// POST /api/chat — Chat IA streaming SSE
// ============================================================
import { NextRequest } from 'next/server'
import { getAnthropicClient } from '@/lib/anthropic'
import { buildSystemPrompt } from '@/lib/chat/system-prompt'
import { checkRateLimit } from '@/lib/chat/rate-limiter'
import { SUGGESTIONS } from '@/lib/chat/constants'
import type { ChatRequestBody, ChatCTA } from '@/lib/chat/types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json()
    const { messages, context } = body

    if (!messages?.length) {
      return new Response(
        JSON.stringify({ error: 'Messages requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Rate limiting
    const sessionId = context.userId || request.headers.get('x-forwarded-for') || 'anon'
    const rateCheck = checkRateLimit(sessionId, !!context.userId)
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Trop de messages. Réessayez dans une minute.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(context)

    // Prepare messages (keep last 10 for context window)
    const recentMessages = messages.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Stream response via SSE
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropic = getAnthropicClient()

          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            temperature: 0.3,
            system: systemPrompt,
            messages: recentMessages,
            stream: true,
          })

          let fullText = ''

          for await (const event of response) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const chunk = event.delta.text
              fullText += chunk
              const data = JSON.stringify({ type: 'chunk', content: chunk })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Parse la réponse JSON du bot pour extraire suggestions/CTA
          let parsedSuggestions: string[] = []
          let parsedCTA: ChatCTA | null = null

          try {
            // Nettoyer les backticks markdown si présents
            let cleanText = fullText.trim()
            if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7)
            if (cleanText.startsWith('```')) cleanText = cleanText.slice(3)
            if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3)
            cleanText = cleanText.trim()

            const parsed = JSON.parse(cleanText)
            if (parsed.suggestions) parsedSuggestions = parsed.suggestions
            if (parsed.cta) parsedCTA = parsed.cta
          } catch {
            // Si le JSON est mal formé, on utilise les suggestions par défaut
            const pageKey = context.currentBrique || 'home'
            parsedSuggestions = SUGGESTIONS[pageKey] || SUGGESTIONS.home
          }

          // Envoyer l'event "done"
          const doneData = JSON.stringify({
            type: 'done',
            suggestions: parsedSuggestions,
            cta: parsedCTA,
          })
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`))
          controller.close()
        } catch (err) {
          console.error('[CHAT] Streaming error:', err)
          const errData = JSON.stringify({
            type: 'error',
            content: 'Désolé, une erreur est survenue. Réessayez.',
          })
          controller.enqueue(encoder.encode(`data: ${errData}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[CHAT] Route error:', err)
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
