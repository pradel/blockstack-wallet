import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { ChainID } from '@blockstack/stacks-transactions';
import {
  deriveStxAddressChain,
  deriveRootKeychainFromMnemonic,
} from '@blockstack/keychain';
import { getStorageKeyPk } from '../utils';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';
import { Button } from '../components/Button';
import StacksInMetaverse from '../../assets/StacksInMetaverse.png';
import StacksInMetaverseLight from '../../assets/StacksInMetaverseLight.png';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
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
    navigation.navigate('CreateWallet');
  };

  const handleImportWallet = () => {
    Alert.alert('Coming soon');
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
      auth.signIn({
        address: result.address,
        publicKey: result.childKey.publicKey.toString('hex'),
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* TODO replace with real logo */}
      <View style={styles.logoContainer}>
        <Image
          source={
            theme === 'light' ? StacksInMetaverse : StacksInMetaverseLight
          }
          style={styles.logoImage}
        />
      </View>

      <View style={styles.buttonsContainer}>
        {haveWallet ? (
          <Button
            style={styles.button}
            mode="contained"
            onPress={handleAuthenticateWithBiometrics}
          >
            Login with biometrics
          </Button>
        ) : (
          <>
            <Button
              style={styles.button}
              mode="contained"
              onPress={handleCreateNewWallet}
            >
              Create a new wallet
            </Button>
            <Button
              style={styles.button}
              mode="outlined"
              onPress={handleImportWallet}
            >
              I already have a wallet
            </Button>
          </>
        )}
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
  logoImage: {
    height: 400,
    width: 400,
  },
  buttonsContainer: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
});
