import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Layout, Text, Button } from "@ui-kitten/components";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import {
  getAddressFromPrivateKey,
  TransactionVersion,
} from "@blockstack/stacks-transactions";
import { getStorageKeyPk } from "../utils";
import { useAuth } from "../context/AuthContext";
import { useAppConfig } from "../context/AppConfigContext";

export const LoginScreen = () => {
  const navigation = useNavigation();
  const auth = useAuth();
  const appConfig = useAppConfig();
  const [haveWallet, setHaveWallet] = useState<boolean>();

  useEffect(() => {
    const checkWalletInDevice = async () => {
      const haveLocalWallet = Boolean(
        await SecureStore.getItemAsync(getStorageKeyPk())
      );
      setHaveWallet(haveLocalWallet);

      // We ask user to enter biometrics directly if a wallet is already setup
      if (haveLocalWallet) {
        handleAuthenticateWithBiometrics();
      }
    };

    checkWalletInDevice();
  }, []);

  const handleCreateNewWallet = () => {
    navigation.navigate("CreateWallet");
  };

  const handleImportWallet = () => {
    // TODO redirect to the import wallet flow
  };

  const handleAuthenticateWithBiometrics = async () => {
    if (appConfig.appConfig.requireBiometricOpenApp) {
      const authenticateResult = await LocalAuthentication.authenticateAsync();
      if (!authenticateResult.success) return;
    }

    const privateKeyHex = await SecureStore.getItemAsync(getStorageKeyPk());
    if (privateKeyHex) {
      const address = getAddressFromPrivateKey(
        privateKeyHex,
        TransactionVersion.Testnet
      );
      auth.signIn(address);
    }
  };

  return (
    <Layout style={styles.container}>
      <View style={styles.logoContainer}>
        <Text category="h1">Blockstack wallet</Text>
      </View>

      <View style={styles.buttonsContainer}>
        {haveWallet && (
          <Button
            style={styles.button}
            onPress={handleAuthenticateWithBiometrics}
          >
            Login with biometrics
          </Button>
        )}
        <Button
          style={styles.button}
          appearance={haveWallet ? "ghost" : "filled"}
          onPress={handleCreateNewWallet}
        >
          Create a new wallet
        </Button>
        <Button
          style={styles.button}
          appearance="ghost"
          onPress={handleImportWallet}
        >
          I already have a wallet
        </Button>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between" },
  logoContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 64,
    alignItems: "center",
  },
  buttonsContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  button: {
    width: "100%",
  },
});
