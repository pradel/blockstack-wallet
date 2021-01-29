import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Image } from 'react-native';
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
import { useQuery } from 'react-query';
import Big from 'big.js';
import { format } from 'date-fns';
import type {
  Transaction,
  MempoolTransaction,
} from '@blockstack/stacks-blockchain-sidecar-types';
import { microToStacks } from '../utils';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePrice } from '../context/PriceContext';
import { ReceiveScreen } from './Receive';
import StacksBigMetaverse from '../../assets/StacksBigMetaverse.png';
import StacksBigMetaverseLight from '../../assets/StacksBigMetaverseLight.png';
import { config } from '../config';
import { RootStackParamList } from '../types/router';
import {
  ArrowNarrowUp,
  Camera,
  Code,
  QuestionMarkCircle,
  Upload,
} from '../icons';
import { queryClient } from '../queryClient';
import { useStacksClient } from '../context/StacksClientContext';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { theme } = useTheme();
  const auth = useAuth();
  const { price } = usePrice();
  const { stacksClientAccounts, stacksClientTransactions } = useStacksClient();
  const {
    data: balanceData,
    // error: balanceError,
  } = useQuery(['user-balance', auth.address], () =>
    stacksClientAccounts.getAccountBalance({ principal: auth.address })
  );
  const {
    data: transactionsData,
    // error: transactionsError,
  } = useQuery(['transactions-list', auth.address], async () => {
    const [mempoolTransactions, accountTransactions] = await Promise.all([
      // Get the pending transactions
      stacksClientTransactions.getMempoolTransactionList({
        address: auth.address,
      }),
      // Get confirmed transactions
      stacksClientAccounts.getAccountTransactions({
        principal: auth.address,
      }),
    ]);
    // Merge the pending transactions at the beginning of the transaction list
    const result = accountTransactions;
    result.results = [
      ...mempoolTransactions.results,
      ...accountTransactions.results,
    ];
    return result;
  });
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
    await Promise.all([
      queryClient.invalidateQueries(['user-balance', auth.address]),
      queryClient.invalidateQueries(['transactions-list', auth.address]),
    ]);
    setIsRefreshing(false);
  };

  const handleReceive = () => {
    setIsBottomSheetOpen(true);
  };

  const handleScan = () => {
    navigation.navigate('SendScanAddress');
  };

  // TODO handle error (display snackbar?)

  const balanceString = balanceData
    ? microToStacks(balanceData.stx.balance)
    : '...';

  return (
    <View style={styles.container}>
      <Surface style={styles.balanceContainer}>
        <Title style={styles.balanceTextCrypto}>{balanceString} STX</Title>
        <Caption>{fiatPrice ? `~${fiatPrice} USD` : ' '}</Caption>

        <View style={styles.actionsContainer}>
          <View style={styles.actionsButtonContainer}>
            <IconButton
              icon={(props) => (
                <ArrowNarrowUp
                  fill={props.color}
                  style={{
                    transform: [
                      {
                        rotate: '-135deg',
                      },
                    ],
                  }}
                  {...props}
                />
              )}
              color="#ffffff"
              style={styles.actionButton}
              onPress={handleReceive}
            />
            <Text style={styles.actionsText}>Receive</Text>
          </View>
          <View style={styles.actionsButtonContainer}>
            <IconButton
              icon={(props) => (
                <ArrowNarrowUp
                  fill={props.color}
                  style={{
                    transform: [
                      {
                        rotate: '45deg',
                      },
                    ],
                  }}
                  {...props}
                />
              )}
              color="#ffffff"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Send')}
            />
            <Text style={styles.actionsText}>Send</Text>
          </View>
          <View style={styles.actionsButtonContainer}>
            <IconButton
              icon={(props) => <Camera fill={props.color} {...props} />}
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
          data={
            transactionsData?.results as (Transaction | MempoolTransaction)[]
          }
          keyExtractor={(item) => item.tx_id}
          ItemSeparatorComponent={Divider}
          ListEmptyComponent={() => (
            <View style={styles.transactionsImageContainer}>
              <Image
                source={
                  theme === 'light'
                    ? StacksBigMetaverse
                    : StacksBigMetaverseLight
                }
                style={styles.transactionsImage}
              />
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

            const LeftIcon =
              item.tx_type === 'token_transfer'
                ? ArrowNarrowUp
                : item.tx_type === 'smart_contract'
                ? Upload
                : item.tx_type === 'contract_call'
                ? Code
                : QuestionMarkCircle;

            let title = (
              <>
                {item.tx_status === 'pending' ? (
                  <View style={styles.pendingBadge} />
                ) : null}
                {item.tx_type === 'token_transfer'
                  ? isIncomingTx
                    ? 'Received STX'
                    : 'Sent STX'
                  : item.tx_type === 'smart_contract'
                  ? item.smart_contract.contract_id.split('.')[1]
                  : item.tx_type === 'contract_call'
                  ? item.contract_call.contract_id.split('.')[1]
                  : 'Unknown'}
              </>
            );

            let readableDate = format(
              'burn_block_time' in item
                ? // Transaction
                  item.burn_block_time * 1000
                : // Mempool transaction
                  item.receipt_time * 1000,
              'dd MMMM '
            );
            if (item.tx_status === 'pending') {
              readableDate = `Pending - ${readableDate}`;
            }

            return (
              <List.Item
                onPress={() =>
                  navigation.navigate('TransactionDetails', {
                    txId: item.tx_id,
                  })
                }
                title={title}
                titleStyle={{
                  paddingHorizontal: item.tx_status === 'pending' ? 4 : 0,
                }}
                description={readableDate}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={({ size, color }) => (
                      <LeftIcon size={size} fill={color} />
                    )}
                    style={[
                      props.style,
                      {
                        transform:
                          item.tx_type === 'token_transfer'
                            ? [
                                {
                                  rotate: isIncomingTx ? '-135deg' : '45deg',
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
    elevation: 0,
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
    borderRadius: 26,
    backgroundColor: config.colors.primary,
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
  transactionsImage: {
    height: 200,
    width: 200,
    marginTop: -50,
    marginBottom: -50,
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
  pendingBadge: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#FE9000',
  },
});
