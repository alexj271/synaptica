import React from 'react';
import {Text as RNText, TextProps, StyleSheet} from 'react-native';
import {colors, typography} from '../theme';

interface CustomTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'small' | 'muted';
}

export const Text: React.FC<CustomTextProps> = ({
  variant = 'body',
  style,
  ...props
}) => {
  return <RNText style={[styles[variant], style]} {...props} />;
};

// Alias для удобства
export const AppText = Text;

const styles = StyleSheet.create({
  h1: {
    ...typography.h1,
    color: colors.text,
  },
  h2: {
    ...typography.h2,
    color: colors.text,
  },
  h3: {
    ...typography.h3,
    color: colors.text,
  },
  body: {
    ...typography.body,
    color: colors.text,
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  small: {
    ...typography.small,
    color: colors.textSecondary,
  },
  muted: {
    ...typography.small,
    color: colors.textSecondary,
  },
});
