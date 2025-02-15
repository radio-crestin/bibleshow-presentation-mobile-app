import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {FC, useEffect} from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';
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

const RootLayoutContent: FC<{ colorScheme: ColorSchemeName }> = ({ colorScheme }) => {
  const { isPowerSaving } = useSettings();
  const [originalBrightness, setOriginalBrightness] = useState<number | null>(null);
  const manageBrightness = async () => {
    try {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === 'granted') {
        if (isPowerSaving) {
          // Save current brightness before dimming if not already saved
          if (originalBrightness === null) {
            const currentBrightness = await Brightness.getBrightnessAsync();
            setOriginalBrightness(currentBrightness);
          }
          await Brightness.setBrightnessAsync(Math.max((originalBrightness || 0.5) * 0.5, 0.1));
        } else if (originalBrightness !== null) {
          // Restore original brightness
          await Brightness.setBrightnessAsync(originalBrightness);
          setOriginalBrightness(null);
        }
      }
    } catch (error) {
      console.warn('Failed to manage brightness:', error);
    }
  };

  manageBrightness();
  
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
        <StatusBar style="auto" backgroundColor="white" />
      </ThemeProvider>
      <PowerSaveOverlay isPowerSaving={isPowerSaving} />
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
      <RootLayoutContent colorScheme={colorScheme} />
    </SettingsProvider>
  );
}
