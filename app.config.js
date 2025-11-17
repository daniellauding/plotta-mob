module.exports = ({ config }) => {
  return {
    ...config,
    name: "Plotta",
    slug: "plotta-mobile",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/images/icon.png",
    scheme: "plotta",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.instinctly.plotta",
      infoPlist: {
        UIBackgroundModes: [
          "remote-notification",
          "remote-notification",
          "remote-notification",
          "remote-notification"
        ]
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#000000"
      },
      package: "com.instinctly.plotta",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      runtimeVersion: {
        policy: "appVersion"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "86a2908c-ad3b-409f-a7cf-f0c50effe54c"
      },
      // AI Assistant Configuration
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      anthropicApiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
      defaultAiProvider: process.env.EXPO_PUBLIC_DEFAULT_AI_PROVIDER || 'openai',
    },
    updates: {
      url: "https://u.expo.dev/86a2908c-ad3b-409f-a7cf-f0c50effe54c"
    },
    runtimeVersion: {
      policy: "appVersion"
    }
  };
};
