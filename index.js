import { registerRootComponent } from 'expo';

import App from './App';

if (__DEV__) {
    const defaultHandler = ErrorUtils.getGlobalHandler?.();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
        console.error('Global App Error:', error);
        if (defaultHandler) defaultHandler(error, isFatal);
    });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);