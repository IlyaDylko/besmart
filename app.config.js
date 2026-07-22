const fs = require('fs');
const path = require('path');

const androidGoogleServices = './google-services.json';
const iosGoogleServices = './GoogleService-Info.plist';

const hasAndroidGoogleServices = fs.existsSync(path.resolve(__dirname, androidGoogleServices));
const hasIosGoogleServices = fs.existsSync(path.resolve(__dirname, iosGoogleServices));

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: 'BeSmart',
  slug: 'BeSmart',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'besmart',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.besmart.app',
    ...(hasIosGoogleServices ? { googleServicesFile: iosGoogleServices } : {}),
  },
  android: {
    package: 'com.besmart.app',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    ...(hasAndroidGoogleServices ? { googleServicesFile: androidGoogleServices } : {}),
  },
  platforms: ['ios', 'android'],
  plugins: [
    'expo-router',
    'expo-dev-client',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FF7A50',
        android: {
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      },
    ],
    '@react-native-firebase/app',
    [
      '@react-native-firebase/analytics',
      {
        ios: {
          // Avoid IDFA / ATT until we add a consent flow (P1).
          withoutAdIdSupport: true,
        },
      },
    ],
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
          forceStaticLinking: ['RNFBApp', 'RNFBAnalytics'],
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

if (!hasAndroidGoogleServices || !hasIosGoogleServices) {
  console.warn(
    '[firebase] Missing google-services.json and/or GoogleService-Info.plist — ' +
      'Analytics will no-op until you add them (see docs/FIREBASE.md).',
  );
}

module.exports = { expo: config };
