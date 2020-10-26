import './src/globals';
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import * as Sentry from '@sentry/react-native';
import App from './App';

Sentry.init({
  enabled: process.env.NODE_ENV === 'production',
  dsn:
    'https://7f620092734740a0a349e69961076b58@o72928.ingest.sentry.io/5493197',
  enableAutoSessionTracking: true,
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
