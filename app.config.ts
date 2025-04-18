// app.config.ts

import type { ConfigContext, ExpoConfig } from '@expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Yeko Prof',
  description: 'Yeko Professeur',
  slug: 'yeko-teach',
  scheme: 'io.ldsgroups.yeko_teach',
  version: '1.0.0',
  sdkVersion: '52.0.0',
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  runtimeVersion: '1.0.0',
  assetBundlePatterns: ['./src/assets/images/*'],
  locales: {
    tr: './src/assets/languages/turkish.json',
    en: './src/assets/languages/english.json',
  },
  splash: {
    image: './src/assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    bundleIdentifier: 'io.ldsgroups.yekoTeach',
    buildNumber: '1.0.0',
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
    },
  },
  web: {
    bundler: 'metro',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'io.ldsgroups.yeko_teach',
    versionCode: 1,
  },
  // updates: {
  //   enabled: true,
  //   url: "https://u.expo.dev/49e4e24d-c928-4ff1-815d-f1a58ca580bd",
  // },
  extra: {
    eas: {
      projectId: 'fe2266ec-6e03-4384-9a57-5c9634e77314',
    },
  },
  owner: 'ldsgroups225',
  plugins: [
    'expo-font',
    'expo-localization',
    [
      'expo-sqlite',
      {
        enableFTS: true,
        useSQLCipher: true,
        android: {
          // Override the shared configuration for Android
          enableFTS: false,
          useSQLCipher: false,
        },
        ios: {
          // You can also override the shared configurations for iOS
          customBuildFlags: ['-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1'],
        },
      },
    ],
  ],
})
