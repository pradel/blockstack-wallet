import './src/globals';
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
// Before rendering any navigation stack
import { enableScreens } from 'react-native-screens';
enableScreens();

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
