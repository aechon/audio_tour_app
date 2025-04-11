import 'dotenv/config';

export default {
  name: "Audio Tour App",
  slug: "audio-tour-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "audio-tour-app",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.anonymous.audio-tour-app",
    associatedDomains: ["applinks:audio-tour-app.com"]
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.anonymous.audio_tour_app",
    intentFilters: [
      {
        action: "VIEW",
        data: [
          {
            scheme: "audio-tour-app"
          }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      }
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
      }
    ]
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
    turboModules: true
  },
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "aa66332a-2814-4777-970b-c0697d3164b5"
    },
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  },
  owner: "thronows"
}; 