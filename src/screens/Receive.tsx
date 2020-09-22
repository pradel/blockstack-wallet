import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Share,
  Alert,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Layout, Text, Button } from '@ui-kitten/components';
import QRCode from 'react-native-qrcode-svg';
import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ReceiveScreenProps {
  open: boolean;
  onClose: () => void;
}

export const ReceiveScreen = ({ open, onClose }: ReceiveScreenProps) => {
  const auth = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetAnimatedValue = useRef(new Animated.Value<number>(1));

  useEffect(() => {
    if (open) {
      bottomSheetRef.current?.snapTo(400);
    } else {
      bottomSheetRef.current?.snapTo(1);
    }
  }, [open]);

  const handleShare = async () => {
    try {
      await Share.share({ message: auth.address });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  // const handleRequestStx = async () => {
  //   const data = await fetch(
  //     `https://sidecar.staging.blockstack.xyz/sidecar/v1/faucets/stx?address=${auth.address}`,
  //     {
  //       method: 'POST',
  //     }
  //   );
  //   if (data.ok) {
  //     alert("You'll receive your testing Stacks Token (STX) momentarily.");
  //   } else {
  //     alert(`Request failed with status ${data.status}`);
  //   }
  // };

  // TODO needs to be on top of bottom navigation

  return (
    <React.Fragment>
      {open && (
        <AnimatedTouchable
          onPress={onClose}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            opacity: Animated.sub(
              0.4,
              Animated.multiply(bottomSheetAnimatedValue.current, 0.4)
            ),
            backgroundColor: 'black',
          }}
        />
      )}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[400, 0]}
        initialSnap={1}
        callbackNode={bottomSheetAnimatedValue.current}
        onCloseEnd={onClose}
        renderContent={() => (
          <View
            style={{
              height: '100%',
            }}
          >
            <Layout style={styles.container} level="1">
              <View style={styles.headerContainer}>
                <View style={styles.header} />
              </View>

              <Layout style={styles.qrCodeContainer} level="2">
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

              <Layout style={styles.buttonsContainer}>
                {/* TODO display only on testnet */}
                {/* <Button
              size="large"
              style={styles.buttonFaucet}
              onPress={handleRequestStx}
            >
              Get STX from faucet
            </Button> */}
                <Button size="large" onPress={handleShare}>
                  Share
                </Button>
              </Layout>
            </Layout>
          </View>
        )}
      />
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 24,
    width: Dimensions.get('screen').width,
    justifyContent: 'center',
    alignContent: 'center',
  },
  header: {
    width: 36,
    height: 4,
    backgroundColor: '#040618',
    borderRadius: 8,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  container: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  qrCodeContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  text: {
    marginTop: 32,
    textAlign: 'center',
    fontWeight: '700',
  },
  buttonsContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 32,
    paddingBottom: 16,
  },
  buttonFaucet: {
    marginBottom: 16,
  },
});
