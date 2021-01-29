import React from 'react';
import { LogBox } from 'react-native';
import AppLoading from 'expo-app-loading';
import {
  useFonts,
  Inter_100Thin,
  Inter_300Light,
  Inter_500Medium,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from 'react-query';
import { ThemeProvider } from './src/context/ThemeContext';
import { ConfigProvider } from './src/context/AppConfigContext';
import { AuthProvider } from './src/context/AuthContext';
import { StacksClientProvider } from './src/context/StacksClientContext';
import { Router } from './src/Router';
import { StatusBar } from './src/components/StatusBar';
import { queryClient } from './src/queryClient';

// for react-query https://github.com/tannerlinsley/react-query/issues/1259#issuecomment-745623606
LogBox.ignoreLogs(['Setting a timer']);

export default () => {
  let [fontsLoaded] = useFonts({
    Inter_100Thin,
    Inter_300Light,
    Inter_500Medium,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ConfigProvider>
          <AuthProvider>
            <StacksClientProvider>
              <Router />
              <StatusBar />
            </StacksClientProvider>
          </AuthProvider>
        </ConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
