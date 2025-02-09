import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { FC } from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PowerSaveOverlay } from '@/components/PowerSaveOverlay';
import { useSettings } from '@/contexts/SettingsContext';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

const RootLayoutContent: FC<{ colorScheme: 'light' | 'dark' | null }> = ({ colorScheme }) => {
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
        <StatusBar style="auto" backgroundColor="white" />
      </ThemeProvider>
      <PowerSaveOverlay active={isPowerSaving} />
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
