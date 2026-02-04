
# 🧠 Общие правила (ОБЯЗАТЕЛЬНО ДЛЯ COPILOT)

```txt
- Использовать Redux Toolkit (createSlice)
- State = доменная модель, не UI
- Все поля сериализуемы в JSON
- Никакой логики в reducers
- Reducers должны быть детерминированными
- Имена экшенов = domain events
- AI НЕ ИМЕЕТ прямого доступа к reducers
```

---

# 1️⃣ Health Slice — объективные и субъективные показатели

## Назначение

* Хранит **формализованное состояние здоровья**
* Используется:

  * Dashboard
  * AI анализ
  * Планирование

---

## Структура состояния (СКОРМИТЬ COPILOT)

```ts
HealthState {
  metrics: {
    sleep?: {
      duration: number        // минуты
      quality: number         // 0–100
      trend: 'up' | 'down' | 'stable'
      lastUpdated: string     // ISO
    }

    pressure?: {
      systolic: number
      diastolic: number
      measuredAt: string
    }

    weight?: {
      value: number
      measuredAt: string
    }
  }

  subjective: {
    energy?: number          // 1–10
    stress?: number          // 1–10
    mood?: string
  }
}
```

---

## Reducers (domain events)

```ts
health/metricUpdated
health/subjectiveUpdated
health/metricsBatchUpdated
```

---

## Пример slice (эталон)

```ts
const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    metricUpdated(state, action) {
      const { type, value } = action.payload
      state.metrics[type] = value
    },

    subjectiveUpdated(state, action) {
      state.subjective = {
        ...state.subjective,
        ...action.payload,
      }
    },

    metricsBatchUpdated(state, action) {
      state.metrics = {
        ...state.metrics,
        ...action.payload,
      }
    },
  },
})
```

> ⚠️ Никаких вычислений, только запись фактов.

---

# 2️⃣ Journal Slice — сырой текст + AI-парсинг

## Назначение

* Хранит **истину пользователя**
* AI может переобрабатывать `parsed`, но `rawText` неизменяем

---

## Структура состояния

```ts
JournalState {
  entries: Array<{
    id: string
    date: string            // ISO
    rawText: string
    parsed?: {
      energy?: number
      stress?: number
      sleepComplaint?: boolean
      symptoms?: string[]
    }
    source: 'manual' | 'voice'
  }>
}
```

---

## Reducers

```ts
journal/entryAdded
journal/entryParsed
journal/entryUpdated
```

---

## Эталонный slice

```ts
const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    entryAdded(state, action) {
      state.entries.push(action.payload)
    },

    entryParsed(state, action) {
      const { id, parsed } = action.payload
      const entry = state.entries.find(e => e.id === id)
      if (entry) {
        entry.parsed = parsed
      }
    },
  },
})
```

> ✅ AI middleware **ТОЛЬКО** диспатчит `entryParsed`

---

# 3️⃣ Plan Slice — стратегия и действия

## Назначение

* Центральный объект управления
* AI чаще всего работает именно с этим slice

---

## Структура состояния

```ts
PlanState {
  strategy: {
    goal: string
    priorities: string[]
    constraints: string[]
    updatedAt: string
  }

  actions: Array<{
    id: string
    title: string
    type: 'habit' | 'training' | 'measurement'
    schedule?: string
    status: 'pending' | 'done' | 'skipped'
    impact: string[]
  }>
}
```

---

## Reducers

```ts
plan/strategyUpdated
plan/actionsReplaced
plan/actionStatusChanged
```

---

## Эталонный slice

```ts
const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    strategyUpdated(state, action) {
      state.strategy = {
        ...action.payload,
        updatedAt: new Date().toISOString(),
      }
    },

    actionsReplaced(state, action) {
      state.actions = action.payload
    },

    actionStatusChanged(state, action) {
      const { id, status } = action.payload
      const actionItem = state.actions.find(a => a.id === id)
      if (actionItem) {
        actionItem.status = status
      }
    },
  },
})
```

---

# 4️⃣ Как AI middleware работает с этими slices

## Пример domainActions от AI

```json
{
  "domainActions": [
    {
      "type": "journal/entryParsed",
      "payload": {
        "id": "entry-123",
        "parsed": {
          "energy": 3,
          "sleepComplaint": true
        }
      }
    },
    {
      "type": "plan/strategyUpdated",
      "payload": {
        "goal": "Восстановление сна",
        "priorities": ["сон", "стресс"],
        "constraints": ["низкая энергия"]
      }
    }
  ]
}
```

👉 middleware просто делает:

```ts
response.domainActions.forEach(store.dispatch)
```

---

# 5️⃣ Контроль качества (ОБЯЗАТЕЛЬНО)

### Для Copilot / LLM

```txt
- reducers не вызывают async
- reducers не используют Date.now() (кроме меток)
- reducers не знают про AI
- middleware — единственное место вызова AI
```

---

# 6️⃣ Почему это идеально для AI

* JSON плоский и понятный
* Легко валидировать Zod
* Можно отправлять partial state
* Можно replay actions
* Можно объяснять пользователю “почему”

