import { View, StyleSheet, Platform } from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import { Searchbar } from 'react-native-paper';

interface CustomSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  debounceTime?: number;
  colors?: {
    primary: string;
    surface: string;
    text: string;
    placeholder: string;
    disabled: string;
    background: string;
    shadow: string;
  };
  roundness?: number;
  style?: any;
}

const defaultColors = {
  primary: '#6200EE',
  surface: '#FFFFFF',
  text: '#000000',
  placeholder: '#757575',
  disabled: '#BDBDBD',
  background: '#F6F6F6',
  shadow: '#000000',
};

export default function CustomSearchBar({
  placeholder = "Search...",
  onSearch,
  debounceTime = 500,
  colors = defaultColors,
  roundness = 12,
  style,
}: CustomSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleClear = () => {
    setSearchQuery("");
  };

  // Web-specific style handling
  useEffect(() => {
    if (Platform.OS === 'web') {
      const updateStyles = () => {
        const styleId = 'searchbar-clear-button-styles';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = styleId;
          document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
          [data-testid="search-bar-icon-wrapper"] {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          [data-testid="search-bar-clear-icon-container"]${!searchQuery ? ', [aria-label="clear"]' : ''} {
            display: ${searchQuery ? 'flex' : 'none'};
            pointer-events: ${searchQuery ? 'auto' : 'none'};
            opacity: ${searchQuery ? '1' : '0'};
            position: relative;
            align-items: center;
            justify-content: center;
            padding: 8px;
          }
          [data-testid="search-bar-clear-icon-container"] button {
            padding: 8px;
            margin: 0;
          }
          [data-testid="search-bar-clear-icon-container"]:hover${!searchQuery ? ', [aria-label="clear"]:hover' : ''},
          [data-testid="search-bar-clear-icon-container"]:active${!searchQuery ? ', [aria-label="clear"]:active' : ''} {
            display: ${searchQuery ? 'flex' : 'none'};
            pointer-events: ${searchQuery ? 'auto' : 'none'};
            opacity: ${searchQuery ? '1' : '0'};
          }
        `;
      };

      // Initial setup
      updateStyles();

      // Update styles when searchQuery changes
      const observer = new MutationObserver(updateStyles);
      observer.observe(document.body, { childList: true, subtree: true });

      // Add ESC key handler
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && searchQuery && isSearchFocused) {
          handleClear();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        const styleElement = document.getElementById('searchbar-clear-button-styles');
        if (styleElement) {
          document.head.removeChild(styleElement);
        }
        observer.disconnect();
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [searchQuery, handleClear, isSearchFocused]);

  // Debounce search query
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceTime);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery, debounceTime]);

  // Handler for when the debounced value changes
  useEffect(() => {
    if (debouncedQuery && onSearch) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <View style={[styles.searchContainer, style]}>
      <View style={styles.searchRow}>
        <View style={[
          styles.inputWrapper,
          isSearchFocused && Platform.OS === 'android' && { borderColor: colors.primary }
        ]}>
          <Searchbar
            placeholder={placeholder}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[
              styles.searchInput,
              isSearchFocused && (Platform.OS === 'web' || Platform.OS === 'ios') && { borderColor: colors.primary }
            ]}
            iconColor={colors.primary}
            placeholderTextColor={colors.placeholder}
            inputStyle={styles.searchInputText}
            onClearIconPress={searchQuery ? handleClear : undefined}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            theme={{
              colors: {
                primary: colors.primary,
                background: colors.surface,
                surface: colors.surface,
                accent: colors.primary,
                text: colors.text,
                placeholder: colors.placeholder,
                disabled: colors.disabled,
              },
              roundness,
            }}
            onKeyPress={(e) => {
              if (Platform.OS === 'web' && e.nativeEvent.key === 'Escape' && searchQuery) {
                handleClear();
              }
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    width: "100%",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    ...(Platform.OS === 'android' ? {
      backgroundColor: defaultColors.surface,
      borderRadius: 32,
      elevation: 2,
      shadowColor: defaultColors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      borderWidth: 2,
      borderColor: 'transparent',
      margin: -3,
    } : {}),
  },
  inputWrapperFocused: {
    ...(Platform.OS === 'android' ? {
      // borderColor removed - applied dynamically above
    } : {}),
  },
  searchInput: {
    backgroundColor: Platform.OS === 'android' ? "transparent" : defaultColors.surface,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      borderWidth: 2,
      borderColor: 'transparent',
      margin: -3,
    } : Platform.OS === 'ios' ? {
      shadowColor: defaultColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 2,
      borderColor: 'transparent',
      margin: -3,
    } : {}),
  },
  searchInputFocused: {
    ...(Platform.OS === 'web' ? {
      // borderColor removed - applied dynamically above
    } : Platform.OS === 'ios' ? {
      // borderColor removed - applied dynamically above
    } : {}),
  },
  searchInputText: {
    color: defaultColors.text,
    fontSize: 16,
  },
}); 