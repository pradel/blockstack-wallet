import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { ActivityIndicator, Appbar, Text } from 'react-native-paper';
import { BarCodeScanner, BarCodeScannedCallback } from 'expo-barcode-scanner';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/router';
import { AppbarHeader } from '../components/AppbarHeader';

type StackingScanAddressNavigationProp = StackNavigationProp<
  RootStackParamList,
  'StackingScanAddress'
>;
type StackingScanAddressRouteProp = RouteProp<
  RootStackParamList,
  'StackingScanAddress'
>;

export const StackingScanAddress = () => {
  const navigation = useNavigation<StackingScanAddressNavigationProp>();
  const route = useRoute<StackingScanAddressRouteProp>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    });

    return unsubscribe;
  }, [navigation, setHasPermission]);

  const handleBarCodeScanned: BarCodeScannedCallback = ({ data }) => {
    // We keep this scanned value so the callback is not called 2 times while we process the response
    setScanned(true);
    navigation.navigate('StackingAddress', {
      amountInMicro: route.params.amountInMicro,
      bitcoinAddress: data,
    });
  };

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Scan recipient BTC address" />
      </AppbarHeader>

      {hasPermission !== true ? (
        <View style={styles.messageContainer}>
          {hasPermission === null ? (
            <React.Fragment>
              <ActivityIndicator
                animating={true}
                style={styles.activityIndicator}
              />
              <Text>Requesting for camera permission</Text>
            </React.Fragment>
          ) : null}
          {hasPermission === false ? <Text>No access to camera</Text> : null}
        </View>
      ) : null}

      {hasPermission === true ? (
        <View style={styles.contentContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? () => null : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIndicator: {
    marginBottom: 32,
  },
  contentContainer: {
    flex: 1,
  },
});
