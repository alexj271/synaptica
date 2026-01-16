import React from 'react';
import {View, TextInput, TextInputProps, StyleSheet} from 'react-native';
import {AppText} from './Text';
import {colors, spacing} from '../theme';

interface InputRowProps extends TextInputProps {
  label: string;
}

export const InputRow: React.FC<InputRowProps> = ({label, ...props}) => {
  return (
    <View style={styles.container}>
      <AppText variant="small" style={styles.label}>
        {label}
      </AppText>
      <TextInput style={styles.input} placeholderTextColor={colors.textSecondary} {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text,
    fontSize: 16,
  },
});
