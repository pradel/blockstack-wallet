import React from 'react';
import Constants from 'expo-constants';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { List, Divider, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { AppbarHeader } from '../components/AppbarHeader';
import { AppbarContent } from '../components/AppBarContent';

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <AppbarHeader>
        <AppbarContent title="Settings" />
      </AppbarHeader>

      <ScrollView>
        <List.Section>
          <List.Subheader>Security</List.Subheader>
          <Surface>
            <List.Item
              title="Fingerprint"
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Fingerprint')}
            />
            <Divider />
            <List.Item
              title="Backup your passphrase"
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('BackupPassphrase')}
            />
          </Surface>
        </List.Section>

        <List.Section>
          <List.Subheader>General</List.Subheader>
          <Surface>
            <List.Item
              title={theme.theme === 'light' ? 'Dark mode' : 'Light mode'}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon={
                    theme.theme === 'light'
                      ? 'moon-waning-crescent'
                      : 'white-balance-sunny'
                  }
                />
              )}
              onPress={theme.toggleTheme}
            />
            <Divider />
            <List.Item
              title="Currency"
              description="USD"
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Coming soon')}
            />
          </Surface>
        </List.Section>

        <List.Section>
          <List.Subheader>Info</List.Subheader>
          <Surface>
            <List.Item
              title="About"
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Coming soon')}
            />
            <Divider />
            <List.Item
              title="Version"
              description={Constants.nativeAppVersion}
              onPress={() => Alert.alert('Coming soon')}
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
});
