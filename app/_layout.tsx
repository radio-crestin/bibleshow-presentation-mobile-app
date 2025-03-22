import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {FC, useEffect} from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { MicrophoneProvider } from '@/components/MicrophoneContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
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

Sentry.init({
  dsn: 'https://74f7dc639a13d5f67792d37731e5e346@o4508825689325568.ingest.de.sentry.io/4508825691095120',

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const RootLayoutContent: FC<{ colorScheme: ColorSchemeName }> = ({ colorScheme }) => {
  const { isPowerSaving } = useSettings();

  return (
    <>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="settings"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
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
