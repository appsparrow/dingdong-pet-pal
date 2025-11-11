import 'dotenv/config';

export default {
  expo: {
    name: 'DingDongDog',
    slug: 'dingdongdog',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'dingdongdog',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.dingdongdog.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.dingdongdog.app',
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: '00000000-0000-0000-0000-000000000000',
      },
    },
    plugins: [],
    runtimeVersion: {
      policy: 'sdkVersion',
    },
    sdkVersion: '54.0.0',
  },
};


