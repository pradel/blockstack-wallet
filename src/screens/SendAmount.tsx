import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { Appbar, Button, TextInput } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/router';

type SendAmountNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SendAmount'
>;
type SendAmountScreenRouteProp = RouteProp<RootStackParamList, 'SendAmount'>;

export const SendAmountScreen = () => {
  const navigation = useNavigation<SendAmountNavigationProp>();
  const route = useRoute<SendAmountScreenRouteProp>();
  const [amount, setAmount] = useState('');

  // TODO display available balance near by the button
  // TODO next button active only if amount lower than balance

  // TODO adjust fees

  const handleConfirm = () => {
    navigation.navigate('SendConfirm', {
      address: route.params.address,
      amount,
    });
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Enter Amount" />
      </Appbar.Header>

      <View style={styles.contentContainer}>
        <View />

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
            onPress={handleConfirm}
            disabled={!amount}
            labelStyle={{
              marginVertical: 16,
            }}
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
