import { View, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import CustomSearchBar from "./Components/CustomSearchBar";
import Colors from "./constants/Colors";
import { IconButton, Text, ActivityIndicator, TextInput, Icon } from 'react-native-paper';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useRouter } from 'expo-router';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function Index() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationTextValue, setLocationTextValue] = useState("Fetching location...");
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isLoadingMyLocation, setIsLoadingMyLocation] = useState(false);
  const placesInputRef = useRef<any>(null);

  const fetchAndSetCurrentLocation = useCallback(async (triggeredByUserAction = false) => {
    if (!triggeredByUserAction) {
      if (locationTextValue !== "Fetching location..." && locationTextValue !== "API Key Missing" && locationTextValue !== "Permission Denied" && locationTextValue !== "Address Unavailable") {
        if (isLoadingLocation) setIsLoadingLocation(false);
        return;
      }
      setIsLoadingLocation(true);
    } else {
      setIsLoadingMyLocation(true);
    }
    setLocationErrorMsg(null);

    if (!GOOGLE_MAPS_API_KEY) {
      setLocationErrorMsg('Google API key not configured.');
      setLocationTextValue("API Key Missing");
      if (!triggeredByUserAction) setIsLoadingLocation(false);
      setIsLoadingMyLocation(false);
      return;
    }

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

    try {
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;

      let addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });

      let finalAddress = "Address Unavailable";
      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        const streetAddress = addr.streetNumber ? `${addr.streetNumber} ${addr.street}` : addr.street;
        const displayAddress = [
            streetAddress,
            addr.city,
            addr.region,
          ]
          .filter(Boolean)
          .join(', ');
        finalAddress = displayAddress || "Address not found";
      } else {
        setLocationErrorMsg('Could not determine address.');
      }

      setLocationTextValue(finalAddress);
      setLocationErrorMsg(null);

      if (placesInputRef.current) {
        placesInputRef.current.setAddressText(finalAddress);
      }

      if (triggeredByUserAction) {
        setIsEditingLocation(false);
      }

    } catch (error) {
      setLocationErrorMsg('Failed to get location or address.');
      setLocationTextValue("Location Unavailable");
    } finally {
      if (!triggeredByUserAction) setIsLoadingLocation(false);
      setIsLoadingMyLocation(false);
    }
  }, [GOOGLE_MAPS_API_KEY]);

  useEffect(() => {
    fetchAndSetCurrentLocation(false);
  }, [fetchAndSetCurrentLocation]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEditLocationPress = useCallback(() => {
    if (!locationErrorMsg && !isLoadingLocation && !isEditingLocation) {
      setIsEditingLocation(true);
    }
  }, [locationErrorMsg, isLoadingLocation, isEditingLocation]);

  const handleCloseEdit = useCallback(() => {
    setIsEditingLocation(false);
    if (placesInputRef.current && locationTextValue) {
        placesInputRef.current.setAddressText(locationTextValue);
    }
  }, [locationTextValue]);

  const handleMyLocationPress = useCallback(() => {
      fetchAndSetCurrentLocation(true);
  }, [fetchAndSetCurrentLocation]);

  const handleNewTourPress = () => {
    router.push('/tours/new');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <CustomSearchBar
              placeholder="Search for audio tours..."
              onSearch={handleSearch}
              style={styles.searchBar}
              colors={Colors}
            />
            <IconButton
              icon="plus"
              iconColor={Colors.primary}
              size={28}
              onPress={handleNewTourPress}
              style={styles.newButtonIcon}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
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

              {isLoadingLocation && !isEditingLocation ? (
                 <ActivityIndicator size="small" color={Colors.primary} style={styles.locationLoading} />
              ) : isEditingLocation ? (
                 isLoadingMyLocation ? (
                    <ActivityIndicator size="small" color={Colors.primary} style={styles.locationInputLoading} />
                 ) : (
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
                        styles={{
                          container: { flex: 1, marginHorizontal: 4 },
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
                              borderColor: Colors.outline,
                              borderWidth: 1,
                              marginTop: 2,
                              position: 'absolute',
                              top: 40,
                              left: 0,
                              right: 0,
                              zIndex: 10,
                          },
                          poweredContainer: { display: 'none' },
                          row: {
                              padding: 10,
                              height: 40,
                              backgroundColor: Colors.background,
                              flexDirection: 'row',
                              alignItems: 'center',
                          },
                          description: { color: Colors.text },
                          separator: {
                              height: StyleSheet.hairlineWidth,
                              backgroundColor: Colors.outline,
                          },
                        }}
                        textInputProps={{
                          InputComp: TextInput,
                          mode: 'flat',
                          dense: true,
                          underlineColor: 'transparent',
                          activeUnderlineColor: Colors.primary,
                          autoFocus: true,
                        }}
                        enablePoweredByContainer={false}
                        suppressDefaultStyles
                        keepResultsAfterBlur={false}
                      />
                 )
              ) : (
                 <Text
                  style={[styles.locationText, locationErrorMsg ? styles.errorText : {}]}
                  variant="bodyMedium"
                  numberOfLines={1}
                  ellipsizeMode='tail'
                  onPress={handleEditLocationPress}
                 >
                  {locationTextValue}
                 </Text>
              )}

              {!isLoadingLocation && !isEditingLocation && (
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
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    width: "100%",
    alignSelf: "center",
    marginTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  newButtonIcon: {
    margin: 0,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    minHeight: 40,
    backgroundColor: Colors.background,
    position: 'relative',
    zIndex: 1,
  },
  locationIcon: {
    marginRight: 4,
    marginLeft: -8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    color: Colors.textSecondary,
    marginHorizontal: 4,
    alignSelf: 'center',
    lineHeight: 20,
    paddingVertical: 10,
  },
  locationLoading: {
    flex: 1,
    marginHorizontal: 4,
  },
  errorText: {
    color: Colors.error,
  },
  locationInput: {
    flex: 1,
    marginHorizontal: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    fontSize: 14,
    height: 40,
    borderWidth: 0,
    margin: 0,
    paddingVertical: 0,
    lineHeight: 20,
  },
  editIcon: {
    marginLeft: 4,
    marginRight: -8,
  },
  closeIcon: {
    marginLeft: 4,
    marginRight: -8,
  },
  locationInputLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    marginHorizontal: 4,
  },
});
