import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Main: undefined;
  // Добавить остальные экраны
};

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
