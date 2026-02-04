export const AI_INTENTS = [
  'journal_parse',
  'plan_update',
  'health_review',
  'chat_general',
] as const

export type AIIntent = typeof AI_INTENTS[number]
