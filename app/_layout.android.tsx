import 'react-native-get-random-values'; // Import the polyfill
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // Hide header on Android index
        }}
      />
      <Stack.Screen
        name="tours/new"
        options={{
          // By default, headerShown is true, so the header will show
          // You can customize header options here if needed
          title: "New Audio Tour", // Example title
        }}
      />
    </Stack>
  );
} 