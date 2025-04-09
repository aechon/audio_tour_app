import { Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState, useEffect, useCallback } from "react";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

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

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search audio tours..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  text: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  searchContainer: {
    width: "100%",
    paddingHorizontal: 15,
    paddingTop: 15,
    backgroundColor: "#F5F5F5",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    fontSize: 16,
    color: "#999",
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#FFF",
    borderRadius: 5,
    paddingHorizontal: 35,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  clearButton: {
    position: "absolute",
    right: 10,
    paddingHorizontal: 5,
  },
  clearButtonText: {
    fontSize: 20,
    color: "#999",
  },
});
