import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './src/context/AuthContext';
import { RideProvider } from './src/context/RideContext';
import { ToastProvider } from './src/context/ToastContext';
import ToastHost from './src/components/ToastHost';
import AppNavigator from './src/navigation/AppNavigator';
import { STRIPE_PUBLISHABLE_KEY } from './src/config/constants';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <ToastProvider>
            <AuthProvider>
              <RideProvider>
                <StatusBar style="dark" />
                <AppNavigator />
                <ToastHost />
              </RideProvider>
            </AuthProvider>
          </ToastProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
