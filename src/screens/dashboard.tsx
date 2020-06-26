import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Layout,
  Text,
  Divider,
  List,
  ListItem,
  Icon,
  ButtonGroup,
  Button,
} from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import useSWR from 'swr';
import { format } from 'date-fns';
import { fetcher, microToStacks } from '../utils';
import { useAuth } from '../context/AuthContext';

interface BalanceResponse {
  stx: {
    balance: string;
  };
}

interface TransactionsResponse {
  results: {
    // tx_status: "success";
    // tx_type: "token_transfer";
    sender_address: string;
    burn_block_time: number;
    token_transfer: {
      amount: string;
      recipient_address: string;
      // memo: string;
    };
  }[];
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
  } = useSWR<TransactionsResponse>(
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
      <Layout style={styles.balanceContainer}>
        <Text category="h2">{balanceString} STX</Text>
        <Text appearance="hint">~{fiatPrice} EUR</Text>
        <ButtonGroup
          style={styles.buttonGroup}
          appearance="outline"
          status="basic"
        >
          <Button onPress={() => navigation.navigate('Send')}>Send</Button>
          <Button onPress={() => navigation.navigate('Receive')}>
            Receive
          </Button>
        </ButtonGroup>
      </Layout>
      <Divider />

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
              item: TransactionsResponse['results'][0];
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
                      name="paper-plane-outline"
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
    flex: 1,
  },
  balanceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 64,
  },
  buttonGroup: {
    marginTop: 32,
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
  },
});
