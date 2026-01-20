import React, {useCallback, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {GiftedChat, IMessage, Bubble, InputToolbar, Send} from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/Feather';
import {colors, spacing} from '../../ui/theme';

// Мок-история (для MVP)
const initialMessages: IMessage[] = [
  {
    _id: 3,
    text: 'Что можно сделать в первую очередь?',
    createdAt: new Date(Date.now() - 8000),
    user: {
      _id: 1,
      name: 'User',
    },
  },
  {
    _id: 2,
    text: 'Качество сна снизилось, что может влиять на утреннее давление.',
    createdAt: new Date(Date.now() - 9000),
    user: {
      _id: 2,
      name: 'AI Assistant',
      avatar: 'https://ui-avatars.com/api/?name=AI&background=007AFF&color=fff',
    },
  },
  {
    _id: 1,
    text: 'Я проанализировал данные за последние 3 дня.',
    createdAt: new Date(Date.now() - 10000),
    user: {
      _id: 2,
      name: 'AI Assistant',
      avatar: 'https://ui-avatars.com/api/?name=AI&background=007AFF&color=fff',
    },
  },
];

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>(initialMessages);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages),
    );

    // MVP-заглушка ответа AI
    setTimeout(() => {
      const aiResponse: IMessage = {
        _id: Date.now(),
        text: 'Рекомендую начать со стабилизации сна и снижения нагрузки на 1–2 дня.',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'AI Assistant',
          avatar: 'https://ui-avatars.com/api/?name=AI&background=007AFF&color=fff',
        },
      };
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [aiResponse]),
      );
    }, 600);
  }, []);

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: colors.primary,
        },
        left: {
          backgroundColor: colors.surface,
        },
      }}
      textStyle={{
        right: {
          color: '#fff',
        },
        left: {
          color: colors.text,
        },
      }}
    />
  );

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={styles.inputPrimary}
    />
  );

  const renderSend = (props: any) => (
    <Send {...props} containerStyle={styles.sendContainer}>
      <Icon name="send" size={24} color={colors.primary} />
    </Send>
  );

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: 1,
          name: 'User',
        }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        isSendButtonAlwaysVisible
        messagesContainerStyle={{
          paddingBottom: spacing.md,
        }}
        textInputProps={{
          placeholder: 'Напишите сообщение…',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
  },
  inputPrimary: {
    alignItems: 'center',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
});
