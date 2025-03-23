import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {FC, useEffect} from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { MicrophoneProvider } from '@/components/MicrophoneContext';
import { useFonts } from 'expo-font';
import {Stack, useNavigationContainerRef} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { PowerSaveOverlay } from '@/components/PowerSaveOverlay';
import { useSettings } from '@/contexts/SettingsContext';
import * as Brightness from 'expo-brightness';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import {ColorSchemeName} from "react-native/Libraries/Utilities/Appearance";
import { useState } from 'react';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';

// Construct a new integration instance. This is needed to communicate between the integration and React
const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: 'https://74f7dc639a13d5f67792d37731e5e346@o4508825689325568.ingest.de.sentry.io/4508825691095120',
  sendDefaultPii: true,
  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
  integrations: [
    // Pass integration
    navigationIntegration,
  ],
  enableNativeFramesTracking: !isRunningInExpoGo(),
});

const RootLayoutContent: FC<{ colorScheme: ColorSchemeName }> = ({ colorScheme }) => {
  const { isPowerSaving } = useSettings();

  return (
    <>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" backgroundColor="white" hidden />
      </ThemeProvider>
      <PowerSaveOverlay  />
    </>
  );
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref?.current) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SettingsProvider>
      <MicrophoneProvider>
        <RootLayoutContent colorScheme={colorScheme} />
      </MicrophoneProvider>
    </SettingsProvider>
  );
}
