import {z} from 'zod'

export const StrategySchema = z.object({
  goal: z.string(),
  priorities: z.array(z.string()),
  constraints: z.array(z.string()),
  updatedAt: z.string().datetime().optional(),
})

export const PlanActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['habit', 'training', 'measurement']),
  schedule: z.string().optional(),
  status: z.enum(['pending', 'done', 'skipped']),
  impact: z.array(z.string()),
})

export const PlanStateSchema = z.object({
  strategy: StrategySchema,
  actions: z.array(PlanActionSchema),
})
