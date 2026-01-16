import React, {PropsWithChildren} from 'react';
import {View, ViewProps, StyleSheet} from 'react-native';
import {colors, spacing} from '../theme';

interface CardProps extends PropsWithChildren, ViewProps {}

export const Card: React.FC<CardProps> = ({style, children, ...props}) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
});
