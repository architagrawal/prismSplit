/**
 * PrismSplit List Item Components
 * 
 * Reusable list items for groups, bills, and activity.
 */

import { Stack, Text } from 'tamagui';
import { Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useThemeColors } from '@/hooks/useThemeColors';
import { Avatar, AvatarGroup } from './Avatar';
import { BalanceBadge, StatusBadge, CategoryBadge } from './Badge';
import { SplitBar } from './SplitBar';

// === Group List Item ===

interface GroupListItemProps {
  name: string;
  emoji: string;
  memberCount: number;
  balance?: number;
  lastActivity?: string;
  onPress?: () => void;
}

export function GroupListItem({
  name,
  emoji,
  memberCount,
  balance = 0,
  lastActivity,
  onPress,
}: GroupListItemProps) {
  const themeColors = useThemeColors();
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable 
      onPress={handlePress} 
      style={{
        backgroundColor: themeColors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: themeColors.border,
      }}
    >
      <Stack flexDirection="row" alignItems="center" gap="$3">
        {/* Emoji Avatar */}
        <Stack
          width={48}
          height={48}
          borderRadius={12}
          backgroundColor={themeColors.surfaceElevated}
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize={24}>{emoji}</Text>
        </Stack>
        
        {/* Content */}
        <Stack flex={1} gap="$1">
          <Text
            fontSize={16}
            fontWeight="600"
            color={themeColors.textPrimary}
          >
            {name}
          </Text>
          <Text
            fontSize={14}
            color={themeColors.textSecondary}
          >
            {memberCount} members{lastActivity ? ` • ${lastActivity}` : ''}
          </Text>
        </Stack>
        
        {/* Balance */}
        <Stack alignItems="flex-end" gap="$1">
          <BalanceBadge amount={balance} size="sm" />
          <ChevronRight size={20} color={themeColors.textMuted} />
        </Stack>
      </Stack>
    </Pressable>
  );
}

// === Bill List Item ===

interface BillListItemProps {
  title: string;
  category: string;
  categoryIcon?: string;
  amount: number;
  yourShare: number;
  date: string;
  payerName: string;
  participants: Array<{ name: string; colorIndex: number }>;
  onPress?: () => void;
}

export function BillListItem({
  title,
  category,
  categoryIcon,
  amount,
  yourShare,
  date,
  payerName,
  participants,
  onPress,
}: BillListItemProps) {
  const themeColors = useThemeColors();
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable 
      onPress={handlePress} 
      style={{
        backgroundColor: themeColors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: themeColors.border,
      }}
    >
      <Stack gap="$2">
        {/* Top row */}
        <Stack flexDirection="row" justifyContent="space-between" alignItems="flex-start">
          <Stack flex={1} gap="$1">
            <Text
              fontSize={16}
              fontWeight="600"
              color={themeColors.textPrimary}
            >
              {title}
            </Text>
            <Stack flexDirection="row" alignItems="center" gap="$2">
              <CategoryBadge category={category} icon={categoryIcon} />
            </Stack>
          </Stack>
          
          <Stack alignItems="flex-end">
            <Text
              fontSize={16}
              fontWeight="600"
              color={themeColors.textPrimary}
            >
              ${amount.toFixed(2)}
            </Text>
            <Text
              fontSize={12}
              color={themeColors.textSecondary}
            >
              Your share: ${yourShare.toFixed(2)}
            </Text>
          </Stack>
        </Stack>
        
        {/* Bottom row */}
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text
            fontSize={12}
            color={themeColors.textMuted}
          >
            {date} • Paid by {payerName}
          </Text>
          <AvatarGroup users={participants} size="sm" />
        </Stack>
      </Stack>
    </Pressable>
  );
}

// === Item Row (for bill items with splits) ===

interface ItemRowProps {
  name: string;
  price: number;
  quantity: number;
  participants: Array<{ userId: string; name: string; colorIndex: number; percentage: number }>;
  isSelected?: boolean;
  onPress?: () => void;
  onExpand?: () => void;
}

export function ItemRow({
  name,
  price,
  quantity,
  participants,
  isSelected = false,
  onPress,
  onExpand,
}: ItemRowProps) {
  const themeColors = useThemeColors();
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const totalPrice = price * quantity;
  const unclaimed = participants.length === 0 ? 100 : 0;

  return (
    <Pressable onPress={handlePress}>
      <Stack
        backgroundColor={isSelected ? themeColors.surfaceElevated : themeColors.surface}
        borderWidth={isSelected ? 2 : 1}
        borderColor={isSelected ? themeColors.primary : themeColors.border}
        borderRadius={12}
        padding="$3"
        gap="$2"
      >
        {/* Top row */}
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
          <Stack flex={1}>
            <Text
              fontSize={16}
              fontWeight="500"
              color={themeColors.textPrimary}
            >
              {name}
            </Text>
            {quantity > 1 && (
              <Text
                fontSize={12}
                color={themeColors.textSecondary}
              >
                Qty: {quantity}
              </Text>
            )}
          </Stack>
          
          <Text
            fontSize={16}
            fontWeight="600"
            color={themeColors.primary}
          >
            ${totalPrice.toFixed(2)}
          </Text>
        </Stack>
        
        {/* Avatars */}
        <Stack flexDirection="row" alignItems="center" gap="$2">
          {participants.length > 0 ? (
            <AvatarGroup 
              users={participants.map(p => ({ name: p.name, colorIndex: p.colorIndex }))} 
              size="sm" 
            />
          ) : (
            <Text
              fontSize={12}
              color={themeColors.warning}
            >
              ⚠️ No one yet
            </Text>
          )}
        </Stack>
        
        {/* Split bar */}
        <SplitBar
          segments={participants.map(p => ({
            userId: p.userId,
            colorIndex: p.colorIndex,
            percentage: p.percentage,
          }))}
          height={4}
          unclaimed={unclaimed}
        />
      </Stack>
    </Pressable>
  );
}
