Ниже — **минимальный, но достаточный UI-kit из 10 компонентов**, заточенный именно под **health + AI-chat приложение**, который позволяет собрать все экраны **без дизайнера** и без визуального хаоса.

Я даю:

* назначение компонента
* API
* упрощённую реализацию (React Native + TS)

---

# 0. Базовое допущение

Все компоненты:

* используют одну тему (`colors / spacing / typography`)
* не знают о бизнес-логике
* легко комбинируются

---

# 1. `Screen` — базовый контейнер экрана

**Зачем:**
Единый padding, фон, safe-area.

```tsx
// ui/primitives/Screen.tsx
export const Screen: React.FC<PropsWithChildren> = ({ children }) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView contentContainerStyle={{ padding: spacing.md }}>
      {children}
    </ScrollView>
  </SafeAreaView>
)
```

Используется **в каждом экране**.

---

# 2. `Text` — единая типографика

**Зачем:**
Никаких `Text` из RN напрямую.

```tsx
export const AppText = ({ variant = 'body', style, children }) => (
  <Text style={[typography[variant], { color: colors.text }, style]}>
    {children}
  </Text>
)
```

Варианты: `h1`, `h2`, `body`, `small`, `muted`.

---

# 3. `Section` — логическая секция экрана

**Зачем:**
Читаемая структура без дизайна.

```tsx
export const Section = ({ title, children }) => (
  <View style={{ marginBottom: spacing.lg }}>
    <AppText variant="h2">{title}</AppText>
    <View style={{ marginTop: spacing.sm }}>{children}</View>
  </View>
)
```

---

# 4. `Card` — базовый визуальный контейнер

**Зачем:**
90% UI строится на карточках.

```tsx
export const Card: React.FC<PropsWithChildren> = ({ children }) => (
  <View style={{
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  }}>
    {children}
  </View>
)
```

---

# 5. `MetricCard` — показатель здоровья

**Зачем:**
Сон, давление, пульс, вес.

```tsx
<MetricCard
  title="Сон"
  value="6ч 20м"
  trend="down"
  status="warning"
/>
```

```tsx
export const MetricCard = ({ title, value, trend, status }) => (
  <Card>
    <AppText variant="small" style={{ color: colors.muted }}>
      {title}
    </AppText>
    <AppText variant="h1">{value}</AppText>
    <AppText variant="small">
      {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
    </AppText>
  </Card>
)
```

---

# 6. `ActionItem` — элемент To-Do

**Зачем:**
План действий — ключевая ценность.

```tsx
<ActionItem
  title="Прогулка 20 мин"
  subtitle="Поддерживает давление и сон"
  done={false}
/>
```

```tsx
export const ActionItem = ({ title, subtitle, done }) => (
  <Card>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Checkbox status={done ? 'checked' : 'unchecked'} />
      <View style={{ marginLeft: spacing.sm }}>
        <AppText>{title}</AppText>
        <AppText variant="small" style={{ color: colors.muted }}>
          {subtitle}
        </AppText>
      </View>
    </View>
  </Card>
)
```

---

# 7. `ChatBubble` — сообщение в AI-чате

**Зачем:**
Отделить AI от пользователя, но без «мессенджерного» мусора.

```tsx
<ChatBubble role="ai">
  Я вижу снижение качества сна за 3 дня
</ChatBubble>
```

```tsx
export const ChatBubble = ({ role, children }) => (
  <View style={{
    alignSelf: role === 'ai' ? 'flex-start' : 'flex-end',
    backgroundColor: role === 'ai' ? colors.surface : colors.primary,
    padding: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.sm,
  }}>
    <AppText style={{ color: role === 'ai' ? colors.text : '#fff' }}>
      {children}
    </AppText>
  </View>
)
```

---

# 8. `InsightCard` — вывод или рекомендация AI

**Зачем:**
Отделить «мнение AI» от чата.

```tsx
<InsightCard type="warning" title="Сон ниже нормы">
  Это может повышать утреннее давление
</InsightCard>
```

```tsx
export const InsightCard = ({ type, title, children }) => (
  <Card>
    <AppText variant="h2">{title}</AppText>
    <AppText>{children}</AppText>
  </Card>
)
```

---

# 9. `EmptyState` — пустые состояния

**Зачем:**
Без дизайнера пустые экраны — частая боль.

```tsx
<EmptyState
  title="Нет данных"
  description="Добавьте показатели вручную или подключите браслет"
/>
```

```tsx
export const EmptyState = ({ title, description }) => (
  <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
    <AppText variant="h2">{title}</AppText>
    <AppText style={{ color: colors.muted, textAlign: 'center' }}>
      {description}
    </AppText>
  </View>
)
```

---

# 10. `InputRow` — ввод данных (давление, вес)

**Зачем:**
Ручной ввод — обязательный сценарий.

```tsx
<InputRow
  label="Давление"
  placeholder="120 / 80"
/>
```

```tsx
export const InputRow = ({ label, ...props }) => (
  <View style={{ marginBottom: spacing.md }}>
    <AppText variant="small">{label}</AppText>
    <TextInput style={{
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8,
      padding: spacing.sm,
    }} {...props} />
  </View>
)
```

---

# Как этим собрать всё приложение

* **Dashboard** → `MetricCard + Section + InsightCard`
* **Chat** → `ChatBubble + InsightCard`
* **Plan** → `ActionItem`
* **Data** → `InputRow + EmptyState`

