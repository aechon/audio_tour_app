import { Stack, useRouter } from "expo-router";
import { Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import Colors from "./constants/Colors";

// Placeholder Logo Component - Replace with your actual logo
const LogoTitle = () => {
  const router = useRouter();

  const handleLogoPress = () => {
    // Directly replace for web context
    router.replace('/');
  };

  return (
    <TouchableOpacity onPress={handleLogoPress} style={styles.logoContainer}>
      <Image
        style={styles.logo} // Use styles
        source={require('../assets/images/logo.png')} // Use the correct local logo file path
      />
      <Text style={styles.titleText}>Audio Walk</Text>
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index" // Assuming your main screen is index.tsx
        options={{
          // Always show header on web
          headerShown: true,
          // Always use custom title component on web
          headerTitle: () => <LogoTitle />,
          // Apply web header styles
          headerStyle: styles.webHeader,
          // Align the logo to the left
          headerTitleAlign: 'left',
        }}
      />
      <Stack.Screen
        name="tours/new" // Route for the new tour page
        options={{
          headerShown: true,
          headerTitle: () => <LogoTitle />,
          headerStyle: styles.webHeader,
          headerTitleAlign: 'left',
          headerBackVisible: false, // Keep this just in case
          headerLeft: () => null, // Explicitly remove the left component (back button)
        }}
      />
      {/* Add other Stack.Screen configurations here if needed */}
    </Stack>
  );
}

const styles = StyleSheet.create({
  logoContainer: { // Style for the container view
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: { // Style for the logo image
    width: 30,
    height: 30,
    marginRight: 10, // Add some space between logo and title
  },
  titleText: { // Style for the title text
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  webHeader: {
    // Add any specific web header styles here
    backgroundColor: Colors.headerBackground,
  },
}); 