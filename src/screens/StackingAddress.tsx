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
import { validateBitcoinAddress } from '../utils';
import { RootStackParamList } from '../types/router';

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
  const [address, setAddress] = useState('');

  // Listen to the navigation param so if we can on this screen it will fill the input
  useEffect(() => {
    if (route.params.address) {
      route.params.address.startsWith('bitcoin:')
        ? setAddress(route.params.address.replace('bitcoin:', ''))
        : setAddress(route.params.address);
    }
  }, [route.params.address]);

  const handlePaste = async () => {
    const text = await Clipboard.getString();
    setAddress(text);
  };

  const handleScan = () => {
    navigation.navigate('StackingScanAddress', { amount: route.params.amount });
  };

  const handleConfirm = () => {
    // TODO navigate to next step
  };

  // TODO based on testnet / mainnet as the format is different
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
            autoCorrect={false}
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