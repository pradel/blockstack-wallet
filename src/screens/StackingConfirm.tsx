import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, View, Alert } from 'react-native';
import { ActivityIndicator, Appbar, Text, List } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ChainID } from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import {
  deriveRootKeychainFromMnemonic,
  deriveStxAddressChain,
} from '@stacks/keychain';
import { CoreInfo, PoxInfo, StackingClient } from '@stacks/stacking';
import { format } from 'date-fns';
import BnJs from 'bn.js';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { Button } from '../components/Button';
import { getStorageKeyPk, microToStacks } from '../utils';
import { RootStackParamList } from '../types/router';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';

type StackingConfirmScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'StackingConfirm'
>;
type StackingConfirmScreenRouteProp = RouteProp<
  RootStackParamList,
  'StackingConfirm'
>;

export const StackingConfirmScreen = () => {
  const navigation = useNavigation<StackingConfirmScreenNavigationProp>();
  const route = useRoute<StackingConfirmScreenRouteProp>();
  const auth = useAuth();
  const { appConfig } = useAppConfig();
  const [isEligible, setIsEligible] = useState<true | string>();
  const [stackingInfos, setStackingInfos] = useState<{
    nextCycleStartingAt: Date;
    unlockingAt: Date;
  }>();
  const [stacksInfo, setStacksInfo] = useState<{
    poxInfo: PoxInfo;
    coreInfo: CoreInfo;
    blockTimeInfo: number;
  }>();
  const [confirming, setConfirming] = useState(false);

  const stackingClient = new StackingClient(
    auth.address,
    appConfig.network === 'mainnet' ? new StacksMainnet() : new StacksTestnet()
  );

  useEffect(() => {
    const fetchPoxInfo = async () => {
      try {
        const poxInfo = await stackingClient.getPoxInfo();
        const coreInfo = await stackingClient.getCoreInfo();
        const blockTimeInfo = await stackingClient.getTargetBlockTime();
        setStacksInfo({
          poxInfo,
          coreInfo,
          blockTimeInfo,
        });
      } catch (error) {
        // TODO show error to the user
        console.error(error);
      }
    };

    fetchPoxInfo();
  }, [setStacksInfo]);

  // TODO
  const numberOfCycles = 1;

  useEffect(() => {
    const fetchIsUserEligible = async () => {
      if (!stacksInfo) return;

      try {
        const stackingEligibility = await stackingClient.canStack({
          poxAddress: route.params.bitcoinAddress,
          cycles: numberOfCycles,
        });

        if (!stackingEligibility.eligible) {
          setIsEligible(stackingEligibility.reason);
          return;
        }

        setIsEligible(true);
      } catch (error) {
        console.error(error);
        Alert.alert(`Verify stacking eligibility failed. ${error.message}`);
        return;
      }

      // how much time is left (in seconds) until the next cycle begins?
      const secondsToNextCycle =
        (stacksInfo.poxInfo.reward_cycle_length -
          ((stacksInfo.coreInfo.burn_block_height -
            stacksInfo.poxInfo.first_burnchain_block_height) %
            stacksInfo.poxInfo.reward_cycle_length)) *
        stacksInfo.blockTimeInfo;

      // the actual datetime of the next cycle start
      const nextCycleStartingAt = new Date();
      nextCycleStartingAt.setSeconds(
        nextCycleStartingAt.getSeconds() + secondsToNextCycle
      );

      const unlockingAt = new Date(nextCycleStartingAt);
      unlockingAt.setSeconds(
        unlockingAt.getSeconds() +
          stacksInfo.poxInfo.reward_cycle_length *
            numberOfCycles *
            stacksInfo.blockTimeInfo
      );

      setStackingInfos({ nextCycleStartingAt, unlockingAt });
    };

    fetchIsUserEligible();
  }, [stacksInfo]);

  const handleConfirm = async () => {
    if (!stacksInfo) return;

    if (appConfig.requireBiometricTransaction) {
      const authenticateResult = await LocalAuthentication.authenticateAsync();
      if (!authenticateResult.success) {
        return;
      }
    }

    setConfirming(true);

    const mnemonic = await SecureStore.getItemAsync(getStorageKeyPk());

    if (!mnemonic) {
      Alert.alert('Failed to get mnemonic');
      return;
    }

    const rootNode = await deriveRootKeychainFromMnemonic(mnemonic);
    const result = deriveStxAddressChain(
      appConfig.network === 'mainnet' ? ChainID.Mainnet : ChainID.Testnet
    )(rootNode);

    try {
      const stackingResponse = await stackingClient.stack({
        amountMicroStx: new BnJs(route.params.amountInMicro),
        poxAddress: route.params.bitcoinAddress,
        cycles: numberOfCycles,
        privateKey: result.privateKey,
        // Adding 3 blocks to provide a buffer for transaction to confirm
        burnBlockHeight: stacksInfo.coreInfo.burn_block_height + 3,
      });
      if (stackingResponse.hasOwnProperty('error')) {
        console.error(stackingResponse);
        throw new Error((stackingResponse as any).error);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(`Stacking transaction failed. ${error.message}`);
      setConfirming(false);
      return;
    }

    navigation.navigate('Stacking');
  };

  const canConfirm = isEligible === true;

  const showLoading = isEligible === undefined || !stackingInfos;

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>

      <View style={styles.contentContainer}>
        <AppbarHeader>
          <AppbarContent
            title="Confirm Stacking"
            subtitle="Please check that everything looks good."
          />
        </AppbarHeader>

        {showLoading ? (
          <View>
            <ActivityIndicator animating={true} />
          </View>
        ) : null}

        {typeof isEligible === 'string' ? (
          <View style={styles.errorContainer}>
            <Text>You are not eligible for stacking.</Text>
            <Text>Error: {isEligible}</Text>
          </View>
        ) : null}

        {isEligible === true && stackingInfos ? (
          <View>
            <List.Item
              title="Amount to lock"
              description={`${microToStacks(route.params.amountInMicro)} STX`}
            />
            <List.Item title="Number of cycles" description={numberOfCycles} />
            <List.Item
              title="Start date"
              description={format(
                stackingInfos.nextCycleStartingAt,
                'HH:mm dd MMMM yyyy'
              )}
            />
            <List.Item
              title="Unlocking date"
              description={format(
                stackingInfos.unlockingAt,
                'HH:mm dd MMMM yyyy'
              )}
            />
            <List.Item
              title="BTC address"
              description={route.params.bitcoinAddress}
            />
            {/* TODO display fees of the transaction */}
            {/* TODO estimation of the reward */}
          </View>
        ) : null}

        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            disabled={!canConfirm || confirming}
            loading={confirming}
            onPress={handleConfirm}
          >
            Confirm
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
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  buttonsContainer: {
    padding: 16,
  },
});
