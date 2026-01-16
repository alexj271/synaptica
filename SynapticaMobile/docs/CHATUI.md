Ниже — **полноценный `ChatScreen` на React Native с `FlatList`**, ориентированный на **AI-чат для здоровья**, без дизайнерских зависимостей и с правильной архитектурой (готов к стримингу, истории, actions).


## 1. Файл

```
src/screens/Chat/ChatScreen.tsx
```

(в реальном проекте рядом будут `hooks.ts`, `chat.service.ts`, но здесь — экран целиком)

---

## 2. Модель сообщения

```ts
type ChatRole = 'user' | 'ai' | 'system'

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: number
}
```

---

## 3. Мок-история (для MVP)

```ts
const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'ai',
    content: 'Я проанализировал данные за последние 3 дня.',
    createdAt: Date.now() - 10000,
  },
  {
    id: '2',
    role: 'ai',
    content:
      'Качество сна снизилось, что может влиять на утреннее давление.',
    createdAt: Date.now() - 9000,
  },
  {
    id: '3',
    role: 'user',
    content: 'Что можно сделать в первую очередь?',
    createdAt: Date.now() - 8000,
  },
]
```

---

## 4. ChatScreen — полный код

```tsx
import React, { useCallback, useRef, useState } from 'react'
import {
  View,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native'

import { Screen } from '@/ui/primitives/Screen'
import { ChatBubble } from '@/ui/components/ChatBubble'
import { AppText } from '@/ui/primitives/Text'
import { spacing, colors } from '@/ui/theme'

type ChatRole = 'user' | 'ai' | 'system'

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: number
}

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const listRef = useRef<FlatList<ChatMessage>>(null)

  const sendMessage = useCallback(() => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: input,
      createdAt: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    // MVP-заглушка ответа AI
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'ai',
        content:
          'Рекомендую начать со стабилизации сна и снижения нагрузки на 1–2 дня.',
        createdAt: Date.now(),
      }
      setMessages(prev => [...prev, aiMessage])
    }, 600)
  }, [input])

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <ChatBubble role={item.role}>{item.content}</ChatBubble>
  )

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <Screen>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: spacing.lg }}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
        />
      </Screen>

      {/* ===== Input Bar ===== */}
      <View
        style={{
          flexDirection: 'row',
          padding: spacing.sm,
          borderTopWidth: 1,
          borderColor: '#E5E7EB',
          backgroundColor: colors.surface,
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Напишите сообщение…"
          style={{
            flex: 1,
            padding: spacing.sm,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 8,
          }}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            marginLeft: spacing.sm,
            justifyContent: 'center',
          }}
        >
          <AppText style={{ color: colors.primary }}>Отправить</AppText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
```

---

## 5. Почему FlatList именно так

### ✅ `FlatList`, а не `ScrollView`

* История чата растёт
* Нормальная память
* Легко добавить:

  * пагинацию
  * стриминг
  * prepend истории

### ✅ `onContentSizeChange → scrollToEnd`

* Автоскролл без костылей
* Работает с async-ответами

### ✅ `KeyboardAvoidingView`

* Без перекрытия input
* iOS / Android корректно

---

## 6. Как это расширяется дальше

### Стриминг AI-ответа

```ts
setMessages(prev =>
  prev.map(m =>
    m.id === streamingId
      ? { ...m, content: m.content + chunk }
      : m
  )
)
```

### Карточки внутри чата

* `InsightCard`
* кнопки: «Сформировать план», «Почему так?»

### Системные сообщения

```ts
role: 'system' // «Стратегия обновлена»
```

