import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import AuthFormScreen from '../screens/AuthFormScreen';
import DecksScreen from '../screens/DecksScreen';
import StudyScreen from '../screens/StudyScreen';
import CreateDeckScreen from '../screens/CreateDeckScreen';
import AddCardScreen from '../screens/AddCardScreen';
import EditCardScreen from '../screens/EditCardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StatsScreen from '../screens/StatsScreen';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AuthForm" component={AuthFormScreen} options={{ title: 'Logowanie / Rejestracja' }} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Decks" component={DecksScreen} options={{ title: 'Twoje Zestawy' }} />
    <Stack.Screen name="Study" component={StudyScreen} options={({ route }) => ({ title: route.params.deckTitle || 'Nauka' })} />
    <Stack.Screen name="CreateDeck" component={CreateDeckScreen} options={{ title: 'Nowy Zestaw' }} />
    <Stack.Screen name="AddCard" component={AddCardScreen} options={{ title: 'Nowa Fiszka' }} />
    <Stack.Screen name="EditCard" component={EditCardScreen} options={{ title: 'Edytuj Fiszkę' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mój Profil' }} />
    <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Moje Statystyki' }} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user } = useAuth();
  const { theme, colors } = useTheme();

  const navigationTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;