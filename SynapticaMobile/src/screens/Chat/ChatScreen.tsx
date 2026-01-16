import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {Screen, ChatBubble, AppText} from '../../ui/primitives';
import {spacing, colors} from '../../ui/theme';

type ChatRole = 'user' | 'ai' | 'system';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

// Мок-история (для MVP)
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
    content: 'Качество сна снизилось, что может влиять на утреннее давление.',
    createdAt: Date.now() - 9000,
  },
  {
    id: '3',
    role: 'user',
    content: 'Что можно сделать в первую очередь?',
    createdAt: Date.now() - 8000,
  },
];

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: input,
      createdAt: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // MVP-заглушка ответа AI
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'ai',
        content:
          'Рекомендую начать со стабилизации сна и снижения нагрузки на 1–2 дня.',
        createdAt: Date.now(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 600);
  }, [input]);

  const renderItem = ({item}: {item: ChatMessage}) => (
    <ChatBubble role={item.role}>{item.content}</ChatBubble>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}>
      <Screen scrollable={false}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({animated: true})
          }
        />
      </Screen>

      {/* ===== Input Bar ===== */}
      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Напишите сообщение…"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <AppText style={styles.sendText}>Отправить</AppText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  inputBar: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.text,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  sendText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
