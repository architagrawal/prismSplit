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
  size?: 'sm' | 'md';
  iconOnly?: boolean;
}

export function CategoryBadge({ category, icon, size = 'md', iconOnly = false }: CategoryBadgeProps) {
  const themeColors = useThemeColors();
  
  // Use provided icon or lookup from dictionary
  const displayIcon = icon || categoryIcons[category as Category] || '📦';
  
  if (iconOnly) {
    return (
        <Stack
        width={size === 'sm' ? 20 : 28}
        height={size === 'sm' ? 20 : 28}
        borderRadius={size === 'sm' ? 6 : 8}
        backgroundColor={themeColors.borderLight}
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize={size === 'sm' ? 12 : 16}>{displayIcon}</Text>
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
