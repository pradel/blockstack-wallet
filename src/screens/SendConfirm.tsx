import React from "react";
import { StyleSheet, Alert } from "react-native";
import {
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Divider,
  Text,
  Button,
} from "@ui-kitten/components";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  makeSTXTokenTransfer,
  StacksTestnet,
  broadcastTransaction,
  StacksTransaction,
} from "@blockstack/stacks-transactions";
import Big from "bn.js";
import { RootStackParamList } from "../types/router";
import { getStorageKeyPk, stacksToMicro } from "../utils";
import { useAppConfig } from "../context/AppConfigContext";

type SendConfirmNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SendConfirm"
>;
type SendConfirmScreenRouteProp = RouteProp<RootStackParamList, "SendConfirm">;

export const SendConfirmScreen = () => {
  const navigation = useNavigation<SendConfirmNavigationProp>();
  const route = useRoute<SendConfirmScreenRouteProp>();
  const appConfig = useAppConfig();

  // TODO show transaction details for confirmation

  const handleConfirm = async () => {
    if (appConfig.appConfig.requireBiometricTransaction) {
      const authenticateResult = await LocalAuthentication.authenticateAsync();
      if (!authenticateResult.success) return;
    }

    const privateKeyHex = await SecureStore.getItemAsync(getStorageKeyPk());
    if (privateKeyHex) {
      const network = new StacksTestnet();

      let transaction: StacksTransaction;
      try {
        transaction = await makeSTXTokenTransfer({
          recipient: route.params.address,
          amount: new Big(stacksToMicro(route.params.amount)),
          senderKey: privateKeyHex,
          network,
          // TODO allow custom memo message
          memo: "test memo",
        });
      } catch (error) {
        Alert.alert(`Failed to create transaction. ${error.message}`);
        return;
      }

      try {
        await broadcastTransaction(transaction, network);
      } catch (error) {
        Alert.alert(`Failed to broadcast transaction. ${error.message}`);
        return;
      }

      navigation.navigate("Main");
    }
  };

  return (
    <Layout style={styles.container}>
      <TopNavigation
        title="Send STX"
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
        <Layout style={styles.inputContainer}>
          <Text category="h1">Confirm details</Text>
        </Layout>

        <Layout style={styles.buttonsContainer}>
          <Button onPress={handleConfirm}>Confirm</Button>
        </Layout>
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  inputContainer: {
    padding: 16,
  },
  buttonsContainer: {
    padding: 16,
  },
});
