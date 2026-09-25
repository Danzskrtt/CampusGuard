import '../global.css';

import PushNotificationRegistrar from '@/components/PushNotificationRegistrar';
import { ThemeProvider as AppThemeProvider } from '@/context/ThemeContext';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <AppThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PushNotificationRegistrar />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </AppThemeProvider>
  );
}
