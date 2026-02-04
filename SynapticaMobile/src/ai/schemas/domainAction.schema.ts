import {z} from 'zod'

export const DomainActionSchema = z.object({
  type: z.string().min(1),
  payload: z.unknown(),
})

export type DomainAction = z.infer<typeof DomainActionSchema>
