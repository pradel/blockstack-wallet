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
  StacksMainnet,
} from '@blockstack/stacks-transactions';
import {
  deriveStxAddressChain,
  deriveRootKeychainFromMnemonic,
} from '@blockstack/keychain';
import Big from 'big.js';
import BnJs from 'bn.js';
import { RootStackParamList } from '../types/router';
import { getStorageKeyPk } from '../utils';
import { useAppConfig } from '../context/AppConfigContext';
import { Button } from '../components/Button';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { useAuth } from '../context/AuthContext';
import { usePrice } from '../context/PriceContext';

type SendConfirmNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SendConfirm'
>;
type SendConfirmScreenRouteProp = RouteProp<RootStackParamList, 'SendConfirm'>;

export const SendConfirmScreen = () => {
  const navigation = useNavigation<SendConfirmNavigationProp>();
  const route = useRoute<SendConfirmScreenRouteProp>();
  const { appConfig } = useAppConfig();
  const auth = useAuth();
  const { price } = usePrice();
  const [
    unsignedTransaction,
    setUnsignedTransaction,
  ] = useState<StacksTransaction>();
  const [loading, setLoading] = useState(false);
  // TODO pass down memo once it's ready
  const memo = undefined;

  useEffect(() => {
    // We create an unsigned transaction to estimate the network fees and show them to the user
    const network = new StacksTestnet();

    // TODO catch in case of failure
    makeUnsignedSTXTokenTransfer({
      recipient: route.params.address,
      amount: new BnJs(route.params.amountInMicro),
      network,
      publicKey: auth.publicKey,
      memo,
    }).then((transaction) => {
      setUnsignedTransaction(transaction);
    });
  }, [setUnsignedTransaction, auth.publicKey, route.params]);

  const handleConfirm = async () => {
    setLoading(false);

    if (appConfig.requireBiometricTransaction) {
      const authenticateResult = await LocalAuthentication.authenticateAsync();
      if (!authenticateResult.success) {
        return;
      }
    }

    setLoading(true);

    const mnemonic = await SecureStore.getItemAsync(getStorageKeyPk());

    if (!mnemonic) {
      Alert.alert('Failed to get mnemonic');
      return;
    }

    const network =
      appConfig.network === 'mainnet'
        ? new StacksMainnet()
        : new StacksTestnet();

    const rootNode = await deriveRootKeychainFromMnemonic(mnemonic);
    const result = deriveStxAddressChain(
      appConfig.network === 'mainnet' ? ChainID.Mainnet : ChainID.Testnet
    )(rootNode);

    const fee = unsignedTransaction?.auth.getFee();

    if (!fee) {
      Alert.alert('Fee not found');
      return;
    }

    let transaction: StacksTransaction;
    try {
      transaction = await makeSTXTokenTransfer({
        recipient: route.params.address,
        amount: new BnJs(route.params.amountInMicro),
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
  };

  const bigAmountInStack = new Big(route.params.amountInMicro).div(
    Math.pow(10, 6)
  );
  const bigAmountFiat = price ? bigAmountInStack.mul(price) : undefined;
  const bigFeeInStack = unsignedTransaction
    ? new Big(unsignedTransaction.auth.getFee()!.toString()).div(
        Math.pow(10, 6)
      )
    : undefined;
  const bigFeeFiat =
    price && bigFeeInStack ? bigFeeInStack.mul(price) : undefined;

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
              description={`${bigAmountInStack.toFixed(6)} STX${
                bigAmountFiat ? ` ~= ${bigAmountFiat.toFixed(2)} USD` : ''
              }`}
            />
            <List.Item
              title="Network fee"
              // TODO nicely display decimals etc..
              description={
                bigFeeInStack
                  ? `${bigFeeInStack.toFixed(6)} STX${
                      bigFeeFiat ? ` ~= ${bigFeeFiat.toFixed(2)} USD` : ''
                    }`
                  : 'Estimating fee ...'
              }
            />
            {memo ? <List.Item title="Memo" description={memo} /> : null}
            <List.Item
              title="Total"
              // TODO nicely display decimals etc..
              description={
                bigFeeInStack
                  ? `${bigAmountInStack.add(bigFeeInStack).toFixed(6)} STX${
                      bigAmountFiat && bigFeeFiat
                        ? ` ~= ${bigAmountFiat.add(bigFeeFiat).toFixed(2)} USD`
                        : ''
                    }`
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
});
