import {AIIntent} from './intent.types'
import {ruleClassifier} from './ruleClassifier'
import {aiClassifier} from './aiClassifier'

const globalCache = (globalThis as any).__intentCache as
  | Map<string, AIIntent>
  | undefined

const cache = globalCache ?? new Map<string, AIIntent>()

if (!globalCache) {
  ;(globalThis as any).__intentCache = cache
}

export async function detectIntent(action: any): Promise<AIIntent> {
  const ruleIntent = ruleClassifier(action.type, action.payload)
  if (ruleIntent) return ruleIntent

  if (action.type === 'chat/messageSent') {
    const text = action.payload?.text
    if (typeof text === 'string' && text.length > 0) {
      const cached = cache.get(text)
      if (cached) return cached

      const {intent, confidence} = await aiClassifier(text)
      if (confidence > 0.65) {
        cache.set(text, intent)
        return intent
      }

      cache.set(text, 'chat_general')
    }
  }

  return 'chat_general'
}

export function clearIntentCache() {
  cache.clear()
}
