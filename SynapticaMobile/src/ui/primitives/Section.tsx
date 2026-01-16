import React, {PropsWithChildren} from 'react';
import {View, StyleSheet} from 'react-native';
import {AppText} from './Text';
import {spacing} from '../theme';

interface SectionProps extends PropsWithChildren {
  title: string;
}

export const Section: React.FC<SectionProps> = ({title, children}) => {
  return (
    <View style={styles.section}>
      <AppText variant="h2">{title}</AppText>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  content: {
    marginTop: spacing.sm,
  },
});
