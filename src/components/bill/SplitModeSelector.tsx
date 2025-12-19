import React, { useState, useRef } from 'react';
import { Modal, Pressable, View, Dimensions, StyleSheet } from 'react-native';
import { Stack, XStack, Text } from 'tamagui';
import { ChevronDown, Check } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';

type SplitMode = 'equal' | 'proportional' | 'custom';

interface DropdownSelectorProps {
  value: SplitMode;
  onChange: (value: SplitMode) => void;
}

export const SplitModeSelector: React.FC<DropdownSelectorProps> = ({ value, onChange }) => {
  const themeColors = useThemeColors();
  const [visible, setVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const buttonRef = useRef<View>(null);

  const handleOpen = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setButtonLayout({ x, y, width, height });
      setVisible(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });
  };

  const handleSelect = (mode: SplitMode) => {
    onChange(mode);
    setVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const options: SplitMode[] = ['equal', 'proportional', 'custom'];

  return (
    <>
      <Pressable 
        ref={buttonRef}
        onPress={handleOpen} 
        style={{ flex: 1, paddingHorizontal: 12 }}
      >
        <Stack
          paddingHorizontal="$3"
          paddingVertical="$2"
          backgroundColor={visible ? themeColors.primary + '20' : themeColors.surfaceElevated} // Highlight when open
          borderRadius={8}
          borderWidth={1}
          borderColor={visible ? themeColors.primary : themeColors.border}
          width="100%"
          height={36}
          justifyContent="center"
        >
          <XStack alignItems="center" width="100%">
            <Text 
                flex={1}
                fontSize={13} 
                color={visible ? themeColors.primary : themeColors.textPrimary} 
                fontWeight="500" 
                textTransform="capitalize"
                textAlign="center"
            >
                {value}
            </Text>
            <ChevronDown size={14} color={visible ? themeColors.primary : themeColors.textSecondary} />
          </XStack>
        </Stack>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={() => setVisible(false)} // Touch outside to close
        >
            {buttonLayout && (
                <View 
                    style={{ 
                        position: 'absolute', 
                        top: buttonLayout.y + buttonLayout.height + 4, 
                        left: buttonLayout.x,
                        width: Math.max(buttonLayout.width, 140), // Min width for dropdown
                    }}
                >
                    <Animated.View 
                        entering={FadeIn.duration(150)} 
                        exiting={FadeOut.duration(100)}
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 12,
                            elevation: 8,
                        }}
                    >
                        <Stack
                            backgroundColor={themeColors.surface}
                            borderRadius={12}
                            borderWidth={1}
                            borderColor={themeColors.border}
                            overflow="hidden"
                            paddingVertical="$1"
                        >
                            {options.map((option) => (
                                <Pressable
                                    key={option}
                                    onPress={() => handleSelect(option)}
                                    style={({ pressed }) => ({
                                        backgroundColor: pressed ? themeColors.surfaceElevated : 'transparent',
                                    })}
                                >
                                    <XStack 
                                        paddingHorizontal="$3" 
                                        paddingVertical="$2" 
                                        alignItems="center" 
                                        justifyContent="space-between"
                                        gap="$2"
                                    >
                                        <Text 
                                            fontSize={14} 
                                            color={themeColors.textPrimary}
                                            textTransform="capitalize"
                                        >
                                            {option}
                                        </Text>
                                        {value === option && (
                                            <Check size={16} color={themeColors.primary} />
                                        )}
                                    </XStack>
                                </Pressable>
                            ))}
                        </Stack>
                    </Animated.View>
                </View>
            )}
        </Pressable>
      </Modal>
    </>
  );
};
