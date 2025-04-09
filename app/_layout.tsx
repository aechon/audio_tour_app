import { Stack } from "expo-router";
import { Image, View, Platform, Text, TouchableOpacity } from "react-native";
import { useRouter, Link } from "expo-router";

export default function RootLayout() {
  const router = useRouter();
  
  return (
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
            <Link href="/" asChild>
              <TouchableOpacity 
                style={{ 
                  marginLeft: 15,
                  padding: 8,
                }}
              >
                <Text style={{ fontSize: 24 }}>←</Text>
              </TouchableOpacity>
            </Link>
          ) : undefined,
          headerTitle: () => (
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
    </Stack>
  );
}
