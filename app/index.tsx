import { Text, View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import { Link } from "expo-router";
import Constants from 'expo-constants';
import { GOOGLE_MAPS_API_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Searchbar } from 'react-native-paper';

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
              try {
                const response = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`
                );
                const data = await response.json();

                if (data.results && data.results[0]) {
                  const addressComponents = data.results[0].address_components;
                  const street = addressComponents.find((component: AddressComponent) => 
                    component.types.includes('route')
                  )?.long_name;
                  const streetNumber = addressComponents.find((component: AddressComponent) => 
                    component.types.includes('street_number')
                  )?.long_name;
                  const city = addressComponents.find((component: AddressComponent) => 
                    component.types.includes('locality')
                  )?.long_name;
                  const state = addressComponents.find((component: AddressComponent) => 
                    component.types.includes('administrative_area_level_1')
                  )?.long_name;

                  const streetAddress = streetNumber && street ? `${streetNumber} ${street}` : street || '';
                  const formattedLocation = `${streetAddress}${streetAddress && city ? ', ' : ''}${city || ''}${(streetAddress || city) && state ? ', ' : ''}${state || ''}`;
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
            } else {
              try {
                const address = await Location.reverseGeocodeAsync({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                });

                if (address[0]) {
                  const { street, city, region } = address[0];
                  const formattedLocation = `${street || ''}${street && city ? ', ' : ''}${city || ''}${(street || city) && region ? ', ' : ''}${region || ''}`;
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
            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`
              );
              const data = await response.json();

              if (data.results && data.results[0]) {
                const addressComponents = data.results[0].address_components;
                const street = addressComponents.find((component: AddressComponent) => 
                  component.types.includes('route')
                )?.long_name;
                const streetNumber = addressComponents.find((component: AddressComponent) => 
                  component.types.includes('street_number')
                )?.long_name;
                const city = addressComponents.find((component: AddressComponent) => 
                  component.types.includes('locality')
                )?.long_name;
                const state = addressComponents.find((component: AddressComponent) => 
                  component.types.includes('administrative_area_level_1')
                )?.long_name;

                const streetAddress = streetNumber && street ? `${streetNumber} ${street}` : street || '';
                const formattedLocation = `${streetAddress}${streetAddress && city ? ', ' : ''}${city || ''}${(streetAddress || city) && state ? ', ' : ''}${state || ''}`;
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
          } else {
            try {
              const address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              });

              if (address[0]) {
                const { street, city, region } = address[0];
                const formattedLocation = `${street || ''}${street && city ? ', ' : ''}${city || ''}${(street || city) && region ? ', ' : ''}${region || ''}`;
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
            <Searchbar
              placeholder="Search audio tours..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchInput}
              iconColor="#999"
              placeholderTextColor="#999"
              inputStyle={styles.searchInputText}
              onClearIconPress={handleClear}
            />
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
    marginBottom: 10,
  },
  inputWrapper: {
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInputText: {
    color: "#000",
    fontSize: 16,
  },
  newTourButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newTourButtonText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  locationLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 5,
  },
  locationText: {
    fontSize: 14,
    color: "#000",
    flex: 1,
  },
});
