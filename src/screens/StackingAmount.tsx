import React, { useState } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';
import { Appbar, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Big from 'bn.js';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { Button } from '../components/Button';
import { stacksToMicro } from '../utils';

export const StackingAmountScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');

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

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Amount"
            mode="outlined"
            autoFocus={true}
            value={amount}
            keyboardType="number-pad"
            onChangeText={(nextValue) => setAmount(nextValue)}
          />
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={() => null}
            disabled={!isAmountValid}
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
