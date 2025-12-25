/**
 * Auth Layout
 * 
 * Stack layout for authentication screens.
 * Includes reverse guard - redirects authenticated users to main app.
 */

import { Stack, Redirect } from 'expo-router';

import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/lib/store';

export default function AuthLayout() {
  const themeColors = useThemeColors();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  
  // Wait for persisted state to load before making redirect decisions
  if (!_hasHydrated) {
    return null; // Show nothing while loading persisted state
  }
  
  // Reverse auth guard - if already logged in, go to main app
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  
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
