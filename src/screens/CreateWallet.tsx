import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import Constants from 'expo-constants';
import { Layout, Text, Button, Spinner } from '@ui-kitten/components';
import { ChainID } from '@blockstack/stacks-transactions';
import { deriveStxAddressChain } from '@blockstack/keychain';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { BIP32Interface } from 'bitcoinjs-lib';
import { useAuth } from '../context/AuthContext';
import { getStorageKeyPk, generateMnemonicRootKeychain } from '../utils';

// TODO display mnemonic 24-word phrase

export const CreateWalletScreen = () => {
  const auth = useAuth();
  const [mnemonic, setMnemonic] = useState<{
    rootNode: BIP32Interface;
    plaintextMnemonic: string;
  }>();

  useEffect(() => {
    // when the screen is mounted we generate a new private key
    const generateMnemonic = async () => {
      try {
        const newMnemonic = await generateMnemonicRootKeychain();
        setMnemonic(newMnemonic);
      } catch (error) {
        // TODO display error in snackbar
      }
    };

    generateMnemonic();
  }, []);

  const handleCreateNewWallet = async () => {
    if (!mnemonic) {
      return;
    }

    const authenticateResult = await LocalAuthentication.authenticateAsync();

    if (authenticateResult.success) {
      try {
        // We store the hex key in the device secure storage
        await SecureStore.setItemAsync(
          getStorageKeyPk(),
          mnemonic.plaintextMnemonic
        );
        const result = deriveStxAddressChain(ChainID.Testnet)(
          mnemonic.rootNode
        );
        auth.signIn(result.address);
      } catch (error) {
        // TODO report error to Sentry
        Alert.alert(error.message);
      }
    }
  };

  const handleImportWallet = () => {
    // TODO redirect to the import wallet flow
  };

  if (!mnemonic) {
    return (
      <Layout style={styles.containerFull}>
        <Spinner size="large" />
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      <View style={styles.textContainer}>
        {mnemonic && (
          <Text style={styles.text} category="s1">
            {mnemonic.plaintextMnemonic}
          </Text>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <Button style={styles.button} onPress={handleCreateNewWallet}>
          Save wallet
        </Button>
        <Button
          style={styles.button}
          appearance="ghost"
          onPress={handleImportWallet}
        >
          I already have a wallet
        </Button>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  containerFull: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
    justifyContent: 'space-between',
  },
  textContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 64,
    alignItems: 'center',
  },
  text: { textAlign: 'center' },
  buttonsContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  button: {
    width: '100%',
  },
});
