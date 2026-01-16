import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from './Text';
import {colors, spacing} from '../theme';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({title, description}) => {
  return (
    <View style={styles.container}>
      <AppText variant="h2" style={styles.title}>
        {title}
      </AppText>
      {description && (
        <AppText style={styles.description}>{description}</AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
