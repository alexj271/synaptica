import React, {PropsWithChildren} from 'react';
import {StyleSheet} from 'react-native';
import {Card} from './Card';
import {AppText} from './Text';
import {colors, spacing} from '../theme';

interface InsightCardProps extends PropsWithChildren {
  type?: 'info' | 'warning' | 'danger';
  title: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  type = 'info',
  title,
  children,
}) => {
  const getBorderColor = () => {
    if (type === 'warning') return colors.warning;
    if (type === 'danger') return colors.error;
    return colors.primary;
  };

  return (
    <Card style={[styles.card, {borderLeftColor: getBorderColor()}]}>
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      <AppText style={styles.content}>{children}</AppText>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
  },
  title: {
    marginBottom: spacing.xs,
  },
  content: {
    color: colors.text,
  },
});
