Model Router — это **один из главных архитектурных множителей силы AI-приложения**.
Если middleware — мозг событий, то router — **мозг вычислений**.

Без него почти все AI-приложения через 6–12 месяцев упираются в:

* exploding costs
* unpredictable latency
* vendor lock
* невозможность контролировать reasoning depth

Ты уже на том этапе архитектуры, где router — **обязательный компонент**, а не “nice to have”.

---

# 🎯 Что такое Model Router

Это слой, который решает:

```
Какую модель вызвать
С каким режимом
С каким бюджетом
С каким reasoning depth
Нужно ли вообще LLM
```

НЕ middleware.
НЕ intent classifier.

👉 Это **compute orchestrator**.

---

# Главный принцип

## ❗ НЕ все задачи требуют умной модели.

Большая ошибка:

```
user message → GPT-4
```

Правильно:

```
event → intent → complexity → router → model
```

---

# Архитектура

Рекомендую буквально такую структуру:

```
src/ai/router/
 ├─ modelRouter.ts
 ├─ routingPolicy.ts
 ├─ taskComplexity.ts
 ├─ modelProfiles.ts
 └─ costGuard.ts
```

---

# 1️⃣ Model Profiles (фиксируем возможности моделей)

## modelProfiles.ts

```ts
export type ModelProfile = {
  name: string
  tier: 'small' | 'reasoning' | 'premium'
  costPer1k: number
  latencyMs: number
  reasoning: boolean
}

export const MODELS = {
  FAST: {
    name: 'gpt-4o-mini',
    tier: 'small',
    costPer1k: 0.15,
    latencyMs: 300,
    reasoning: false,
  },

  SMART: {
    name: 'claude-sonnet',
    tier: 'reasoning',
    costPer1k: 3,
    latencyMs: 900,
    reasoning: true,
  },

  DEEP: {
    name: 'gpt-4.1',
    tier: 'premium',
    costPer1k: 10,
    latencyMs: 2000,
    reasoning: true,
  },
}
```

👉 Router принимает решения на основе **capabilities**, не брендов.

---

# 2️⃣ Task Complexity Detector

LLM — это **переменная глубина мышления**.

### taskComplexity.ts

```ts
export type TaskComplexity =
  | 'trivial'
  | 'standard'
  | 'deep'

export function detectComplexity(
  intent: string,
  contextSize: number,
): TaskComplexity {

  if (intent === 'journal_parse') {
    return 'trivial'
  }

  if (intent === 'health_review') {
    return 'standard'
  }

  if (intent === 'plan_update' && contextSize > 2000) {
    return 'deep'
  }

  return 'standard'
}
```

👉 complexity = главный driver cost.

---

# 3️⃣ Routing Policy (сердце router-а)

## routingPolicy.ts

```ts
import { MODELS } from './modelProfiles'

export function selectModel(complexity: string) {

  switch (complexity) {

    case 'trivial':
      return MODELS.FAST

    case 'standard':
      return MODELS.SMART

    case 'deep':
      return MODELS.DEEP

    default:
      return MODELS.FAST
  }
}
```

Просто. Предсказуемо. Контролируемо.

Не делай ML router 🙂
Rule router почти всегда лучше.

---

# 4️⃣ Cost Guard (ОЧЕНЬ советую)

AI без cost guard — почти всегда катастрофа позже.

### costGuard.ts

```ts
let monthlyBudget = 200 // USD
let spent = 0

export function canUseModel(model) {

  if (spent > monthlyBudget) {
    return false
  }

  return true
}

export function registerSpend(amount: number) {
  spent += amount
}
```

Позже можно подключить:

* per-user budget
* premium tier
* hard kill-switch

---

# 5️⃣ Model Router (главный файл)

## modelRouter.ts

```ts
import { detectComplexity } from './taskComplexity'
import { selectModel } from './routingPolicy'
import { canUseModel } from './costGuard'

export async function routeModel({
  intent,
  context,
}) {

  const complexity = detectComplexity(
    intent,
    JSON.stringify(context).length,
  )

  let model = selectModel(complexity)

  // downgrade если бюджет не позволяет
  if (!canUseModel(model)) {
    model = selectModel('trivial')
  }

  return {
    model,
    complexity,
  }
}
```

---

# Как подключается к aiMiddleware

Вместо:

```ts
await callAI(context)
```

👉

```ts
const { model } = await routeModel({
  intent,
  context,
})

await callAI({
  model: model.name,
  context,
})
```

---

# 🔥 Продвинутый апгрейд (очень рекомендую)

## Escalation Strategy

Начать с дешёвой модели.

Если confidence низкий → эскалировать.

```
mini → sonnet → gpt4
```

Это **золотой стандарт AI infra** сейчас.

---

### пример:

```ts
let result = await callFastModel()

if (result.confidence < 0.6) {
  result = await callSmartModel()
}
```

Экономия может быть **5–20x**.

---

# 🚨 Самая частая ошибка

## ❌ Router на основе intent.

Неправильно:

```
plan_update → always smart
```

Правильно:

```
intent + complexity + context size
```

Иногда plan_update — это:

> "Move training from Monday to Tuesday"

Это trivial 🙂

---

# 🔥 Архитектурный уровень выше (рекомендую подумать)

## Compute Budget Per User

```
free tier → FAST only
pro → SMART
elite → DEEP
```

Router идеально поддерживает монетизацию.

---

# Второй апгрейд (очень мощный)

## Context-Aware Routing

Если у пользователя:

* 3 года данных
* 10k journal entries
* multi-factor health metrics

→ сразу deep model.

Router должен это учитывать.

---

# Итоговая цепочка теперь выглядит очень сильно:

```
Redux Event
   ↓
Intent classifier
   ↓
Complexity detector
   ↓
Model Router
   ↓
LLM
   ↓
Zod validation
   ↓
Domain actions
```

Это уже архитектура уровня:

👉 serious health-tech
👉 AI-native products
👉 adaptive assistants

