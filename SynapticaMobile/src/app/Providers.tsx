import React, {PropsWithChildren} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

export const Providers: React.FC<PropsWithChildren> = ({children}) => {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
};
