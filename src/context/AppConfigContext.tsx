import React, { createContext, useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

interface AppConfig {
  requireBiometricOpenApp: boolean;
  requireBiometricTransaction: boolean;
  network: 'mainnet' | 'testnet';
}

const AppConfigContext = createContext<{
  appConfig: AppConfig;
  setRequireBiometricOpenApp: (
    requireBiometricOpenApp: boolean
  ) => Promise<void>;
  setRequireBiometricTransaction: (
    requireBiometricTransaction: boolean
  ) => Promise<void>;
  setNetwork: (network: 'mainnet' | 'testnet') => Promise<void>;
}>({} as any);

interface AppConfigProviderProps {
  children: React.ReactNode;
}

const appConfigKey = '@appConfig';

const defaultConfig: AppConfig = {
  requireBiometricOpenApp: true,
  requireBiometricTransaction: true,
  network: 'testnet',
};

export const ConfigProvider = ({ children }: AppConfigProviderProps) => {
  const [appConfig, setAppConfig] = useState<AppConfig>();

  useEffect(() => {
    const loadConfigFromStorage = async () => {
      try {
        const value = await AsyncStorage.getItem(appConfigKey);
        if (value !== null) {
          try {
            const jsonValue = JSON.parse(value);
            setAppConfig(jsonValue);
          } catch (error) {
            Alert.alert(`Failed to parse app config. ${error.message}`);
          }
        } else {
          setAppConfig(defaultConfig);
        }
      } catch (error) {
        Alert.alert(`Failed to load app config. ${error.message}`);
      }
    };

    loadConfigFromStorage();
  }, []);

  const setNewConfig = async (newConfig: AppConfig) => {
    setAppConfig(newConfig);
    try {
      const jsonValue = JSON.stringify(newConfig);
      await AsyncStorage.setItem(appConfigKey, jsonValue);
    } catch (error) {
      Alert.alert(`Failed to save app config. ${error.message}`);
    }
  };

  const appConfigContext = useMemo(
    () => ({
      setRequireBiometricOpenApp: async (requireBiometricOpenApp: boolean) => {
        if (!appConfig) {
          return;
        }
        return setNewConfig({ ...appConfig, requireBiometricOpenApp });
      },
      setRequireBiometricTransaction: async (
        requireBiometricTransaction: boolean
      ) => {
        if (!appConfig) {
          return;
        }
        return setNewConfig({ ...appConfig, requireBiometricTransaction });
      },
      setNetwork: async (network: 'mainnet' | 'testnet') => {
        if (!appConfig) {
          return;
        }
        return setNewConfig({ ...appConfig, network });
      },
    }),
    [appConfig]
  );

  if (!appConfig) {
    return null;
  }

  return (
    <AppConfigContext.Provider
      value={{
        appConfig,
        setRequireBiometricOpenApp: appConfigContext.setRequireBiometricOpenApp,
        setRequireBiometricTransaction:
          appConfigContext.setRequireBiometricTransaction,
        setNetwork: appConfigContext.setNetwork,
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => React.useContext(AppConfigContext);
