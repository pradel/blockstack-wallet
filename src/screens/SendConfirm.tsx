import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import Constants from 'expo-constants';
import { Appbar, List } from 'react-native-paper';
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
  makeUnsignedSTXTokenTransfer,
} from '@blockstack/stacks-transactions';
import {
  deriveStxAddressChain,
  deriveRootKeychainFromMnemonic,
} from '@blockstack/keychain';
import Big from 'bn.js';
import { RootStackParamList } from '../types/router';
import { getStorageKeyPk, stacksToMicro, microToStacks } from '../utils';
import { useAppConfig } from '../context/AppConfigContext';
import { Button } from '../components/Button';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { useAuth } from '../context/AuthContext';

type SendConfirmNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SendConfirm'
>;
type SendConfirmScreenRouteProp = RouteProp<RootStackParamList, 'SendConfirm'>;

export const SendConfirmScreen = () => {
  const navigation = useNavigation<SendConfirmNavigationProp>();
  const route = useRoute<SendConfirmScreenRouteProp>();
  const appConfig = useAppConfig();
  const auth = useAuth();
  const [unsignedTransaction, setUnsignedTransaction] = useState<
    StacksTransaction
  >();
  const [loading, setLoading] = useState(false);
  // TODO pass down memo once it's ready
  const memo = undefined;

  useEffect(() => {
    // We create an unsigned transaction to estimate the network fees and show them to the user
    const network = new StacksTestnet();

    // TODO catch in case of failure
    makeUnsignedSTXTokenTransfer({
      recipient: route.params.address,
      amount: new Big(stacksToMicro(route.params.amount)),
      network,
      publicKey: auth.publicKey,
      memo,
    }).then((transaction) => {
      setUnsignedTransaction(transaction);
    });
  }, [setUnsignedTransaction, auth.publicKey, route.params]);

  // TODO show transaction details for confirmation

  const handleConfirm = async () => {
    setLoading(false);

    if (appConfig.appConfig.requireBiometricTransaction) {
      const authenticateResult = await LocalAuthentication.authenticateAsync();
      if (!authenticateResult.success) {
        return;
      }
    }

    setLoading(true);

    const mnemonic = await SecureStore.getItemAsync(getStorageKeyPk());
    if (mnemonic) {
      const network = new StacksTestnet();

      const rootNode = await deriveRootKeychainFromMnemonic(mnemonic);
      const result = deriveStxAddressChain(ChainID.Testnet)(rootNode);

      const fee = unsignedTransaction?.auth.getFee();

      if (!fee) {
        Alert.alert('Fee not found');
        return;
      }

      let transaction: StacksTransaction;
      try {
        transaction = await makeSTXTokenTransfer({
          recipient: route.params.address,
          amount: new Big(stacksToMicro(route.params.amount)),
          senderKey: result.privateKey,
          network,
          fee,
          memo,
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
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>

      <View style={styles.contentContainer}>
        <View>
          <AppbarContent
            title="Confirm details"
            subtitle="Please check that everything looks good."
          />

          <View style={styles.listContainer}>
            <List.Item
              title="Recipient address"
              description={route.params.address}
            />
            <List.Item
              title="Amount"
              // TODO nicely display decimals etc..
              description={`${route.params.amount} STX`}
            />
            <List.Item
              title="Network fee"
              description={
                unsignedTransaction
                  ? // TODO use big for this calc
                    `${microToStacks(
                      unsignedTransaction.auth.getFee()!.toString()
                    )} STX`
                  : 'Estimating fee ...'
              }
            />
            {memo ? <List.Item title="Memo" description={memo} /> : null}
            <List.Item
              title="Total"
              description={
                unsignedTransaction
                  ? // TODO use big for this calc
                    `${microToStacks(
                      unsignedTransaction.auth
                        .getFee()!
                        .add(new Big(stacksToMicro(route.params.amount)))
                        .toString()
                    )} STX`
                  : ''
              }
            />
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={handleConfirm}
            loading={loading}
            disabled={!unsignedTransaction || loading}
          >
            {!loading ? 'Confirm' : ''}
          </Button>
        </View>
      </View>
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
  },
  listContainer: {
    marginTop: 32,
  },
  buttonsContainer: {
    padding: 16,
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
