import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { ScrollView } from 'react-native-gesture-handler';

export const BackupPassphrase = () => {
  const navigation = useNavigation();
  const [mnemonic, setMnemonic] = useState<string>();

  useEffect(() => {
    const loadMnemonic = async () => {
      // const authenticateResult = await LocalAuthentication.authenticateAsync();

      // if (!authenticateResult.success) {
      //   navigation.goBack();
      //   return;
      // }

      const mnemonicStorage = await SecureStore.getItemAsync(getStorageKeyPk());
      if (mnemonicStorage) {
        setMnemonic(mnemonicStorage);
      }
    };

    loadMnemonic();
  }, []);

  const renderWord = (index: number, word: string) => (
    <Text key={index} category="h3">
      {index + 1} - {word}
    </Text>
  );

  const array1 = mnemonic ? mnemonic.split(' ').slice(0, 12) : undefined;
  const array2 = mnemonic ? mnemonic.split(' ').slice(12, 24) : undefined;

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

      <ScrollView>
        <Layout style={styles.columnContainer}>
          <View style={styles.column}>
            {array1?.map((word, index) => renderWord(index, word))}
          </View>
          <View style={styles.column}>
            {array2?.map((word, index) => renderWord(index + 12, word))}
          </View>
        </Layout>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
  },
  columnContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
  },
  column: {
    flex: 1,
    width: '50%',
  },
});
