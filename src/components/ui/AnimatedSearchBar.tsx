/**
 * PrismSplit AnimatedSearchBar Component
 * 
 * Reusable expandable search bar with smooth animations.
 * Expands from search icon, collapses on X press.
 */

import { useState, useRef, useEffect } from 'react';
import { Animated, TextInput, Pressable, Keyboard, useWindowDimensions } from 'react-native';
import { XStack } from 'tamagui';
import { Search, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useThemeColors } from '@/hooks/useThemeColors';

interface AnimatedSearchBarProps {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Optional: Control the search query externally */
  value?: string;
  /** Animation duration in ms (default: 250) */
  animationDuration?: number;
  /** Max width when expanded (optional override) */
  expandedWidth?: number;
  /** Size of the search icon (default: 22) */
  iconSize?: number;
}

export function AnimatedSearchBar({
  placeholder = 'Search...',
  onSearchChange,
  value,
  animationDuration = 250,
  expandedWidth,
  iconSize = 22,
}: AnimatedSearchBarProps) {
  const themeColors = useThemeColors();
  const { width: windowWidth } = useWindowDimensions();
  
  // Calculate responsive width if not provided
  // Default to 45% of screen width, max cap at 300 for tablets
  const finalExpandedWidth = expandedWidth ?? Math.min(windowWidth * 0.45, 300);
  
  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value || '');
  const searchInputRef = useRef<TextInput>(null);
  
  // Animation value (0 = closed, 1 = open)
  const searchAnimation = useRef(new Animated.Value(0)).current;
  
  // Sync external value
  useEffect(() => {
    if (value !== undefined) {
      setSearchQuery(value);
    }
  }, [value]);
  
  // Animate search open
  const openSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSearchOpen(true);
    Animated.timing(searchAnimation, {
      toValue: 1,
      duration: animationDuration,
      useNativeDriver: false,
    }).start(() => {
      searchInputRef.current?.focus();
    });
  };
  
  // Animate search close
  const closeSearch = () => {
    // Dismiss keyboard first
    Keyboard.dismiss();
    
    // Hide X button immediately
    setIsClosing(true);
    
    Animated.timing(searchAnimation, {
      toValue: 0,
      duration: animationDuration,
      useNativeDriver: false,
    }).start(() => {
      setIsSearchOpen(false);
      setIsClosing(false);
      setSearchQuery('');
      onSearchChange('');
    });
  };
  
  // Handle query change
  const handleQueryChange = (text: string) => {
    setSearchQuery(text);
    onSearchChange(text);
  };
  
  // Animated width for the search box
  const searchBoxWidth = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, finalExpandedWidth],
  });
  
  // Animated opacity for the input content (hides instantly when closing)
  const inputOpacity = isClosing ? 0 : searchAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });
  
  return (
    <XStack alignItems="center" gap="$2">
      <Pressable onPress={isSearchOpen ? undefined : openSearch}>
        <XStack 
          alignItems="center"
          backgroundColor={isSearchOpen && !isClosing ? themeColors.surface : 'transparent'}
          borderRadius={24}
          borderWidth={1}
          borderColor={isSearchOpen && !isClosing ? themeColors.border : 'transparent'}
          overflow="hidden"
          height={iconSize + 16}
          paddingVertical={8}
          paddingLeft={isSearchOpen && !isClosing ? 12 : 0}
          paddingRight={isSearchOpen && !isClosing ? 8 : 0}
        >
          <Search size={iconSize} color={themeColors.textPrimary} />
          
          <Animated.View style={{ 
            width: searchBoxWidth, 
            overflow: 'hidden',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Animated.View style={{ 
              flex: 1, 
              opacity: inputOpacity,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <TextInput
                ref={searchInputRef}
                placeholder={placeholder}
                placeholderTextColor={themeColors.textMuted}
                value={searchQuery}
                onChangeText={handleQueryChange}
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: themeColors.textPrimary,
                  marginLeft: 8,
                  paddingVertical: 0,
                }}
              />
            </Animated.View>
          </Animated.View>
          
          {isSearchOpen && !isClosing && (
            <Pressable 
              onPress={closeSearch}
              style={{ padding: 4 }}
            >
              <X size={18} color={themeColors.textMuted} />
            </Pressable>
          )}
        </XStack>
      </Pressable>
    </XStack>
  );
}
