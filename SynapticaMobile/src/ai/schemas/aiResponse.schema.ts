import {z} from 'zod'
import {ParsedJournalSchema} from './journal.schema'
import {StrategySchema, PlanActionSchema} from './plan.schema'

export const AllowedDomainActions = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('journal/entryParsed'),
    payload: z.object({
      id: z.string(),
      parsed: ParsedJournalSchema,
    }),
  }),

  z.object({
    type: z.literal('plan/strategyUpdated'),
    payload: StrategySchema,
  }),

  z.object({
    type: z.literal('plan/actionsReplaced'),
    payload: z.array(PlanActionSchema),
  }),
])

export const AIResponseSchema = z.object({
  intent: z.string(),
  summary: z.string(),
  domainActions: z.array(AllowedDomainActions),
  explanations: z.array(z.string()).optional(),
})

export type AIResponse = z.infer<typeof AIResponseSchema>
