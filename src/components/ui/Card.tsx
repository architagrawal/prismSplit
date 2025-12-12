/**
 * PrismSplit Card Component
 * 
 * Surface and elevated card variants with consistent styling.
 */

import { styled, Stack, GetProps } from 'tamagui';

import { colors } from '@/theme/tokens';

// Base Card styled component
const CardBase = styled(Stack, {
  borderRadius: 12,
  padding: '$4',
  
  variants: {
    variant: {
      surface: {
        backgroundColor: colors.light.surface,
        borderWidth: 1,
        borderColor: colors.light.border,
      },
      elevated: {
        backgroundColor: colors.light.surfaceElevated,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.light.border,
      },
    },
    pressable: {
      true: {
        pressStyle: {
          opacity: 0.9,
          scale: 0.99,
        },
      },
    },
  } as const,
  
  defaultVariants: {
    variant: 'surface',
  },
});

export type CardProps = GetProps<typeof CardBase>;

export function Card({ children, ...props }: CardProps) {
  return <CardBase {...props}>{children}</CardBase>;
}

// Specialized card for balance display with glow effect
export function BalanceCard({ 
  children, 
  type = 'neutral',
  ...props 
}: CardProps & { type?: 'owed' | 'owing' | 'neutral' }) {
  const glowColor = type === 'owed' 
    ? colors.light.successLight 
    : type === 'owing' 
      ? colors.light.errorLight 
      : colors.light.primary;
  
  return (
    <Stack
      backgroundColor={colors.light.surface}
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
