import React from 'react';
import {Screen, Section, EmptyState} from '../../ui/primitives';

export const PlanScreen: React.FC = () => {
  return (
    <Screen>
      <Section title="План">
        <EmptyState
          title="Скоро здесь появится ваш план"
          description="Мы работаем над персонализированным планом здоровья"
        />
      </Section>
    </Screen>
  );
};
