import {z} from 'zod'
import {AI_INTENTS} from './intent.types'

export const IntentSchema = z.object({
  intent: z.enum(AI_INTENTS),
  confidence: z.number().min(0).max(1),
})

export type IntentResult = z.infer<typeof IntentSchema>
