import { View, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams, usePathname } from "expo-router";
import { useTour } from "./context/TourContext";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function NewTourPreview() {
  const { tour: webTour } = useTour();
  const router = useRouter();
  const params = useLocalSearchParams();
  const pathname = usePathname();
  const mobileTitle = params.title as string;

  // Determine which title to use based on platform
  const title = Platform.OS === 'web' ? webTour.title : mobileTitle;

  // Redirect to new_tour if no title available (web only)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const isInTourFlow = pathname === '/new_tour' || pathname === '/new_tour_preview';
      if (!isInTourFlow) {
        router.replace('/new_tour');
      }
    }
  }, [pathname]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || "Untitled Tour"}</Text>
      {/* Additional preview content will mirror the new_tour form layout */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginBottom: 20,
  },
}); 