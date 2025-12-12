/**
 * PrismSplit Color Tokens
 * 
 * Pastel palette for light and dark modes.
 * Primary: Lavender, Secondary: Peach
 */

export const colors = {
  // Light Mode (Default)
  light: {
    // Backgrounds
    background: '#FEFDFB',      // Warm cream
    surface: '#FFFBF5',         // Cards
    surfaceElevated: '#F5F3FF', // Modals (lavender tint)
    
    // Primary
    primary: '#A78BFA',         // Lavender
    primaryDark: '#8B5CF6',     // Darker lavender
    primaryLight: '#DDD6FE',    // Lighter lavender
    accent: '#E9D5FF',          // Very light lavender
    secondary: '#FDBA74',       // Peach
    secondaryDark: '#F59E0B',   // Darker peach
    secondaryLight: '#FED7AA',  // Lighter peach
    tertiary: '#6EE7B7',        // Mint
    tertiaryLight: '#A7F3D0',   // Lighter mint
    
    // Semantic
    success: '#059669',         // Sage (text)
    successLight: '#86EFAC',    // Sage (icons)
    successBg: '#D1FAE5',       // Mint bg
    error: '#F87171',           // Coral
    errorLight: '#FDA4AF',      // Rose
    errorBg: '#FEE2E2',         // Pink bg
    warning: '#D97706',         // Amber
    warningBg: '#FEF3C7',       // Light amber
    info: '#7DD3FC',            // Sky blue
    infoBg: '#E0F2FE',          // Light sky
    
    // Text
    textPrimary: '#1C1917',     // Charcoal
    textSecondary: '#78716C',   // Warm gray
    textMuted: '#A8A29E',       // Light gray
    textInverse: '#FFFFFF',     // White on dark
    
    // Border
    border: '#E5E5E5',
    borderLight: '#F3F4F6',
    borderFocus: '#A78BFA',     // Lavender
  },
  
  // Dark Mode (Alternative)
  dark: {
    // Backgrounds
    background: '#09090B',      // Near black
    surface: '#18181B',         // Dark surface
    surfaceElevated: '#27272A', // Elevated
    
    // Primary
    primary: '#A78BFA',
    primaryDark: '#8B5CF6',
    secondary: '#FDBA74',
    secondaryDark: '#F59E0B',
    
    // Semantic
    success: '#10B981',
    successLight: '#34D399',
    successBg: '#064E3B',
    error: '#F87171',
    errorLight: '#FDA4AF',
    errorBg: '#450A0A',
    warning: '#FBBF24',
    warningBg: '#451A03',
    info: '#7DD3FC',
    infoBg: '#0C4A6E',
    
    // Text
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    textInverse: '#18181B',
    
    // Border
    border: '#3F3F46',
    borderLight: '#27272A',
    borderFocus: '#A78BFA',
  },
  
  // Person Avatar Colors (consistent across themes)
  avatar: {
    lavender: '#A78BFA',
    sky: '#7DD3FC',
    sage: '#86EFAC',
    peach: '#FDBA74',
    rose: '#FDA4AF',
    mint: '#6EE7B7',
  },
  
  // Category Colors
  category: {
    groceries: '#86EFAC',     // Sage
    dining: '#FDBA74',        // Peach
    transport: '#7DD3FC',     // Sky
    utilities: '#A78BFA',     // Lavender
    entertainment: '#FDA4AF', // Rose
    travel: '#67E8F9',        // Cyan
    shopping: '#FDE047',      // Yellow
    other: '#A1A1AA',         // Gray
  },
};

// Avatar color sequence for group members
export const avatarColors = [
  colors.avatar.lavender,
  colors.avatar.sky,
  colors.avatar.sage,
  colors.avatar.peach,
  colors.avatar.rose,
  colors.avatar.mint,
];

// Get avatar color by index (wraps around)
export function getAvatarColor(index: number): string {
  return avatarColors[index % avatarColors.length];
}
