import React from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { Appbar, Divider, List, Surface, Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppConfig } from '../context/AppConfigContext';

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
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Fingerprint" />
      </Appbar.Header>

      <List.Section>
        <List.Subheader>Security</List.Subheader>
        <Surface>
          <List.Item
            title="Require to open app"
            style={styles.listItem}
            right={(props) => (
              <Switch
                {...props}
                value={requireBiometricOpenApp}
                onValueChange={handleChangeRequireBiometricOpenApp}
              />
            )}
            onPress={handleChangeRequireBiometricOpenApp}
          />
          <Divider />
          <List.Item
            title="Require for transactions"
            style={styles.listItem}
            right={(props) => (
              <Switch
                {...props}
                value={requireBiometricTransaction}
                onValueChange={handleChangeRequireBiometricTransaction}
              />
            )}
            onPress={handleChangeRequireBiometricTransaction}
          />
        </Surface>
      </List.Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
  },
  listItem: {
    paddingTop: 12,
    paddingBottom: 12,
  },
});
