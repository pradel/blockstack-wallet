import React from 'react';
import { StyleSheet, Share, Alert } from 'react-native';
import {
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Text,
  Button,
} from '@ui-kitten/components';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';

interface ReceiveScreenHeaderProps {
  onClose: () => void;
}

export const ReceiveScreenHeader = ({ onClose }: ReceiveScreenHeaderProps) => {
  return (
    <TopNavigation
      title="Address"
      alignment="center"
      accessoryRight={() => (
        <TopNavigationAction
          icon={(props) => <Icon {...props} name="close" />}
          onPress={onClose}
        />
      )}
    />
  );
};

export const ReceiveScreen = () => {
  const auth = useAuth();

  const handleShare = async () => {
    try {
      await Share.share({ message: auth.address });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const handleRequestStx = async () => {
    const data = await fetch(
      `https://sidecar.staging.blockstack.xyz/sidecar/v1/faucets/stx?address=${auth.address}`,
      {
        method: 'POST',
      }
    );
    if (data.ok) {
      alert("You'll receive your testing Stacks Token (STX) momentarily.");
    } else {
      alert(`Request failed with status ${data.status}`);
    }
  };

  return (
    <Layout style={styles.container} level="1">
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
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    zIndex: 100,
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
