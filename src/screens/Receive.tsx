import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet, Share, Alert, View } from 'react-native';
import { Layout, Text, Button } from '@ui-kitten/components';
import QRCode from 'react-native-qrcode-svg';
import BottomSheet, {
  BottomSheetView,
  TouchableOpacity,
} from '@gorhom/bottom-sheet';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';

interface ReceiveScreenProps {
  open: boolean;
  onClose: () => void;
}

export const ReceiveScreen = ({ open, onClose }: ReceiveScreenProps) => {
  const auth = useAuth();
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

  const handleRequestStx = async () => {
    const data = await fetch(
      `${config.blockstackApiUrl}/extended/v1/faucets/stx?address=${auth.address}`,
      {
        method: 'POST',
      }
    );
    if (data.ok) {
      alert("You'll receive your testing Stacks Token (STX) momentarily.");
    } else {
      alert(`Request failed with status ${data.status}`);
      console.error(await data.json());
    }
  };

  // TODO needs to be on top of bottom navigation
  // TODO overlay behind and if click overlay then close the sheet

  return (
    <BottomSheet
      ref={bottomSheetRef}
      initialSnapIndex={-1}
      snapPoints={[0, 450]}
      onChange={handleSheetChanges}
    >
      <BottomSheetView>
        <Layout style={styles.container}>
          <Layout style={styles.qrCodeContainer}>
            <QRCode value={auth.address} size={160} />
          </Layout>
          <Text
            appearance="hint"
            category="p2"
            style={styles.text}
            onPress={handleShare}
          >
            {auth.address}
          </Text>

          <View style={styles.buttonsContainer}>
            {/* TODO display only on testnet */}
            <TouchableOpacity onPress={handleRequestStx} activeOpacity={0.7}>
              <Button size="large" style={styles.buttonFaucet}>
                Get STX from faucet
              </Button>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} activeOpacity={0.7}>
              <Button size="large">Share</Button>
            </TouchableOpacity>
          </View>
        </Layout>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
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
