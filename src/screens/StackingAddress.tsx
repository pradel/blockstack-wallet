import React, { useState } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';
import { Appbar, HelperText, IconButton, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-community/clipboard';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { Button } from '../components/Button';
import { validateBitcoinAddress } from '../utils';

export const StackingAddressScreen = () => {
  const navigation = useNavigation();
  const [address, setAddress] = useState('');

  const handlePaste = async () => {
    const text = await Clipboard.getString();
    setAddress(text);
  };

  const handleConfirm = () => {
    // TODO navigate to next step
  };

  // TODO testnet / mainnet
  const isAddressValid = address && validateBitcoinAddress(address);

  const canContinue = isAddressValid;

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      </AppbarHeader>

      <View style={styles.contentContainer}>
        <AppbarHeader>
          <AppbarContent
            title="Bitcoin address"
            subtitle="Where would you like to receive your stacking rewards?"
          />
        </AppbarHeader>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="BTC address"
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
            Invalid BTC address
          </HelperText>
        </View>

        <View style={styles.buttonsContainer}>
          <View style={styles.qrCodeContainer}>
            <IconButton
              icon="qrcode"
              style={styles.qrCodeButton}
              size={24}
              // onPress={handleScan}
            />
          </View>
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
  qrCodeContainer: {
    alignItems: 'center',
  },
  qrCodeButton: {
    marginBottom: 16,
  },
});
