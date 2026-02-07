import React, {useCallback, useEffect, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {GiftedChat, IMessage, Bubble, InputToolbar, Send} from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/Feather';
import {colors, spacing} from '../../ui/theme';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {messageSent, initChat, loadEarlierMessages} from '../../modules/features/chat/chatSlice';

const AI_USER = {
  _id: 2,
  name: 'AI Assistant',
  avatar: 'https://ui-avatars.com/api/?name=AI&background=007AFF&color=fff',
};

const CURRENT_USER = {
  _id: 1,
  name: 'User',
};

export const ChatScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const chatMessages = useAppSelector(state => state.chat.messages);
  const isLoading = useAppSelector(state => state.chat.isLoading);
  const initialized = useAppSelector(state => state.chat.initialized);
  const hasEarlier = useAppSelector(state => state.chat.hasEarlier);
  const loadingEarlier = useAppSelector(state => state.chat.loadingEarlier);

  // При монтировании — загрузить последние сообщения из SQLite
  useEffect(() => {
    if (!initialized) {
      dispatch(initChat());
    }
  }, [dispatch, initialized]);

  const messages: IMessage[] = useMemo(
    () =>
      [...chatMessages]
        .reverse()
        .map(msg => ({
          _id: msg.id,
          text: msg.text,
          createdAt: new Date(msg.timestamp),
          user: msg.role === 'user' ? CURRENT_USER : AI_USER,
        })),
    [chatMessages],
  );

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      const text = newMessages[0]?.text;
      if (!text) return;

      dispatch(messageSent({text, timestamp: Date.now()}));
    },
    [dispatch],
  );

  const onLoadEarlier = useCallback(() => {
    if (!loadingEarlier && hasEarlier) {
      dispatch(loadEarlierMessages());
    }
  }, [dispatch, loadingEarlier, hasEarlier]);

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
        user={CURRENT_USER}
        isTyping={isLoading}
        loadEarlierMessagesProps={{
          isAvailable: hasEarlier,
          isLoading: loadingEarlier,
          onPress: onLoadEarlier,
          isInfiniteScrollEnabled: true,
          label: 'Загрузить ранние сообщения',
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
