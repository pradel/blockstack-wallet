import React, { createContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {
  Provider as PaperProvider,
  DefaultTheme as PaperDefaultTheme,
  DarkTheme as PaperDarkTheme,
  configureFonts,
} from 'react-native-paper';
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { config } from '../config';

const fontConfig = {
  default: {
    regular: {
      fontFamily: 'Inter_500Medium',
      fontWeight: '500' as '500',
    },
    medium: {
      fontFamily: 'Inter_800ExtraBold',
      fontWeight: '800' as '800',
    },
    light: {
      fontFamily: 'Inter_300Light',
      fontWeight: '300' as '300',
    },
    thin: {
      fontFamily: 'Inter_100Thin',
      fontWeight: '100' as '100',
    },
  },
};

const CombinedDefaultTheme = {
  ...PaperDefaultTheme,
  ...NavigationDefaultTheme,
  fonts: configureFonts(fontConfig),
  colors: {
    ...PaperDefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
    background: '#ffffff',
    primary: config.colors.primary,
  },
};
const CombinedDarkTheme = {
  ...PaperDarkTheme,
  ...NavigationDarkTheme,
  fonts: configureFonts(fontConfig),
  colors: {
    ...PaperDarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: config.colors.primary,
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
