import React from 'react';
import { AppLoading } from 'expo';
import {
  useFonts,
  Inter_100Thin,
  Inter_300Light,
  Inter_500Medium,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { ThemeProvider } from './src/context/ThemeContext';
import { ConfigProvider } from './src/context/AppConfigContext';
import { AuthProvider } from './src/context/AuthContext';
import { Router } from './src/Router';
import { StatusBar } from './src/components/StatusBar';

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
    <ThemeProvider>
      <ConfigProvider>
        <AuthProvider>
          <Router />
          <StatusBar />
        </AuthProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
};
