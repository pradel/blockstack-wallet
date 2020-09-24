import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
import { BarCodeScanner, BarCodeScannedCallback } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/router';

type SendNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SendScanAddress'
>;

export const SendScanAddress = () => {
  const navigation = useNavigation<SendNavigationProp>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned: BarCodeScannedCallback = ({ data }) => {
    // We keep this scanned value so the callback is not called 2 times while we process the response
    setScanned(true);
    navigation.navigate('Send', { address: data });
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <Layout style={styles.container}>
      <TopNavigation
        title="Scan recipient address"
        alignment="center"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props) => <Icon {...props} name="arrow-ios-back-outline" />}
            onPress={() => navigation.goBack()}
          />
        )}
      />

      <Layout style={styles.contentContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? () => null : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
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
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
});
