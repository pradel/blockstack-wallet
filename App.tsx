import React from 'react';
import AppLoading from 'expo-app-loading';
import {
  useFonts,
  Inter_100Thin,
  Inter_300Light,
  Inter_500Medium,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from './src/context/ThemeContext';
import { ConfigProvider } from './src/context/AppConfigContext';
import { AuthProvider } from './src/context/AuthContext';
import { Router } from './src/Router';
import { StatusBar } from './src/components/StatusBar';
import { LogBox } from 'react-native';

// for react-query https://github.com/tannerlinsley/react-query/issues/1259#issuecomment-745623606
LogBox.ignoreLogs(['Setting a timer']);

const queryClient = new QueryClient();

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
            <Router />
            <StatusBar />
          </AuthProvider>
        </ConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
