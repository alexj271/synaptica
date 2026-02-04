# 1. Базовый принцип (зафиксируем)

> **Redux actions = события предметной области**
> **Redux middleware = слой интерпретации и реакции (AI, side-effects)**
> **Reducers = чистое применение состояния**

AI:

* **не дергается из UI**
* **не знает про UI**
* **подписан на типы экшенов**

Это exactly как saga / CQRS, но с LLM.

---

# 2. Типы экшенов (строго разделяем)

### 2.1 User Intent Actions (вход)

Экшены, которые отражают **намерение пользователя**, а не техническое действие.

```ts
chat/messageSent
journal/entryAdded
plan/requestUpdate
health/manualMetricAdded
```

UI диспатчит **ТОЛЬКО ЭТИ**.

---

### 2.2 AI Request Actions (внутренние)

Их диспатчит middleware.

```ts
ai/requestStarted
ai/requestSucceeded
ai/requestFailed
```

---

### 2.3 State Mutation Actions (чистые)

Только редьюсеры применяют.

```ts
health/updateMetrics
plan/updateStrategy
plan/updateActions
journal/parseResultApplied
```

---

# 3. Chat → AI → State: полный поток

```
UI
 │
 │ dispatch(chat/messageSent)
 ▼
Redux Middleware (AI)
 │
 │ → build context
 │ → call LLM
 ▼
ai/requestSucceeded (structured response)
 │
 │ → dispatch domain mutations
 ▼
Reducers
 │
 ▼
UI updates automatically
```

UI **не участвует** после первого экшена.

---

# 4. Контракт chat/messageSent

```ts
dispatch({
  type: 'chat/messageSent',
  payload: {
    text: string
    timestamp: number
  }
})
```

Это **событие**, а не команда.

---

# 5. AI Middleware (ключевая часть)

### Скелет middleware

```ts
export const aiMiddleware: Middleware =
  store => next => async action => {

    next(action)

    switch (action.type) {
      case 'chat/messageSent':
        await handleChatMessage(store, action)
        break

      case 'journal/entryAdded':
        await handleJournalParse(store, action)
        break
    }
  }
```

---

# 6. Обработка chat/messageSent

```ts
async function handleChatMessage(store, action) {
  const state = store.getState()

  const intent = detectIntent(action.payload.text)

  const context = buildAIContext(state, intent)

  store.dispatch({ type: 'ai/requestStarted', payload: { intent } })

  try {
    const response = await callAI({
      message: action.payload.text,
      context,
      intent,
    })

    store.dispatch({
      type: 'ai/requestSucceeded',
      payload: response,
    })

    applyAIResponse(store, response)

  } catch (e) {
    store.dispatch({
      type: 'ai/requestFailed',
      payload: { error: String(e) },
    })
  }
}
```

---

# 7. Формат AI-ответа (жёсткий контракт)

```ts
interface AIResponse {
  summary: string
  intent: 'health_review' | 'plan_update' | 'journal_parse'
  patches: Array<{
    path: string
    value: unknown
  }>
  domainActions?: Array<{
    type: string
    payload: unknown
  }>
  explanations: string[]
}
```

> ❗ ВАЖНО: LLM не знает про Redux
> Он знает только про **JSON-схему**

---

# 8. Применение AI-ответа

### Вариант 1 (рекомендую): domainActions

```ts
function applyAIResponse(store, response) {
  response.domainActions.forEach(action =>
    store.dispatch(action)
  )
}
```

---

# 9. Reducers остаются тупыми и чистыми

```ts
const planReducer = createSlice({
  name: 'plan',
  reducers: {
    updateStrategy(state, action) {
      state.strategy = action.payload
    },
    updateActions(state, action) {
      state.actions = action.payload
    }
  }
})
```

AI **не лезет внутрь**.

---

# 10. Почему middleware, а не thunk / saga

✔ Middleware — реакция на события
✔ Легко добавлять новые AI-реакции
✔ Нет coupling UI ↔ AI
✔ Можно логировать весь event stream
✔ Можно replay / time-travel

Ты фактически строишь **AI Event Processor**.

---

# 11. Очень важное правило

> ❌ Нельзя вызывать AI из UI
> ❌ Нельзя менять state из middleware напрямую
> ❌ Нельзя позволять AI решать «как именно» менять store

Только:

* action → middleware → structured response → reducers

---

# 12. Пример реального сценария

Пользователь пишет:

> «Я плохо спал и чувствую усталость»

1️⃣ `chat/messageSent`
2️⃣ middleware → intent = `journal_parse`
3️⃣ AI возвращает:

```json
{
  "summary": "Признаки усталости и дефицита сна",
  "domainActions": [
    {
      "type": "journal/parseResultApplied",
      "payload": {
        "energy": 3,
        "sleepComplaint": true
      }
    }
  ]
}
```

4️⃣ UI обновился автоматически.

