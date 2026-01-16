import React from 'react';
import {Providers} from './Providers';
import {RootNavigator} from '../navigation/RootNavigator';

export const App = () => {
  return (
    <Providers>
      <RootNavigator />
    </Providers>
  );
};
