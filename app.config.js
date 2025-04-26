import 'dotenv/config'; // Load .env file at the top

export default {
  "expo": {
    "name": "audio_tour_app",
    "slug": "audio_tour_app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      "expo-video"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": process.env.EAS_PROJECT_ID || "YOUR_EAS_PROJECT_ID"
      },
      "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
    }
  }
}
