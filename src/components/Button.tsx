import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as RNPButton } from 'react-native-paper';

export const Button = ({
  style,
  labelStyle,
  ...props
}: React.ComponentProps<typeof RNPButton>) => (
  <RNPButton
    {...props}
    style={[styles.container, style]}
    labelStyle={[styles.label, labelStyle]}
  />
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 26,
  },
  label: {
    marginVertical: 16,
  },
});
