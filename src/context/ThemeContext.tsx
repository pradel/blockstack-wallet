import React, { createContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {
  Provider as PaperProvider,
  DefaultTheme as PaperDefaultTheme,
  DarkTheme as PaperDarkTheme,
} from 'react-native-paper';
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';

const CombinedDefaultTheme = {
  ...PaperDefaultTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: '#1A202C',
  },
};
const CombinedDarkTheme = {
  ...PaperDarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    ...NavigationDarkTheme.colors,
  },
};

const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}>({ theme: 'light', toggleTheme: () => {} });

interface ThemeProviderProps {
  children: React.ReactNode;
}

const appThemeKey = '@appTheme';

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>();

  useEffect(() => {
    const loadThemeFromStorage = async () => {
      try {
        const value = await AsyncStorage.getItem(appThemeKey);
        if (value !== null && (value === 'light' || value === 'dark')) {
          setTheme(value);
        } else {
          setTheme('light');
        }
      } catch (error) {
        Alert.alert(`Failed to load theme. ${error.message}`);
      }
    };

    loadThemeFromStorage();
  }, []);

  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      await AsyncStorage.setItem(appThemeKey, nextTheme);
    } catch (error) {
      Alert.alert(`Failed to save theme. ${error.message}`);
    }
  };

  if (!theme) {
    return null;
  }

  const customTheme =
    theme === 'light' ? CombinedDefaultTheme : CombinedDarkTheme;

  return (
    <React.Fragment>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <PaperProvider theme={customTheme}>
          <NavigationContainer theme={customTheme}>
            {children}
          </NavigationContainer>
        </PaperProvider>
      </ThemeContext.Provider>
    </React.Fragment>
  );
};

export const useTheme = () => React.useContext(ThemeContext);
