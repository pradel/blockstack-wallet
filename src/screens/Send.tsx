import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableHighlight, View } from 'react-native';
import Constants from 'expo-constants';
import {
  Appbar,
  TextInput,
  Button,
  HelperText,
  IconButton,
  Text,
} from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Clipboard from '@react-native-community/clipboard';
import { RootStackParamList } from '../types/router';
import { validateStacksAddress } from '../utils';

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
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Recipient address" />
      </Appbar.Header>

      <View style={styles.contentContainer}>
        <View />

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Address"
            mode="outlined"
            autoFocus={true}
            value={address}
            onChangeText={(nextValue) => setAddress(nextValue)}
            right={
              <TextInput.Icon name="content-paste" onPress={handlePaste} />
            }
          />
          <HelperText
            type="error"
            visible={Boolean(address && !isAddressValid)}
          >
            Invalid STX address
          </HelperText>
        </View>

        <View style={styles.buttonsContainer}>
          <View style={{ alignItems: 'center' }}>
            <IconButton
              icon="qrcode"
              style={styles.qrCodeButton}
              size={24}
              onPress={handleScan}
            />
          </View>
          <Button
            mode="contained"
            onPress={handleConfirm}
            disabled={!isAddressValid}
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
  inputTextAction: {
    fontWeight: '700',
  },
  buttonsContainer: {
    padding: 16,
  },
  qrCodeButton: {
    marginBottom: 16,
  },
});
