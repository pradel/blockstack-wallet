import React from "react";
import {
  NavigationContainer,
  NavigationContainerRef,
  NavigationState,
} from "@react-navigation/native";
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  Divider,
} from "@ui-kitten/components";
import analytics from "@react-native-firebase/analytics";
import { ThemeProvider } from "./src/context/ThemeContext";
import { ConfigProvider } from "./src/context/AppConfigContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { LoginScreen } from "./src/screens/login";
import { DashboardScreen } from "./src/screens/dashboard";
import { SettingsScreen } from "./src/screens/settings";
import { CreateWalletScreen } from "./src/screens/CreateWallet";
import { BackupPassphrase } from "./src/screens/BackupPassphrase";
import { Fingerprint } from "./src/screens/Fingerprint";
import { ReceiveScreen } from "./src/screens/Receive";
import { SendScreen } from "./src/screens/Send";
import { SendAmountScreen } from "./src/screens/SendAmount";
import { RootStackParamList } from "./src/types/router";
import { SendConfirmScreen } from "./src/screens/SendConfirm";

const Tab = createBottomTabNavigator();

const BottomTabBar = ({ navigation, state }: BottomTabBarProps) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={(index) => navigation.navigate(state.routeNames[index])}
    appearance="noIndicator"
  >
    <BottomNavigationTab
      icon={(props) => <Icon {...props} name="home-outline" />}
    />
    <BottomNavigationTab
      icon={(props) => <Icon {...props} name="settings-outline" />}
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

const Router = () => {
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
        name="Receive"
        component={ReceiveScreen}
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

// Gets the current screen from navigation state
const getActiveRouteName = (state?: NavigationState): any => {
  const route = state?.routes[state.index];

  if (route?.state) {
    // Dive into nested navigators
    return getActiveRouteName(route.state as any);
  }

  return route?.name;
};

export default () => {
  const routeNameRef = React.useRef();
  const navigationRef = React.useRef<NavigationContainerRef>(null);

  React.useEffect(() => {
    if (!navigationRef.current) return;
    const state = navigationRef.current.getRootState();

    // Save the initial route name
    routeNameRef.current = getActiveRouteName(state);
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={(state) => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = getActiveRouteName(state);

        console.log("currentRouteName", currentRouteName);

        if (previousRouteName !== currentRouteName) {
          console.log("log");
          analytics().setCurrentScreen(currentRouteName, currentRouteName);
        }

        // Save the current route name for later comparison
        routeNameRef.current = currentRouteName;
      }}
    >
      <ThemeProvider>
        <ConfigProvider>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </ConfigProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
};
