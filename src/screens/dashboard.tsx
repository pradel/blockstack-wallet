import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
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
import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import useSWR from 'swr';
import { format } from 'date-fns';
import type { TransactionResults } from '@blockstack/stacks-blockchain-sidecar-types';
import { fetcher, microToStacks } from '../utils';
import { useAuth } from '../context/AuthContext';
import { ReceiveScreen, ReceiveScreenHeader } from './Receive';

type Value = string | number | boolean;

function useAnimatedValue<T extends Value>(value: T) {
  return React.useMemo<Animated.Value<T>>(() => {
    return new Animated.Value(value);
  }, []);
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const opacity = useAnimatedValue(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([balanceMutate(), transactionMutate()]);
    setIsRefreshing(false);
  };

  const handleReceive = () => {
    setIsBottomSheetOpen(true);
    bottomSheetRef.current?.snapTo(400);
  };

  const handleCloseReceive = () => {
    bottomSheetRef.current?.snapTo(1);
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

      {/* TODO needs to be on top of bottom navigation  */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[400, 1, 0]}
        initialSnap={1}
        renderHeader={() => (
          <ReceiveScreenHeader onClose={handleCloseReceive} />
        )}
        renderContent={() => <ReceiveScreen />}
        callbackNode={opacity}
        onCloseEnd={() => setIsBottomSheetOpen(false)}
      />
      {isBottomSheetOpen && (
        <AnimatedTouchable
          onPress={handleCloseReceive}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            opacity: Animated.sub(0.4, Animated.multiply(opacity, 0.4)),
            backgroundColor: 'black',
          }}
        />
      )}
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
