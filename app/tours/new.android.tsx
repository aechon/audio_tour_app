import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../constants/Colors';
import TourDetailsAndroid from '../Components/TourDetailsAndroid';
import { useNavigation } from '@react-navigation/native';

export default function NewTourScreenAndroid() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const navigation = useNavigation();
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const footerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showFooterAndResetTimer = useCallback(() => {
    if (footerTimeoutRef.current) {
      clearTimeout(footerTimeoutRef.current);
      footerTimeoutRef.current = null;
    }
    setIsFooterVisible(true);
    
    if (isPreviewing) {
      footerTimeoutRef.current = setTimeout(() => {
        setIsFooterVisible(false);
      }, 3000);
    }
  }, [isPreviewing]);

  useEffect(() => {
    showFooterAndResetTimer();
    return () => {
      if (footerTimeoutRef.current) {
        clearTimeout(footerTimeoutRef.current);
      }
    };
  }, [isPreviewing, showFooterAndResetTimer]);

  useEffect(() => {
    navigation.setOptions({ 
      title: isPreviewing ? 'Preview' : 'New Audio Tour',
      // headerTitle: undefined,
      // headerLeft: undefined,
      // headerBackTitleVisible: false,
    });
  }, [isPreviewing, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isPreviewing || e.defaultPrevented) {
        return;
      }

      e.preventDefault();

      setIsPreviewing(false);
    });

    return unsubscribe;
  }, [navigation, isPreviewing, setIsPreviewing]);

  const handleFileUpload = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need media library permissions to make this work!');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedVideo = result.assets[0];
        console.log('Selected Filename:', selectedVideo.fileName);
        setUploadedFileName(selectedVideo.fileName || 'Selected Video');
        setVideoUri(selectedVideo.uri);
        console.log('Selected Video URI:', selectedVideo.uri);
      } else {
        console.log('Video picking cancelled or no video selected');
      }
    } catch (err) {
      console.error('Error picking video:', err);
      Alert.alert('Error', 'Could not select video.');
    }
  }, []);

  const handleTogglePreview = () => {
    setIsPreviewing(prev => !prev);
    console.log('Preview toggled (Android):', !isPreviewing);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    console.log('Submit pressed (Android):', { title, description, videoUri });
    setTimeout(() => {
      console.log('Submission complete (simulated Android)');
      setIsSubmitting(false);
    }, 2000);
  };

  const isFormIncomplete = !title || !description || !videoUri;

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={isPreviewing ? styles.scrollContentContainerPreview : styles.scrollContentContainerForm} 
        onScrollBeginDrag={() => { if (isPreviewing) showFooterAndResetTimer(); }}
        onMomentumScrollBegin={() => { if (isPreviewing) showFooterAndResetTimer(); }}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {isPreviewing ? (
          <View style={styles.previewWrapper}>
            <TourDetailsAndroid 
              title={title} 
              description={description} 
              videoUri={videoUri} 
              isPreviewing={true}
            />
          </View>
        ) : (
          <View style={styles.formWrapper}>
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
        )}
      </ScrollView>

      {/* Action Buttons Container - Moved outside ScrollView */}
      {(!isPreviewing || isFooterVisible) && (
        <View style={styles.actionButtonContainer}>
          <Button 
            mode="outlined" 
            onPress={handleTogglePreview} 
            disabled={isFormIncomplete || isSubmitting}
            style={styles.actionButton} 
            textColor={Colors.primary}
          >
            {isPreviewing ? 'Edit' : 'Preview'}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContentContainerForm: { 
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
  scrollContentContainerPreview: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  previewWrapper: {
    flex: 1,
  },
}); 