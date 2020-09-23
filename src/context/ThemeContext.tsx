import React, { createContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import * as eva from '@eva-design/eva';
import { IconRegistry, ApplicationProvider } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { default as customTheme } from '../../custom-theme.json';
import { default as customMapping } from '../mapping.json';

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

  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <ApplicationProvider
          {...eva}
          customMapping={customMapping as any}
          theme={{ ...eva[theme], ...customTheme }}
        >
          {children}
        </ApplicationProvider>
      </ThemeContext.Provider>
    </React.Fragment>
  );
};

export const useTheme = () => React.useContext(ThemeContext);
