import { View, Platform, StyleSheet, useWindowDimensions, TouchableOpacity, FlatList, TextInput as RNTextInput } from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import CustomSearchBar from "./Components/CustomSearchBar";
import Colors from "./constants/Colors";
import { Button, Text, IconButton, ActivityIndicator, TextInput as PaperTextInput, Icon } from 'react-native-paper';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useRouter } from "expo-router";

// Get the API key from expo-constants
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// Proxy URL for web development
const PROXY_URL = 'http://localhost:8080/'; // Define the proxy URL

// NOTE: The proxy setup needs to be handled differently for web with this component.
// The library doesn't directly support a simple proxyUrl parameter in the query.
// We might need a custom request function or explore other options if web proxying is strictly required here.

export default function Index() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingFonts, setIsLoadingFonts] = useState(!document?.fonts?.check('1em material-community'));
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationTextValue, setLocationTextValue] = useState("Fetching location...");
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingMyLocation, setIsLoadingMyLocation] = useState(false);
  const placesInputRef = useRef<any>(null); // Add ref for the autocomplete input

  useEffect(() => {
      setIsDesktop(width > 768);
  }, [width]);

  useEffect(() => {
    if (isLoadingFonts) {
      let fontLoaded = false;
      const fontCheckPromise = document?.fonts?.load('1em material-community')
        .then(() => {
          fontLoaded = true;
        })
        .catch((err) => {});

      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));

      Promise.race([fontCheckPromise, timeoutPromise]).finally(() => {
        requestAnimationFrame(() => {
          setIsLoadingFonts(false);
        });
      });
    }
  }, [isLoadingFonts]);

  const fetchAndSetCurrentLocation = useCallback(async (triggeredByUserAction = false) => {
    if (!triggeredByUserAction) {
      if (locationTextValue !== "Fetching location..." && locationTextValue !== "API Key Missing" && locationTextValue !== "Permission Denied" && locationTextValue !== "Location Unavailable") {
        if (isLoadingLocation) setIsLoadingLocation(false);
        return;
      }
      setIsLoadingLocation(true); // Use main loading indicator for initial fetch
    } else {
      setIsLoadingMyLocation(true); // Use button loading indicator for user action
    }
      setLocationErrorMsg(null);

      if (!GOOGLE_MAPS_API_KEY) {
        setLocationErrorMsg('Google API key not configured.');
        setLocationTextValue("API Key Missing");
      if (!triggeredByUserAction) setIsLoadingLocation(false);
      setIsLoadingMyLocation(false);
        return;
      }

    // Check/Request Permissions
    let permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
        permission = await Location.requestForegroundPermissionsAsync();
    }

    if (permission.status !== 'granted') {
        setLocationErrorMsg('Location permission denied.');
        setLocationTextValue("Permission Denied");
      if (!triggeredByUserAction) setIsLoadingLocation(false);
      setIsLoadingMyLocation(false);
        return;
      }

    // Get Location and Geocode
      try {
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const addressComponents = data.results[0].address_components;
          const streetNumber = addressComponents.find((c: any) => c.types.includes('street_number'))?.long_name;
          const streetName = addressComponents.find((c: any) => c.types.includes('route'))?.long_name;
          const city = addressComponents.find((c: any) => c.types.includes('locality'))?.long_name;
          const state = addressComponents.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name;
          const country = addressComponents.find((c: any) => c.types.includes('country'))?.short_name;
          let displayAddress = "";
        if (streetNumber && streetName) { displayAddress += `${streetNumber} ${streetName}, `; }
        else if (streetName) { displayAddress += `${streetName}, `; }
        if (city) { displayAddress += `${city}, `; }
        if (state) { displayAddress += `${state}`; }
        else if (country) { displayAddress += `${country}`; }
        displayAddress = displayAddress.trim().replace(/,$/, '') || data.results[0].formatted_address;
        const finalAddress = displayAddress || "Address not found";
        setLocationTextValue(finalAddress);
        setLocationErrorMsg(null);
        // If triggered by user, update state and exit edit mode
        if(triggeredByUserAction) {
          setIsEditingLocation(false); // Close edit mode
        }
        } else {
          setLocationErrorMsg(`Geocoding failed (${data.status}).`);
          setLocationTextValue("Address Unavailable");
        }
      } catch (error) {
        setLocationErrorMsg('Failed to get location or address.');
        setLocationTextValue("Location Unavailable");
      } finally {
      if (!triggeredByUserAction) setIsLoadingLocation(false);
      setIsLoadingMyLocation(false);
      // Reset autocomplete text if needed after fetching current location
      if (placesInputRef.current) {
          placesInputRef.current.setAddressText(locationTextValue); // Update autocomplete text
      }
    }
  }, [GOOGLE_MAPS_API_KEY, locationTextValue]);

  useEffect(() => {
    fetchAndSetCurrentLocation(false); // false indicates not a user action
  }, [fetchAndSetCurrentLocation]); // Now depends on the stable callback

  useEffect(() => {
    // Initialize Places Autocomplete text only when not editing or when location is first fetched
    if (placesInputRef.current && locationTextValue && !isEditingLocation) {
      placesInputRef.current.setAddressText(locationTextValue);
    }
  }, [locationTextValue, isEditingLocation]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEditLocationPress = useCallback(() => {
    if (!locationErrorMsg && !isLoadingLocation) {
      setIsEditingLocation(true);
    }
  }, [locationErrorMsg, isLoadingLocation]);

  const handleCloseEdit = useCallback(() => {
    setIsEditingLocation(false);
    // Reset autocomplete text to the current confirmed location
    if (placesInputRef.current && locationTextValue) {
        placesInputRef.current.setAddressText(locationTextValue);
    }
  }, [locationTextValue]);

  const handleMyLocationPress = useCallback(() => {
    fetchAndSetCurrentLocation(true);
  }, [fetchAndSetCurrentLocation]);

  const handleNewTourPress = useCallback(() => {
    // Directly replace for web context
    router.replace('/tours/new');
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isLoadingFonts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating={true} color={Colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.searchContainer}>
              <CustomSearchBar
                placeholder="Search for audio tours..."
                onSearch={handleSearch}
                style={styles.searchBar}
                colors={Colors}
              />
              {isDesktop ? (
              <Button
                  testID="new-audio-tour-button-desktop"
                mode="contained"
                onPress={handleNewTourPress}
                style={styles.newButton}
                contentStyle={styles.newButtonContent}
                buttonColor={Colors.primary}
                textColor="#FFFFFF"
                icon="plus"
              >
                New
              </Button>
              ) : (
                <View style={styles.newButtonIconWrapper}>
                  <IconButton
                    testID="new-audio-tour-button-mobile"
                    icon="plus"
                    iconColor="#FFFFFF"
                    size={24}
                    onPress={handleNewTourPress}
                  />
                </View>
              )}
            </View>

            <View style={styles.locationContainer}>
              {isEditingLocation ? (
              <IconButton
                  icon="crosshairs-gps"
                size={20}
                  iconColor={Colors.primary}
                  onPress={handleMyLocationPress}
                style={styles.locationIcon}
                  disabled={isLoadingMyLocation}
                />
              ) : (
                <View style={styles.locationIcon}>
                  <Icon
                    source="map-marker"
                    size={20}
                    color={locationErrorMsg ? Colors.error : Colors.primary}
                  />
                </View>
              )}
              <View style={styles.locationInputWrapper}>
                {isLoadingLocation && !isEditingLocation ? (
                <ActivityIndicator size="small" color={Colors.primary} style={styles.locationLoading} />
              ) : isEditingLocation ? (
                  <GooglePlacesAutocomplete
                    ref={placesInputRef}
                    placeholder={"Search for address or place"}
                    fetchDetails={true}
                    onPress={(data, details = null) => {
                      setLocationTextValue(data.description);
                      setIsEditingLocation(false);
                      setLocationErrorMsg(null);
                    }}
                    query={{
                      key: GOOGLE_MAPS_API_KEY,
                      language: 'en',
                    }}
                    // Use requestUrl for web proxying
                    requestUrl={Platform.OS === 'web' ? {
                      useOnPlatform: 'web', // Specify platform
                      url: `${PROXY_URL}https://maps.googleapis.com/maps/api`,
                    } : undefined} // Use default for native
                    styles={{
                      container: {
                        flex: 1,
                      },
                      textInputContainer: {
                         backgroundColor: 'transparent',
                         borderTopWidth: 0,
                         borderBottomWidth: 0,
                         height: 40,
                         justifyContent: 'center',
                      },
                      textInput: {
                        ...styles.locationInput,
                        marginTop: 0,
                        marginLeft: 0,
                        marginRight: 0,
                        height: 40,
                        paddingVertical: 0,
                        lineHeight: 20,
                      },
                      listView: {
                        backgroundColor: Colors.background,
                        borderColor: Colors.outline, // Use outline color
                        borderWidth: 1,
                        marginTop: 2,
                        position: 'absolute',
                        top: 40,
                        left: 0,
                        right: 0,
                        zIndex: 10,
                      },
                       poweredContainer: {
                         display: 'none',
                       },
                       row: {
                         padding: 10,
                         height: 40,
                         backgroundColor: Colors.background,
                         flexDirection: 'row',
                         alignItems: 'center',
                       },
                       description: {
                         color: Colors.text,
                       },
                       separator: {
                         height: StyleSheet.hairlineWidth,
                         backgroundColor: Colors.outline, // Use outline color
                       },
                    }}
                    textInputProps={{
                       InputComp: PaperTextInput,
                       mode: 'flat',
                       dense: true,
                       underlineColor: 'transparent',
                       activeUnderlineColor: Colors.primary,
                       style: styles.locationInput,
                       autoFocus: true,
                    }}
                    enablePoweredByContainer={false}
                    suppressDefaultStyles
                    keepResultsAfterBlur={false}
                  />
                ) : (
                  <Text
                    style={[styles.locationText, locationErrorMsg ? styles.errorText : {}]}
                    variant="bodyMedium"
                    numberOfLines={1}
                    ellipsizeMode='tail'
                  >
                    {locationTextValue}
                  </Text>
                )}
              </View>
              { !isLoadingLocation && !isEditingLocation && (
                <IconButton
                  icon="pencil"
                  size={20}
                  iconColor={Colors.primary}
                  onPress={handleEditLocationPress}
                  style={[styles.editIcon, { opacity: locationErrorMsg ? 0 : 1 }]}
                  disabled={!!locationErrorMsg}
                />
              )}
              {isEditingLocation && (
                <IconButton
                  icon="close"
                  size={20}
                  iconColor={Colors.textSecondary}
                  onPress={handleCloseEdit}
                  style={styles.closeIcon}
                />
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },
  content: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  searchBar: {
    flex: 1,
    marginRight: 10,
  },
  newButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderRadius: 30,
    marginLeft: 8,
  },
  newButtonContent: {
    paddingVertical: 10,
  },
  newButtonIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    minHeight: 40,
    backgroundColor: Colors.background,
    marginBottom: 20,
    position: 'relative',
  },
  locationIcon: {
    marginRight: 4,
    marginLeft: -8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInputWrapper: {
      flex: 1,
      marginHorizontal: 4,
      justifyContent: 'center',
      minHeight: 40,
  },
  locationText: {
    color: Colors.textSecondary,
    alignSelf: 'stretch',
    lineHeight: 20,
    paddingVertical: 10,
  },
  locationLoading: {
    alignSelf: 'center',
  },
  errorText: {
    color: Colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  editIcon: {
    marginLeft: 4,
    marginRight: -8,
  },
  closeIcon: {
    marginLeft: 4,
    marginRight: -8,
  },
  locationInput: {
    backgroundColor: 'transparent',
    fontSize: 14,
    height: 40,
    lineHeight: 20,
    margin: 0,
    paddingVertical: 0,
    borderWidth: 0,
  },
}); 