import { Text, View, StyleSheet, TextInput, TouchableOpacity, Platform } from "react-native";
import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import { Link } from "expo-router";
import Constants from 'expo-constants';
import { GOOGLE_MAPS_API_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodingResult {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type: string;
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  place_id: string;
  types: string[];
}

interface GeocodingResponse {
  results: GeocodingResult[];
  status: string;
}

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [location, setLocation] = useState<string>("Getting location...");
  const [status, requestPermission] = Location.useForegroundPermissions();

  // Load saved location on initial render
  useEffect(() => {
    const loadSavedLocation = async () => {
      try {
        const savedLocation = await AsyncStorage.getItem('lastKnownLocation');
        if (savedLocation) {
          setLocation(savedLocation);
        }
      } catch (error) {
        console.log('Error loading saved location:', error);
      }
    };
    loadSavedLocation();
  }, []);

  // Get user's location
  useEffect(() => {
    const getLocation = async () => {
      try {
        if (!status) {
          return;
        }

        if (!status.granted) {
          const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
          
          if (newStatus === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            
            if (Platform.OS === 'web') {
              if (__DEV__) {
                const formattedLocation = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
                await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
                setLocation(formattedLocation);
              } else {
                try {
                  const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`
                  );
                  const data = await response.json();

                  if (data.results && data.results[0]) {
                    const addressComponents = data.results[0].address_components;
                    const city = addressComponents.find((component: AddressComponent) => 
                      component.types.includes('locality')
                    )?.long_name;
                    const state = addressComponents.find((component: AddressComponent) => 
                      component.types.includes('administrative_area_level_1')
                    )?.long_name;
                    const country = addressComponents.find((component: AddressComponent) => 
                      component.types.includes('country')
                    )?.long_name;

                    const formattedLocation = `${city || ''}${city && state ? ', ' : ''}${state || ''}${(city || state) && country ? ', ' : ''}${country || ''}`;
                    await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
                    setLocation(formattedLocation);
                  } else {
                    const formattedLocation = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
                    await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
                    setLocation(formattedLocation);
                  }
                } catch (error) {
                  const formattedLocation = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
                  await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
                  setLocation(formattedLocation);
                }
              }
            } else {
              try {
                const address = await Location.reverseGeocodeAsync({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                });

                if (address[0]) {
                  const { city, region, country } = address[0];
                  const formattedLocation = `${city || ''}${city && region ? ', ' : ''}${region || ''}${(city || region) && country ? ', ' : ''}${country || ''}`;
                  await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
                  setLocation(formattedLocation);
                } else {
                  const formattedLocation = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
                  await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
                  setLocation(formattedLocation);
                }
              } catch (geocodeError) {
                const formattedLocation = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
                await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
                setLocation(formattedLocation);
              }
            }
          } else {
            setLocation("Location permission denied");
          }
        } else {
          const location = await Location.getCurrentPositionAsync({});
          
          if (Platform.OS === 'web') {
            if (__DEV__) {
              const formattedLocation = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
              await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
              setLocation(formattedLocation);
            } else {
              try {
                const response = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`
                );
                const data = await response.json();

                if (data.results && data.results[0]) {
                  const addressComponents = data.results[0].address_components;
                  const city = addressComponents.find((component: AddressComponent) => 
                    component.types.includes('locality')
                  )?.long_name;
                  const state = addressComponents.find((component: AddressComponent) => 
                    component.types.includes('administrative_area_level_1')
                  )?.long_name;
                  const country = addressComponents.find((component: AddressComponent) => 
                    component.types.includes('country')
                  )?.long_name;

                  const formattedLocation = `${city || ''}${city && state ? ', ' : ''}${state || ''}${(city || state) && country ? ', ' : ''}${country || ''}`;
                  await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
                  setLocation(formattedLocation);
                } else {
                  const formattedLocation = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
                  await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
                  setLocation(formattedLocation);
                }
              } catch (error) {
                const formattedLocation = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
                await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
                setLocation(formattedLocation);
              }
            }
          } else {
            try {
              const address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              });

              if (address[0]) {
                const { city, region, country } = address[0];
                const formattedLocation = `${city || ''}${city && region ? ', ' : ''}${region || ''}${(city || region) && country ? ', ' : ''}${country || ''}`;
                await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
                setLocation(formattedLocation);
              } else {
                const formattedLocation = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
                await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
                setLocation(formattedLocation);
              }
            } catch (geocodeError) {
              const formattedLocation = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
              await AsyncStorage.setItem('lastKnownLocation', formattedLocation);
              setLocation(formattedLocation);
            }
          }
        }
      } catch (error) {
        setLocation("Unable to get location");
      }
    };

    getLocation();
  }, [status]);

  // Debounce search query
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  // Handler for when the debounced value changes
  useEffect(() => {
    if (debouncedQuery) {
      handleSearch();
    }
  }, [debouncedQuery]);

  const handleSearch = useCallback(() => {
    console.log("Searching for:", debouncedQuery);
    // Implement search functionality here
  }, [debouncedQuery]);

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.inputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search audio tours..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          <Link href="/new_tour" asChild>
            <TouchableOpacity style={styles.newTourButton}>
              <Text style={styles.newTourButtonText}>+</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Location:</Text>
          <Text 
            style={styles.locationText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {location}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  text: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  searchContainer: {
    width: "100%",
    paddingHorizontal: 15,
    paddingTop: 15,
    backgroundColor: "#F5F5F5",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    fontSize: 16,
    color: "#999",
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#FFF",
    borderRadius: 5,
    paddingHorizontal: 35,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  clearButton: {
    position: "absolute",
    right: 10,
    paddingHorizontal: 5,
  },
  clearButtonText: {
    fontSize: 20,
    color: "#999",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  locationLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    paddingLeft: 1,
  },
  locationText: {
    fontSize: 14,
    color: "#999",
    marginLeft: 5,
    flex: 1,
    paddingRight: 1,
  },
  newTourButton: {
    width: 38,
    height: 38,
    backgroundColor: "#007AFF",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  newTourButtonText: {
    fontSize: 22,
    color: "#FFFFFF",
    lineHeight: 22,
  },
});
