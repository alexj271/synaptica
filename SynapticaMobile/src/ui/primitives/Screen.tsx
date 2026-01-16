import React, {PropsWithChildren} from 'react';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {colors, spacing} from '../theme';

interface ScreenProps extends PropsWithChildren {
  scrollable?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({children, scrollable = true}) => {
  if (scrollable) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return <SafeAreaView style={styles.screen}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
});
