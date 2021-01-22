import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';
import { Appbar, HelperText, IconButton, TextInput } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Clipboard from '@react-native-community/clipboard';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { Button } from '../components/Button';
import { validateBitcoinAddress } from '../utils/validation';
import { RootStackParamList } from '../types/router';
import { useAppConfig } from '../context/AppConfigContext';
import { Clipboard as ClipboardIcon, QrCode } from '../icons';

type StackingAddressScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'StackingAddress'
>;
type StackingAddressScreenRouteProp = RouteProp<
  RootStackParamList,
  'StackingAddress'
>;

export const StackingAddressScreen = () => {
  const navigation = useNavigation<StackingAddressScreenNavigationProp>();
  const route = useRoute<StackingAddressScreenRouteProp>();
  const { appConfig } = useAppConfig();
  const [bitcoinAddress, setBitcoinAddress] = useState('');

  // Listen to the navigation param so if we can on this screen it will fill the input
  useEffect(() => {
    if (route.params.bitcoinAddress) {
      route.params.bitcoinAddress.startsWith('bitcoin:')
        ? setBitcoinAddress(route.params.bitcoinAddress.replace('bitcoin:', ''))
        : setBitcoinAddress(route.params.bitcoinAddress);
    }
  }, [route.params.bitcoinAddress]);

  const handlePaste = async () => {
    const text = await Clipboard.getString();
    setBitcoinAddress(text);
  };

  const handleScan = () => {
    navigation.navigate('StackingScanAddress', {
      amountInMicro: route.params.amountInMicro,
    });
  };

  const handleConfirm = () => {
    navigation.navigate('StackingConfirm', {
      amountInMicro: route.params.amountInMicro,
      bitcoinAddress,
    });
  };

  let bitcoinAddressValidError: string | undefined;
  if (bitcoinAddress) {
    if (!validateBitcoinAddress(bitcoinAddress, appConfig.network)) {
      bitcoinAddressValidError = 'Invalid BTC address';
    }
    // We check that the address format is supported
    // The smart contract only supports p2sh and p2pkh
    // See https://allprivatekeys.com/bitcoin-address-format for the full list
    const isFormatValid =
      appConfig.network === 'mainnet'
        ? // On mainnet the address must start with 1 or 3
          bitcoinAddress.startsWith('1') || bitcoinAddress.startsWith('3')
        : // On testnet the address must start with m, n or 2
          bitcoinAddress.startsWith('m') ||
          bitcoinAddress.startsWith('n') ||
          bitcoinAddress.startsWith('2');
    if (!isFormatValid) {
      bitcoinAddressValidError = 'Only p2sh and p2pkh address supported';
    }
  }

  const canContinue = bitcoinAddress && bitcoinAddressValidError === undefined;

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
            autoCorrect={false}
            value={bitcoinAddress}
            onChangeText={(nextValue) => setBitcoinAddress(nextValue)}
            right={
              <TextInput.Icon
                name={(props) => (
                  <ClipboardIcon size={props.size} fill={props.color} />
                )}
                onPress={handlePaste}
              />
            }
          />
          <HelperText
            type="error"
            visible={Boolean(bitcoinAddress && !!bitcoinAddressValidError)}
          >
            {bitcoinAddressValidError}
          </HelperText>
        </View>

        <View style={styles.buttonsContainer}>
          <View style={styles.qrCodeContainer}>
            <IconButton
              icon={(props) => <QrCode size={props.size} fill={props.color} />}
              style={styles.qrCodeButton}
              size={24}
              onPress={handleScan}
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
