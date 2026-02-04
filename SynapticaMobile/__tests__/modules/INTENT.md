Это **очень критичный слой** в AI-first приложении.
Хороший intent classifier:

* снижает стоимость AI
* уменьшает latency
* повышает предсказуемость
* предотвращает “LLM hallucination routing”

👉 Правильная стратегия — **Hybrid Intent Detection**:

```
FAST PATH  → rule-based
SMART PATH → AI classifier
FALLBACK   → safe default
```

Это архитектура уровня production AI systems.

---

# 🎯 Цель classifier-а

Преобразовать:

```
Redux Action → Intent → Context → Model
```

НЕ:

```
Text → LLM → "угадай что делать"
```

---

# Архитектурное правило №1

👉 **Intent — это НЕ NLP-задача.**
Это **routing-задача**.

Сначала пытаемся определить intent **без LLM**.

LLM — только если ambiguity.

---

# Рекомендуемая структура

```
src/ai/
 ├─ intent/
 │   ├─ detectIntent.ts
 │   ├─ ruleClassifier.ts
 │   ├─ aiClassifier.ts
 │   └─ intent.types.ts
```

---

# 1️⃣ Типы intent (фиксируем жестко)

⚠️ Intent должен быть ENUM.
Никаких свободных строк.

```ts
export const AI_INTENTS = [
  'journal_parse',
  'plan_update',
  'health_review',
  'chat_general',
] as const

export type AIIntent = typeof AI_INTENTS[number]
```

---

# 2️⃣ Rule-based classifier (быстрый)

## Главная идея:

**80% событий должны не доходить до AI classifier.**

---

### ruleClassifier.ts

```ts
import { AIIntent } from './intent.types'

export function ruleClassifier(
  actionType: string,
  payload: any,
): AIIntent | null {

  // ✅ deterministic routing по event type
  if (actionType === 'journal/entryAdded') {
    return 'journal_parse'
  }

  if (actionType === 'health/manualMetricAdded') {
    return 'health_review'
  }

  // Chat требует анализа текста
  if (actionType === 'chat/messageSent') {
    const text = payload?.text?.toLowerCase()

    if (!text) return 'chat_general'

    // ultra-fast keyword routing
    if (contains(text, ['plan', 'schedule', 'training'])) {
      return 'plan_update'
    }

    if (contains(text, ['pressure', 'sleep', 'weight'])) {
      return 'health_review'
    }

    if (contains(text, ['feel', 'felt', 'energy', 'tired'])) {
      return 'journal_parse'
    }

    return null // → AI classifier
  }

  return null
}

function contains(text: string, words: string[]) {
  return words.some(w => text.includes(w))
}
```

---

# 🔥 Важный принцип

НЕ делай сложный NLP тут.

Rule classifier должен быть:

* тупым
* быстрым
* explainable

Regex > ML.

---

# 3️⃣ AI Classifier (только при необходимости)

Вызывается если:

```
ruleClassifier === null
```

---

## Zod схема intent-а

```ts
import { z } from 'zod'
import { AI_INTENTS } from './intent.types'

export const IntentSchema = z.object({
  intent: z.enum(AI_INTENTS),
  confidence: z.number().min(0).max(1),
})
```

---

## aiClassifier.ts

```ts
import { IntentSchema } from './intent.schema'

export async function aiClassifier(text: string) {

  const response = await callIntentModel(text)

  return IntentSchema.parse(response)
}
```

---

## Prompt (очень важный)

```txt
Classify the user message into ONE of the intents:

- journal_parse
- plan_update
- health_review
- chat_general

Rules:

journal_parse:
User describing feelings, symptoms, sleep, fatigue.

plan_update:
User wants to change habits, schedule, strategy.

health_review:
User asks for analysis of metrics.

chat_general:
Everything else.

Return ONLY JSON:

{
 "intent": "...",
 "confidence": 0-1
}
```

---

# 4️⃣ Orchestrator (самое важное)

## detectIntent.ts

```ts
import { ruleClassifier } from './ruleClassifier'
import { aiClassifier } from './aiClassifier'
import { AIIntent } from './intent.types'

export async function detectIntent(
  action: any,
): Promise<AIIntent> {

  const ruleIntent = ruleClassifier(
    action.type,
    action.payload,
  )

  if (ruleIntent) return ruleIntent

  // fallback → AI
  if (action.type === 'chat/messageSent') {

    const { intent, confidence } =
      await aiClassifier(action.payload.text)

    // safety threshold
    if (confidence > 0.65) {
      return intent
    }
  }

  // safest default
  return 'chat_general'
}
```

---

# 🔥 Production Trick (очень советую)

## Intent Cache

Повторяющиеся сообщения — обычное дело.

```
"Analyze my sleep"
"Analyze my sleep"
"Analyze my sleep"
```

Не надо 3 LLM calls.

---

### простой cache

```ts
const cache = new Map<string, AIIntent>()

if (cache.has(text)) {
  return cache.get(text)!
}

cache.set(text, intent)
```

Можно потом заменить на LRU.

---

# 🚨 Самая частая ошибка

### ❌ Пускать ВСЕ chat сообщения в AI classifier.

Это:

* дорого
* медленно
* нестабильно

Rule classifier должен ловить большую часть.

---

# 🔥 Архитектурный апгрейд (рекомендую)

Раздели модели:

```
intent-model → маленькая и быстрая
reasoning-model → умная и дорогая
```

Например:

* intent → GPT-4o-mini / Haiku
* reasoning → GPT-4 / Sonnet

Экономия может быть **10x**.

---

# Идеальная цепочка теперь:

```
Redux Event
   ↓
Rule classifier (0ms)
   ↓
AI classifier (~150ms, редко)
   ↓
Reasoning model
```

Это уже архитектура уровня:

👉 health-tech
👉 AI copilots
👉 adaptive systems

