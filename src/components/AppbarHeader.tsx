import React from 'react';
import { StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

export const AppbarHeader = ({
  ...props
}: React.ComponentProps<typeof Appbar.Header>) => {
  const { theme } = useTheme();

  const backgroundColor = theme === 'light' ? '#ffffff' : '#000000';

  return (
    <Appbar.Header
      {...props}
      style={[styles.appbarHeader, { backgroundColor }]}
    />
  );
};

const styles = StyleSheet.create({
  appbarHeader: {
    elevation: 0,
  },
});
