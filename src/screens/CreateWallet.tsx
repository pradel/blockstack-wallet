import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import Constants from 'expo-constants';
import {
  Surface,
  Title,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import { ChainID } from '@blockstack/stacks-transactions';
import { deriveStxAddressChain } from '@blockstack/keychain';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { BIP32Interface } from 'bitcoinjs-lib';
import * as Sentry from '@sentry/react-native';
import { useAuth } from '../context/AuthContext';
import { getStorageKeyPk, generateMnemonicRootKeychain } from '../utils';
import { Button } from '../components/Button';

export const CreateWalletScreen = () => {
  const auth = useAuth();
  const [mnemonic, setMnemonic] = useState<{
    rootNode: BIP32Interface;
    plaintextMnemonic: string;
  }>();

  useEffect(() => {
    // when the screen is mounted we generate a new private key
    const generateMnemonic = async () => {
      const newMnemonic = await generateMnemonicRootKeychain();
      setMnemonic(newMnemonic);
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
        auth.signIn({
          address: result.address,
          publicKey: result.childKey.publicKey.toString('hex'),
        });
      } catch (error) {
        Alert.alert(error.message);
        Sentry.captureException(error);
      }
    }
  };

  // TODO back button to return to login screen

  return (
    <View style={styles.container}>
      <View>
        <Title style={styles.title}>Write down your mnemonic</Title>
        <Paragraph style={styles.paragraph}>
          These words are the keys to access your blockstack wallet. Keep it in
          a safe place and do not share it with anyone.
        </Paragraph>

        {mnemonic ? (
          <Surface style={styles.wordContainer}>
            {mnemonic.plaintextMnemonic.split(' ').map((word, index) => (
              <Paragraph key={index} style={styles.text}>
                {word}
              </Paragraph>
            ))}
          </Surface>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating={true} />
          </View>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <Button
          mode="contained"
          onPress={handleCreateNewWallet}
          disabled={!mnemonic}
        >
          Save wallet
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 80,
  },
  title: {
    fontSize: 26,
    marginTop: 32,
    textAlign: 'center',
  },
  paragraph: {
    textAlign: 'center',
  },
  wordContainer: {
    marginTop: 64,
    padding: 32,
    flexWrap: 'wrap',
    display: 'flex',
    flexDirection: 'row',
  },
  text: {
    marginRight: 8,
  },
  buttonsContainer: {
    paddingTop: 16,
    paddingBottom: 16,
  },
});
