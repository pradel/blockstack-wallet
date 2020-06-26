import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import { Layout, Text, Button } from '@ui-kitten/components';
import {
  StacksPrivateKey,
  getAddressFromPrivateKey,
  TransactionVersion,
} from '@blockstack/stacks-transactions';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../context/AuthContext';
import { makeRandomPrivKey, getStorageKeyPk } from '../utils';

// TODO display mnemonic 24-word phrase

export const CreateWalletScreen = () => {
  const auth = useAuth();
  const [privateKey, setPrivateKey] = useState<StacksPrivateKey>();

  useEffect(() => {
    // when the screen is mounted we generate a new private key
    const generatePrivateKey = async () => {
      try {
        const privateKey = await makeRandomPrivKey();
        setPrivateKey(privateKey);
      } catch (error) {
        // TODO display error in snackbar
      }
    };

    generatePrivateKey();
  }, []);

  const handleCreateNewWallet = async () => {
    if (!privateKey) return;

    const authenticateResult = await LocalAuthentication.authenticateAsync();

    if (authenticateResult.success) {
      const privateKeyHex = privateKey.data.toString('hex');
      try {
        // We store the hex key in the device secure storage
        await SecureStore.setItemAsync(getStorageKeyPk(), privateKeyHex);
        const address = getAddressFromPrivateKey(
          privateKeyHex,
          TransactionVersion.Testnet
        );
        auth.signIn(address);
      } catch (error) {
        // TODO report error to Sentry
        Alert.alert(error.message);
      }
    }
  };

  const handleImportWallet = () => {
    // TODO redirect to the import wallet flow
  };

  return (
    <Layout style={styles.container}>
      <View style={styles.textContainer}>
        {privateKey && (
          <Text style={styles.text} category="s1">
            {privateKey.data.toString('hex')}
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
  container: { flex: 1, justifyContent: 'space-between' },
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
