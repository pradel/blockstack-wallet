import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import {
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Text,
} from '@ui-kitten/components';
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
    <Layout style={styles.container}>
      <TopNavigation
        title="Backup your passphrase"
        alignment="center"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props) => <Icon {...props} name="arrow-back" />}
            onPress={() => navigation.goBack()}
          />
        )}
      />

      <Layout style={styles.wordContainer}>
        {mnemonic?.split(' ').map((word, index) => (
          <Layout key={index} level="3" style={styles.wordItemContainer}>
            <Text category="h6">{word}</Text>
          </Layout>
        ))}
      </Layout>

      <Layout style={styles.textContainer}>
        <Text>
          These words are the keys to access your blockstack wallet. Keep it in
          a safe place and do not share it with anyone.
        </Text>
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
  },
  textContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
  },
  wordContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
  },
  wordItemContainer: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginVertical: 8,
    marginRight: 8,
  },
});
