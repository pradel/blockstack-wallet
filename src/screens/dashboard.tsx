import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
    error: balanceError,
    mutate: balanceMutate,
  } = useSWR<BalanceResponse>(
    `https://sidecar.staging.blockstack.xyz/sidecar/v1/address/${auth.address}/balances`,
    fetcher
  );
  const {
    data: transactionsData,
    error: transactionsError,
    mutate: transactionMutate,
  } = useSWR<TransactionResults>(
    `https://sidecar.staging.blockstack.xyz/sidecar/v1/address/${auth.address}/transactions`,
    fetcher
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([balanceMutate(), transactionMutate()]);
    setIsRefreshing(false);
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
              onPress={() => navigation.navigate('Receive')}
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
              onPress={() => navigation.navigate('Receive')}
            />
            <Text style={styles.actionsText} category="p2">
              Scan
            </Text>
          </View>
        </View>
      </Layout>

      <Layout style={styles.transactionsContainer}>
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
                item.token_transfer.recipient_address === auth.address;

              return (
                <ListItem
                  style={styles.listItem}
                  title={isIncomingTx ? 'Received STX' : 'Sent STX'}
                  description={format(item.burn_block_time * 1000, 'dd MMMM ')}
                  accessoryLeft={(props) => (
                    <Icon
                      {...props}
                      name="diagonal-arrow-right-up"
                      style={{
                        // @ts-ignore
                        ...(props?.style ?? {}),
                        height: 18,
                        width: 18,
                        transform: [
                          { rotate: isIncomingTx ? '180deg' : '0deg' },
                        ],
                      }}
                    />
                  )}
                  accessoryRight={() => (
                    <Text style={styles.listItemRightText} appearance="hint">
                      {isIncomingTx ? '+' : '-'}
                      {microToStacks(item.token_transfer.amount)} STX
                    </Text>
                  )}
                />
              );
            }}
          />
        )}
      </Layout>
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
