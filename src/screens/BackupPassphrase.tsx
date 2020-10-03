import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { Appbar, Paragraph, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { getStorageKeyPk } from '../utils';

export const BackupPassphrase = () => {
  const navigation = useNavigation();
  const [mnemonic, setMnemonic] = useState<string>();

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

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Backup your passphrase" />
      </Appbar.Header>

      <Surface style={styles.wordContainer}>
        {mnemonic?.split(' ').map((word, index) => (
          <Paragraph key={index} style={styles.text}>
            {word}
          </Paragraph>
        ))}
      </Surface>

      <View style={styles.textContainer}>
        <Paragraph>
          These words are the keys to access your blockstack wallet. Keep it in
          a safe place and do not share it with anyone.
        </Paragraph>
      </View>
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
  },
  text: {
    marginRight: 8,
  },
});
