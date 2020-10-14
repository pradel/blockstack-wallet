import React from 'react';
import { Appbar } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

export const AppbarHeader = ({
  ...props
}: React.ComponentProps<typeof Appbar.Header>) => {
  const { theme } = useTheme();

  // TODO in dark mode is it really #ffffff or a variant?
  const backgroundColor = theme === 'light' ? '#ffffff' : '#000000';

  return <Appbar.Header {...props} style={{ backgroundColor, elevation: 0 }} />;
};
