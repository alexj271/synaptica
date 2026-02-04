import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store } from '../modules/store';

export const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </Provider>
  );
};
