import React, { useEffect } from 'react';
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
} from '@blockstack/stacks-transactions';
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

  const { data: stackingData } = useSWR('stacking', async () => {
    const poxInfo = await stacksClientInfo.getPoxInfo();

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

    return stackingInfo;
  });

  useEffect(() => {
    if (stackingData?.result) {
      const response = deserializeCV(
        global.Buffer.from(stackingData.result.slice(2), 'hex')
      );
      console.log({ response });

      // @ts-ignore
      const data = response.value.data;

      console.log({
        lockPeriod: cvToString(data['lock-period']),
        amountSTX: cvToString(data['amount-ustx']),
        firstRewardCycle: cvToString(data['first-reward-cycle']),
        poxAddr: {
          version: cvToString(data['pox-addr'].data.version),
          hashbytes: cvToString(data['pox-addr'].data.hashbytes),
        },
      });
    }
  }, [stackingData]);

  // TODO only show this if user is not already stacking
  // TODO if user is stacking show stacking dashboard with metrics

  // TODO show real number for APY

  const handleHowItWorks = async () => {
    const url = 'https://docs.blockstack.org/stacks-blockchain/stacking';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    }
  };

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
        <Button style={styles.button} onPress={handleHowItWorks}>
          How it works
        </Button>
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
