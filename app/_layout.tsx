import { Stack } from "expo-router";
import { Image, View } from "react-native";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          headerTitle: '',
          headerLeft: () => (
            <View style={{ marginLeft: 15 }}>
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
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      />
    </Stack>
  );
}
