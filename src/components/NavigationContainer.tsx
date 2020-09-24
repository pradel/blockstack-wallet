import React from 'react';
import {
  NavigationContainer as RNNavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

interface NavigationContainerProps {
  children: React.ReactNode;
}

export const NavigationContainer = ({ children }: NavigationContainerProps) => {
  const { theme } = useTheme();

  return (
    <RNNavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
      {children}
    </RNNavigationContainer>
  );
};
