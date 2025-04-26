import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { useNavigation } from 'expo-router';
import Colors from '../constants/Colors';

// Define a lighter primary color if not already in Colors.ts
// Example: const primaryLight = '#aaccff'; // Adjust this hex code
const primaryColor = Colors.primary; // e.g., '#007bff'
// Basic way to generate a lighter shade (adjust logic as needed)
const primaryLight = `${primaryColor}B3`; // Add alpha transparency (e.g., 70% opaque)

export default function CustomBackButton() {
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      style={({ pressed }) => [
        styles.button,
        // Add conditional styles here if needed, e.g., different background on press
      ]}
      hitSlop={10} // Increase touch area slightly
    >
      {({ pressed }) => (
        <Icon
          source="arrow-left"
          color={pressed ? primaryLight : primaryColor}
          size={24}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8, // Add some padding for touch area and spacing
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 