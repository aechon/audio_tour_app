import { View, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams, usePathname } from "expo-router";
import { useTour } from "./context/TourContext";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export default function NewTourPreview() {
  const { tour: webTour } = useTour();
  const router = useRouter();
  const params = useLocalSearchParams();
  const pathname = usePathname();
  const mobileTitle = params.title as string;
  const mobileDescription = params.description as string;
  const [isMounted, setIsMounted] = useState(false);

  // Determine which title and description to use based on platform
  const title = Platform.OS === 'web' ? webTour.title : mobileTitle;
  const description = Platform.OS === 'web' ? webTour.description : mobileDescription;

  // Set mounted state after initial render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect to index if no context available or context is empty on web
  useEffect(() => {
    if (Platform.OS === 'web' && isMounted) {
      const isInTourFlow = pathname === '/new_tour' || pathname === '/new_tour_preview';
      if (!isInTourFlow || !webTour.title.trim()) {
        router.replace('/');
      }
    }
  }, [pathname, webTour.title, isMounted]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || "Untitled Tour"}</Text>
      <View style={styles.descriptionContainer}>
        <Text style={[styles.description, !description && styles.italicText]}>
          {description || "No description provided"}
        </Text>
      </View>
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
  descriptionContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  italicText: {
    fontStyle: "italic",
  },
}); 