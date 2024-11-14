import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';

import { AuthStack } from './navigation/AuthStack';
import { MainStack } from './navigation/MainStack';
import { useAuth } from './hooks/useAuth';

const Stack = createNativeStackNavigator();

export default function App() {
  const { user, initializing } = useAuth();

  if (initializing) return null;

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}