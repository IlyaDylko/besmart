/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const BrandColors = {
  primary: '#FF7A50',
  primarySoft: '#FFE8DF',
  streak: '#FFB800',
  streakSoft: '#FFF3CC',
  success: '#2ECC71',
  successSoft: '#DFF6E8',
  error: '#E74C3C',
  errorSoft: '#FDE8E6',
  border: '#E8E4DF',
  card: '#FFFFFF',
} as const;

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#FFF9F5',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#FFE8DF',
    textSecondary: '#6B6560',
  },
  dark: {
    text: '#FFFFFF',
    background: '#12100E',
    backgroundElement: '#1E1B18',
    backgroundSelected: '#3D2A22',
    textSecondary: '#B0AAA3',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80, web: 72 }) ?? 0;
export const MaxContentWidth = 800;
