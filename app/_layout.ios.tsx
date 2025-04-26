import 'react-native-get-random-values'; // Import the polyfill
import { Stack } from "expo-router"; // Removed useNavigation
import CustomBackButton from './Components/CustomBackButton'; // Import the new component
// Import the new PreviewScreenIOS component
// import PreviewScreenIOS from './Components/PreviewScreenIOS';

export default function RootLayout() {
  return (
    <Stack
      // Reset any stack-wide screenOptions if they were interfering
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          // Ensure no lingering back title options here
        }}
      />
      <Stack.Screen
        name="tours/new"
        options={{ // No need for function wrapper if component handles navigation
          title: "New Audio Tour",
          headerLeft: () => <CustomBackButton />, // Use the component here
        }}
      />
      {/* Add the new screen for Preview on iOS using file-based routing */}
      <Stack.Screen
        name="tours/preview" // Matches the file path app/tours/preview.ios.tsx
        // NO component prop needed - Expo Router finds it by file path
        options={{
          title: "Preview", // Header title set here (overrides component if set)
          headerLeft: () => <CustomBackButton />, // Use the same custom back button
        }}
      />
    </Stack>
  );
}
