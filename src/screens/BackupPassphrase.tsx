import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { Appbar, Paragraph, Surface } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { getStorageKeyPk } from '../utils';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { RootStackParamList } from '../types/router';

type BackupPassphraseNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BackupPassphrase'
>;

export const BackupPassphrase = () => {
  const navigation = useNavigation<BackupPassphraseNavigationProp>();
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
    elevation: 0,
  },
  text: {
    marginRight: 8,
  },
});
