import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableHighlight, View } from 'react-native';
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Clipboard from '@react-native-community/clipboard';
import { RootStackParamList } from '../types/router';
import { validateStacksAddress } from '../utils';
import { HeroQrCode } from '../images/HeroQrCode';

type SendNavigationProp = StackNavigationProp<RootStackParamList, 'Send'>;
type SendRouteProp = RouteProp<RootStackParamList, 'Send'>;

export const SendScreen = () => {
  const navigation = useNavigation<SendNavigationProp>();
  const route = useRoute<SendRouteProp>();
  const [address, setAddress] = useState(route.params?.address ?? '');

  // Listen to the navigation param so if we can on this screen it will fill the input
  useEffect(() => {
    if (route.params?.address) {
      setAddress(route.params.address);
    }
  }, [route.params?.address]);

  const handlePaste = async () => {
    const text = await Clipboard.getString();
    setAddress(text);
  };

  const handleScan = () => {
    navigation.navigate('SendScanAddress');
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
            status={address && !isAddressValid ? 'danger' : undefined}
            caption={
              address && !isAddressValid ? 'Invalid STX address' : undefined
            }
            accessoryRight={() => (
              <TouchableHighlight onPress={handlePaste}>
                <Text style={styles.inputTextAction}>Paste</Text>
              </TouchableHighlight>
            )}
          />
        </Layout>

        <Layout style={styles.buttonsContainer}>
          <View style={{ alignItems: 'center' }}>
            <Button
              style={styles.qrCodeButton}
              size="large"
              appearance="ghost"
              accessoryLeft={HeroQrCode as any}
              onPress={handleScan}
            />
          </View>
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
  qrCodeButton: {
    marginBottom: 16,
    width: 48,
    height: 48,
  },
});
