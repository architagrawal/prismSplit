/**
 * PrismSplit Badge Components
 * 
 * Status badges, balance badges, and labels.
 */

import { Stack, Text } from 'tamagui';

import { useThemeColors } from '@/hooks/useThemeColors';

// === Balance Badge ===

interface BalanceBadgeProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BalanceBadge({ 
  amount, 
  currency = '$',
  size = 'md',
}: BalanceBadgeProps) {
  const themeColors = useThemeColors();
  
  const isOwed = amount > 0;
  const isOwing = amount < 0;
  
  const color = isOwed 
    ? themeColors.success 
    : isOwing 
      ? themeColors.error 
      : themeColors.textSecondary;
  
  const fontSize = size === 'sm' ? 14 : size === 'md' ? 18 : 24;
  const fontWeight = size === 'lg' ? '700' : '600';

  const displayAmount = Math.abs(amount).toFixed(2);
  const prefix = isOwing ? '-' : isOwed ? '+' : '';

  return (
    <Text
      color={color}
      fontSize={fontSize}
      fontWeight={fontWeight}
    >
      {prefix}{currency}{displayAmount}
    </Text>
  );
}

// === Status Badge ===

// Matches BillStatus - all states are editable
type StatusType = 'draft' | 'active' | 'settled' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const themeColors = useThemeColors();
  
  const statusConfig: Record<StatusType, { label: string; bg: string; text: string }> = {
    draft: { 
      label: 'Draft', 
      bg: themeColors.borderLight, 
      text: themeColors.textSecondary 
    },
    active: { 
      label: 'Active', 
      bg: themeColors.infoBg, 
      text: themeColors.info 
    },
    settled: { 
      label: 'Settled', 
      bg: themeColors.successBg, 
      text: themeColors.success 
    },
    pending: { 
      label: 'Pending', 
      bg: themeColors.warningBg, 
      text: themeColors.warning 
    },
  };
  
  const config = statusConfig[status];

  return (
    <Stack
      backgroundColor={config.bg}
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius={6}
    >
      <Text
        color={config.text}
        fontSize={12}
        fontWeight="600"
      >
        {config.label}
      </Text>
    </Stack>
  );
}

// === Category Badge ===
import { categoryIcons, Category } from '@/types/models';

interface CategoryBadgeProps {
  category: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  isSelected?: boolean;
}

export function CategoryBadge({ category, icon, size = 'md', iconOnly = false, isSelected = false }: CategoryBadgeProps) {
  const themeColors = useThemeColors();
  
  // Use provided icon or lookup from dictionary
  const displayIcon = icon || categoryIcons[category as Category] || '📦';
  
  if (iconOnly) {
    const sizeMap = {
      sm: { dim: 20, fontSize: 12, radius: 6, checkSize: 10, checkPos: -2 },
      md: { dim: 28, fontSize: 16, radius: 8, checkSize: 12, checkPos: -3 },
      lg: { dim: 42, fontSize: 24, radius: 14, checkSize: 16, checkPos: -4 },
      xl: { dim: 52, fontSize: 28, radius: 16, checkSize: 20, checkPos: -5 },
    };
    
    // Default to md if size invalid
    const { dim, fontSize: fSize, radius, checkSize, checkPos } = sizeMap[size as keyof typeof sizeMap] || sizeMap.md;

    return (
        <Stack
        width={dim}
        height={dim}
        borderRadius={radius}
        backgroundColor={themeColors.borderLight}
        justifyContent="center"
        alignItems="center"
        position="relative"
      >
        <Text fontSize={fSize}>{displayIcon}</Text>
        
        {/* Selection Checkmark Overlay */}
        {isSelected && (
          <Stack
            position="absolute"
            bottom={checkPos}
            right={checkPos}
            backgroundColor={themeColors.primary}
            width={checkSize}
            height={checkSize}
            borderRadius={checkSize / 2}
            justifyContent="center"
            alignItems="center"
            borderWidth={1.5}
            borderColor={themeColors.surface}
          >
            <Text fontSize={checkSize * 0.6} color="white" fontWeight="bold">✓</Text>
          </Stack>
        )}
      </Stack>
    );
  }

  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      backgroundColor={themeColors.borderLight}
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius={6}
      gap="$1"
    >
      <Text fontSize={12}>{displayIcon}</Text>
      <Text
        color={themeColors.textSecondary}
        fontSize={12}
        fontWeight="500"
        textTransform="capitalize"
      >
        {category}
      </Text>
    </Stack>
  );
}

// === Unclaimed Badge ===

export function UnclaimedBadge() {
  const themeColors = useThemeColors();
  
  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      backgroundColor={themeColors.warningBg}
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius={6}
      gap="$1"
    >
      <Text fontSize={12}>⚠️</Text>
      <Text
        color={themeColors.warning}
        fontSize={12}
        fontWeight="500"
      >
        No one yet
      </Text>
    </Stack>
  );
}
