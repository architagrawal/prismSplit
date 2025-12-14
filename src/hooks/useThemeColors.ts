/**
 * PrismSplit Theme Hook
 * 
 * Returns theme-aware colors based on uiStore.theme setting.
 */

import { useColorScheme } from 'react-native';
import { useUIStore } from '@/lib/store';
import { colors } from '@/theme/tokens';

export type ThemeColors = typeof colors.light;

/**
 * Hook to get the current theme's colors
 * Respects uiStore.theme setting (light/dark/system)
 */
export function useThemeColors(): ThemeColors {
  const { theme } = useUIStore();
  const systemScheme = useColorScheme();
  
  const resolvedTheme = theme === 'system' 
    ? (systemScheme ?? 'light') 
    : theme;
  
  return colors[resolvedTheme];
}

/**
 * Hook to get the resolved theme name
 */
export function useResolvedTheme(): 'light' | 'dark' {
  const { theme } = useUIStore();
  const systemScheme = useColorScheme();
  
  return theme === 'system' 
    ? (systemScheme ?? 'light') 
    : theme;
}

/**
 * Hook to check if dark mode is active
 */
export function useIsDarkMode(): boolean {
  return useResolvedTheme() === 'dark';
}
