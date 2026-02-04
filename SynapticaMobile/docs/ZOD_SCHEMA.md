
# 🎯 Цели Zod в этой архитектуре

```txt
1. Валидировать ответы AI (жёстко)
2. Ограничить, что AI вообще может изменить
3. Обеспечить обратную совместимость
4. Сделать AI детерминированным
5. Изолировать доменные контракты от UI
```

---

# 📁 Рекомендуемое размещение

```
src/
 └─ ai/
     ├─ schemas/
     │   ├─ aiResponse.schema.ts
     │   ├─ health.schema.ts
     │   ├─ journal.schema.ts
     │   ├─ plan.schema.ts
     │   └─ domainAction.schema.ts
```

---

# 1️⃣ Базовая схема DomainAction (КРИТИЧНО)

```ts
// domainAction.schema.ts
import { z } from 'zod'

export const DomainActionSchema = z.object({
  type: z.string().min(1),
  payload: z.unknown(),
})

export type DomainAction = z.infer<typeof DomainActionSchema>
```

> ⚠️ payload валидируем позже — по типу экшена

---

# 2️⃣ Health schemas

```ts
// health.schema.ts
import { z } from 'zod'

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
```

---

# 3️⃣ Journal schemas

```ts
// journal.schema.ts
import { z } from 'zod'

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
```

---

# 4️⃣ Plan schemas (САМЫЕ ВАЖНЫЕ)

```ts
// plan.schema.ts
import { z } from 'zod'

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
```

---

# 5️⃣ Whitelist экшенов + payload schemas

```ts
// aiResponse.schema.ts
import { z } from 'zod'
import { DomainActionSchema } from './domainAction.schema'
import { ParsedJournalSchema } from './journal.schema'
import { StrategySchema, PlanActionSchema } from './plan.schema'

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
```

> ❗ Это **ключевая защита**
> AI **физически не может** изменить ничего вне whitelist.

---

# 6️⃣ Использование в aiMiddleware

```ts
import { AIResponseSchema } from '@/ai/schemas/aiResponse.schema'

const parsed = AIResponseSchema.parse(aiResponse)

// дальше безопасно:
parsed.domainActions.forEach(dispatch)
```

Если AI вернул мусор → exception → `ai/requestFailed`

---

# 7️⃣ Рекомендуемый PROMPT (ОБЯЗАТЕЛЬНО)

```txt
You must return JSON strictly matching this schema.
You are not allowed to invent new action types.
If no state update is required, return an empty domainActions array.
```

---

# 8️⃣ Почему это мощно

✅ AI стал **детерминированным процессором**
✅ State невозможно сломать
✅ Можно безопасно использовать auto-actions
✅ Можно логировать, воспроизводить и объяснять
✅ Можно менять модель без риска
