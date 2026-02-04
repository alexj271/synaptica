import {z} from 'zod'

export const ParsedJournalSchema = z.object({
  energy: z.number().min(1).max(10).optional(),
  stress: z.number().min(1).max(10).optional(),
  sleepComplaint: z.boolean().optional(),
  symptoms: z.array(z.string()).optional(),
})

export const JournalEntrySchema = z.object({
  id: z.string(),
  date: z.string().datetime(),
  rawText: z.string(),
  parsed: ParsedJournalSchema.optional(),
  source: z.enum(['manual', 'voice']),
})

export const JournalStateSchema = z.object({
  entries: z.array(JournalEntrySchema),
})
