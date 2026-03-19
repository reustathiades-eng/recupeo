// ============================================================
// Client Anthropic Claude API — Singleton
// ============================================================
import Anthropic from '@anthropic-ai/sdk'
import type {
  ImageBlockParam,
  TextBlockParam,
} from '@anthropic-ai/sdk/resources/messages/messages'

let client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables')
    }
    client = new Anthropic({ apiKey })
  }
  return client
}

/**
 * Appel Claude API avec gestion d'erreur.
 * Renvoie le texte de la réponse.
 */
export async function callClaude(options: {
  system: string
  userMessage: string
  maxTokens?: number
  temperature?: number
}): Promise<string> {
  const anthropic = getAnthropicClient()

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options.maxTokens ?? 4096,
    temperature: options.temperature ?? 0.3,
    system: options.system,
    messages: [
      { role: 'user', content: options.userMessage }
    ],
  })

  const textBlock = response.content.find(block => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude API')
  }
  return textBlock.text
}

/**
 * Appel Claude Vision API (multi-images).
 * Utilisé en FALLBACK uniquement quand l'OCR local n'est pas fiable.
 * 
 * ⚠️  RGPD : les images envoyées peuvent contenir des données personnelles.
 *     L'utilisateur DOIT avoir donné son consentement explicite avant cet appel.
 *     Les données extraites doivent être anonymisées immédiatement après.
 */
export async function callClaudeVision(options: {
  system: string
  images: Array<{ base64: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' }>
  textPrompt?: string
  maxTokens?: number
  temperature?: number
}): Promise<string> {
  const anthropic = getAnthropicClient()

  // Construire le contenu multimodal avec les types SDK
  const content: Array<ImageBlockParam | TextBlockParam> = []

  for (const img of options.images) {
    const imageBlock: ImageBlockParam = {
      type: 'image',
      source: {
        type: 'base64',
        media_type: img.mediaType,
        data: img.base64,
      },
    }
    content.push(imageBlock)
  }

  if (options.textPrompt) {
    const textBlock: TextBlockParam = { type: 'text', text: options.textPrompt }
    content.push(textBlock)
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options.maxTokens ?? 8192,
    temperature: options.temperature ?? 0.2,
    system: options.system,
    messages: [{ role: 'user', content }],
  })

  const textBlock = response.content.find(block => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude Vision API')
  }
  return textBlock.text
}
