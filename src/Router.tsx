import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  Divider,
} from '@ui-kitten/components';
import { useAuth } from './context/AuthContext';
import { LoginScreen } from './screens/login';
import { DashboardScreen } from './screens/dashboard';
import { SettingsScreen } from './screens/settings';
import { CreateWalletScreen } from './screens/CreateWallet';
import { BackupPassphrase } from './screens/BackupPassphrase';
import { Fingerprint } from './screens/Fingerprint';
import { SendScreen } from './screens/Send';
import { SendAmountScreen } from './screens/SendAmount';
import { RootStackParamList } from './types/router';
import { SendConfirmScreen } from './screens/SendConfirm';
import { SendScanAddress } from './screens/SendScanAddress';

const Tab = createBottomTabNavigator();

const BottomTabBar = ({ navigation, state }: BottomTabBarProps) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={(index) => navigation.navigate(state.routeNames[index])}
    appearance="noIndicator"
  >
    <BottomNavigationTab icon={(props) => <Icon {...props} name="home" />} />
    <BottomNavigationTab
      icon={(props) => <Icon {...props} name="settings" />}
    />
  </BottomNavigation>
);

const MainStackScreen = () => (
  <Tab.Navigator
    tabBar={(props) => (
      <React.Fragment>
        <Divider />
        <BottomTabBar {...props} />
      </React.Fragment>
    )}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const Stack = createStackNavigator();

const RootStack = createStackNavigator<RootStackParamList>();

export const Router = () => {
  const auth = useAuth();

  return !auth.address ? (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateWallet"
        component={CreateWalletScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  ) : (
    <RootStack.Navigator mode="modal">
      <RootStack.Screen
        name="Main"
        component={MainStackScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="SendScanAddress"
        component={SendScanAddress}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="Send"
        component={SendScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="SendAmount"
        component={SendAmountScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="SendConfirm"
        component={SendConfirmScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="BackupPassphrase"
        component={BackupPassphrase}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="Fingerprint"
        component={Fingerprint}
        options={{ headerShown: false }}
      />
    </RootStack.Navigator>
  );
};
