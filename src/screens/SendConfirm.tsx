import React, { useState } from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import Constants from 'expo-constants';
import {
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Divider,
  Text,
  Button,
  Spinner,
} from '@ui-kitten/components';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  makeSTXTokenTransfer,
  StacksTestnet,
  broadcastTransaction,
  StacksTransaction,
  ChainID,
} from '@blockstack/stacks-transactions';
import { deriveStxAddressChain } from '@blockstack/keychain';
import Big from 'bn.js';
import { RootStackParamList } from '../types/router';
import {
  getStorageKeyPk,
  stacksToMicro,
  getRootKeychainFromMnemonic,
} from '../utils';
import { useAppConfig } from '../context/AppConfigContext';

type SendConfirmNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SendConfirm'
>;
type SendConfirmScreenRouteProp = RouteProp<RootStackParamList, 'SendConfirm'>;

export const SendConfirmScreen = () => {
  const navigation = useNavigation<SendConfirmNavigationProp>();
  const route = useRoute<SendConfirmScreenRouteProp>();
  const appConfig = useAppConfig();
  const [loading, setLoading] = useState(false);

  // TODO show transaction details for confirmation

  const handleConfirm = async () => {
    setLoading(false);

    if (appConfig.appConfig.requireBiometricTransaction) {
      const authenticateResult = await LocalAuthentication.authenticateAsync();
      if (!authenticateResult.success) return;
    }

    setLoading(true);

    const mnemonic = await SecureStore.getItemAsync(getStorageKeyPk());
    if (mnemonic) {
      const network = new StacksTestnet();

      const rootNode = await getRootKeychainFromMnemonic(mnemonic);
      const result = deriveStxAddressChain(ChainID.Testnet)(rootNode);

      let transaction: StacksTransaction;
      try {
        transaction = await makeSTXTokenTransfer({
          recipient: route.params.address,
          amount: new Big(stacksToMicro(route.params.amount)),
          senderKey: result.privateKey,
          network,
          // TODO allow custom memo message
          memo: 'test memo',
        });
      } catch (error) {
        Alert.alert(`Failed to create transaction. ${error.message}`);
        setLoading(false);
        return;
      }

      try {
        await broadcastTransaction(transaction, network);
      } catch (error) {
        Alert.alert(`Failed to broadcast transaction. ${error.message}`);
        setLoading(false);
        return;
      }

      navigation.navigate('Main');
    }
  };

  return (
    <Layout style={styles.container}>
      <TopNavigation
        title="Confirm details"
        alignment="center"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props) => <Icon {...props} name="arrow-back" />}
            onPress={() => navigation.goBack()}
          />
        )}
      />

      <Layout style={styles.contentContainer}>
        <Layout />

        <Layout style={styles.buttonsContainer}>
          <Button
            size="large"
            onPress={handleConfirm}
            accessoryLeft={(props) =>
              loading ? (
                <View style={[props?.style, styles.indicator]}>
                  <Spinner />
                </View>
              ) : (
                (null as any)
              )
            }
            disabled={loading}
          >
            {!loading ? 'Confirm' : ''}
          </Button>
        </Layout>
      </Layout>
    </Layout>
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
  },
  buttonsContainer: {
    padding: 16,
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
