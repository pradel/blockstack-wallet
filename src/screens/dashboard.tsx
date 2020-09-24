import React, { useState } from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import Constants from 'expo-constants';
import {
  Layout,
  Text,
  Divider,
  List,
  ListItem,
  Icon,
  Button,
} from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import useSWR from 'swr';
import { format } from 'date-fns';
import type { TransactionResults } from '@blockstack/stacks-blockchain-sidecar-types';
import { fetcher, microToStacks } from '../utils';
import { useAuth } from '../context/AuthContext';
import { ReceiveScreen } from './Receive';
import zeroTransactionsImage from '../../assets/undraw_void.png';

interface BalanceResponse {
  stx: {
    balance: string;
  };
}

export const DashboardScreen = () => {
  const navigation = useNavigation();
  const auth = useAuth();
  const {
    data: balanceData,
    // error: balanceError,
    mutate: balanceMutate,
  } = useSWR<BalanceResponse>(
    `https://sidecar.staging.blockstack.xyz/sidecar/v1/address/${auth.address}/balances`,
    fetcher
  );
  const {
    data: transactionsData,
    // error: transactionsError,
    mutate: transactionMutate,
  } = useSWR<TransactionResults>(
    `https://sidecar.staging.blockstack.xyz/sidecar/v1/address/${auth.address}/transactions`,
    fetcher
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([balanceMutate(), transactionMutate()]);
    setIsRefreshing(false);
  };

  const handleReceive = () => {
    setIsBottomSheetOpen(true);
  };

  // TODO handle error (display snackbar?)

  // TODO infinite scrolling

  // TODO price eur if available
  const fiatPrice = '1.89';

  const balanceString = balanceData
    ? microToStacks(balanceData.stx.balance)
    : '...';

  return (
    <Layout style={styles.container}>
      <Layout style={styles.balanceContainer} level="2">
        <Text style={styles.balanceTextCrypto} category="h2">
          {balanceString} STX
        </Text>
        <Text appearance="hint">~{fiatPrice} EUR</Text>

        <View style={styles.actionsContainer}>
          <View style={styles.actionsButtonContainer}>
            <Button
              style={styles.actionButton}
              accessoryLeft={(props) => (
                <Icon {...props} name="diagonal-arrow-left-down-outline" />
              )}
              onPress={handleReceive}
            />
            <Text style={styles.actionsText} category="p2">
              Receive
            </Text>
          </View>
          <View style={styles.actionsButtonContainer}>
            <Button
              style={styles.actionButton}
              accessoryLeft={(props) => (
                <Icon {...props} name="diagonal-arrow-right-up-outline" />
              )}
              onPress={() => navigation.navigate('Send')}
            />
            <Text style={styles.actionsText} category="p2">
              Send
            </Text>
          </View>
          <View style={styles.actionsButtonContainer}>
            <Button
              style={styles.actionButton}
              accessoryLeft={(props) => (
                <Icon {...props} name="camera-outline" />
              )}
              onPress={handleReceive}
            />
            <Text style={styles.actionsText} category="p2">
              Scan
            </Text>
          </View>
        </View>
      </Layout>

      <Layout style={styles.transactionsContainer}>
        {transactionsData && transactionsData.results.length === 0 ? (
          <View style={styles.transactionsImageContainer}>
            <Image
              source={zeroTransactionsImage}
              style={styles.transactionsImage}
              resizeMode="contain"
            />
            <Text appearance="hint">No transactions..</Text>
          </View>
        ) : null}

        {transactionsData && (
          <List
            style={styles.transactionsList}
            data={transactionsData.results}
            ItemSeparatorComponent={Divider}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            renderItem={({
              item,
            }: {
              item: TransactionResults['results'][0];
            }) => {
              const isIncomingTx =
                item.tx_type === 'token_transfer' &&
                item.token_transfer.recipient_address === auth.address;

              return (
                <ListItem
                  style={styles.listItem}
                  title={
                    item.tx_type === 'token_transfer'
                      ? isIncomingTx
                        ? 'Received STX'
                        : 'Sent STX'
                      : item.tx_type === 'smart_contract'
                      ? item.smart_contract.contract_id.split('.')[1]
                      : item.tx_type === 'contract_call'
                      ? item.contract_call.contract_id.split('.')[1]
                      : 'Unknown'
                  }
                  description={
                    item.burn_block_time
                      ? format(item.burn_block_time * 1000, 'dd MMMM ')
                      : undefined
                  }
                  accessoryLeft={(props) => (
                    <Icon
                      {...props}
                      name={
                        item.tx_type === 'token_transfer'
                          ? 'diagonal-arrow-right-up'
                          : item.tx_type === 'smart_contract'
                          ? 'upload'
                          : item.tx_type === 'contract_call'
                          ? 'code'
                          : 'question-mark'
                      }
                      style={[
                        props?.style,
                        {
                          height: 18,
                          width: 18,
                          transform:
                            item.tx_type === 'token_transfer'
                              ? [{ rotate: isIncomingTx ? '180deg' : '0deg' }]
                              : [],
                        },
                      ]}
                    />
                  )}
                  accessoryRight={() => (
                    <Text style={styles.listItemRightText} appearance="hint">
                      {item.tx_type === 'token_transfer'
                        ? `${isIncomingTx ? '+' : '-'}${microToStacks(
                            item.token_transfer.amount
                          )} STX`
                        : item.tx_type === 'smart_contract'
                        ? `-${microToStacks(item.fee_rate)} STX`
                        : item.tx_type === 'contract_call'
                        ? `-${microToStacks(item.fee_rate)} STX`
                        : ''}
                    </Text>
                  )}
                />
              );
            }}
          />
        )}
      </Layout>

      <ReceiveScreen
        open={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
  },
  balanceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 48,
  },
  balanceTextCrypto: {
    fontWeight: '700',
  },
  actionsContainer: {
    marginTop: 32,
    display: 'flex',
    flexDirection: 'row',
  },
  actionsButtonContainer: {
    marginHorizontal: 24,
  },
  actionButton: {
    height: 50,
    width: 50,
    borderRadius: 18,
  },
  actionsText: {
    marginTop: 8,
    textAlign: 'center',
  },
  transactionsContainer: {
    flex: 1,
  },
  transactionsImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionsImage: {
    height: 140,
    width: '100%',
  },
  transactionsList: {
    flex: 1,
  },
  listItem: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  listItemRightText: {
    marginRight: 8,
    // fontWeight: '700',
  },
});
