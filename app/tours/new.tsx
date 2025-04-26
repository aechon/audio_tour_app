import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import Colors from '../constants/Colors'; // Assuming Colors is in a constants folder relative to app
import TourDetailsWeb from '../Components/TourDetailsWeb'; // Assuming TourDetailsWeb is the default export

// Define styles before the component
const styles = StyleSheet.create({
  container: {
    flex: 1, // Keep flex: 1 to fill screen
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    padding: 16, // Apply padding to the scrollable content
    paddingTop: 32,
    paddingBottom: 16, // Standard bottom padding
    alignItems: 'stretch', // Maintain alignment for content
  },
  header: {
    marginBottom: 24,
    textAlign: 'left', // Left-align the header text
    color: Colors.primaryDark,
  },
  desktopPreviewHeader: {
    marginBottom: 8, // Reduced margin to compensate for TourDetails top margin
    textAlign: 'left',
    color: Colors.primaryDark,
    paddingLeft: 16, // Align with TourDetails content padding
  },
  formWrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  previewWrapper: { // Base style for mobile preview
    width: '100%',
    alignSelf: 'center',
  },
  desktopPreviewWrapper: { // Style for desktop preview to match TourDetails container
    width: '100%',
    maxWidth: 1200, // Match TourDetails maxWidth
    alignSelf: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: Colors.surface, // Ensure background for outlined input
  },
  titleInput: {
     fontSize: 18, // Larger font size for title
  },
  descriptionInput: {
     fontSize: 14, // Standard font size for description
     minHeight: 100, // Ensure enough height for multiline
     textAlignVertical: 'top', // Align text to top for multiline
  },
  uploadButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 4, // Standard border radius
    height: 50, // Standard button height
    justifyContent: 'center',
  },
  uploadButtonDotted: {
    borderStyle: 'dashed',
    borderColor: Colors.primary,
  },
  uploadButtonFilled: {
     borderColor: Colors.primaryLight, // Match border to background or remove if desired
  },
  uploadButtonLabel: {
    fontSize: 14,
  },
  // Styles for bottom buttons (no longer fixed)
  bottomButtonContainer: {
    marginTop: 24, // Add space above the buttons
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    maxWidth: 600, // Match the form width
    alignSelf: 'center', // Center the buttons
  },
  bottomButton: {
    marginHorizontal: 8,
    minWidth: 120,
  },
});

export default function NewTourScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false); // State for preview toggle
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission loading
  const scrollViewRef = useRef<ScrollView>(null); // Create a ref for the ScrollView
  const { width } = useWindowDimensions(); // Get screen width
  const isDesktop = width >= 768; // Common breakpoint for tablet/desktop

  const handleFileUpload = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/mp4', // Limit to MP4 files
        copyToCacheDirectory: false, // Optional: Set to true if you need to access the file later from cache
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadedFile(result.assets[0]);
      } else {
        // Handle cancellation or no file selected if needed
        // console.log('File picking cancelled or failed');
      }
    } catch (err) {
      console.error('Error picking document:', err);
      // Handle errors, e.g., show a message to the user
    }
  }, []);

  const handleTogglePreview = () => {
    // Scroll to top *before* toggling state might feel smoother
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    setIsPreviewing(prev => !prev);
    console.log('Preview toggled:', !isPreviewing);
  };

  const handleSubmit = () => {
    // Placeholder for submit logic
    setIsSubmitting(true); // Start loading
    console.log('Submit pressed:', { title, description, fileName: uploadedFile?.name });
    // TODO: Implement actual async submission
    // Simulate network request
    setTimeout(() => {
      console.log('Submission complete (simulated)');
      setIsSubmitting(false); // Stop loading after completion/error
    }, 2000); // Simulate 2 seconds loading time
  };

  // Determine if the form is incomplete
  const isFormIncomplete = !title || !description || !uploadedFile;

  // Dynamically choose the wrapper style for preview mode
  const previewContainerStyle = isDesktop ? styles.desktopPreviewWrapper : styles.previewWrapper;
  // Dynamically choose the header style for preview mode
  const previewHeaderStyle = isDesktop ? styles.desktopPreviewHeader : styles.header;

  return (
    <View style={styles.container}>
      {/* Assign the ref to the ScrollView */}
      <ScrollView 
        ref={scrollViewRef} 
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Conditional Rendering: Form or Preview */}
        {isPreviewing ? (
          // Apply the dynamic wrapper style
          <View style={previewContainerStyle}>
            {/* Apply the dynamic header style */}
            <Text variant="headlineMedium" style={previewHeaderStyle}>
              Preview
            </Text>
            <TourDetailsWeb 
              title={title} 
              description={description} 
              videoUri={uploadedFile?.uri ?? null}
            />
          </View>
        ) : (
          // Render Form Inputs with original width limits
          <View style={styles.formWrapper}>
            <Text variant="headlineMedium" style={styles.header}>
              Add New Audio Tour
            </Text>
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
              mode={uploadedFile ? "contained" : "outlined"} 
              onPress={handleFileUpload} 
              style={[styles.uploadButton, uploadedFile ? styles.uploadButtonFilled : styles.uploadButtonDotted]} 
              labelStyle={styles.uploadButtonLabel} 
              icon={uploadedFile ? "" : "cloud-upload-outline"} 
              buttonColor={uploadedFile ? Colors.primaryLight : 'transparent'} 
              textColor={uploadedFile ? Colors.background : Colors.primary}
            >
              {uploadedFile ? uploadedFile.name : "Upload Video (.mp4)"}
            </Button>
          </View>
        )}

        {/* Bottom Buttons */}
        <View style={styles.bottomButtonContainer}>
          <Button 
            mode="outlined" 
            onPress={handleTogglePreview} 
            disabled={isFormIncomplete || isSubmitting} // Disable while submitting
            style={styles.bottomButton} 
            textColor={Colors.primary}
          >
            {isPreviewing ? 'Edit' : 'Preview'}
          </Button>
          {isSubmitting ? (
            <ActivityIndicator animating={true} color={Colors.primary} style={styles.bottomButton} />
          ) : (
            <Button 
              mode="contained" 
              onPress={handleSubmit} 
              disabled={isFormIncomplete} 
              style={styles.bottomButton} 
              buttonColor={Colors.primary} 
              textColor={Colors.background}
            >
              Submit
            </Button>
          )}
        </View>

      </ScrollView>{/* End of ScrollView */}

    </View>// End of main container
  );
} 