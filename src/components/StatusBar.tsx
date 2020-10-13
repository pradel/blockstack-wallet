import React from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

/**
 * Status bar for the app reacting to the theme change.
 * Will set:
 * - color of the text
 * - color of the background (android only)
 */
export const StatusBar = () => {
  const { theme } = useTheme();

  return (
    <ExpoStatusBar
      animated
      style={theme === 'light' ? 'dark' : 'light'}
      backgroundColor={theme === 'light' ? '#ffffff' : '#1A202C'}
    />
  );
};
