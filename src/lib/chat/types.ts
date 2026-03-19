// ============================================================
// RÉCUPÉO — Chat IA Types
// ============================================================

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  suggestions?: string[]
  cta?: ChatCTA
}

export interface ChatCTA {
  label: string
  url: string
}

export interface ChatContext {
  currentPage: string
  currentBrique?: string
  userId?: string
  userName?: string
  usedBriques?: string[]
}

export interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  context: ChatContext
}

export interface ChatStreamEvent {
  type: 'chunk' | 'done' | 'error'
  content?: string
  suggestions?: string[]
  cta?: ChatCTA
}

export type ChatMode = 'orientation' | 'assistance' | 'post_achat'
