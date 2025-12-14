/**
 * PrismSplit Screen Layout Component
 * 
 * Consistent screen wrapper with safe areas and background.
 * Uses react-native-safe-area-context for proper edge-to-edge support.
 */

import { Stack, ScrollView, Text } from 'tamagui';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/useThemeColors';

interface ScreenProps {
  children: React.ReactNode;
  /** Scroll content */
  scroll?: boolean;
  /** Add horizontal padding */
  padded?: boolean;
  /** Avoid keyboard */
  keyboardAvoiding?: boolean;
  /** Background color override */
  backgroundColor?: string;
  /** Include bottom safe area (set false for screens with tab bar) */
  safeBottom?: boolean;
  /** Include top safe area */
  safeTop?: boolean;
}

export function Screen({
  children,
  scroll = false,
  padded = true,
  keyboardAvoiding = false,
  backgroundColor,
  safeBottom = true,
  safeTop = true,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  
  const bgColor = backgroundColor ?? themeColors.background;

  const content = (
    <Stack
      flex={1}
      paddingHorizontal={padded ? '$4' : 0}
    >
      {children}
    </Stack>
  );

  const scrollContent = scroll ? (
    <ScrollView 
      flex={1} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {content}
    </ScrollView>
  ) : content;

  const keyboardContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
    >
      {scrollContent}
    </KeyboardAvoidingView>
  ) : scrollContent;

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: bgColor,
          paddingTop: safeTop ? insets.top : 0,
          paddingBottom: safeBottom ? insets.bottom : 0,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }
      ]}
    >
      {keyboardContent}
    </View>
  );
}

/**
 * Screen header component
 */
interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
}: ScreenHeaderProps) {
  const themeColors = useThemeColors();
  
  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingVertical="$3"
      paddingHorizontal="$4"
    >
      <Stack width={44}>
        {leftAction}
      </Stack>
      
      <Stack flex={1} alignItems="center">
        <Stack alignItems="center">
          <Text
            fontSize={18}
            fontWeight="600"
            color={themeColors.textPrimary}
            textAlign="center"
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              fontSize={14}
              color={themeColors.textSecondary}
              textAlign="center"
            >
              {subtitle}
            </Text>
          )}
        </Stack>
      </Stack>
      
      <Stack width={44} alignItems="flex-end">
        {rightAction}
      </Stack>
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
});

