import React, { useEffect, useMemo, useState } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  HelperText,
  TextInput,
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import Big from 'bn.js';
import {
  CoreNodePoxResponse,
  AddressBalanceResponse,
} from '@stacks/blockchain-api-client';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { Button } from '../components/Button';
import { microToStacks, stacksToMicro } from '../utils';
import { stacksClientInfo, stacksClientAccounts } from '../stacksClient';
import { RootStackParamList } from '../types/router';
import { useAuth } from '../context/AuthContext';

type StackingAmountScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'StackingAmount'
>;

export const StackingAmountScreen = () => {
  const navigation = useNavigation<StackingAmountScreenNavigationProp>();
  const auth = useAuth();
  const [amount, setAmount] = useState('');
  const [stacksInfo, setStacksInfo] = useState<{
    poxInfo: CoreNodePoxResponse;
    accountBalance: AddressBalanceResponse;
  }>();
  // Is the user allowed to participate in stacking
  // We check that the balance has enough founds compared to the minimum required
  const canParticipate = useMemo(() => {
    if (!stacksInfo) return false;
    const accountSTXBalance = new Big(
      stacksInfo.accountBalance.stx.balance,
      10
    );
    const minAmountSTX = new Big(stacksInfo.poxInfo.min_amount_ustx, 10);
    return accountSTXBalance.cmp(minAmountSTX) >= 0;
  }, [stacksInfo]);

  useEffect(() => {
    const fetchPoxInfo = async () => {
      try {
        const poxInfo = await stacksClientInfo.getPoxInfo();
        const accountBalance = await stacksClientAccounts.getAccountBalance({
          principal: auth.address,
        });
        setStacksInfo({ poxInfo, accountBalance });
      } catch (error) {
        // TODO show error to the user
      }
    };

    fetchPoxInfo();
  }, [setStacksInfo]);

  let isAmountValid = false;
  if (amount) {
    try {
      // TODO find a better way to do this
      // TODO also apply to send flow
      new Big(stacksToMicro(amount));
      isAmountValid = true;
    } catch (error) {
      // Amount is invalid and user cannot go to next step
      // We can safely ignore
    }
  }

  const handleConfirm = () => {
    // TODO select number of cycles first
    navigation.navigate('StackingAddress', { amount });
  };

  // TODO check amount entered does not exceed current balance

  const canContinue = isAmountValid && stacksInfo && canParticipate;

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>

      <View style={styles.contentContainer}>
        <AppbarHeader>
          <AppbarContent
            title="Stacking amount"
            subtitle="How many Stacks would you like to stack?"
          />
        </AppbarHeader>

        {!stacksInfo ? (
          <View>
            <ActivityIndicator animating={true} />
          </View>
        ) : null}

        {stacksInfo ? (
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Amount"
              mode="outlined"
              autoFocus={true}
              value={amount}
              keyboardType="number-pad"
              onChangeText={(nextValue) => setAmount(nextValue)}
            />
            <HelperText type="info">
              A minimum of{' '}
              {microToStacks(stacksInfo.poxInfo.min_amount_ustx.toString())} STX
              is required.
              {/* TODO why link */}
            </HelperText>
          </View>
        ) : null}

        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={handleConfirm}
            disabled={!canContinue}
          >
            Next
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
  inputContainer: {
    padding: 16,
  },
  buttonsContainer: {
    padding: 16,
  },
});
