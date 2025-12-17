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
import { getAvatarColor } from '@/theme/tokens';
import { Avatar, AvatarGroup } from './Avatar';
import { BalanceBadge, StatusBadge, CategoryBadge } from './Badge';
import { SplitBar } from './SplitBar';
import { GroupImage } from './GroupImage';

// === Group List Item ===

interface GroupMemberPreview {
  name: string;
  imageUrl?: string | null;
  colorIndex: number;
}

interface GroupListItemProps {
  name: string;
  groupId: string; // Used for GroupImage
  memberCount: number;
  members?: GroupMemberPreview[];
  balance?: number;
  lastActivity?: string;
  onPress?: () => void;
}

export function GroupListItem({
  name,
  groupId,
  memberCount,
  members,
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
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: themeColors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      <Stack flexDirection="row" alignItems="center" gap="$3">
        {/* Group Image */}
        <GroupImage groupId={groupId} size="md" />
        
        {/* Content */}
        <Stack flex={1} gap={4}>
          <Text
            fontSize={17}
            fontWeight="600"
            color={themeColors.textPrimary}
          >
            {name}
          </Text>
          {/* Show member avatars if available, otherwise show text count */}
          {members && members.length > 0 ? (
            <Stack flexDirection="row" alignItems="center" gap="$2">
              <AvatarGroup users={members} size="sm" max={4} />
              {lastActivity && (
                <Text fontSize={12} color={themeColors.textMuted}>
                  • {lastActivity}
                </Text>
              )}
            </Stack>
          ) : (
            <Text
              fontSize={13}
              color={themeColors.textMuted}
            >
              {memberCount} members{lastActivity ? ` • ${lastActivity}` : ''}
            </Text>
          )}
        </Stack>
        
        {/* Balance */}
        <BalanceBadge amount={balance} size="sm" />
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
  payerColorIndex?: number; // Avatar color for payer
  participants: Array<{ name: string; colorIndex: number }>;
  onPress?: () => void;
  variant?: 'card' | 'compact';
  isPayer?: boolean; // True if current user is the payer
  itemCount?: number; // Number of items in bill (for itemized bills)
}

export function BillListItem({
  title,
  category,
  categoryIcon,
  amount,
  yourShare,
  date,
  payerName,
  payerColorIndex = 0,
  participants,
  onPress,
  variant = 'card',
  isPayer = false,
  itemCount = 0,
}: BillListItemProps) {
  const themeColors = useThemeColors();
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  // Determine involvement and balance status
  const isInvolved = yourShare > 0 || isPayer;
  const netAmount = isPayer ? (amount - yourShare) : yourShare;
  
  // Get balance text and color
  const getBalanceInfo = () => {
    // Not involved: user not payer AND share = 0
    if (!isPayer && yourShare === 0) {
      return { text: 'not involved', color: themeColors.textMuted };
    }
    
    // User is payer
    if (isPayer) {
      if (netAmount > 0) {
        // Lent money to others
        return { text: `you get $${netAmount.toFixed(2)}`, color: themeColors.success };
      } else if (yourShare === amount) {
        // Paid only for self (no one owes) - just show "you paid"
        return { text: 'you paid', color: themeColors.textMuted };
      } else {
        // Edge case: paid but somehow share > amount (shouldn't happen)
        return { text: `your share: $${yourShare.toFixed(2)}`, color: themeColors.textSecondary };
      }
    }
    
    // User is not payer but has a share (borrowed)
    if (yourShare > 0) {
      return { text: `you give $${yourShare.toFixed(2)}`, color: themeColors.error };
    }
    
    // Fallback
    return { text: `your share: $${yourShare.toFixed(2)}`, color: themeColors.textSecondary };
  };

  const balanceInfo = getBalanceInfo();

  // Compact variant - high density row
  if (variant === 'compact') {
    return (
      <Pressable 
        onPress={handlePress} 
        style={{
          paddingVertical: 12,
          paddingHorizontal: 4,
          opacity: isInvolved ? 1 : 0.5,
        }}
      >
        <Stack flexDirection="row" alignItems="center" gap="$3">
          {/* Category Icon with Credit Card Payer Badge */}
          <Stack position="relative">
            <Stack
              width={36}
              height={36}
              borderRadius={8}
              backgroundColor={themeColors.surfaceElevated}
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize={18}>{categoryIcon || '📦'}</Text>
            </Stack>
            {/* Credit card payer badge */}
            <Stack
              position="absolute"
              bottom={-6}
              right={-6}
              width={22}
              height={16}
              borderRadius={2}
              backgroundColor={getAvatarColor(payerColorIndex)}
              borderWidth={1.5}
              borderColor={themeColors.background}
              overflow="hidden"
            >
              {/* Magnetic stripe near top */}
              <Stack
                position="absolute"
                top={2}
                left={0}
                right={0}
                height={3}
                backgroundColor="rgba(255,255,255,0.4)"
              />
              {/* Initials centered */}
              <Stack flex={1} justifyContent="center" alignItems="center" paddingTop={3}>
                <Text fontSize={7} fontWeight="700" color="white">
                  {payerName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </Text>
              </Stack>
            </Stack>
          </Stack>
          
          {/* Title and Item Count */}
          <Stack flex={1} gap={2}>
            <Text
              fontSize={15}
              fontWeight="500"
              color={themeColors.textPrimary}
              numberOfLines={1}
            >
              {title}
            </Text>
            {itemCount > 1 && (
              <Text fontSize={11} color={themeColors.textMuted}>
                {itemCount} items
              </Text>
            )}
          </Stack>
          
          {/* Amount and Balance */}
          <Stack alignItems="flex-end" gap={2}>
            <Text
              fontSize={12}
              fontWeight="400"
              color={themeColors.textMuted}
            >
              ${amount.toFixed(2)}
            </Text>
            <Text
              fontSize={14}
              fontWeight="600"
              color={balanceInfo.color}
            >
              {balanceInfo.text}
            </Text>
          </Stack>
        </Stack>
      </Pressable>
    );
  }

  // Card variant - original design
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
              color={balanceInfo.color}
              fontWeight="500"
            >
              {balanceInfo.text}
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
