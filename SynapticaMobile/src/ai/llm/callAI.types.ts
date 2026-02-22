import { AIIntent } from '@/ai/intent/intent.types'

export type CallAIParams = {
  model: string
  intent: AIIntent
  message?: string
  context: Record<string, unknown>
}

export type CallAIResponse = {
  intent: string
  summary: string
  domainActions: Array<{ type: string; payload: unknown }>
  explanations?: string[]
}
