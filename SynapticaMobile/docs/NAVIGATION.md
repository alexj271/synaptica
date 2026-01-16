## 1. Установка зависимостей

```bash
yarn add @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-vector-icons
```

### Обязательные шаги для чистого RN:

1. `react-native-gesture-handler` → импорт в `index.js`:

```js
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './src/app/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

2. `react-native-reanimated` → добавить `babel-plugin` в `babel.config.js`:

```js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

3. `react-native-vector-icons` → проверить автолинковку (`react-native link react-native-vector-icons`) или использовать `react-native.config.js`:

```js
module.exports = {
  assets: ['./assets/fonts/'],
};
```

---

## 2. RootNavigator для чистого RN

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';

import { DashboardScreen } from '@/screens/Dashboard/DashboardScreen';
import { ChatScreen } from '@/screens/Chat/ChatScreen';
import { PlanScreen } from '@/screens/Plan/PlanScreen';
import { DataScreen } from '@/screens/Data/DataScreen';
import { ProfileScreen } from '@/screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 60 },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="message-square" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="check-square" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Data"
        component={DataScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="bar-chart-2" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="user" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  </NavigationContainer>
);
```

---

## 3. index.js

```js
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './src/app/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

---

## 4. App.tsx

```tsx
import React from 'react';
import { RootNavigator } from '@/navigation/RootNavigator';
import { Providers } from './Providers'; // Theme, Zustand/Redux store

export default function App() {
  return (
    <Providers>
      <RootNavigator />
    </Providers>
  );
}
```
