import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
// Import useNavigation for header options and goBack
import { useNavigation } from '@react-navigation/native';
// Import useLocalSearchParams from expo-router to get parameters
import { useLocalSearchParams, useRouter } from 'expo-router';
import TourDetailsiOS from '../Components/TourDetailsiOS'; // Corrected path
import Colors from '../constants/Colors'; // Corrected path
import { Button, ActivityIndicator } from 'react-native-paper';

// No specific route prop type needed when using useLocalSearchParams

export default function TourPreviewScreenIOS() {
  const navigation = useNavigation();
  const router = useRouter(); // Get router for potential navigation after submit
  // Get params using useLocalSearchParams
  const params = useLocalSearchParams<{ title: string; description: string; videoUri?: string }>();
  const { title, description, videoUri } = params; // videoUri might be undefined if not passed

  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state
  const footerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to show footer and reset the hide timer
  const showFooterAndResetTimer = useCallback(() => {
    if (footerTimeoutRef.current) {
      clearTimeout(footerTimeoutRef.current);
      footerTimeoutRef.current = null;
    }
    setIsFooterVisible(true);
    footerTimeoutRef.current = setTimeout(() => {
      setIsFooterVisible(false);
    }, 3000);
  }, []);

  // Initial timer setup and cleanup
  useEffect(() => {
    showFooterAndResetTimer();
    return () => {
      if (footerTimeoutRef.current) {
        clearTimeout(footerTimeoutRef.current);
      }
    };
  }, [showFooterAndResetTimer]);

  // Set header title using navigation.setOptions
  useEffect(() => {
    navigation.setOptions({ title: 'Preview' });
  }, [navigation]);

  // Placeholder Submit handler (copied from new.ios.tsx)
  const handleSubmit = () => {
    setIsSubmitting(true);
    console.log('Submit pressed from Preview (iOS):', { title, description, videoUri });
    // Simulate network request
    setTimeout(() => {
      console.log('Submission complete (simulated from Preview iOS)');
      setIsSubmitting(false);
      // TODO: Navigate somewhere after successful submission (e.g., back to index)
      // Example: router.replace('/'); // Replace current stack
      Alert.alert('Success', 'Tour Submitted (Simulated)');
      // Maybe go back two screens? Or replace stack?
      if (navigation.canGoBack()) navigation.goBack(); // Go back to form first
      if (navigation.canGoBack()) navigation.goBack(); // Then back to index? Depends on desired flow

    }, 2000); 
  };

  // Determine if form is incomplete (basic check) - copied from new.ios.tsx
  const isFormIncomplete = !title || !description || !videoUri;

  // Handle scroll to reset footer timer
  const handleScroll = () => {
    showFooterAndResetTimer();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        onScrollBeginDrag={handleScroll}
        onMomentumScrollBegin={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Render TourDetailsiOS using route params */}
        <TourDetailsiOS
          title={title ?? ''} // Provide fallback for potential undefined
          description={description ?? ''} // Provide fallback
          videoUri={videoUri ?? null} // Provide fallback
          isPreviewing={true}
        />
      </ScrollView>

      {/* Floating Action Button - Only Edit/Back needed */}
      {isFooterVisible && (
        <View style={styles.actionButtonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()} // Simple goBack takes user to the form
            style={styles.actionButton}
            textColor={Colors.primary}
          >
            Edit
          </Button>
          {/* Add Submit button logic */} 
          {isSubmitting ? (
            <ActivityIndicator animating={true} color={Colors.primary} style={styles.actionButton} />
          ) : (
            <Button 
              mode="contained" 
              onPress={handleSubmit} 
              disabled={isFormIncomplete} // Disable if required fields missing
              style={styles.actionButton} 
              buttonColor={Colors.primary} 
              textColor={Colors.background}
            >
              Submit
            </Button>
          )}
        </View>
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContentContainer: {
    paddingBottom: 100,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingBottom: 32,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.outline,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  previewWrapper: { // Kept just in case TourDetailsiOS needs it
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'stretch',
  },
}); 