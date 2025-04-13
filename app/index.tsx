import { Text, View, StyleSheet, TouchableOpacity, Platform, Pressable, Keyboard } from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import * as Location from "expo-location";
import { Link } from "expo-router";
import Constants from 'expo-constants';
import { GOOGLE_MAPS_API_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Searchbar, IconButton, Modal, Portal, TextInput, Button } from 'react-native-paper';
import { textInputTheme, textInputStyles } from './styles/globalStyles';
import { colors } from './styles/colors';

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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedLocation, setEditedLocation] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const addressInputRef = useRef<any>(null);

  const handleClear = () => {
    setSearchQuery("");
  };

  // Add web-specific style injection
  useEffect(() => {
    if (Platform.OS === 'web') {
      const updateStyles = () => {
        const styleId = 'searchbar-clear-button-styles';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = styleId;
          document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
          [data-testid="search-bar-icon-wrapper"] {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          [data-testid="search-bar-clear-icon-container"]${!searchQuery ? ', [aria-label="clear"]' : ''} {
            display: ${searchQuery ? 'flex' : 'none'};
            pointer-events: ${searchQuery ? 'auto' : 'none'};
            opacity: ${searchQuery ? '1' : '0'};
            position: relative;
            align-items: center;
            justify-content: center;
            padding: 8px;
          }
          [data-testid="search-bar-clear-icon-container"] button {
            padding: 8px;
            margin: 0;
          }
          [data-testid="search-bar-clear-icon-container"]:hover${!searchQuery ? ', [aria-label="clear"]:hover' : ''},
          [data-testid="search-bar-clear-icon-container"]:active${!searchQuery ? ', [aria-label="clear"]:active' : ''} {
            display: ${searchQuery ? 'flex' : 'none'};
            pointer-events: ${searchQuery ? 'auto' : 'none'};
            opacity: ${searchQuery ? '1' : '0'};
          }
        `;
      };

      // Initial setup
      updateStyles();

      // Update styles when searchQuery changes
      const observer = new MutationObserver(updateStyles);
      observer.observe(document.body, { childList: true, subtree: true });

      // Add ESC key handler
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && searchQuery && isSearchFocused) {
          handleClear();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        const styleElement = document.getElementById('searchbar-clear-button-styles');
        if (styleElement) {
          document.head.removeChild(styleElement);
        }
        observer.disconnect();
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [searchQuery, handleClear, isSearchFocused]);

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

  const handleEditLocation = () => {
    setEditedLocation("");
    setIsEditModalVisible(true);
  };

  const handleSaveLocation = async () => {
    if (editedLocation.trim()) {
      setLocation(editedLocation);
      try {
        await AsyncStorage.setItem('lastKnownLocation', editedLocation);
      } catch (error) {
        console.log('Error saving location:', error);
      }
    }
    setIsEditModalVisible(false);
  };

  // Add effect to handle focus and selection when modal opens
  useEffect(() => {
    if (isEditModalVisible && addressInputRef.current) {
      // Use setTimeout to ensure the modal is fully rendered
      setTimeout(() => {
        addressInputRef.current?.focus();
      }, 100);
    }
  }, [isEditModalVisible]);

  const handlePressOutside = () => {
    if (Platform.OS !== 'web') {
      Keyboard.dismiss();
    }
  };

  return Platform.OS === 'web' ? (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchRow}>
            <View style={[styles.inputWrapper, isSearchFocused && styles.inputWrapperFocused]}>
              <Searchbar
                placeholder="Search audio tours..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={[styles.searchInput, isSearchFocused && styles.searchInputFocused]}
                iconColor={colors.primary}
                placeholderTextColor={colors.gray.placeholder}
                inputStyle={styles.searchInputText}
                onClearIconPress={searchQuery ? handleClear : undefined}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                theme={{
                  colors: {
                    primary: colors.primary,
                    background: colors.surface,
                    surface: colors.surface,
                    accent: colors.primary,
                    text: colors.text,
                    placeholder: colors.gray.placeholder,
                    disabled: colors.gray.disabled,
                  },
                  roundness: 12,
                }}
                onKeyPress={(e) => {
                  if (Platform.OS === 'web' && e.nativeEvent.key === 'Escape' && searchQuery) {
                    handleClear();
                  }
                }}
              />
            </View>
            <Link href="/new_tour" asChild>
              <IconButton
                icon="plus"
                size={24}
                iconColor={colors.white}
                style={styles.newTourButton}
                containerColor={colors.primary}
              />
            </Link>
          </View>
          <View style={styles.locationContainer}>
            <IconButton
              icon="map-marker"
              size={16}
              iconColor={colors.primary}
              style={styles.locationIcon}
            />
            <Text 
              style={styles.locationText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {location}
            </Text>
            <IconButton
              icon="pencil"
              size={16}
              iconColor={colors.primary}
              style={styles.editIcon}
              onPress={handleEditLocation}
            />
          </View>
        </View>

        <Portal>
          <Modal
            visible={isEditModalVisible}
            onDismiss={() => setIsEditModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Edit Location</Text>
            <TextInput
              ref={addressInputRef}
              mode="outlined"
              value={editedLocation}
              onChangeText={setEditedLocation}
              style={[textInputStyles.base, styles.modalInput]}
              autoFocus
              theme={textInputTheme}
              outlineColor="transparent"
              activeOutlineColor={colors.primary}
            />
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalButton}
                textColor={colors.primary}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveLocation}
                style={styles.modalButton}
                buttonColor={colors.primary}
                textColor={colors.white}
              >
                Save
              </Button>
            </View>
          </Modal>
        </Portal>
      </View>
    </View>
  ) : (
    <Pressable onPress={handlePressOutside} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchRow}>
            <View style={[styles.inputWrapper, isSearchFocused && styles.inputWrapperFocused]}>
              <Searchbar
                placeholder="Search audio tours..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={[styles.searchInput, isSearchFocused && styles.searchInputFocused]}
                iconColor={colors.primary}
                placeholderTextColor={colors.gray.placeholder}
                inputStyle={styles.searchInputText}
                onClearIconPress={searchQuery ? handleClear : undefined}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                theme={{
                  colors: {
                    primary: colors.primary,
                    background: colors.surface,
                    surface: colors.surface,
                    accent: colors.primary,
                    text: colors.text,
                    placeholder: colors.gray.placeholder,
                    disabled: colors.gray.disabled,
                  },
                  roundness: 12,
                }}
                onKeyPress={(e) => {
                  if (Platform.OS === 'web' && e.nativeEvent.key === 'Escape' && searchQuery) {
                    handleClear();
                  }
                }}
              />
            </View>
            <Link href="/new_tour" asChild>
              <IconButton
                icon="plus"
                size={24}
                iconColor={colors.white}
                style={styles.newTourButton}
                containerColor={colors.primary}
              />
            </Link>
          </View>
          <View style={styles.locationContainer}>
            <IconButton
              icon="map-marker"
              size={16}
              iconColor={colors.primary}
              style={styles.locationIcon}
            />
            <Text 
              style={styles.locationText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {location}
            </Text>
            <IconButton
              icon="pencil"
              size={16}
              iconColor={colors.primary}
              style={styles.editIcon}
              onPress={handleEditLocation}
            />
          </View>
        </View>

        <Portal>
          <Modal
            visible={isEditModalVisible}
            onDismiss={() => setIsEditModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Edit Location</Text>
            <TextInput
              ref={addressInputRef}
              mode="outlined"
              value={editedLocation}
              onChangeText={setEditedLocation}
              style={[textInputStyles.base, styles.modalInput]}
              autoFocus
              theme={textInputTheme}
              outlineColor="transparent"
              activeOutlineColor={colors.primary}
            />
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalButton}
                textColor={colors.primary}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveLocation}
                style={styles.modalButton}
                buttonColor={colors.primary}
                textColor={colors.white}
              >
                Save
              </Button>
            </View>
          </Modal>
        </Portal>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  searchContainer: {
    width: "100%",
    paddingHorizontal: 15,
    paddingTop: 15,
    backgroundColor: colors.background,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  inputWrapper: {
    flex: 1,
    marginRight: 10,
    ...(Platform.OS === 'android' ? {
      backgroundColor: colors.surface,
      borderRadius: 32,
      elevation: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      borderWidth: 2,
      borderColor: 'transparent',
      margin: -3,
    } : {}),
  },
  inputWrapperFocused: {
    ...(Platform.OS === 'android' ? {
      borderColor: colors.primary,
    } : {}),
  },
  searchInput: {
    backgroundColor: Platform.OS === 'android' ? "transparent" : colors.surface,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      borderWidth: 2,
      borderColor: 'transparent',
      margin: -3,
    } : Platform.OS === 'ios' ? {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 2,
      borderColor: 'transparent',
      margin: -3,
    } : {}),
  },
  searchInputFocused: {
    ...(Platform.OS === 'web' ? {
      borderColor: colors.primary,
    } : Platform.OS === 'ios' ? {
      borderColor: colors.primary,
    } : {}),
  },
  searchInputText: {
    color: colors.text,
    fontSize: 16,
  },
  newTourButton: {
    margin: 0,
    padding: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    elevation: 2,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  locationIcon: {
    margin: 0,
    padding: 0,
    marginRight: 4,
  },
  editIcon: {
    margin: 0,
    padding: 0,
    marginLeft: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
  },
  modalInput: {
    marginBottom: 12,
    fontSize: 14,
    height: 36,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    minWidth: 80,
  },
});
