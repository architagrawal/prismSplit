/**
 * PrismSplit Tamagui Configuration
 * 
 * Extends default Tamagui config with custom theme tokens.
 */

import { createTamagui } from 'tamagui';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { themes, tokens } from '@tamagui/config/v3';
import { createMedia } from '@tamagui/react-native-media-driver';

import { colors } from './tokens';

// Create Inter font
const fontFamily = createInterFont();

// Custom tokens extending Tamagui defaults
const customTokens = {
  ...tokens,
  color: {
    ...tokens.color,
    // Add our custom colors
    primary: colors.light.primary,
    primaryDark: colors.light.primaryDark,
    secondary: colors.light.secondary,
    success: colors.light.success,
    successLight: colors.light.successLight,
    error: colors.light.error,
    errorLight: colors.light.errorLight,
    warning: colors.light.warning,
    info: colors.light.info,
    // Avatar colors
    avatarLavender: colors.avatar.lavender,
    avatarSky: colors.avatar.sky,
    avatarSage: colors.avatar.sage,
    avatarPeach: colors.avatar.peach,
    avatarRose: colors.avatar.rose,
    avatarMint: colors.avatar.mint,
  },
  space: {
    ...tokens.space,
    // Custom spacing
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    ...tokens.radius,
    // Custom radii
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};

// Custom theme extending light/dark
const lightTheme = {
  background: colors.light.background,
  backgroundHover: colors.light.surface,
  backgroundPress: colors.light.surfaceElevated,
  backgroundFocus: colors.light.surface,
  
  color: colors.light.textPrimary,
  colorHover: colors.light.textPrimary,
  colorPress: colors.light.textSecondary,
  colorFocus: colors.light.textPrimary,
  
  borderColor: colors.light.border,
  borderColorHover: colors.light.primary,
  borderColorFocus: colors.light.primary,
  
  // Surface colors
  surface: colors.light.surface,
  surfaceElevated: colors.light.surfaceElevated,
  
  // Primary colors
  primary: colors.light.primary,
  primaryDark: colors.light.primaryDark,
  secondary: colors.light.secondary,
  
  // Semantic
  success: colors.light.success,
  successLight: colors.light.successLight,
  successBg: colors.light.successBg,
  error: colors.light.error,
  errorLight: colors.light.errorLight,
  errorBg: colors.light.errorBg,
  warning: colors.light.warning,
  info: colors.light.info,
  
  // Text
  textPrimary: colors.light.textPrimary,
  textSecondary: colors.light.textSecondary,
  textMuted: colors.light.textMuted,
  textInverse: colors.light.textInverse,
};

const darkTheme = {
  background: colors.dark.background,
  backgroundHover: colors.dark.surface,
  backgroundPress: colors.dark.surfaceElevated,
  backgroundFocus: colors.dark.surface,
  
  color: colors.dark.textPrimary,
  colorHover: colors.dark.textPrimary,
  colorPress: colors.dark.textSecondary,
  colorFocus: colors.dark.textPrimary,
  
  borderColor: colors.dark.border,
  borderColorHover: colors.dark.primary,
  borderColorFocus: colors.dark.primary,
  
  // Surface colors
  surface: colors.dark.surface,
  surfaceElevated: colors.dark.surfaceElevated,
  
  // Primary colors
  primary: colors.dark.primary,
  primaryDark: colors.dark.primaryDark,
  secondary: colors.dark.secondary,
  
  // Semantic
  success: colors.dark.success,
  successLight: colors.dark.successLight,
  successBg: colors.dark.successBg,
  error: colors.dark.error,
  errorLight: colors.dark.errorLight,
  errorBg: colors.dark.errorBg,
  warning: colors.dark.warning,
  info: colors.dark.info,
  
  // Text
  textPrimary: colors.dark.textPrimary,
  textSecondary: colors.dark.textSecondary,
  textMuted: colors.dark.textMuted,
  textInverse: colors.dark.textInverse,
};

// Create Tamagui config
const config = createTamagui({
  tokens: customTokens,
  themes: {
    ...themes,
    light: {
      ...themes.light,
      ...lightTheme,
    },
    dark: {
      ...themes.dark,
      ...darkTheme,
    },
  },
  fonts: {
    heading: fontFamily,
    body: fontFamily,
  },
  shorthands,
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  }),
});

export default config;

// For type safety
export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
