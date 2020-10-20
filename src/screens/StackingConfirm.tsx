import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, View, Alert } from 'react-native';
import { ActivityIndicator, Appbar, Text, List } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  CoreNodePoxResponse,
  CoreNodeInfoResponse,
  NetworkBlockTimesResponse,
} from '@stacks/blockchain-api-client';
import {
  bufferCV,
  cvToString,
  deserializeCV,
  serializeCV,
  StacksTestnet,
  StacksMainnet,
  tupleCV,
  uintCV,
  makeContractCall,
  ChainID,
  StacksTransaction,
  broadcastTransaction,
} from '@blockstack/stacks-transactions';
import {
  deriveRootKeychainFromMnemonic,
  deriveStxAddressChain,
} from '@blockstack/keychain';
import { format } from 'date-fns';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { Button } from '../components/Button';
import { getStorageKeyPk, microToStacks } from '../utils';
import { stacksClientInfo, stacksClientSmartContracts } from '../stacksClient';
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
    poxInfo: CoreNodePoxResponse;
    coreInfo: CoreNodeInfoResponse;
    blockTimeInfo: NetworkBlockTimesResponse;
  }>();
  const [confirming, setConfirming] = useState(false);

  // derive bitcoin address from Stacks account and convert into required format
  const hashbytes = bufferCV(
    global.Buffer.from(route.params.bitcoinAddress, 'hex')
  );
  const version = bufferCV(global.Buffer.from('01', 'hex'));

  useEffect(() => {
    const fetchPoxInfo = async () => {
      try {
        const poxInfo = await stacksClientInfo.getPoxInfo();
        const coreInfo = await stacksClientInfo.getCoreApiInfo();
        const blockTimeInfo = await stacksClientInfo.getNetworkBlockTimes();
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

      const [
        contractAddress,
        contractName,
      ] = stacksInfo.poxInfo.contract_id.split('.');

      try {
        // read-only contract call
        const isEligible = await stacksClientSmartContracts.callReadOnlyFunction(
          {
            contractAddress,
            contractName,
            functionName: 'can-stack-stx',
            readOnlyFunctionArgs: {
              sender: auth.address,
              arguments: [
                `0x${serializeCV(
                  tupleCV({
                    hashbytes,
                    version,
                  })
                ).toString('hex')}`,
                `0x${serializeCV(uintCV(route.params.amountInMicro)).toString(
                  'hex'
                )}`,
                // explicilty check eligibility for next cycle
                `0x${serializeCV(
                  uintCV(stacksInfo.poxInfo.reward_cycle_id)
                ).toString('hex')}`,
                `0x${serializeCV(uintCV(numberOfCycles)).toString('hex')}`,
              ],
            },
          }
        );
        // error codes: https://github.com/blockstack/stacks-blockchain/blob/master/src/chainstate/stacks/boot/pox.clar#L2
        const response = cvToString(
          deserializeCV(
            global.Buffer.from(
              isEligible.result ? isEligible.result.slice(2) : '',
              'hex'
            )
          )
        );

        if (response.startsWith(`(err `)) {
          setIsEligible(response);
          return;
        }

        setIsEligible(true);
      } catch (error) {
        // TODO show error to the user
        console.error(error);
      }

      // how much time is left (in seconds) until the next cycle begins?
      const secondsToNextCycle =
        (stacksInfo.poxInfo.reward_cycle_length -
          ((stacksInfo.coreInfo.burn_block_height -
            stacksInfo.poxInfo.first_burnchain_block_height) %
            stacksInfo.poxInfo.reward_cycle_length)) *
        stacksInfo.blockTimeInfo.testnet.target_block_time;

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
            stacksInfo.blockTimeInfo.testnet.target_block_time
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

    const [
      contractAddress,
      contractName,
    ] = stacksInfo.poxInfo.contract_id.split('.');

    const network =
      appConfig.network === 'mainnet'
        ? new StacksMainnet()
        : new StacksTestnet();

    const rootNode = await deriveRootKeychainFromMnemonic(mnemonic);
    const result = deriveStxAddressChain(
      appConfig.network === 'mainnet' ? ChainID.Mainnet : ChainID.Testnet
    )(rootNode);

    let transaction: StacksTransaction;
    try {
      transaction = await makeContractCall({
        contractAddress,
        contractName,
        functionName: 'stack-stx',
        functionArgs: [
          uintCV(route.params.amountInMicro),
          tupleCV({
            hashbytes,
            version,
          }),
          uintCV(stacksInfo.coreInfo.burn_block_height + 1),
          uintCV(numberOfCycles),
        ],
        senderKey: result.privateKey,
        validateWithAbi: true,
        network,
      });
    } catch (error) {
      console.error(error);
      Alert.alert(`Failed to create transaction. ${error.message}`);
      setConfirming(false);
      return;
    }

    try {
      await broadcastTransaction(transaction, network);
    } catch (error) {
      console.error(error);
      Alert.alert(`Failed to broadcast transaction. ${error.message}`);
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
