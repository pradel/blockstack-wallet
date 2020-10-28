import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from './context/AuthContext';
import { LoginScreen } from './screens/Login';
import { DashboardScreen } from './screens/Dashboard';
import { SettingsScreen } from './screens/Settings';
import { CreateWalletScreen } from './screens/CreateWallet';
import { BackupPassphrase } from './screens/BackupPassphrase';
import { Fingerprint } from './screens/Fingerprint';
import { SendScreen } from './screens/Send';
import { SendAmountScreen } from './screens/SendAmount';
import { RootStackParamList } from './types/router';
import { SendConfirmScreen } from './screens/SendConfirm';
import { SendScanAddress } from './screens/SendScanAddress';
import { AboutScreen } from './screens/About';
import { TransactionDetails } from './screens/TransactionDetails';
import { StackingScreen } from './screens/Stacking';
import { StackingAmountScreen } from './screens/StackingAmount';
import { StackingAddressScreen } from './screens/StackingAddress';
import { StackingScanAddress } from './screens/StackingScanAddress';
import { StackingConfirmScreen } from './screens/StackingConfirm';
import { PriceProvider } from './context/PriceContext';

const Tab = createMaterialBottomTabNavigator();

const MainStackScreen = () => (
  <Tab.Navigator labeled={false}>
    <Tab.Screen
      name="Dashboard"
      options={{ tabBarIcon: 'home' }}
      component={DashboardScreen}
    />
    <Tab.Screen
      name="Stacking"
      options={{ tabBarIcon: 'bank' }}
      component={StackingScreen}
    />
    <Tab.Screen
      name="Settings"
      options={{ tabBarIcon: 'settings' }}
      component={SettingsScreen}
    />
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
    <PriceProvider>
      <RootStack.Navigator mode="modal">
        <RootStack.Screen
          name="Main"
          component={MainStackScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="TransactionDetails"
          component={TransactionDetails}
          options={{ headerShown: false }}
        />
        {/* Send flow */}
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
        {/* Stacking */}
        <RootStack.Screen
          name="StackingAmount"
          component={StackingAmountScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="StackingAddress"
          component={StackingAddressScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="StackingScanAddress"
          component={StackingScanAddress}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="StackingConfirm"
          component={StackingConfirmScreen}
          options={{ headerShown: false }}
        />
        {/* Settings */}
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
        <RootStack.Screen
          name="About"
          component={AboutScreen}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </PriceProvider>
  );
};
