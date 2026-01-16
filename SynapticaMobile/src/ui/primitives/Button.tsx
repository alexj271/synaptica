import React from 'react';
import {TouchableOpacity, TouchableOpacityProps, StyleSheet} from 'react-native';
import {Text} from './Text';
import {colors, spacing} from '../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  style,
  ...props
}) => {
  return (
    <TouchableOpacity style={[styles.base, styles[variant], style]} {...props}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    color: colors.background,
    fontWeight: '600',
  },
});
