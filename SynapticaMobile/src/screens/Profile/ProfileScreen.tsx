import React from 'react';
import {Screen, AppText, Section, Card} from '../../ui/primitives';

export const ProfileScreen: React.FC = () => {
  return (
    <Screen>
      <Section title="Профиль">
        <Card>
          <AppText variant="h3">Настройки профиля</AppText>
          <AppText variant="muted">Скоро здесь появятся настройки</AppText>
        </Card>
      </Section>
    </Screen>
  );
};
