import React from 'react';
import { StyleSheet } from 'react-native';
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
      style={styles.container}
      titleStyle={styles.title}
      subtitleStyle={styles.subtitle}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
  },
  title: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 14,
  },
});
