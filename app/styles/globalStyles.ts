import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';

export const textInputTheme = {
  colors: {
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    placeholder: colors.placeholder,
    onSurface: colors.onSurface,
  },
  roundness: 8,
};

export const textInputStyles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : Platform.OS === 'ios' ? {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : {}),
  },
});

// Default export required by Next.js/Expo Router
export default function GlobalStyles() {
  return null;
} 