import React from 'react';
import Constants from 'expo-constants';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { List, Divider, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAppConfig } from '../context/AppConfigContext';
import { useAuth } from '../context/AuthContext';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';
import { ChevronRight, Moon, Sun } from '../icons';
import { config } from '../config';
import { queryClient } from '../queryClient';

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { appConfig, setNetwork } = useAppConfig();
  const auth = useAuth();

  const handleOpenChangelog = () => {
    const changelogUrl = `${config.githubUrl}/blob/master/CHANGELOG.md`;
    Linking.canOpenURL(changelogUrl).then((supported) => {
      if (supported) {
        Linking.openURL(changelogUrl);
      }
    });
  };

  const handleConfirmChangeNetwork = async () => {
    await setNetwork(appConfig.network === 'mainnet' ? 'testnet' : 'mainnet');
    // Remove all the cache
    queryClient.invalidateQueries();
    auth.signOut();
  };

  const handleChangeNetwork = () => {
    Alert.alert(
      'Change network',
      '⚠️ Only change the network if you know what you are doing!',
      [
        { text: 'Cancel' },
        { text: 'Continue', onPress: handleConfirmChangeNetwork },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <AppbarContent title="Settings" />
      </AppbarHeader>

      <ScrollView>
        <List.Section>
          <List.Subheader>Security</List.Subheader>
          <Surface style={styles.surface}>
            <List.Item
              title="Fingerprint"
              right={(props) => (
                <List.Icon
                  {...props}
                  icon={({ size, color }) => (
                    <ChevronRight size={size} fill={color} />
                  )}
                />
              )}
              onPress={() => navigation.navigate('Fingerprint')}
            />
            <List.Item
              title="Backup your passphrase"
              right={(props) => (
                <List.Icon
                  {...props}
                  icon={({ size, color }) => (
                    <ChevronRight size={size} fill={color} />
                  )}
                />
              )}
              onPress={() => navigation.navigate('BackupPassphrase')}
            />
          </Surface>
        </List.Section>

        <List.Section>
          <Divider />
          <List.Subheader>General</List.Subheader>
          <Surface style={styles.surface}>
            <List.Item
              title={theme.theme === 'light' ? 'Dark mode' : 'Light mode'}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon={({ size, color }) =>
                    theme.theme === 'light' ? (
                      <Moon size={size} fill={color} />
                    ) : (
                      <Sun size={size} fill={color} />
                    )
                  }
                />
              )}
              onPress={theme.toggleTheme}
            />
            <List.Item
              title="Currency"
              description="USD"
              right={(props) => (
                <List.Icon
                  {...props}
                  icon={({ size, color }) => (
                    <ChevronRight size={size} fill={color} />
                  )}
                />
              )}
              onPress={() => Alert.alert('Coming soon')}
            />
            <List.Item
              title="Network"
              description={
                appConfig.network === 'mainnet' ? 'Mainnet' : 'Testnet'
              }
              right={(props) => (
                <List.Icon
                  {...props}
                  icon={({ size, color }) => (
                    <ChevronRight size={size} fill={color} />
                  )}
                />
              )}
              onPress={handleChangeNetwork}
            />
          </Surface>
        </List.Section>

        <List.Section>
          <Divider />
          <List.Subheader>Info</List.Subheader>
          <Surface style={styles.surface}>
            <List.Item
              title="About"
              right={(props) => (
                <List.Icon
                  {...props}
                  icon={({ size, color }) => (
                    <ChevronRight size={size} fill={color} />
                  )}
                />
              )}
              onPress={() => navigation.navigate('About')}
            />
            <List.Item
              title="Version"
              description={Constants.nativeAppVersion}
              onPress={handleOpenChangelog}
            />
          </Surface>
        </List.Section>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
    flexDirection: 'column',
  },
  surface: {
    elevation: 0,
  },
});
