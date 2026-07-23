const fs = require('fs');
const path = require('path');

const androidGoogleServices = './google-services.json';
const iosGoogleServices = './GoogleService-Info.plist';

const hasAndroidGoogleServices = fs.existsSync(path.resolve(__dirname, androidGoogleServices));
const hasIosGoogleServices = fs.existsSync(path.resolve(__dirname, iosGoogleServices));

/** Meta / Facebook App Events — set in `.env` (see docs/META_EVENTS.md). */
const facebookAppId =
  process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || '';
const facebookClientToken =
  process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN || process.env.FACEBOOK_CLIENT_TOKEN || '';
const hasMetaCredentials = Boolean(facebookAppId && facebookClientToken);

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
          // Product analytics without IDFA (see docs/ATT.md). Meta ads use ATT separately.
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
    [
      'expo-tracking-transparency',
      {
        userTrackingPermission:
          'BeSmart uses this to measure which ads help people discover the app and to improve ad performance. You can change this anytime in Settings.',
      },
    ],
    ...(hasMetaCredentials
      ? [
          [
            'react-native-fbsdk-next',
            {
              appID: facebookAppId,
              clientToken: facebookClientToken,
              displayName: 'BeSmart',
              scheme: `fb${facebookAppId}`,
              // Collection allowed in Info.plist; runtime gated by ATT → setAdvertiserTrackingEnabled.
              advertiserIDCollectionEnabled: true,
              autoLogAppEventsEnabled: true,
              isAutoInitEnabled: true,
            },
          ],
        ]
      : []),
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    facebookAppId: hasMetaCredentials ? facebookAppId : null,
  },
};

if (!hasAndroidGoogleServices || !hasIosGoogleServices) {
  console.warn(
    '[firebase] Missing google-services.json and/or GoogleService-Info.plist — ' +
      'Analytics will no-op until you add them (see docs/FIREBASE.md).',
  );
}

if (!hasMetaCredentials) {
  console.warn(
    '[meta] Missing FACEBOOK_APP_ID / FACEBOOK_CLIENT_TOKEN — ' +
      'Meta App Events plugin skipped (see docs/META_EVENTS.md).',
  );
}

module.exports = { expo: config };
