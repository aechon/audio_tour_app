import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker'; // Import expo-image-picker
import { useNavigation } from '@react-navigation/native'; 
import Colors from '../constants/Colors';

export default function NewTourScreenIOS() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null); // Add state for the URI
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state
  const navigation = useNavigation(); // Get navigation object

  // File upload handler for iOS using expo-image-picker
  const handleFileUpload = useCallback(async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image library to pick only videos
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false, // Typically false for video uploads
        quality: 1, // Use 1 for original quality
        // You might want `videoExportPreset` on iOS if specific format needed, but often defaults are fine
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedVideo = result.assets[0];
        
        // Log the filename provided by the picker
        console.log('Selected Filename:', selectedVideo.fileName);

        setUploadedFileName(selectedVideo.fileName || 'Selected Video'); // Use filename or a default
        setVideoUri(selectedVideo.uri);
        // TODO: Implement the actual upload logic using the selectedVideo.uri
        console.log('Selected Video URI:', selectedVideo.uri);
      } else {
        console.log('Video picking cancelled or no video selected');
        // Optionally reset state if user cancels after selecting a file previously
        // setUploadedFileName(null);
        // setVideoUri(null);
      }
    } catch (err) {
      console.error('Error picking video:', err);
      Alert.alert('Error', 'Could not select video.');
    }
  }, []);

  // Toggle Preview handler - Navigates to tours/preview
  const handleTogglePreview = () => {
    // @ts-ignore - Keeping until navigator types updated
    navigation.navigate('tours/preview', { 
      title,
      description,
      videoUri 
    }); 
  };

  // Placeholder Submit handler
  const handleSubmit = () => {
    setIsSubmitting(true);
    console.log('Submit pressed (iOS):', { title, description, videoUri });
    // Simulate network request
    setTimeout(() => {
      console.log('Submission complete (simulated iOS)');
      setIsSubmitting(false);
    }, 2000); 
  };

  // Determine if form is incomplete (basic check)
  const isFormIncomplete = !title || !description || !videoUri;

  return (
    <View style={styles.container}>
      {/* Wrap content in ScrollView for bottom padding */}
      <ScrollView 
        contentContainerStyle={styles.scrollContentContainer}
        scrollEventThrottle={16} // Optional: Adjust if needed for scroll performance
      >
        {/* Always show the form */}
        <View style={styles.formWrapper}>
          {/* Form Inputs */}
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={[styles.input, styles.titleInput]}
            theme={{ colors: { primary: Colors.primary } }}
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={[styles.input, styles.descriptionInput]}
            theme={{ colors: { primary: Colors.primary } }}
          />
          <Button
            mode={uploadedFileName ? "contained" : "outlined"}
            onPress={handleFileUpload}
            style={[styles.uploadButton, uploadedFileName ? styles.uploadButtonFilled : styles.uploadButtonDotted]}
            labelStyle={styles.uploadButtonLabel}
            icon={uploadedFileName ? "" : "cloud-upload-outline"}
            buttonColor={uploadedFileName ? Colors.primaryLight : 'transparent'}
            textColor={uploadedFileName ? Colors.background : Colors.primary}
          >
            {uploadedFileName ? uploadedFileName : "Upload Video (.mp4)"}
          </Button>
        </View>
      </ScrollView>

      {/* Action Buttons Container - Always visible */} 
      <View style={styles.actionButtonContainer}>
        <Button 
          mode="outlined" 
          onPress={handleTogglePreview} // This now navigates
          disabled={isFormIncomplete || isSubmitting} // Disable if incomplete or submitting
          style={styles.actionButton} 
          textColor={Colors.primary}
        >
          Preview 
        </Button>
        {isSubmitting ? (
          <ActivityIndicator animating={true} color={Colors.primary} style={styles.actionButton} />
        ) : (
          <Button 
            mode="contained" 
            onPress={handleSubmit} 
            disabled={isFormIncomplete} 
            style={styles.actionButton} 
            buttonColor={Colors.primary} 
            textColor={Colors.background}
          >
            Submit
          </Button>
        )}
      </View>

    </View>
  );
}

// Reuse the same styles as Android/Web, adjust if needed for specific iOS look
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    // Remove padding, apply to ScrollView content instead
    // padding: 16, 
    // alignItems: 'stretch', // Not needed on main container
  },
  scrollContentContainer: { // Style for ScrollView content
    // padding: 16, // Removed general padding
    paddingBottom: 100, // Keep padding to push content above footer
  },
  formWrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    marginTop: 16, // Add margin from top/header
    paddingHorizontal: 16, // Added padding for form only
    paddingTop: 16, // Added padding for form only
  },
  input: {
    marginBottom: 16,
    backgroundColor: Colors.surface,
  },
  titleInput: {
     fontSize: 18,
  },
  descriptionInput: {
     fontSize: 14,
     minHeight: 100,
     textAlignVertical: 'top',
  },
  uploadButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 4,
    height: 50,
    justifyContent: 'center',
  },
  uploadButtonDotted: {
    borderStyle: 'dashed',
    borderColor: Colors.primary,
  },
  uploadButtonFilled: {
     borderColor: Colors.primaryLight,
  },
  uploadButtonLabel: {
    fontSize: 14,
  },
  actionButtonContainer: {
    // marginTop: 24, // Removed marginTop
    flexDirection: 'row',
    justifyContent: 'space-around',
    // paddingHorizontal: 16, // Keep horizontal padding
    paddingVertical: 16, // Add vertical padding
    paddingBottom: 32, // Extra padding for home indicator/safe area
    position: 'absolute', // Make it float
    bottom: 0, // Stick to bottom
    left: 0, // Stretch full width
    right: 0, // Stretch full width
    backgroundColor: Colors.background, // Give it a background
    borderTopWidth: StyleSheet.hairlineWidth, // Add a subtle top border
    borderTopColor: Colors.outline, // Use theme color for border
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8, // Add space between buttons
  },
  header: {
    marginBottom: 16,
  },
}); 