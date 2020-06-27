import React from 'react';
import { StyleSheet, Share, Alert } from 'react-native';
import Constants from 'expo-constants';
import {
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Divider,
  Text,
  Button,
} from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/router';

type ReceiveNavigationProp = StackNavigationProp<RootStackParamList, 'Receive'>;

export const ReceiveScreen = () => {
  const navigation = useNavigation<ReceiveNavigationProp>();
  const auth = useAuth();

  const handleShare = async () => {
    try {
      await Share.share({ message: auth.address });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  return (
    <Layout style={styles.container}>
      <TopNavigation
        title="Receive STX"
        alignment="center"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props) => <Icon {...props} name="arrow-back" />}
            onPress={() => navigation.goBack()}
          />
        )}
      />
      <Divider />

      <Layout style={styles.contentContainer}>
        <Layout>
          <Layout style={styles.qrCodeContainer}>
            <QRCode value={auth.address} size={300} />
          </Layout>
          <Text style={styles.text} onPress={handleShare}>
            {auth.address}
          </Text>
        </Layout>

        <Layout style={styles.buttonsContainer}>
          <Button onPress={handleShare}>Share</Button>
        </Layout>
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
    justifyContent: 'space-between',
  },
  qrCodeContainer: {
    marginTop: 64,
    alignItems: 'center',
  },
  text: {
    marginTop: 32,
    textAlign: 'center',
  },
  buttonsContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
});
