import { View, Text, StyleSheet, Platform, TextInput, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams, usePathname } from "expo-router";
import { useTour } from "./context/TourContext";
import { useState, useEffect } from "react";
import { Link } from "expo-router";
import { useNavigation } from "expo-router";
import { RectButton } from "react-native-gesture-handler";

const PLACEHOLDER_TITLE = "Enter tour title...";

export default function NewTour() {
  // Use local state for mobile, context for web
  const [mobileTour, setMobileTour] = useState({ title: "" });
  const { tour: webTour, setTour: setWebTour, clearTour } = useTour();
  const router = useRouter();
  const params = useLocalSearchParams();
  const pathname = usePathname();
  const navigation = useNavigation();

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
        title: tour.title 
      }
    });
  };

  // Set up header options
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        Platform.OS === 'web' ? (
          <Link href="/new_tour_preview" asChild>
            <TouchableOpacity 
              style={{ 
                marginRight: 15,
                padding: 8,
                backgroundColor: '#007AFF',
                borderRadius: 8,
              }}
            >
              <Text style={{ 
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
              }}>
                Preview
              </Text>
            </TouchableOpacity>
          </Link>
        ) : Platform.OS === 'android' ? (
          <RectButton 
            onPress={handlePreview}
            style={{ 
              marginRight: 15,
              padding: 8,
              backgroundColor: '#007AFF',
              borderRadius: 8,
            }}
          >
            <Text style={{ 
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
            }}>
              Preview
            </Text>
          </RectButton>
        ) : (
          <TouchableOpacity 
            onPress={handlePreview}
            style={{ 
              marginRight: 15,
              padding: 8,
              backgroundColor: '#007AFF',
              borderRadius: 8,
            }}
          >
            <Text style={{ 
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
            }}>
              Preview
            </Text>
          </TouchableOpacity>
        )
      ),
    });
  }, [navigation, tour.title]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        placeholder={PLACEHOLDER_TITLE}
        placeholderTextColor="#999"
        value={tour.title}
        onChangeText={(text) => setTour({ ...tour, title: text })}
      />
      {/* Tour creation form will go here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 15,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 20,
  },
}); 