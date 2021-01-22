import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import Constants from 'expo-constants';
import {
  Surface,
  Title,
  Paragraph,
  ActivityIndicator,
  Appbar,
  Snackbar,
} from 'react-native-paper';
import { ChainID } from '@stacks/transactions';
import { deriveStxAddressChain } from '@stacks/keychain';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { BIP32Interface } from 'bitcoinjs-lib';
import * as Sentry from '@sentry/react-native';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-community/clipboard';
import { useAuth } from '../../context/AuthContext';
import { useAppConfig } from '../../context/AppConfigContext';
import { getStorageKeyPk, generateMnemonicRootKeychain } from '../../utils';
import { Button } from '../../components/Button';
import { AppbarHeader } from '../../components/AppbarHeader';

export const CreateWalletScreen = () => {
  const navigation = useNavigation();
  const auth = useAuth();
  const { appConfig } = useAppConfig();
  const [mnemonic, setMnemonic] = useState<{
    rootNode: BIP32Interface;
    plaintextMnemonic: string;
  }>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    // when the screen is mounted we generate a new private key
    const generateMnemonic = async () => {
      const newMnemonic = await generateMnemonicRootKeychain();
      setMnemonic(newMnemonic);
    };

    generateMnemonic();
  }, []);

  const handleCopyClipboard = () => {
    if (mnemonic) {
      Clipboard.setString(mnemonic.plaintextMnemonic);
      setSnackbarVisible(true);
    }
  };

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
        const result = deriveStxAddressChain(
          appConfig.network === 'mainnet' ? ChainID.Mainnet : ChainID.Testnet
        )(mnemonic.rootNode);
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

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>

      <View style={styles.contentContainer}>
        <View>
          <Title style={styles.title}>Write down your mnemonic</Title>
          <Paragraph>
            These words are the keys to access your blockstack wallet. Keep it
            in a safe place and do not share it with anyone.
          </Paragraph>

          {mnemonic ? (
            <>
              <Surface style={styles.wordContainer}>
                {mnemonic.plaintextMnemonic.split(' ').map((word, index) => (
                  <Paragraph key={index} style={styles.text}>
                    {word}
                  </Paragraph>
                ))}
              </Surface>
              <Button onPress={handleCopyClipboard}>Copy to clipboard</Button>
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator animating={true} />
            </View>
          )}
        </View>
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

      <Snackbar
        visible={snackbarVisible}
        duration={3000}
        onDismiss={() => setSnackbarVisible(false)}
      >
        Copied to clipboard
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 80,
  },
  title: {
    fontSize: 26,
    marginTop: 16,
  },
  wordContainer: {
    marginTop: 64,
    padding: 32,
    flexWrap: 'wrap',
    display: 'flex',
    flexDirection: 'row',
    elevation: 0,
  },
  text: {
    marginRight: 8,
  },
  buttonsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
});
