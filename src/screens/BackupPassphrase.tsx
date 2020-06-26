import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
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
  const [privateKey, setPrivateKey] = useState<string>();

  useEffect(() => {
    const loadPrivateKey = async () => {
      const authenticateResult = await LocalAuthentication.authenticateAsync();

      if (!authenticateResult.success) {
        navigation.goBack();
        return;
      }

      const privateKeyHex = await SecureStore.getItemAsync(getStorageKeyPk());
      if (privateKeyHex) {
        setPrivateKey(privateKeyHex);
      }
    };

    loadPrivateKey();
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
          {privateKey}
        </Text>
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
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
