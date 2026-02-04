import {z} from 'zod'

export const SleepSchema = z.object({
  duration: z.number().min(0),
  quality: z.number().min(0).max(100),
  trend: z.enum(['up', 'down', 'stable']),
  lastUpdated: z.string().datetime(),
})

export const PressureSchema = z.object({
  systolic: z.number(),
  diastolic: z.number(),
  measuredAt: z.string().datetime(),
})

export const WeightSchema = z.object({
  value: z.number(),
  measuredAt: z.string().datetime(),
})

export const HealthMetricsSchema = z.object({
  sleep: SleepSchema.optional(),
  pressure: PressureSchema.optional(),
  weight: WeightSchema.optional(),
})

export const SubjectiveHealthSchema = z.object({
  energy: z.number().min(1).max(10).optional(),
  stress: z.number().min(1).max(10).optional(),
  mood: z.string().optional(),
})

export const HealthStateSchema = z.object({
  metrics: HealthMetricsSchema,
  subjective: SubjectiveHealthSchema,
})
