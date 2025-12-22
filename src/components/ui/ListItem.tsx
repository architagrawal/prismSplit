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
        <Stack alignItems="flex-end" justifyContent="center">
          {balance !== 0 ? (
            <>
              <Text fontSize={11} color={themeColors.textMuted}>
                {balance > 0 ? 'you get' : 'you give'}
              </Text>
              <Text 
                fontSize={16} 
                fontWeight="700" 
                color={balance > 0 ? themeColors.success : themeColors.error}
              >
                ${Math.abs(balance).toFixed(2)}
              </Text>
            </>
          ) : (
            <Text 
              fontSize={14} 
              fontWeight="500" 
              color={themeColors.textMuted}
            >
              Settled
            </Text>
          )}
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
  payerColorIndex?: number; // Avatar color for payer
  participants: Array<{ name: string; colorIndex: number }>;
  onPress?: () => void;
  variant?: 'card' | 'compact';
  isPayer?: boolean; // True if current user is the payer
  itemCount?: number; // Number of items in bill (for itemized bills)
  hasDiscount?: boolean;
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
  hasDiscount = false,
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
        <Stack flexDirection="row" alignItems="flex-start" gap="$3">
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
              {hasDiscount && (
                <Stack backgroundColor={themeColors.surfaceElevated} paddingHorizontal="$2" paddingVertical="$1" borderRadius={4}>
                   <Text fontSize={10} color={themeColors.success} fontWeight="600">SAVE</Text>
                </Stack>
              )}
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

export interface ItemRowProps {
  name: string;
  price: number;
  quantity: number;
  category?: string; // or Category
  participants: Array<{ userId: string; name: string; colorIndex: number; percentage: number }>;
  isSelected?: boolean;
  onPress?: () => void;
  onExpand?: () => void;
}

