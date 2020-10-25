import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, Share, Alert, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import BottomSheet, {
  BottomSheetView,
  TouchableOpacity,
} from '@gorhom/bottom-sheet';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';
import { config } from '../config';
import { Button } from '../components/Button';

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
    if (index === 0) {
      onClose();
    }
  }, []);

  // Request some stx from the faucet
  // Long press on the button add stacking param to the request
  const handleRequestStx = async (longPress?: true) => {
    const data = await fetch(
      `${config.blockstackApiUrl}/extended/v1/faucets/stx?address=${
        auth.address
      }${longPress ? '&stacking=true' : ''}`,
      {
        method: 'POST',
      }
    );
    if (data.ok) {
      Alert.alert(
        "You'll receive your testing Stacks Token (STX) momentarily."
      );
    } else {
      Alert.alert(`Request failed with status ${data.status}`);
      console.error(await data.json());
    }
  };

  // TODO needs to be on top of bottom navigation
  // TODO overlay behind and if click overlay then close the sheet

  return (
    <BottomSheet
      ref={bottomSheetRef}
      initialSnapIndex={-1}
      snapPoints={[0, 430]}
      onChange={handleSheetChanges}
    >
      <BottomSheetView>
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
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
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
