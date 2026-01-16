import React, {PropsWithChildren} from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from './Text';
import {colors, spacing} from '../theme';

interface ChatBubbleProps extends PropsWithChildren {
  role: 'user' | 'ai' | 'system';
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({role, children}) => {
  const isAI = role === 'ai';

  return (
    <View
      style={[
        styles.bubble,
        isAI ? styles.aiBubble : styles.userBubble,
      ]}>
      <AppText style={isAI ? styles.aiText : styles.userText}>
        {children}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    padding: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.sm,
    maxWidth: '80%',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  aiText: {
    color: colors.text,
  },
  userText: {
    color: '#fff',
  },
});
