/**
 * PrismSplit Card Component
 * 
 * Surface and elevated card variants with consistent styling.
 */

import { Stack, GetProps } from 'tamagui';

import { useThemeColors } from '@/hooks/useThemeColors';

// Card variant type
type CardVariant = 'surface' | 'elevated' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  pressable?: boolean;
  padding?: number | string;
  borderRadius?: number;
  [key: string]: any;
}

export type { CardProps };

export function Card({ 
  children, 
  variant = 'surface',
  pressable = false,
  padding,
  borderRadius = 12,
  ...props 
}: CardProps) {
  const themeColors = useThemeColors();
  
  const variantStyles = {
    surface: {
      backgroundColor: themeColors.surface,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    elevated: {
      backgroundColor: themeColors.surfaceElevated,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: themeColors.border,
    },
  };
  
  const style = variantStyles[variant];
  
  return (
    <Stack
      borderRadius={borderRadius}
      padding={padding ?? '$4'}
      {...style}
      {...(pressable && {
        pressStyle: {
          opacity: 0.9,
          scale: 0.99,
        },
      })}
      {...props}
    >
      {children}
    </Stack>
  );
}

// Specialized card for balance display with glow effect
export function BalanceCard({ 
  children, 
  type = 'neutral',
  ...props 
}: CardProps & { type?: 'owed' | 'owing' | 'neutral' }) {
  const themeColors = useThemeColors();
  
  const glowColor = type === 'owed' 
    ? themeColors.successLight 
    : type === 'owing' 
      ? themeColors.errorLight 
      : themeColors.primary;
  
  return (
    <Stack
      backgroundColor={themeColors.surface}
      borderRadius={16}
      padding="$4"
      shadowColor={glowColor}
      shadowOffset={{ width: 0, height: 0 }}
      shadowOpacity={0.3}
      shadowRadius={12}
      {...props}
    >
      {children}
    </Stack>
  );
}
