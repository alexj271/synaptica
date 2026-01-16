import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card} from './Card';
import {AppText} from './Text';
import {colors, spacing} from '../theme';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  status = 'normal',
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getStatusColor = () => {
    if (status === 'warning') return colors.warning;
    if (status === 'danger') return colors.error;
    return colors.success;
  };

  return (
    <Card>
      <AppText variant="small" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="h1">{value}</AppText>
      {trend && (
        <AppText variant="small" style={{color: getStatusColor()}}>
          {getTrendIcon()}
        </AppText>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});
