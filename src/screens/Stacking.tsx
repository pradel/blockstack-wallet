import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { Linking, StyleSheet, View, Image } from 'react-native';
import { List } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import useSWR from 'swr';
import {
  cvToString,
  deserializeCV,
  serializeCV,
  standardPrincipalCV,
} from '@stacks/transactions';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { Button } from '../components/Button';
import { RootStackParamList } from '../types/router';
import MetaverseBigBitcoin from '../../assets/MetaverseBigBitcoin.png';
import MetaverseBigBitcoinLight from '../../assets/MetaverseBigBitcoinLight.png';
import { Check } from '../icons';
import { stacksClientSmartContracts, stacksClientInfo } from '../stacksClient';

type StackingScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const StackingScreen = () => {
  const { theme } = useTheme();
  const auth = useAuth();
  const navigation = useNavigation<StackingScreenNavigationProp>();
  const [stackingInfos, setStackingInfos] = useState<{
    lockingAt: string;
    unlockingAt: string;
    numberOfCycles: number;
    amountInMicro: string;
  }>();

  const { data: stackingData } = useSWR('stacking', async () => {
    // TODO do requests in parallel
    const poxInfo = await stacksClientInfo.getPoxInfo();
    const coreInfo = await stacksClientInfo.getCoreApiInfo();
    const blocktimeInfo = await stacksClientInfo.getNetworkBlockTimes();

    const [contractAddress, contractName] = poxInfo.contract_id.split('.');
    const functionName = 'get-stacker-info';

    const stackingInfo = await stacksClientSmartContracts.callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName,
      readOnlyFunctionArgs: {
        sender: auth.address,
        arguments: [
          `0x${serializeCV(standardPrincipalCV(auth.address)).toString('hex')}`,
        ],
      },
    });

    return { poxInfo, coreInfo, stackingInfo, blocktimeInfo };
  });

  useEffect(() => {
    if (stackingData?.stackingInfo?.result) {
      const response = deserializeCV(
        global.Buffer.from(stackingData.stackingInfo.result.slice(2), 'hex')
      );

      if (!('value' in response) || !('data' in response.value)) {
        return;
      }
      const data: any = response.value.data;

      const amountInMicro = cvToString(data['amount-ustx']).substring(1);
      const numberOfCycles = parseInt(
        cvToString(data['lock-period']).substring(1),
        10
      );
      const startRewardCycleId = parseInt(
        cvToString(data['first-reward-cycle']).substring(1),
        10
      );

      // how much time is left (in seconds) until the next cycle begins?
      const secondsToNextCycle =
        (stackingData.poxInfo.reward_cycle_length -
          ((stackingData.coreInfo.burn_block_height -
            stackingData.poxInfo.first_burnchain_block_height) %
            stackingData.poxInfo.reward_cycle_length)) *
        stackingData.blocktimeInfo.testnet.target_block_time;

      // the actual datetime of the next cycle start
      const nextCycleStartingAt = new Date();
      nextCycleStartingAt.setSeconds(
        nextCycleStartingAt.getSeconds() + secondsToNextCycle
      );

      // The projected datetime for the locking of tokens
      // the date can be in the past if the cycle already started
      const lockingAt = new Date(nextCycleStartingAt);
      // Cycle will start soon
      if (startRewardCycleId > stackingData.poxInfo.reward_cycle_id) {
        const diffCycles =
          startRewardCycleId - 1 - stackingData.poxInfo.reward_cycle_id;
        lockingAt.setSeconds(
          lockingAt.getSeconds() +
            stackingData.poxInfo.reward_cycle_length *
              diffCycles *
              stackingData.blocktimeInfo.testnet.target_block_time
        );
      } else {
        // Cycle already started
        // TODO
      }

      // The projected datetime for the unlocking of tokens
      const unlockingAt = new Date(nextCycleStartingAt);
      unlockingAt.setSeconds(
        unlockingAt.getSeconds() +
          stackingData.poxInfo.reward_cycle_length *
            numberOfCycles *
            stackingData.blocktimeInfo.testnet.target_block_time
      );

      setStackingInfos({
        lockingAt: lockingAt.toString(),
        unlockingAt: unlockingAt.toString(),
        numberOfCycles,
        amountInMicro: amountInMicro,
      });
    }
  }, [stackingData]);

  const handleStackingDashboard = () => {
    if (!stackingInfos) return;

    navigation.navigate('StackingDashboard', {
      unlockingAt: stackingInfos.unlockingAt,
      lockingAt: stackingInfos.lockingAt,
      numberOfCycles: stackingInfos.numberOfCycles,
      amountInMicro: stackingInfos.amountInMicro,
    });
  };

  const handleHowItWorks = async () => {
    const url = 'https://docs.blockstack.org/stacks-blockchain/stacking';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    }
  };

  // TODO show real number for APY

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <AppbarContent
          title="Stacking"
          subtitle="Stack your Stacks to earn bitcoin"
        />
      </AppbarHeader>

      <View>
        <View style={styles.imageContainer}>
          <Image
            source={
              theme === 'light' ? MetaverseBigBitcoin : MetaverseBigBitcoinLight
            }
            style={styles.image}
          />
        </View>

        <List.Section style={styles.listSection}>
          <List.Item
            left={(props) => (
              <List.Icon
                {...props}
                icon={({ size, color }) => <Check size={size} fill={color} />}
              />
            )}
            title="Earn up to X% APY"
          />
          <List.Item
            left={(props) => (
              <List.Icon
                {...props}
                icon={({ size, color }) => <Check size={size} fill={color} />}
              />
            )}
            title="Get Rewards in BTC every week"
          />
          <List.Item
            left={(props) => (
              <List.Icon
                {...props}
                icon={({ size, color }) => <Check size={size} fill={color} />}
              />
            )}
            title="Funds stay yours"
          />
        </List.Section>
      </View>

      <View style={styles.buttonsContainer}>
        {stackingInfos ? (
          <Button style={styles.button} onPress={handleStackingDashboard}>
            Stacking dashboard
          </Button>
        ) : null}
        {!stackingInfos ? (
          <Button style={styles.button} onPress={handleHowItWorks}>
            How it works
          </Button>
        ) : null}
        <Button
          mode="contained"
          onPress={() => navigation.navigate('StackingAmount')}
        >
          Get started
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // +10 is used for AppbarHeader to center it with the Settings title
    marginTop: Constants.statusBarHeight + 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    height: 300,
    width: 300,
    marginTop: -50,
    marginBottom: -50,
  },
  listSection: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  buttonsContainer: {
    padding: 16,
  },
  button: {
    marginBottom: 8,
  },
});
