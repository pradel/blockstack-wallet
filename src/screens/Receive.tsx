import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, Share, Alert, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import BottomSheet, {
  TouchableOpacity,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';
import { Button } from '../components/Button';
import { stacksClientFaucet } from '../stacksClient';

interface ReceiveScreenProps {
  open: boolean;
  onClose: () => void;
}

export const ReceiveScreen = ({ open, onClose }: ReceiveScreenProps) => {
  const auth = useAuth();
  const { appConfig } = useAppConfig();
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (open) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [open]);

  const handleShare = async () => {
    try {
      await Share.share({ message: auth.address });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1 || index === 0) {
      onClose();
    }
  }, []);

  // Request some stx from the faucet
  // Long press on the button add stacking param to the request
  const handleRequestStx = async (longPress?: true) => {
    try {
      const response = await stacksClientFaucet.runFaucetStx({
        address: auth.address,
        stacking: longPress,
      });
      console.log(response);
      Alert.alert(
        "You'll receive your testing Stacks Token (STX) momentarily."
      );
    } catch (error) {
      console.error(error);
      if (typeof error === 'object') {
        // Status is the http code returned by the node
        error = error.status;
      }
      Alert.alert(`Request failed: ${error}`);
    }
  };

  // TODO needs to be on top of bottom navigation

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={[0, 400]}
      onChange={handleSheetChanges}
      backdropComponent={BottomSheetBackdrop}
    >
      <Surface style={styles.container}>
        <View style={styles.qrCodeContainer}>
          <QRCode value={auth.address} size={160} />
        </View>
        <Text style={styles.text} onPress={handleShare}>
          {auth.address}
        </Text>

        <View style={styles.buttonsContainer}>
          {appConfig.network === 'testnet' ? (
            <TouchableOpacity
              onPress={() => handleRequestStx()}
              onLongPress={() => handleRequestStx(true)}
              activeOpacity={0.7}
            >
              <Button mode="contained" style={styles.buttonFaucet}>
                Get STX from faucet
              </Button>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={handleShare} activeOpacity={0.7}>
            <Button mode="contained">Share</Button>
          </TouchableOpacity>
        </View>
      </Surface>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
    elevation: 0,
  },
  qrCodeContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  text: {
    paddingTop: 32,
    textAlign: 'center',
    fontWeight: '700',
  },
  buttonsContainer: {
    paddingTop: 32,
    paddingBottom: 16,
  },
  buttonFaucet: {
    marginBottom: 16,
  },
});
