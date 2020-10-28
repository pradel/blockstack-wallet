import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import {
  ActivityIndicator,
  Appbar,
  HelperText,
  List,
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import useSWR from 'swr';
import { format } from 'date-fns';
import type { Transaction } from '@blockstack/stacks-blockchain-sidecar-types';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { RootStackParamList } from '../types/router';
import { microToStacks, getMemoString } from '../utils';
import { config } from '../config';
import { useAuth } from '../context/AuthContext';
import { stacksClientTransactions } from '../stacksClient';

type TransactionDetailsNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TransactionDetails'
>;
type TransactionDetailsRouteProp = RouteProp<
  RootStackParamList,
  'TransactionDetails'
>;

export const TransactionDetails = () => {
  const navigation = useNavigation<TransactionDetailsNavigationProp>();
  const route = useRoute<TransactionDetailsRouteProp>();
  const auth = useAuth();

  const { data: transactionData, error: transactionError } = useSWR(
    `transaction-details-${route.params.txId}`,
    () => {
      return stacksClientTransactions.getTransactionById({
        txId: route.params.txId,
      }) as Promise<Transaction>;
    }
  );

  const isIncomingTx =
    transactionData &&
    transactionData.tx_type === 'token_transfer' &&
    transactionData.token_transfer.recipient_address === auth.address;

  const handleTransactionIdPress = async () => {
    if (!transactionData) return;

    const supported = await Linking.canOpenURL(config.githubUrl);
    if (supported) {
      Linking.openURL(
        `${config.blockstackExplorerUrl}/txid/${transactionData.tx_id}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>

      {!transactionData && !transactionError ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} />
        </View>
      ) : null}

      {transactionError ? (
        <View style={styles.errorContainer}>
          <HelperText type="error">
            {transactionError.message
              ? transactionError.message
              : transactionError}
          </HelperText>
        </View>
      ) : null}

      {transactionData ? (
        <View style={styles.contentContainer}>
          <AppbarContent
            title={
              transactionData.tx_type === 'token_transfer'
                ? `${isIncomingTx ? '' : '-'}${microToStacks(
                    transactionData.token_transfer.amount
                  )} STX`
                : transactionData.tx_type === 'smart_contract'
                ? 'Contract creation'
                : transactionData.tx_type === 'contract_call'
                ? 'Contract call'
                : 'Unknown transaction'
            }
          />

          <View style={styles.listContainer}>
            <List.Item
              title="Timestamp"
              description={format(
                transactionData.burn_block_time * 1000,
                'HH:mm, MMMM dd yyyy'
              )}
            />
            <List.Item
              title="Block height"
              description={`#${transactionData.block_height}`}
            />
            <List.Item title="Status" description={transactionData.tx_status} />
            {transactionData.tx_type === 'token_transfer' && !isIncomingTx ? (
              <List.Item
                title="Recipient address"
                description={transactionData.token_transfer.recipient_address}
              />
            ) : null}
            {transactionData.tx_type === 'token_transfer' && isIncomingTx ? (
              <List.Item
                title="Sender address"
                description={transactionData.sender_address}
              />
            ) : null}
            {transactionData.tx_type === 'smart_contract' ||
            transactionData.tx_type === 'contract_call' ? (
              <List.Item
                title="Contract name"
                description={
                  transactionData.tx_type === 'smart_contract'
                    ? transactionData.smart_contract.contract_id.split('.')[1]
                    : transactionData.contract_call.contract_id.split('.')[1]
                }
              />
            ) : null}
            <List.Item
              title="Network fee"
              description={`${microToStacks(transactionData.fee_rate)} STX`}
            />
            {transactionData.tx_type === 'token_transfer' ? (
              <List.Item
                title="Memo"
                description={getMemoString(transactionData.token_transfer.memo)}
              />
            ) : null}
            <List.Item
              title="Transaction ID"
              description={transactionData.tx_id}
              descriptionStyle={styles.txHashDescription}
              onPress={handleTransactionIdPress}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    marginTop: 16,
  },
  txHashDescription: {
    textDecorationLine: 'underline',
  },
});
