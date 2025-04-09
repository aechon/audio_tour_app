import { View, Text, StyleSheet } from "react-native";

export default function NewTour() {
  return (
    <View style={styles.container}>

      {/* Add tour creation form here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
}); 