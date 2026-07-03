/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const BookColors = {
  brown: '#5C3D3A',
  brownLight: '#7A5A56',
  brownMuted: '#A89490',
  brownSoft: '#EDE4DC',
  brownSelected: '#F5EDE6',
  cream: '#FDF6F0',
  card: '#FFFFFF',
  cardBorder: '#E8DDD4',
  tag: '#5C3D3A',
  lock: '#C4A882',
} as const;

export const BookTypography = {
  display: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
    fontWeight: '700' as const,
  },
  body: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  },
} as const;

export const BookShadow = {
  card: {
    shadowColor: '#5C3D3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  floating: {
    shadowColor: '#5C3D3A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

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

export const MaxContentWidth = 800;
