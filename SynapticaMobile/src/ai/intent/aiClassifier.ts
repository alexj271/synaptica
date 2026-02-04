import {IntentSchema, IntentResult} from './intent.schema'
import {AIIntent} from './intent.types'
import {AI_ENV} from '@/config/ai'

export async function aiClassifier(text: string): Promise<IntentResult> {
  const response = await callIntentModel(text)
  return IntentSchema.parse(response)
}

async function callIntentModel(_text: string): Promise<{intent: AIIntent; confidence: number}> {
  if (!AI_ENV.OPENAI_API_KEY) {
    return {intent: 'chat_general', confidence: 0}
  }

  // TODO: wire real intent model call
  return {intent: 'chat_general', confidence: 0}
}
