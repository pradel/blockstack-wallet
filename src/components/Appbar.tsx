import React from 'react';
import { Appbar } from 'react-native-paper';

export const AppbarHeader = ({
  ...props
}: React.ComponentProps<typeof Appbar.Header>) => {
  /* TODO black theme */

  return (
    <Appbar.Header
      {...props}
      style={{ backgroundColor: '#fff', elevation: 0 }}
    />
  );
};
