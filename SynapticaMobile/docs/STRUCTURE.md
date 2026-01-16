Структура отражает:

* разделение UI / доменной логики / данных,
* готовность к росту,
* понятность для одного или небольшой команды.

---

## 1. Корневая структура

```txt
app/
├─ assets/
├─ src/
│  ├─ app/
│  ├─ screens/
│  ├─ navigation/
│  ├─ ui/
│  ├─ features/
│  ├─ services/
│  ├─ store/
│  ├─ hooks/
│  ├─ utils/
│  ├─ types/
│  └─ config/
├─ app.json
├─ babel.config.js
├─ tsconfig.json
└─ package.json
```

---

## 2. `/assets` — статика

```txt
assets/
├─ fonts/
├─ icons/
└─ images/
```

* **fonts/** — один шрифт (Inter / System)
* **icons/** — если нужно что-то сверх vector-icons
* **images/** — onboarding, placeholders

---

## 3. `/src/app` — точка входа

```txt
src/app/
├─ App.tsx
├─ Providers.tsx
└─ bootstrap.ts
```

### Назначение:

* `App.tsx` — минимальный root
* `Providers.tsx` — Theme, Store, Query, Navigation
* `bootstrap.ts` — инициализация SDK, аналитики, permissions

---

## 4. `/src/navigation` — навигация

```txt
navigation/
├─ RootNavigator.tsx
├─ TabNavigator.tsx
├─ stacks/
│  ├─ ChatStack.tsx
│  ├─ HealthStack.tsx
│  └─ ProfileStack.tsx
└─ types.ts
```

**Принцип:**
Навигация изолирована, экраны ничего не знают о структуре.

---

## 5. `/src/screens` — экраны (тонкие)

```txt
screens/
├─ Dashboard/
│  ├─ DashboardScreen.tsx
│  └─ index.ts
├─ Chat/
│  ├─ ChatScreen.tsx
│  └─ components/
├─ Plan/
├─ Data/
└─ Profile/
```

### Важно:

* Экран **не содержит бизнес-логики**
* Только композиция компонентов + хуки

---

## 6. `/src/ui` — дизайн-система (ядро)

```txt
ui/
├─ theme/
│  ├─ colors.ts
│  ├─ spacing.ts
│  ├─ typography.ts
│  └─ index.ts
├─ primitives/
│  ├─ Text.tsx
│  ├─ Button.tsx
│  ├─ Card.tsx
│  └─ Screen.tsx
├─ components/
│  ├─ MetricCard.tsx
│  ├─ ActionItem.tsx
│  ├─ EmptyState.tsx
│  └─ Section.tsx
└─ index.ts
```

Это **самая важная папка**.

---

## 7. `/src/features` — бизнес-фичи (domain-driven)

```txt
features/
├─ health/
│  ├─ models.ts
│  ├─ hooks.ts
│  ├─ selectors.ts
│  └─ utils.ts
├─ chat/
│  ├─ chat.service.ts
│  ├─ prompt.builder.ts
│  └─ models.ts
├─ planning/
│  ├─ plan.generator.ts
│  └─ types.ts
└─ devices/
   ├─ connectors/
   └─ types.ts
```

**Здесь вся логика**, а не в экранах.

---

## 8. `/src/services` — внешние сервисы

```txt
services/
├─ api/
│  ├─ client.ts
│  └─ endpoints.ts
├─ ai/
│  ├─ ai.client.ts
│  ├─ model.router.ts
│  └─ types.ts
├─ storage/
│  ├─ asyncStorage.ts
│  └─ secureStorage.ts
└─ analytics/
```

---

## 9. `/src/store` — состояние

```txt
store/
├─ index.ts
├─ slices/
│  ├─ user.slice.ts
│  ├─ health.slice.ts
│  ├─ plan.slice.ts
│  └─ chat.slice.ts
└─ middleware/
```

Можно:

* Redux Toolkit
* Zustand
* Jotai

(для MVP рекомендую Zustand)

---

## 10. `/src/hooks` — переиспользуемые хуки

```txt
hooks/
├─ useHealthMetrics.ts
├─ useChat.ts
├─ usePlan.ts
└─ useDebounce.ts
```

---

## 11. `/src/utils` — утилиты

```txt
utils/
├─ date.ts
├─ format.ts
├─ math.ts
└─ logger.ts
```

---

## 12. `/src/types` — глобальные типы

```txt
types/
├─ health.ts
├─ plan.ts
├─ chat.ts
└─ api.ts
```

---

## 13. `/src/config` — конфигурация

```txt
config/
├─ env.ts
├─ constants.ts
└─ featureFlags.ts
```

---

## 14. Как выглядит экран на практике

```tsx
// DashboardScreen.tsx
export const DashboardScreen = () => {
  const metrics = useHealthMetrics()
  const focus = useTodayFocus()

  return (
    <Screen>
      <Section title="Сегодня" />
      <MetricRow metrics={metrics} />
      <FocusBlock items={focus} />
    </Screen>
  )
}
```

