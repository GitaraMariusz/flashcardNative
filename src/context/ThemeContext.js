import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightColors = {
  background: '#f0f4f8',
  card: 'white',
  text: '#1e293b',
  textSecondary: '#64748b',
  primary: '#3b82f6',
  border: '#e2e8f0',
  separator: '#e2e8f0',
  icon: '#1e293b',
  success: '#22c55e',
  danger: '#ef4444',
};

const darkColors = {
  background: '#0f172a',
  card: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  primary: '#60a5fa',
  border: '#334155',
  separator: '#334155',
  icon: '#f8fafc',
  success: '#4ade80',
  danger: '#f87171',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState(systemScheme);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async (isDarkMode) => {
    const newTheme = isDarkMode ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('appTheme', newTheme);
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);