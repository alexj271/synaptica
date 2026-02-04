Context Engine — это **самый недооценённый компонент AI-систем**, и одновременно **главный множитель качества модели**.

Скажу прямо:

👉 **LLM почти никогда не ограничена интеллектом.**
👉 Она ограничена **контекстом**, который ты ей даёшь.

90% AI-приложений делают так:

```
send(state)
```

И получают:

* дорогие запросы
* hallucinations
* нестабильные ответы
* latency

Ты же строишь систему уровня **AI-native product**, поэтому контекст должен стать **вычисляемым ресурсом**, а не dump-объектом.

---

# 🎯 Что такое Context Engine

Это слой, который решает:

```
ЧТО дать модели
СКОЛЬКО дать
В КАКОМ виде
С КАКИМ приоритетом
```

НЕ middleware.
НЕ router.

👉 Это **information optimizer**.

---

# Главный принцип

## ❗ Контекст — это НЕ state.

Контекст — это:

```
context = relevance(state, intent)
```

---

# Архитектура (рекомендую буквально такую)

```
src/ai/context/
 ├─ buildContext.ts
 ├─ contextPolicy.ts
 ├─ selectors/
 │   ├─ health.selector.ts
 │   ├─ journal.selector.ts
 │   ├─ plan.selector.ts
 ├─ summarizers/
 └─ tokenEstimator.ts
```

Разделение критично.

---

# 🧠 Mental Model

Контекст должен собираться как **query planner в базе данных**.

Не:

```
state → stringify → send
```

А:

```
intent → select → compress → structure
```

---

# 1️⃣ Context Policy (самый важный файл)

Он определяет:

👉 **какие домены участвуют в каждом intent**

## contextPolicy.ts

```ts
export const CONTEXT_POLICY = {

  journal_parse: [
    'recentJournal',
    'sleepMetrics',
  ],

  health_review: [
    'healthMetrics',
    'trendSummary',
    'currentPlan',
  ],

  plan_update: [
    'healthMetrics',
    'longTermTrends',
    'activePlan',
    'constraints',
  ],

  chat_general: [
    'lightHealth',
    'activeGoals',
  ],
}
```

> Это делает систему explainable.

Ты всегда можешь сказать:

> "AI использовал последние 7 записей и метрики сна"

Это критично для health-tech.

---

# 2️⃣ Selectors — НЕ redux selectors

Это **semantic selectors**.

Они должны:

* агрегировать
* фильтровать
* упрощать

НЕ возвращать сырой store.

---

## пример: journal selector

```ts
export function selectRecentJournal(state) {

  return state.journal.entries
    .slice(-7)
    .map(e => ({
      date: e.date,
      energy: e.parsed?.energy,
      stress: e.parsed?.stress,
      symptoms: e.parsed?.symptoms,
    }))
}
```

👉 Уже структурировано для LLM.

---

## Health selector (очень важно — только значимое)

```ts
export function selectHealthMetrics(state) {

  const { sleep, pressure, weight } =
    state.health.metrics

  return {
    sleep,
    pressure,
    weight,
    subjective: state.health.subjective,
  }
}
```

Не отправляй:

* timestamps каждого апдейта
* device metadata
* ids

LLM это не нужно.

---

# 🔥 Критически важный слой — Summarizers

Если у пользователя:

* 2 года дневника
* тысячи записей

Ты НЕ МОЖЕШЬ отправить всё.

---

## Long-term summarization

Делается **в фоне**, не в запросе.

Храни:

```
journal_long_summary
health_trends
behavior_patterns
```

---

### пример summary:

```ts
{
 "sleepTrend": "declining",
 "avgEnergy": 6.1,
 "highStressFrequency": "weekly"
}
```

10 строк → вместо 10 000.

Это **гигантский multiplier** качества.

---

# 4️⃣ Token Estimator (очень советую)

LLM — это бюджетная система.

Простой estimator спасает от катастроф.

---

## tokenEstimator.ts

```ts
export function estimateTokens(obj: unknown) {

  const text = JSON.stringify(obj)

  // грубая, но рабочая эвристика
  return text.length / 4
}
```

---

## Budget guard

```ts
if (estimateTokens(context) > 6000) {
  context = compressContext(context)
}
```

---

# 5️⃣ Context Builder (главный файл)

## buildContext.ts

```ts
import { CONTEXT_POLICY } from './contextPolicy'
import * as selectors from './selectors'

export function buildContext(intent, state) {

  const requiredBlocks =
    CONTEXT_POLICY[intent] ?? []

  const context: Record<string, unknown> = {}

  for (const block of requiredBlocks) {

    switch (block) {

      case 'recentJournal':
        context.recentJournal =
          selectors.selectRecentJournal(state)
        break

      case 'healthMetrics':
        context.health =
          selectors.selectHealthMetrics(state)
        break

      case 'activePlan':
        context.plan =
          selectors.selectActivePlan(state)
        break
    }
  }

  return context
}
```

---

# 🔥 Золотое правило Context Engine

## ❗ Контекст должен быть:

### ✔ Intent-driven

### ✔ Минимальным

### ✔ Структурированным

### ✔ Explainable

НЕ conversational blob.

---

# Самая частая архитектурная ошибка

## ❌ Chat history > State

Многие делают:

```
messages[]
```

и надеются на магию.

В health AI это почти всегда деградация.

👉 State важнее диалога.

---

# 🚨 Очень мощный апгрейд (рекомендую)

## Context Layers

Раздели контекст на уровни:

```
L1 — immediate (последние записи)
L2 — trends
L3 — long-term summary
L4 — constraints
```

LLM мыслит гораздо стабильнее.

---

# Второй апгрейд (Senior+ уровень)

## Context Versioning

Когда AI меняет plan — сохраняй:

```
context_hash
```

Ты всегда сможешь воспроизвести:

> почему AI принял это решение.

Это **регуляторный уровень проектирования** (медтех, страхование).

---

# Третий апгрейд (очень мощный)

## Relevance Scoring

Вместо:

```
last 7 entries
```

Делай:

```
top relevant entries
```

Например — по sleep complaints.

Это уже приближает систему к **clinical-grade reasoning**.

---

# Итоговая архитектура теперь выглядит ОЧЕНЬ сильно:

```
Event
 ↓
Intent
 ↓
Model Router
 ↓
Context Engine   ← (интеллект данных)
 ↓
LLM
 ↓
Zod
 ↓
Domain Actions
```

Это уже уровень систем, которые:

* масштабируются
* объяснимы
* безопасны
* предсказуемы

