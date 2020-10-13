import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { Button } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { ChainID } from '@blockstack/stacks-transactions';
import {
  deriveStxAddressChain,
  deriveRootKeychainFromMnemonic,
} from '@blockstack/keychain';
import { getStorageKeyPk } from '../utils';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';
import { UndrawVoid } from '../images/UndrawVoid';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const auth = useAuth();
  const appConfig = useAppConfig();
  const [haveWallet, setHaveWallet] = useState<boolean>();

  useEffect(() => {
    const checkWalletInDevice = async () => {
      const haveLocalWallet = Boolean(
        await SecureStore.getItemAsync(getStorageKeyPk())
      );
      setHaveWallet(haveLocalWallet);

      // We ask user to enter biometrics directly if a wallet is already setup
      if (haveLocalWallet) {
        handleAuthenticateWithBiometrics();
      }
    };

    checkWalletInDevice();
  }, []);

  const handleCreateNewWallet = () => {
    console.log('press');
    navigation.navigate('CreateWallet');
  };

  const handleImportWallet = () => {
    throw new Error('Test Crashlytics');
    // TODO redirect to the import wallet flow
  };

  const handleAuthenticateWithBiometrics = async () => {
    if (appConfig.appConfig.requireBiometricOpenApp) {
      const authenticateResult = await LocalAuthentication.authenticateAsync();
      if (!authenticateResult.success) {
        return;
      }
    }

    const mnemonic = await SecureStore.getItemAsync(getStorageKeyPk());
    if (mnemonic) {
      const rootNode = await deriveRootKeychainFromMnemonic(mnemonic);
      const result = deriveStxAddressChain(ChainID.Testnet)(rootNode);
      auth.signIn(result.address);
    }
  };

  return (
    <View style={styles.container}>
      {/* TODO replace with real logo */}
      <View style={styles.logoContainer}>
        <UndrawVoid height={150} />
      </View>

      <View style={styles.buttonsContainer}>
        {haveWallet && (
          <Button
            style={styles.button}
            mode="contained"
            onPress={handleAuthenticateWithBiometrics}
            labelStyle={{
              marginVertical: 16,
            }}
          >
            Login with biometrics
          </Button>
        )}
        <Button
          style={styles.button}
          mode={!haveWallet ? 'contained' : 'outlined'}
          onPress={handleCreateNewWallet}
          labelStyle={{
            marginVertical: 16,
          }}
        >
          Create a new wallet
        </Button>
        <Button
          style={styles.button}
          mode="outlined"
          onPress={handleImportWallet}
          labelStyle={{
            marginVertical: 16,
          }}
        >
          I already have a wallet
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 16,
  },
  logoContainer: {
    paddingTop: 128,
    alignItems: 'center',
  },
  buttonsContainer: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
});