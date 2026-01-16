import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Card} from './Card';
import {AppText} from './Text';
import {colors, spacing} from '../theme';

interface ActionItemProps {
  title: string;
  subtitle?: string;
  done: boolean;
  onPress?: () => void;
}

export const ActionItem: React.FC<ActionItemProps> = ({
  title,
  subtitle,
  done,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card>
        <View style={styles.container}>
          <View style={styles.checkbox}>
            <View
              style={[
                styles.checkboxInner,
                done && styles.checkboxChecked,
              ]}
            />
          </View>
          <View style={styles.content}>
            <AppText style={done && styles.doneText}>{title}</AppText>
            {subtitle && (
              <AppText variant="small" style={styles.subtitle}>
                {subtitle}
              </AppText>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  doneText: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
});
