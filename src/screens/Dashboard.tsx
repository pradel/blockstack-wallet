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
import useSWR from 'swr';
import Big from 'big.js';
import { format } from 'date-fns';
import type { TransactionResults } from '@blockstack/stacks-blockchain-sidecar-types';
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
import { stacksClientAccounts } from '../stacksClient';

interface BalanceResponse {
  stx: {
    balance: string;
  };
}

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { theme } = useTheme();
  const auth = useAuth();
  const { price } = usePrice();
  const {
    data: balanceData,
    // error: balanceError,
    mutate: balanceMutate,
  } = useSWR(`balances-${auth.address}`, () =>
    stacksClientAccounts.getAccountBalance({ principal: auth.address })
  );
  const {
    data: transactionsData,
    // error: transactionsError,
    mutate: transactionMutate,
  } = useSWR(`transactions-list-${auth.address}`, () =>
    stacksClientAccounts.getAccountTransactions({ principal: auth.address })
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
          data={transactionsData?.results as TransactionResults['results']}
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
});
