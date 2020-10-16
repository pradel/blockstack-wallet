import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import { ActivityIndicator, Appbar, List } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import useSWR from 'swr';
import { format } from 'date-fns';
import type { Transaction } from '@blockstack/stacks-blockchain-sidecar-types';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { RootStackParamList } from '../types/router';
import { fetcher, microToStacks, getMemoString } from '../utils';
import { config } from '../config';
import { useAuth } from '../context/AuthContext';

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

  const {
    data: transactionData,
    // TODO handle error
    // error: balanceError,
  } = useSWR<Transaction>(
    `${config.blockstackApiUrl}/extended/v1/tx/${route.params.txId}`,
    fetcher
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

  console.log(transactionData);

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>

      {!transactionData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} />
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
                : 'TODO'
            }
          />

          <View style={styles.listContainer}>
            {transactionData.tx_type === 'token_transfer' ? (
              <React.Fragment>
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
                <List.Item
                  title="Status"
                  description={transactionData.tx_status}
                />
                <List.Item
                  title="Recipient address"
                  description={transactionData.token_transfer.recipient_address}
                />

                <List.Item
                  title="Network fee"
                  description={`${microToStacks(transactionData.fee_rate)} STX`}
                />
                <List.Item
                  title="Memo"
                  description={getMemoString(
                    transactionData.token_transfer.memo
                  )}
                />
                <List.Item
                  title="Transaction ID"
                  description={transactionData.tx_id}
                  descriptionStyle={styles.txHashDescription}
                  onPress={handleTransactionIdPress}
                />
              </React.Fragment>
            ) : null}
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
