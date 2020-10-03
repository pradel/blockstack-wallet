import React from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import { ConfigProvider } from './src/context/AppConfigContext';
import { AuthProvider } from './src/context/AuthContext';
import { Router } from './src/Router';
import { StatusBar } from './src/components/StatusBar';

export default () => {
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
