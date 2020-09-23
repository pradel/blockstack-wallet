import React from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import { ConfigProvider } from './src/context/AppConfigContext';
import { AuthProvider } from './src/context/AuthContext';
import { Router } from './src/Router';
import { StatusBar } from './src/components/StatusBar';
import { NavigationContainer } from './src/components/NavigationContainer';

export default () => {
  return (
    <ThemeProvider>
      <ConfigProvider>
        <AuthProvider>
          <NavigationContainer>
            <Router />
          </NavigationContainer>
          <StatusBar />
        </AuthProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
};
