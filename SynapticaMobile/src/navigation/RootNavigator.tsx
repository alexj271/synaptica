import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import {DashboardScreen} from '../screens/Dashboard';
import {ChatScreen} from '../screens/Chat';
import {PlanScreen} from '../screens/Plan';
import {DataScreen} from '../screens/Data';
import {ProfileScreen} from '../screens/Profile';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeTabIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="home" color={color} size={size} />
);

const ChatTabIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="message-square" color={color} size={size} />
);

const PlanTabIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="check-square" color={color} size={size} />
);

const DataTabIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="bar-chart-2" color={color} size={size} />
);

const ProfileTabIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="user" color={color} size={size} />
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {height: 60},
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Главная',
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Чат',
          tabBarIcon: ChatTabIcon,
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          tabBarLabel: 'План',
          tabBarIcon: PlanTabIcon,
        }}
      />
      <Tab.Screen
        name="Data"
        component={DataScreen}
        options={{
          tabBarLabel: 'Данные',
          tabBarIcon: DataTabIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ProfileTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}

export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  </NavigationContainer>
);
