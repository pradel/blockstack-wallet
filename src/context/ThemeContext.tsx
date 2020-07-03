import React, { createContext, useState } from 'react';
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

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // TODO fetch theme from local storage
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    // TODO save to local storage
    setTheme(nextTheme);
  };

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
