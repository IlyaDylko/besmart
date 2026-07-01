import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppProvider } from '@/context/app-context';
import { BrandColors } from '@/constants/theme';

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: BrandColors.primary,
    background: '#FFF9F5',
    card: '#FFFFFF',
    text: '#1A1A1A',
    border: BrandColors.border,
  },
};

const DarkThemeCustom = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: BrandColors.primary,
    background: '#12100E',
    card: '#1E1B18',
    text: '#FFFFFF',
    border: '#3D3833',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkThemeCustom : LightTheme}>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="lesson/[id]"
              options={{ presentation: 'card', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="book/[id]"
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
          </Stack>
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
