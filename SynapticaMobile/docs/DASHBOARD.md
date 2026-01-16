Ниже — **полностью собранный `DashboardScreen`** в инженерном стиле: читаемый, расширяемый, без дизайнерских зависимостей. Это **реальный экран**, который можно положить в проект и дальше наращивать логику.

Я покажу:

1. Структуру файла
2. Мок-данные
3. Сам экран
4. Краткое пояснение архитектуры

---

## 1. Файл

```
src/screens/Dashboard/DashboardScreen.tsx
```

---

## 2. Мок-данные (временно, для MVP)

```ts
const mockMetrics = [
  { id: 'sleep', title: 'Сон', value: '6ч 20м', trend: 'down', status: 'warning' },
  { id: 'activity', title: 'Активность', value: '7 200', trend: 'up', status: 'normal' },
  { id: 'pressure', title: 'Давление', value: '135 / 85', trend: 'up', status: 'warning' },
]

const mockFocus = [
  {
    id: 'walk',
    title: 'Прогулка 20 мин',
    subtitle: 'Поддерживает давление и сон',
    done: false,
  },
  {
    id: 'breath',
    title: 'Дыхание 2×5 мин',
    subtitle: 'Снижает уровень стресса',
    done: false,
  },
]
```

---

## 3. DashboardScreen (полный код)

```tsx
import React from 'react'
import { View, ScrollView } from 'react-native'

import { Screen } from '@/ui/primitives/Screen'
import { Section } from '@/ui/components/Section'
import { MetricCard } from '@/ui/components/MetricCard'
import { ActionItem } from '@/ui/components/ActionItem'
import { InsightCard } from '@/ui/components/InsightCard'
import { AppText } from '@/ui/primitives/Text'
import { spacing } from '@/ui/theme'

export const DashboardScreen: React.FC = () => {
  const todaySummary =
    'Сон ниже нормы. Рекомендуется снизить нагрузку и сфокусироваться на восстановлении.'

  return (
    <Screen>
      {/* ===== Сегодня ===== */}
      <Section title="Сегодня">
        <InsightCard type="warning" title="Общее состояние">
          {todaySummary}
        </InsightCard>
      </Section>

      {/* ===== Метрики ===== */}
      <Section title="Ключевые показатели">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm }}
        >
          {mockMetrics.map(metric => (
            <View key={metric.id} style={{ width: 140 }}>
              <MetricCard
                title={metric.title}
                value={metric.value}
                trend={metric.trend}
                status={metric.status}
              />
            </View>
          ))}
        </ScrollView>
      </Section>

      {/* ===== Фокус дня ===== */}
      <Section title="Фокус дня">
        {mockFocus.map(item => (
          <ActionItem
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            done={item.done}
          />
        ))}
      </Section>

      {/* ===== Быстрое действие ===== */}
      <View style={{ marginTop: spacing.lg }}>
        <InsightCard type="info" title="Рекомендация">
          Обсудить текущую стратегию и возможные корректировки в чате.
        </InsightCard>
      </View>
    </Screen>
  )
}
```

---

## 4. Как это выглядит логически

```
Screen
 ├─ Section: Сегодня
 │   └─ InsightCard (summary)
 ├─ Section: Метрики
 │   └─ HorizontalScroll
 │       └─ MetricCard × N
 ├─ Section: Фокус дня
 │   └─ ActionItem × N
 └─ InsightCard (CTA → чат)
```

---

## 5. Почему это правильный Dashboard

### Инженерно

* Нет бизнес-логики
* Нет API-зависимостей
* Всё легко заменить хуками

### UX

* Читается сверху вниз
* Есть интерпретация, не только цифры
* Есть конкретные действия

### Масштабируемо

* Можно:

  * добавить график
  * вставить “риски”
  * менять стратегию без переписывания экрана

