import React from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {
  Screen,
  Section,
  MetricCard,
  ActionItem,
  InsightCard,
} from '../../ui/primitives';
import {spacing} from '../../ui/theme';

// Mock data (временно для MVP)
const mockMetrics = [
  {
    id: 'sleep',
    title: 'Сон',
    value: '6ч 20м',
    trend: 'down' as const,
    status: 'warning' as const,
  },
  {
    id: 'activity',
    title: 'Активность',
    value: '7 200',
    trend: 'up' as const,
    status: 'normal' as const,
  },
  {
    id: 'pressure',
    title: 'Давление',
    value: '135 / 85',
    trend: 'up' as const,
    status: 'warning' as const,
  },
];

const mockFocus = [
  {
    id: 'walk',
    title: 'Прогулка 20 мин',
    subtitle: 'Поддерживает давление и сон',
    done: false,
  },
  {
    id: 'breath',
    title: 'Дыхание 2×5 мин',
    subtitle: 'Снижает уровень стресса',
    done: false,
  },
];

export const DashboardScreen: React.FC = () => {
  const todaySummary =
    'Сон ниже нормы. Рекомендуется снизить нагрузку и сфокусироваться на восстановлении.';

  return (
    <Screen>
      {/* ===== Сегодня ===== */}
      <Section title="Сегодня">
        <InsightCard type="warning" title="Общее состояние">
          {todaySummary}
        </InsightCard>
      </Section>

      {/* ===== Метрики ===== */}
      <Section title="Ключевые показатели">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.metricsScroll}>
          {mockMetrics.map(metric => (
            <View key={metric.id} style={styles.metricCard}>
              <MetricCard
                title={metric.title}
                value={metric.value}
                trend={metric.trend}
                status={metric.status}
              />
            </View>
          ))}
        </ScrollView>
      </Section>

      {/* ===== Фокус дня ===== */}
      <Section title="Фокус дня">
        {mockFocus.map(item => (
          <ActionItem
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            done={item.done}
          />
        ))}
      </Section>

      {/* ===== Быстрое действие ===== */}
      <View style={styles.recommendation}>
        <InsightCard type="info" title="Рекомендация">
          Обсудить текущую стратегию и возможные корректировки в чате.
        </InsightCard>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  metricsScroll: {
    gap: spacing.sm,
  },
  metricCard: {
    width: 140,
  },
  recommendation: {
    marginTop: spacing.lg,
  },
});
