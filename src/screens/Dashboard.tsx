import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import {
  IconButton,
  Caption,
  Surface,
  Title,
  Text,
  Divider,
  List,
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import useSWR from 'swr';
import Big from 'big.js';
import { format } from 'date-fns';
import type { TransactionResults } from '@blockstack/stacks-blockchain-sidecar-types';
import { fetcher, microToStacks } from '../utils';
import { useAuth } from '../context/AuthContext';
import { ReceiveScreen } from './Receive';
import { UndrawVoid } from '../images/UndrawVoid';
import { config } from '../config';
import { RootStackParamList } from '../types/router';
import { usePrice } from '../context/PriceContext';

interface BalanceResponse {
  stx: {
    balance: string;
  };
}

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const auth = useAuth();
  const { price } = usePrice();
  const {
    data: balanceData,
    // error: balanceError,
    mutate: balanceMutate,
  } = useSWR<BalanceResponse>(
    `${config.blockstackApiUrl}/extended/v1/address/${auth.address}/balances`,
    fetcher
  );
  const {
    data: transactionsData,
    // error: transactionsError,
    mutate: transactionMutate,
  } = useSWR<TransactionResults>(
    `${config.blockstackApiUrl}/extended/v1/address/${auth.address}/transactions`,
    fetcher
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  // Get the fiat price corresponding to the current balance
  const fiatPrice = useMemo(() => {
    if (!price || !balanceData) {
      return undefined;
    }
    const STXAmountBig = new Big(balanceData.stx.balance).div(Math.pow(10, 6));
    const fiatBig = STXAmountBig.mul(price);
    return fiatBig.toFixed(2);
  }, [balanceData, price]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([balanceMutate(), transactionMutate()]);
    setIsRefreshing(false);
  };

  const handleReceive = () => {
    setIsBottomSheetOpen(true);
  };

  const handleScan = () => {
    navigation.navigate('SendScanAddress');
  };

  // TODO handle error (display snackbar?)

  // TODO infinite scrolling

  const balanceString = balanceData
    ? microToStacks(balanceData.stx.balance)
    : '...';

  // TODO change style of IconButton to be black background

  return (
    <View style={styles.container}>
      <Surface style={styles.balanceContainer}>
        <Title style={styles.balanceTextCrypto}>{balanceString} STX</Title>
        {fiatPrice ? <Caption>~{fiatPrice} USD</Caption> : null}

        <View style={styles.actionsContainer}>
          <View style={styles.actionsButtonContainer}>
            <IconButton
              icon="arrow-bottom-left"
              color="#ffffff"
              style={styles.actionButton}
              onPress={handleReceive}
            />
            <Text style={styles.actionsText}>Receive</Text>
          </View>
          <View style={styles.actionsButtonContainer}>
            <IconButton
              icon="arrow-top-right"
              color="#ffffff"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Send')}
            />
            <Text style={styles.actionsText}>Send</Text>
          </View>
          <View style={styles.actionsButtonContainer}>
            <IconButton
              icon="camera"
              color="#ffffff"
              style={styles.actionButton}
              onPress={handleScan}
            />
            <Text style={styles.actionsText}>Scan</Text>
          </View>
        </View>
      </Surface>
      <Divider />

      <View style={styles.transactionsContainer}>
        <FlatList
          style={styles.transactionsList}
          data={transactionsData?.results}
          keyExtractor={(item) => item.tx_id}
          ItemSeparatorComponent={Divider}
          ListEmptyComponent={() => (
            <View style={styles.transactionsImageContainer}>
              <UndrawVoid height={150} />
              <Caption style={styles.transactionsImageText}>
                Transactions will appear here
              </Caption>
            </View>
          )}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          renderItem={({ item }) => {
            const isIncomingTx =
              item.tx_type === 'token_transfer' &&
              item.token_transfer.recipient_address === auth.address;

            return (
              <List.Item
                onPress={() =>
                  navigation.navigate('TransactionDetails', {
                    txId: item.tx_id,
                  })
                }
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
                description={format(item.burn_block_time * 1000, 'dd MMMM ')}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={
                      item.tx_type === 'token_transfer'
                        ? 'arrow-top-right'
                        : item.tx_type === 'smart_contract'
                        ? 'file-upload'
                        : item.tx_type === 'contract_call'
                        ? 'code-tags'
                        : 'help'
                    }
                    style={[
                      props.style,
                      {
                        transform:
                          item.tx_type === 'token_transfer'
                            ? [
                                {
                                  rotate: isIncomingTx ? '180deg' : '0deg',
                                },
                              ]
                            : [],
                      },
                    ]}
                  />
                )}
                right={(props) => (
                  <View {...props} style={{ justifyContent: 'center' }}>
                    <Text style={styles.listItemRightText}>
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
                  </View>
                )}
              />
            );
          }}
        />
      </View>

      <ReceiveScreen
        open={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      />
    </View>
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
    fontSize: 28,
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
    backgroundColor: '#1A202C',
  },
  actionsText: {
    marginTop: 8,
    textAlign: 'center',
  },
  transactionsContainer: {
    flex: 1,
  },
  transactionsImageContainer: {
    marginTop: 32,
    alignItems: 'center',
    height: '100%',
  },
  transactionsImageText: {
    marginTop: 16,
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
    fontSize: 16,
  },
});
