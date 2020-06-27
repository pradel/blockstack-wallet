import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import {
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Divider,
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
      <Divider />

      <Layout style={styles.textContainer}>
        <Text style={styles.text} category="s1">
          {mnemonic}
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
    paddingTop: 64,
    alignItems: 'center',
  },
  text: { textAlign: 'center' },
});
