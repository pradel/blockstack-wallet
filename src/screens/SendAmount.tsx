import React, { useState } from 'react';
import { StyleSheet, TouchableHighlight } from 'react-native';
import Constants from 'expo-constants';
import {
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Divider,
  Text,
  Button,
  Input,
} from '@ui-kitten/components';
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
    <Layout style={styles.container}>
      <TopNavigation
        title="Enter Amount"
        alignment="center"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props) => <Icon {...props} name="arrow-back" />}
            onPress={() => navigation.goBack()}
          />
        )}
      />
      <Divider />

      <Layout style={styles.contentContainer}>
        <Layout />

        <Layout style={styles.inputContainer}>
          <Input
            placeholder="Amount"
            size="large"
            autoFocus={true}
            value={amount}
            keyboardType="number-pad"
            onChangeText={(nextValue) => setAmount(nextValue)}
          />
        </Layout>

        <Layout style={styles.buttonsContainer}>
          <Button size="large" onPress={handleConfirm} disabled={!amount}>
            Next
          </Button>
        </Layout>
      </Layout>
    </Layout>
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
