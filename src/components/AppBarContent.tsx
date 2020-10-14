import React from 'react';
import { Appbar } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

export const AppbarContent = ({
  ...props
}: React.ComponentProps<typeof Appbar.Content>) => {
  const { theme } = useTheme();

  const color = theme === 'light' ? '#000000' : '#ffffff';

  return (
    <Appbar.Content
      {...props}
      color={color}
      style={{
        flex: 0,
      }}
      titleStyle={{
        fontSize: 32,
      }}
      subtitleStyle={{
        fontSize: 14,
      }}
    />
  );
};
