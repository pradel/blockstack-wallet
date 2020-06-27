import React from 'react';
import Constants from 'expo-constants';
import {
  Layout,
  Text,
  ListItem,
  Icon,
  TopNavigation,
  Divider,
} from '@ui-kitten/components';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <Layout style={styles.container} level="2">
      <TopNavigation title="Settings" alignment="center" />
      <Divider />

      <ScrollView>
        <Text category="h6" style={styles.listHeader}>
          Security
        </Text>
        <Divider />
        <ListItem
          title="Fingerprint"
          accessoryRight={(props) => (
            <Icon {...props} name="chevron-right-outline" />
          )}
          style={styles.listItem}
          onPress={() => navigation.navigate('Fingerprint')}
        />
        <Divider />
        <ListItem
          title="Backup your passphrase"
          accessoryRight={(props) => (
            <Icon {...props} name="chevron-right-outline" />
          )}
          style={styles.listItem}
          onPress={() => navigation.navigate('BackupPassphrase')}
        />
        <Divider />

        <Text category="h6" style={styles.listHeader}>
          General
        </Text>
        <Divider />
        <ListItem
          title={theme.theme === 'light' ? 'Dark mode' : 'Light mode'}
          accessoryRight={(props) => (
            <Icon
              name={theme.theme === 'light' ? 'moon-outline' : 'sun-outline'}
              {...props}
              style={{
                // @ts-ignore
                ...(props?.style ?? {}),
                height: 18,
                width: 18,
              }}
            />
          )}
          style={styles.listItem}
          onPress={theme.toggleTheme}
        />
        <Divider />
        <ListItem
          title="Currency"
          style={styles.listItem}
          accessoryRight={() => (
            // TODO make version dynamic on the release version
            <Text
              style={styles.listItemRightText}
              category="s2"
              appearance="hint"
            >
              USD
            </Text>
          )}
          // TODO select currency
        />
        <Divider />

        <Text category="h6" style={styles.listHeader}>
          Info
        </Text>
        <Divider />
        <ListItem
          title="About"
          accessoryRight={(props) => (
            <Icon {...props} name="chevron-right-outline" />
          )}
          style={styles.listItem}
          // TODO make it open an about page
        />
        <Divider />
        <ListItem
          title="Version"
          style={styles.listItem}
          accessoryRight={() => (
            // TODO make version dynamic on the release version
            <Text
              style={styles.listItemRightText}
              category="s2"
              appearance="hint"
            >
              0.0.1
            </Text>
          )}
        />
        <Divider />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
    flexDirection: 'column',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
  },
  listItem: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  listItemRightText: {
    marginRight: 8,
  },
});
