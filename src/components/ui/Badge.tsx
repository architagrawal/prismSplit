/**
 * PrismSplit Badge Components
 * 
 * Status badges, balance badges, and labels.
 */

import { Stack, Text } from 'tamagui';

import { colors } from '@/theme/tokens';

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
  const isOwed = amount > 0;
  const isOwing = amount < 0;
  
  const color = isOwed 
    ? colors.light.success 
    : isOwing 
      ? colors.light.error 
      : colors.light.textSecondary;
  
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

type StatusType = 'draft' | 'shared' | 'finalized' | 'settled' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig: Record<StatusType, { label: string; bg: string; text: string }> = {
  draft: { 
    label: 'Draft', 
    bg: colors.light.borderLight, 
    text: colors.light.textSecondary 
  },
  shared: { 
    label: 'Shared', 
    bg: '#EDE9FE', // Light lavender
    text: colors.light.primary 
  },
  finalized: { 
    label: 'Finalized', 
    bg: colors.light.successBg, 
    text: colors.light.success 
  },
  settled: { 
    label: 'Settled', 
    bg: colors.light.successBg, 
    text: colors.light.success 
  },
  pending: { 
    label: 'Pending', 
    bg: colors.light.warningBg, 
    text: colors.light.warning 
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
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

interface CategoryBadgeProps {
  category: string;
  icon?: string;
}

export function CategoryBadge({ category, icon }: CategoryBadgeProps) {
  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      backgroundColor={colors.light.borderLight}
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius={6}
      gap="$1"
    >
      {icon && (
        <Text fontSize={12}>{icon}</Text>
      )}
      <Text
        color={colors.light.textSecondary}
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
  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      backgroundColor={colors.light.warningBg}
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius={6}
      gap="$1"
    >
      <Text fontSize={12}>⚠️</Text>
      <Text
        color={colors.light.warning}
        fontSize={12}
        fontWeight="500"
      >
        No one yet
      </Text>
    </Stack>
  );
}
