import { Stack } from "expo-router";
import { Image, View, Platform, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { TourProvider } from "./context/TourContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const router = useRouter();
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TourProvider>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{
              headerTitle: '[Audio Tours App]',
              headerLeft: () => (
                <View style={{ 
                  marginLeft: Platform.OS === 'android' ? 0 : 15,
                  marginRight: Platform.OS === 'android' ? 10 : 8,
                }}>
                  <Image
                    source={require('../assets/images/logo.png')}
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                  />
                </View>
              ),
              headerStyle: {
                backgroundColor: '#F5F5F5',
                borderBottomWidth: 0,
                ...(Platform.OS === 'android' ? {
                  elevation: 2,
                } : {
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }),
              },
            }}
          />
          <Stack.Screen 
            name="new_tour" 
            options={{
              headerBackVisible: true,
              headerLeft: Platform.OS === 'web' ? () => (
                <TouchableOpacity 
                  style={{ 
                    marginLeft: 15,
                    padding: 8,
                  }}
                  onPress={() => router.replace('/')}
                >
                  <Text style={{ fontSize: 24 }}>←</Text>
                </TouchableOpacity>
              ) : undefined,
              headerTitle: Platform.OS === 'android' ? 'Create New Tour' : () => (
                <View style={{ 
                  marginLeft: Platform.OS === 'android' ? -15 : 0,
                  flex: 1,
                  justifyContent: 'center',
                }}>
                  <Text style={{ 
                    fontSize: 18,
                    fontWeight: '600',
                  }}>
                    Create New Tour
                  </Text>
                </View>
              ),
              headerStyle: {
                backgroundColor: '#F5F5F5',
                borderBottomWidth: 0,
                ...(Platform.OS === 'android' ? {
                  elevation: 2,
                } : {
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }),
              },
            }}
          />
          <Stack.Screen 
            name="new_tour_preview" 
            options={{
              headerBackVisible: true,
              headerLeft: Platform.OS === 'web' ? () => (
                <TouchableOpacity 
                  style={{ 
                    marginLeft: 15,
                    padding: 8,
                  }}
                  onPress={() => router.replace('/new_tour')}
                >
                  <Text style={{ fontSize: 24 }}>←</Text>
                </TouchableOpacity>
              ) : undefined,
              headerTitle: Platform.OS === 'android' ? 'Tour Preview' : () => (
                <View style={{ 
                  marginLeft: Platform.OS === 'android' ? -15 : 0,
                  flex: 1,
                  justifyContent: 'center',
                }}>
                  <Text style={{ 
                    fontSize: 18,
                    fontWeight: '600',
                  }}>
                    Tour Preview
                  </Text>
                </View>
              ),
              headerStyle: {
                backgroundColor: '#F5F5F5',
                borderBottomWidth: 0,
                ...(Platform.OS === 'android' ? {
                  elevation: 2,
                } : {
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }),
              },
            }}
          />
        </Stack>
      </TourProvider>
    </GestureHandlerRootView>
  );
}
