/**
 * Auth Layout
 * 
 * Stack layout for authentication screens.
 */

import { Stack } from 'expo-router';

import { useThemeColors } from '@/hooks/useThemeColors';

export default function AuthLayout() {
  const themeColors = useThemeColors();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: themeColors.background,
        },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