export function ItemRow({
  name,
  price,
  quantity,
  category,
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
  const unclaimed = participants.length === 0 && !isSelected ? 100 : 0;

  return (
    <Pressable onPress={handlePress} onLongPress={onExpand} delayLongPress={400}>
      <Stack
        backgroundColor={isSelected ? themeColors.surfaceElevated || '#F0F4FF' : themeColors.surface}
        borderBottomWidth={1}
        borderBottomColor={themeColors.border}
        paddingHorizontal="$3"
        paddingVertical="$3"
      >
        <Stack flexDirection="row" alignItems="center" gap="$3">
          {/* 1. Large Category Icon - Intuitive ID */}
          {category && (
               <CategoryBadge 
                  category={category as any} 
                  size="lg" 
                  iconOnly 
                  isSelected={isSelected} // Pass selection state if badge needs to change
               />
          )}

          {/* 3. Name & Participants - What & Who */}
          <Stack flex={1} gap="$1" justifyContent="center">
             <Stack flexDirection="row" alignItems="center" gap="$1">
                <Text
                  fontSize={16}
                  fontWeight="600"
                  color={themeColors.textPrimary}
                  numberOfLines={1}
                >
                  {name}
                </Text>
                {quantity > 1 && (
                  <Text fontSize={12} color={themeColors.textSecondary}>
                     ({quantity})
                  </Text>
                )}
             </Stack>
             
             {/* Participants under name */}
             <Stack flexDirection="row" alignItems="center" minHeight={20}>
                {participants.length > 0 ? (
                    <AvatarGroup 
                      users={participants.map(p => ({ name: p.name, colorIndex: p.colorIndex }))} 
                      size="xs"
                      max={4}
                    />
                ) : (
                     <Text
                       fontSize={12}
                       color={isSelected ? themeColors.success : themeColors.warning}
                       fontStyle="italic"
                     >
                       {isSelected ? 'Shared by you' : 'Tap to select'}
                     </Text>
                )}
             </Stack>
          </Stack>

          {/* 4. Price & Split - How Much & Distribution */}
          <Stack alignItems="flex-end" gap="$1" justifyContent="center">
             <Text
                fontSize={16}
                fontWeight="700"
                color={isSelected ? themeColors.primary : themeColors.textPrimary}
              >
                ${totalPrice.toFixed(2)}
              </Text>
              
              {/* Split Bar under price */}
              <Stack width={80}>
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
          </Stack>

        </Stack>
      </Stack>
    </Pressable>
  );
}

// === Activity List Item ===

import { Receipt, CheckCircle, UserPlus, MousePointer } from 'lucide-react-native';
import type { Activity, ActivityType } from '@/types/models';

interface ActivityListItemProps {
  activity: Activity;
  showGroup?: boolean; // Whether to show group info (false for group detail view)
  onPress?: () => void;
}

export function ActivityListItem({
  activity,
  showGroup = true,
  onPress,
}: ActivityListItemProps) {
  const themeColors = useThemeColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  // Activity icons
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'bill_created':
      case 'bill_shared':
      case 'bill_finalized':
        return <Receipt size={18} color={themeColors.primary} />;
      case 'settlement_created':
        return <CheckCircle size={18} color={themeColors.success} />;
      case 'member_joined':
        return <UserPlus size={18} color={themeColors.info} />;
      case 'item_selected':
        return <MousePointer size={18} color={themeColors.warning} />;
      default:
        return <Receipt size={18} color={themeColors.textSecondary} />;
    }
  };

  // Helper to get dynamic description
  const getActivityDescription = (activity: Activity) => {
    const meta = activity.metadata || {};
    
    switch (activity.type) {
      case 'bill_created':
        return meta.title ? `Created a bill "${meta.title}"` : 'Created a bill';
      case 'bill_shared':
        return meta.title ? `Shared a bill "${meta.title}"` : 'Shared a bill';
      case 'bill_finalized':
        return meta.title ? `Finalized bill "${meta.title}"` : 'Finalized a bill';
      case 'item_selected':
        const billTitle = meta.bill_title ? ` in "${meta.bill_title}"` : '';
        return meta.item_name ? `Selected "${meta.item_name}"${billTitle}` : 'Selected items';
      case 'settlement_created':
        return meta.to_user ? `Settled up with ${meta.to_user}` : 'Settled up';
      case 'member_joined':
        return 'Joined the group';
      default:
        return 'New activity';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month} ${day}, ${hours}:${minutes} ${ampm}`;
  };

  return (
    <Pressable 
      onPress={handlePress}
    >
      <Stack 
        flexDirection="row"
        alignItems="center" 
        gap="$3"
        paddingVertical="$3"
        borderBottomWidth={1}
        borderBottomColor={themeColors.border}
      >
        {/* Left: Icon or Group Image */}
        {showGroup ? (
         <Stack alignItems="center" gap="$1">
           <Stack position="relative">
             <GroupImage groupId={activity.group.id} size="md" />
             {/* Activity Icon Badge - centered on group image */}
             <Stack
               position="absolute"
               top={0}
               left={0}
               right={0}
               bottom={0}
               justifyContent="center"
               alignItems="center"
             >
               <Stack
                 width={32}
                 height={32}
                 borderRadius={16}
                 backgroundColor={themeColors.surface}
                 justifyContent="center"
                 alignItems="center"
                 shadowColor="#000"
                 shadowOffset={{ width: 0, height: 2 }}
                 shadowOpacity={0.35}
                 shadowRadius={4}
                 borderWidth={2}
                 borderColor={themeColors.background}
               >
                 {getActivityIcon(activity.type)}
               </Stack>
             </Stack>
           </Stack>
           <Text fontSize={13} color={themeColors.textMuted} numberOfLines={1}>
             {activity.group.name}
           </Text>
         </Stack>
        ) : (
          <Stack
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor={themeColors.surfaceElevated}
            justifyContent="center"
            alignItems="center"
          >
            {getActivityIcon(activity.type)}
          </Stack>
        )}
        
        {/* Center: Activity Details */}
        <Stack flex={1} gap="$1">
          <Text fontSize={15} fontWeight="600" color={themeColors.textPrimary}>
            {getActivityDescription(activity)}
          </Text>
          <Stack flexDirection="row" alignItems="center" gap="$2">
            <Avatar
              name={activity.user.full_name}
              imageUrl={activity.user.avatar_url}
              colorIndex={activity.user.color_index ?? 0}
              size="xs"
            />
            <Text fontSize={13} color={themeColors.textSecondary}>
              {activity.user.full_name}
            </Text>
          </Stack>
          <Text fontSize={12} color={themeColors.textMuted}>
            {formatTime(activity.created_at)}
          </Text>
        </Stack>
        
        {/* Right: Share Amount (Mocked mostly) */}
        {(() => {
          // Get share amount from activity metadata
          const amount = (activity.metadata?.your_share as number) || 
                        (activity.metadata?.amount as number);
          
          if (!amount) return null;

          const isPositive = activity.type === 'settlement_created' || 
                            (activity.metadata?.direction === 'receive');
          
          return (
            <Stack alignItems="flex-end" justifyContent="center">
              <Text fontSize={11} color={themeColors.textMuted}>
                {isPositive ? 'you get' : 'you give'}
              </Text>
              <Text 
                fontSize={16} 
                fontWeight="700" 
                color={isPositive ? themeColors.success : themeColors.error}
              >
                ${amount.toFixed(2)}
              </Text>
            </Stack>
          );
        })()}
      </Stack>
    </Pressable>
  );
}
