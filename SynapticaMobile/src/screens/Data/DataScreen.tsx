import React from 'react';
import {Screen, AppText, Section, EmptyState} from '../../ui/primitives';

export const DataScreen: React.FC = () => {
  return (
    <Screen>
      <Section title="Данные">
        <EmptyState
          title="Нет данных"
          description="Добавьте показатели вручную или подключите браслет"
        />
      </Section>
    </Screen>
  );
};
