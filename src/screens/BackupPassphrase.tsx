import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { Appbar, Paragraph, Surface, Snackbar } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import Clipboard from '@react-native-community/clipboard';
import { getStorageKeyPk } from '../utils';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { Button } from '../components/Button';
import { RootStackParamList } from '../types/router';

type BackupPassphraseNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BackupPassphrase'
>;

export const BackupPassphrase = () => {
  const navigation = useNavigation<BackupPassphraseNavigationProp>();
  const [mnemonic, setMnemonic] = useState<string>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    const loadMnemonic = async () => {
      const authenticateResult = await LocalAuthentication.authenticateAsync();

      if (!authenticateResult.success) {
        navigation.goBack();
        return;
      }

      const mnemonicStorage = await SecureStore.getItemAsync(getStorageKeyPk());
      if (mnemonicStorage) {
        setMnemonic(mnemonicStorage);
      }
    };

    loadMnemonic();
  }, []);

  const handleCopyClipboard = () => {
    if (mnemonic) {
      Clipboard.setString(mnemonic);
      setSnackbarVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>

      <AppbarContent title="Backup your passphrase" />

      <Surface style={styles.wordContainer}>
        {mnemonic?.split(' ').map((word, index) => (
          <Paragraph key={index} style={styles.text}>
            {word}
          </Paragraph>
        ))}
      </Surface>

      <Button style={styles.copyButton} onPress={handleCopyClipboard}>
        Copy to clipboard
      </Button>

      <View style={styles.textContainer}>
        <Paragraph>
          These words are the keys to access your blockstack wallet. Keep it in
          a safe place and do not share it with anyone.
        </Paragraph>
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
  textContainer: {
    marginHorizontal: 16,
    paddingTop: 16,
  },
  wordContainer: {
    marginHorizontal: 16,
    marginTop: 32,
    padding: 32,
    flexWrap: 'wrap',
    display: 'flex',
    flexDirection: 'row',
    elevation: 0,
  },
  copyButton: {
    marginHorizontal: 16,
  },
  text: {
    marginRight: 8,
  },
});
