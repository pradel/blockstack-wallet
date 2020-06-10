import React from "react";
import { StyleSheet } from "react-native";
import {
  Icon,
  Layout,
  TopNavigation,
  TopNavigationAction,
  Divider,
  Toggle,
  ListItem,
} from "@ui-kitten/components";
import { useNavigation } from "@react-navigation/native";
import { useAppConfig } from "../context/AppConfigContext";

export const Fingerprint = () => {
  const navigation = useNavigation();
  const appConfig = useAppConfig();

  const requireBiometricOpenApp = appConfig.appConfig.requireBiometricOpenApp;
  const handleChangeRequireBiometricOpenApp = () => {
    appConfig.setRequireBiometricOpenApp(!requireBiometricOpenApp);
  };

  const requireBiometricTransaction =
    appConfig.appConfig.requireBiometricTransaction;
  const handleChangeRequireBiometricTransaction = () => {
    appConfig.setRequireBiometricTransaction(!requireBiometricTransaction);
  };

  return (
    <Layout style={styles.container}>
      <TopNavigation
        title="Fingerprint"
        alignment="center"
        accessoryLeft={() => (
          <TopNavigationAction
            icon={(props) => <Icon {...props} name="arrow-back" />}
            onPress={() => navigation.goBack()}
          />
        )}
      />
      <Divider />

      <ListItem
        title="Require to open app"
        accessoryRight={() => (
          <Toggle
            checked={requireBiometricOpenApp}
            onChange={handleChangeRequireBiometricOpenApp}
          />
        )}
        style={styles.listItem}
        onPress={handleChangeRequireBiometricOpenApp}
      />
      <Divider />
      <ListItem
        title="Require for transactions"
        accessoryRight={() => (
          <Toggle
            checked={requireBiometricTransaction}
            onChange={handleChangeRequireBiometricTransaction}
          />
        )}
        style={styles.listItem}
        onPress={handleChangeRequireBiometricTransaction}
      />
      <Divider />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listItem: {
    paddingTop: 16,
    paddingBottom: 16,
  },
});
