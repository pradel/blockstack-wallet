import React, { useState } from 'react';
import { StyleSheet, TouchableHighlight } from 'react-native';
import Constants from 'expo-constants';
import {
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Text,
  Button,
  Input,
} from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Clipboard from '@react-native-community/clipboard';
import { RootStackParamList } from '../types/router';
import { validateStacksAddress } from '../utils';

type SendNavigationProp = StackNavigationProp<RootStackParamList, 'Send'>;

export const SendScreen = () => {
  const navigation = useNavigation<SendNavigationProp>();
  const [address, setAddress] = useState('');

  // TODO Scan qr code and go to next step

  const handlePaste = async () => {
    const text = await Clipboard.getString();
    setAddress(text);
  };

  const handleConfirm = () => {
    navigation.navigate('SendAmount', { address });
  };

  const isAddressValid = address && validateStacksAddress(address);

  return (
    <Layout style={styles.container}>
      <TopNavigation
        title="Recipient address"
        alignment="center"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props) => <Icon {...props} name="arrow-ios-back-outline" />}
            onPress={() => navigation.goBack()}
          />
        )}
      />

      <Layout style={styles.contentContainer}>
        <Layout />

        <Layout style={styles.inputContainer}>
          <Input
            placeholder="Address"
            size="large"
            autoFocus={true}
            value={address}
            onChangeText={(nextValue) => setAddress(nextValue)}
            accessoryRight={() => (
              <TouchableHighlight onPress={handlePaste}>
                <Text style={styles.inputTextAction}>Paste</Text>
              </TouchableHighlight>
            )}
          />
        </Layout>

        <Layout style={styles.buttonsContainer}>
          <Button
            size="large"
            onPress={handleConfirm}
            disabled={!isAddressValid}
          >
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
  inputTextAction: {
    fontWeight: '700',
  },
  buttonsContainer: {
    padding: 16,
  },
});
