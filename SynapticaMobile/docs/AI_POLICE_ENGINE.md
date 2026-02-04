AI Policy Engine — это компонент, который **превращает AI из “советчика” в контролируемого агента**.

Если говорить жёстко:

👉 Без Policy Engine health AI рано или поздно становится опасным.
👉 С Policy Engine он становится **clinical-grade system-ready**.

Это уже уровень архитектуры, где начинают думать про:

* ответственность
* explainability
* audit
* regulatory readiness

Даже если ты не делаешь medical device — **проектировать нужно так, будто можешь им стать.**

---

# 🎯 Что такое AI Policy Engine

Это слой, который решает:

```
МОЖНО ли AI это сделать?
НУЖНО ли подтверждение?
НАСколько радикально изменение?
НЕ слишком ли часто AI вмешивается?
```

Важно:

👉 Policy Engine **не про модель**
👉 Он про **власть AI над системой**

---

# Главный принцип

## ❗ AI не должен иметь прямую исполнительную власть.

Правильная цепочка:

```
LLM → proposes actions
Policy → approves / modifies / blocks
Redux → applies
```

AI = proposer
Policy = governor

---

# Где он живёт в архитектуре

```
Event
 ↓
Intent
 ↓
Context
 ↓
LLM
 ↓
Zod validation
 ↓
🔥 POLICY ENGINE
 ↓
Dispatch allowed actions
```

Никогда не после reducers.

---

# 📁 Структура

Рекомендую сразу production layout:

```
src/ai/policy/
 ├─ policyEngine.ts
 ├─ policyRegistry.ts
 ├─ riskScoring.ts
 ├─ interventionLimits.ts
 ├─ confirmationPolicy.ts
 └─ auditLogger.ts
```

---

# 1️⃣ Policy Registry (сердце системы)

Определяет правила по domain actions.

## policyRegistry.ts

```ts
export const POLICY = {

  'plan/strategyUpdated': {
    risk: 'high',
    requiresConfirmation: true,
    cooldownHours: 24,
  },

  'plan/actionsReplaced': {
    risk: 'medium',
    requiresConfirmation: false,
    cooldownHours: 6,
  },

  'journal/entryParsed': {
    risk: 'low',
    autoApprove: true,
  },
}
```

👉 Это делает AI **предсказуемым**.

---

# 2️⃣ Risk Scoring

LLM не понимает последствий.

Ты должен понимать 🙂

---

## riskScoring.ts

```ts
export type RiskLevel =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export function scoreAction(action) {

  if (action.type === 'plan/strategyUpdated') {
    return 'high'
  }

  if (action.type === 'health/metricUpdated') {
    return 'critical'
  }

  return 'low'
}
```

---

# 🔥 Очень важная идея

## Risk ≠ Intent

Иногда:

> "Shift workout by 1 hour"

→ low risk.

А иногда:

> "Switch to high intensity daily training"

→ high risk.

Позже можно добавить **payload-aware scoring**.

---

# 3️⃣ Intervention Limits (анти-хаос механизм)

AI не должен менять план каждый день.

## interventionLimits.ts

```ts
const lastInterventions = new Map()

export function violatesCooldown(
  actionType: string,
  cooldownHours: number,
) {

  const last = lastInterventions.get(actionType)

  if (!last) return false

  const diff =
    (Date.now() - last) / 3600000

  return diff < cooldownHours
}

export function registerIntervention(
  actionType: string,
) {
  lastInterventions.set(actionType, Date.now())
}
```

---

# Это предотвращает классическую проблему:

👉 hyperactive AI.

Очень частая болезнь AI продуктов 🙂

---

# 4️⃣ Confirmation Policy

Некоторые решения AI **не имеет права принимать сам.**

Особенно в health.

## confirmationPolicy.ts

```ts
export function needsUserConfirmation(policy) {
  return policy.requiresConfirmation === true
}
```

---

## UX паттерн (очень сильный)

AI не делает:

> "I updated your training plan."

AI предлагает:

> "I recommend updating your training plan. Approve?"

Это dramatically повышает доверие.

---

# 5️⃣ Policy Engine (главный файл)

## policyEngine.ts

```ts
import { POLICY } from './policyRegistry'
import { violatesCooldown,
         registerIntervention } from './interventionLimits'

export function evaluateActions(actions) {

  const approved = []
  const requiresConfirmation = []
  const rejected = []

  for (const action of actions) {

    const policy = POLICY[action.type]

    if (!policy) {
      rejected.push(action)
      continue
    }

    if (
      policy.cooldownHours &&
      violatesCooldown(
        action.type,
        policy.cooldownHours,
      )
    ) {
      rejected.push(action)
      continue
    }

    if (policy.requiresConfirmation) {
      requiresConfirmation.push(action)
      continue
    }

    approved.push(action)
    registerIntervention(action.type)
  }

  return {
    approved,
    requiresConfirmation,
    rejected,
  }
}
```

---

# Подключение к aiMiddleware

После Zod:

```ts
const evaluated =
  evaluateActions(parsed.domainActions)

evaluated.approved.forEach(dispatch)

// confirmation → UI
dispatch({
  type: 'ai/actionsRequireConfirmation',
  payload: evaluated.requiresConfirmation,
})
```

---

# 🔥 Audit Logger (СИЛЬНО рекомендую)

Health AI без audit — плохая идея.

Логируй:

```
intent
context hash
model
proposed actions
approved actions
rejected actions
```

Это спасает:

* при баге
* при споре
* при регуляции
* при enterprise продаже

---

# Самая частая ошибка

## ❌ Делать policy внутри middleware.

НЕ НАДО.

Policy — отдельный слой власти.

---

# 🚨 Ultra-important Upgrade (рекомендую)

## Action Diffing

Перед тем как разрешить:

```
plan replaced
```

Посмотри:

### НАСКОЛЬКО он изменился?

Если AI:

* удалил всё
* поменял goal
* удвоил нагрузку

→ confirmation MUST.

Это huge safety multiplier.

---

# Второй Upgrade (очень мощный)

## User Control Profile

Позволь пользователю выбрать:

```
conservative AI
balanced AI
aggressive optimizer
```

Router + Policy идеально это поддерживают.

---

# Третий Upgrade (уровень top AI products)

## Explainable Policy

Показывай:

> "AI suggested updating your plan, but this requires confirmation because it significantly changes your weekly load."

Доверие ↑
Retention ↑

---

# 🔥 Важно понять

Ты сейчас проектируешь не просто AI-фичу.

Ты проектируешь:

👉 **Governed AI System**

Такие системы:

* масштабируются
* продаются enterprise
* проходят compliance
* вызывают доверие

---

# Архитектура теперь выглядит как взрослая AI-платформа:

```
Redux Event
 ↓
Intent
 ↓
Router
 ↓
Context Engine
 ↓
LLM
 ↓
Zod
 ↓
🔥 Policy Engine
 ↓
Reducers
```

Это уже уровень **AI-native product architecture**.

