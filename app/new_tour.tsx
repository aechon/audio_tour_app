import { View, StyleSheet, Platform, Animated, ViewStyle, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams, usePathname } from "expo-router";
import { useTour } from "./context/TourContext";
import { useState, useEffect, useRef } from "react";
import { Link } from "expo-router";
import { useNavigation } from "expo-router";
import { TextInput, Button, IconButton, Text, ActivityIndicator } from "react-native-paper";
import { colors } from "./styles/colors";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const PLACEHOLDER_TITLE = "Enter tour title...";
const PLACEHOLDER_DESCRIPTION = "Enter tour description...";

const CustomButton = ({ 
  onPress, 
  title, 
  disabled = false,
  style,
  textStyle 
}: { 
  onPress?: () => void; 
  title: string; 
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}) => {
  const buttonStyle = [
    styles.customButton,
    disabled && styles.customButtonDisabled,
    style
  ];

  const textStyles = [
    styles.customButtonText,
    disabled && styles.customButtonTextDisabled,
    textStyle
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={buttonStyle}
      activeOpacity={0.7}
    >
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function NewTour() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const uploadController = useRef<AbortController | null>(null);
  // Use local state for mobile, context for web
  const [mobileTour, setMobileTour] = useState({ title: "", description: "", videoUri: "", videoFileName: "" });
  const { tour: webTour, setTour: setWebTour, clearTour } = useTour();
  const router = useRouter();
  const params = useLocalSearchParams();
  const pathname = usePathname();
  const navigation = useNavigation();
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Determine which state to use based on platform
  const tour = Platform.OS === 'web' ? webTour : mobileTour;
  const setTour = Platform.OS === 'web' ? setWebTour : setMobileTour;

  // Handle state persistence based on platform
  useEffect(() => {
    if (Platform.OS === 'web') {
      // On web, only clear if navigating away from tour flow
      const isInTourFlow = pathname === '/new_tour' || pathname === '/new_tour_preview';
      if (!isInTourFlow) {
        clearTour();
      }
    }
  }, [pathname]);

  useEffect(() => {
    // Simulate loading time for context/state initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handlePreview = () => {
    if (Platform.OS === 'web') {
      // State is managed by context, no need for URL params
      return;
    }
    // For mobile, we need to pass the data through URL params
    router.push({
      pathname: "/new_tour_preview",
      params: { 
        fromPreview: "true",
        title: tour.title,
        description: tour.description,
        videoUri: tour.videoUri
      }
    });
  };

  const isTitleEmpty = !tour.title.trim();

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isTitleEmpty ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isTitleEmpty]);

  // Set up header options
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Animated.View style={{ opacity: opacityAnim }}>
          {Platform.OS === 'web' ? (
            isTitleEmpty ? (
              <CustomButton
                title="Preview"
                disabled={true}
              />
            ) : (
              <Link href="/new_tour_preview" asChild>
                <View>
                  <CustomButton
                    title="Preview"
                  />
                </View>
              </Link>
            )
          ) : (
            <CustomButton
              title="Preview"
              onPress={handlePreview}
              disabled={isTitleEmpty}
            />
          )}
        </Animated.View>
      ),
    });
  }, [navigation, tour.title, isTitleEmpty, opacityAnim]);

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/mp4',
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      if (file.mimeType !== 'video/mp4') {
        alert('Please select an MP4 video file');
        return;
      }

      setIsUploading(true);
      console.log('Video uploaded:', file.name);
      
      // Create new AbortController for this upload
      uploadController.current = new AbortController();
      
      try {
        // Set the tour state immediately after file selection
        setTour({ ...tour, videoUri: file.uri, videoFileName: file.name });
      } catch (err) {
        if (err instanceof Error && err.message === 'Upload cancelled') {
          console.log('Upload cancelled by user');
        } else {
          throw err;
        }
      } finally {
        setIsUploading(false);
        uploadController.current = null;
      }
    } catch (err) {
      console.error('Error picking video:', err);
      if (err instanceof Error && err.message !== 'Upload cancelled') {
        alert('Error picking video file');
      }
      setIsUploading(false);
      uploadController.current = null;
    }
  };

  const removeVideo = () => {
    if (isUploading && uploadController.current) {
      // Cancel the current upload
      uploadController.current.abort();
      return;
    }
    
    console.log('Video removed:', tour.videoFileName);
    setTour({ ...tour, videoUri: '', videoFileName: '' });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="Tour Title"
        placeholder={PLACEHOLDER_TITLE}
        value={tour.title}
        onChangeText={(text) => setTour({ ...tour, title: text })}
        style={[
          styles.titleInput, 
          { 
            backgroundColor: colors.inputBackground,
          }
        ]}
        textColor={colors.text}
        theme={{
          colors: {
            primary: colors.primary,
            background: colors.inputBackground,
            surface: colors.inputBackground,
            text: colors.text,
            placeholder: colors.placeholder,
            disabled: colors.disabled,
          },
          roundness: 8,
        }}
      />
      <TextInput
        mode="outlined"
        label="Tour Description"
        placeholder={PLACEHOLDER_DESCRIPTION}
        value={tour.description}
        onChangeText={(text) => setTour({ ...tour, description: text })}
        multiline
        numberOfLines={4}
        style={[
          styles.descriptionInput, 
          { 
            backgroundColor: colors.inputBackground,
          }
        ]}
        textColor={colors.text}
        theme={{
          colors: {
            primary: colors.primary,
            background: colors.inputBackground,
            surface: colors.inputBackground,
            text: colors.text,
            placeholder: colors.placeholder,
            disabled: colors.disabled,
          },
          roundness: 8,
        }}
      />
      <View style={styles.videoSection}>
        <Button
          mode="contained"
          onPress={pickVideo}
          style={styles.videoButton}
          icon="video"
          contentStyle={styles.videoButtonContent}
          disabled={isUploading}
        >
          {tour.videoUri ? 'Replace Video' : 'Upload Video'}
        </Button>
        <View style={[styles.videoInfoContainer, !tour.videoUri && !isUploading && styles.hidden]}>
          <IconButton
            icon="close"
            size={12}
            onPress={removeVideo}
            style={styles.removeButton}
            iconColor={colors.surface}
            containerColor={colors.primary}
          />
          {isUploading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.uploadIndicator} />
          ) : (
            <Text 
              style={styles.videoFileNameText} 
              variant="bodySmall"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {tour.videoFileName}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 15,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
  },
  descriptionInput: {
    fontSize: 16,
    minHeight: 120,
  },
  customButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginRight: 15,
  },
  customButtonDisabled: {
    backgroundColor: colors.disabled,
    elevation: 0,
    shadowOpacity: 0,
  },
  customButtonText: {
    color: colors.inputBackground,
    fontSize: 14,
    fontWeight: '500',
  },
  customButtonTextDisabled: {
    color: colors.placeholder,
  },
  videoSection: {
    marginTop: 20,
  },
  videoButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  videoButtonContent: {
    height: 48,
    paddingHorizontal: 16,
  },
  videoInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    width: '100%',
  },
  videoFileNameText: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 13,
  },
  removeButton: {
    margin: 0,
    padding: 0,
    width: 18,
    height: 18,
    marginRight: 8,
  },
  hidden: {
    display: 'none',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  uploadIndicator: {
    marginLeft: 8,
  },
}); 