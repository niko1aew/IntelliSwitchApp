import React from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import { SettingsScreen } from './screens/SettingsScreen';

const MainStack = createStackNavigator(
  {
    Home: HomeScreen,
    Settings: SettingsScreen
  },
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: {
      headerTransparent: true
    }
  }
);

const AppContainer = createAppContainer(MainStack);

export default function App() {
  return <AppContainer />;
}
