import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { Linking, StyleSheet, View, Image } from 'react-native';
import { List } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from 'react-query';
import { StackingClient } from '@stacks/stacking';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { Button } from '../components/Button';
import { RootStackParamList } from '../types/router';
import MetaverseBigBitcoin from '../../assets/MetaverseBigBitcoin.png';
import MetaverseBigBitcoinLight from '../../assets/MetaverseBigBitcoinLight.png';
import { Check } from '../icons';

type StackingScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const StackingScreen = () => {
  const { theme } = useTheme();
  const auth = useAuth();
  const { appConfig } = useAppConfig();
  const navigation = useNavigation<StackingScreenNavigationProp>();
  const [stackingInfos, setStackingInfos] = useState<{
    lockingAt: string;
    unlockingAt: string;
    numberOfCycles: number;
    amountInMicro: string;
  }>();

  const stackingClient = new StackingClient(
    auth.address,
    appConfig.network === 'mainnet' ? new StacksMainnet() : new StacksTestnet()
  );

  const { data: stackingData } = useQuery(
    ['stacking', auth.address],
    async () => {
      const [
        stackingStatus,
        poxInfo,
        cycleDurationInSeconds,
        secondsUntilNextCycle,
        blockTimeInfo,
      ] = await Promise.all([
        stackingClient.getStatus(),
        stackingClient.getPoxInfo(),
        stackingClient.getCycleDuration(),
        stackingClient.getSecondsUntilNextCycle(),
        stackingClient.getTargetBlockTime(),
      ]);

      return {
        stackingStatus,
        poxInfo,
        cycleDurationInSeconds,
        secondsUntilNextCycle,
        blockTimeInfo,
      };
    }
  );

  useEffect(() => {
    if (stackingData && stackingData.stackingStatus.stacked) {
      // TODO remove check when https://github.com/blockstack/stacks.js/pull/926 is merged
      const stackingStatusDetails = stackingData.stackingStatus.details!;

      const nextCycleStartingAt = new Date(
        new Date().getTime() + stackingData.secondsUntilNextCycle
      );

      // TODO real lockingAt
      const lockingAt = new Date(nextCycleStartingAt);

      // TODO what if already started?
      const unlockingAt = new Date(nextCycleStartingAt);
      unlockingAt.setSeconds(
        unlockingAt.getSeconds() +
          stackingData.cycleDurationInSeconds *
            stackingStatusDetails.lock_period
      );

      setStackingInfos({
        lockingAt: lockingAt.toString(),
        unlockingAt: unlockingAt.toString(),
        numberOfCycles: stackingStatusDetails.lock_period,
        amountInMicro: stackingStatusDetails.amount_microstx,
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
        {stackingData?.stackingStatus.stacked ? (
          <Button style={styles.button} onPress={handleStackingDashboard}>
            Stacking dashboard
          </Button>
        ) : null}
        {!stackingData?.stackingStatus.stacked ? (
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
