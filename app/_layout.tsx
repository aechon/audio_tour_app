import { Stack } from "expo-router";
import { Image, View, Platform } from "react-native";

export default function RootLayout() {
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
    </Stack>
  );
}
