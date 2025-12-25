/**
 * PrismSplit Friends Screen
 * 
 * View all friends across groups with direct balances.
 * Allows quick settle-up with individual people.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { RefreshControl, SectionList, Pressable, View } from 'react-native';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserPlus, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { Screen, Avatar, BalanceBadge } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGroupsStore, useBalancesStore } from '@/lib/store';

export default function FriendsScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { groups, fetchGroups } = useGroupsStore();
  const { 
    friendBalances, 
    groupBalances, 
    fetchAllBalances, 
    isLoading 
  } = useBalancesStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchGroups(),
      fetchAllBalances()
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // Build extended balances with group breakdowns from real data
  const extendedBalances = useMemo(() => {
    return Object.values(friendBalances).map(friend => {
      // Find which groups this friend appears in
      const groupBreakdowns: GroupBreakdown[] = [];
      
      Object.values(groupBalances).forEach(group => {
        const friendInGroup = group.withFriends[friend.userId];
        if (friendInGroup && Math.abs(friendInGroup.balance) >= 0.01) {
          groupBreakdowns.push({
            groupId: group.groupId,
            groupName: group.groupName,
            amount: friendInGroup.balance
          });
        }
      });

      return {
        userId: friend.userId,
        name: friend.name,
        colorIndex: friend.colorIndex,
        balance: friend.balance,
        groups: groupBreakdowns
      };
    }).sort((a, b) => b.balance - a.balance); // Sort: owed to you first
  }, [friendBalances, groupBalances]);

  const handleFriendPress = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/settle/${userId}` as any);
  };

  const handleRemindPress = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <Screen padded={false} backgroundColor={themeColors.background}>
      <YStack paddingTop={insets.top > 0 ? 0 : '$4'} paddingBottom="$2" paddingHorizontal="$4" backgroundColor={themeColors.background} zIndex={10}>
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize={34} fontWeight="800" color={themeColors.textPrimary} letterSpacing={-1}>
              Friends
            </Text>
            <Text fontSize={15} color={themeColors.textSecondary} marginTop="$1">
              {extendedBalances.length} people across {groups.length} groups
            </Text>
          </YStack>
          <Pressable 
            onPress={() => {
              if (groups.length > 0) {
                // Navigate to first group's invite screen
                router.push(`/group/invite?id=${groups[0].id}` as any);
              } else {
                // No groups - suggest creating one first
                router.push('/group/create' as any);
              }
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <LinearGradient
              colors={[themeColors.primary, '#4c669f']} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <UserPlus size={20} color="white" />
            </LinearGradient>
          </Pressable>
        </XStack>
      </YStack>

      <SectionList
        sections={[{ data: extendedBalances }]}
        keyExtractor={(item) => item.userId}
        refreshControl={
          <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />
        }
        renderItem={({ item, index }) => (
          <FriendRow
            friend={item}
            onPress={() => handleFriendPress(item.userId)}
            onRemind={() => handleRemindPress(item.userId)}
            isLast={index === extendedBalances.length - 1}
          />
        )}
        ListFooterComponent={<Stack height={100} />}
        ListEmptyComponent={
          <YStack alignItems="center" paddingVertical="$10" gap="$4">
            <Text fontSize={48}>👥</Text>
            <Text fontSize={16} color={themeColors.textSecondary} textAlign="center">
              {isLoading ? 'Loading friends...' : 'Add friends to start splitting bills!'}
            </Text>
          </YStack>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </Screen>
  );
}

interface GroupBreakdown {
  groupId: string;
  groupName: string;
  amount: number; // Positive = they owe you, Negative = you owe them
}

interface ExtendedFriendBalance {
  userId: string;
  name: string;
  colorIndex: number;
  balance: number;
  groups: GroupBreakdown[];
}

interface FriendRowProps {
  friend: ExtendedFriendBalance;
  onPress: () => void;
  onRemind?: () => void;
  isLast?: boolean;
}

function FriendRow({ friend, onPress, onRemind, isLast }: FriendRowProps) {
  const themeColors = useThemeColors();
  
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? themeColors.surface : 'transparent',
        paddingHorizontal: 20
      })}
    >
      <XStack 
        paddingVertical="$4"
        gap="$4"
        borderBottomWidth={isLast ? 0 : 1}
        borderBottomColor={themeColors.border}
      >
        <Avatar
          name={friend.name}
          colorIndex={friend.colorIndex}
          size="lg"
        />
        
        <YStack flex={1} gap="$1" justifyContent="center">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={17} fontWeight="600" color={themeColors.textPrimary} numberOfLines={1}>
              {friend.name}
            </Text>
            
            <YStack alignItems="flex-end">
              <Text 
                fontSize={16} 
                fontWeight="700" 
                color={friend.balance > 0 ? themeColors.success : friend.balance < 0 ? themeColors.error : themeColors.textMuted}
              >
                {friend.balance === 0 ? '' : '$'}{Math.abs(friend.balance).toFixed(2)}
              </Text>
            </YStack>
          </XStack>

          {/* Detailed Breakdown */}
          <YStack gap="$1" marginTop="$1">
            {friend.groups.map((group, idx) => (
              <XStack key={idx} justifyContent="space-between" alignItems="center">
                <Text fontSize={13} color={themeColors.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
                  {group.groupName}
                </Text>
                <Text 
                  fontSize={13} 
                  fontWeight="500" 
                  color={group.amount > 0 ? themeColors.success : group.amount < 0 ? themeColors.error : themeColors.textMuted}
                >
                  {group.amount > 0 ? 'you get' : 'you give'} ${Math.abs(group.amount).toFixed(2)}
                </Text>
              </XStack>
            ))}
            
            {friend.groups.length === 0 && (
              <Text fontSize={13} color={themeColors.textMuted}>
                Settled up
              </Text>
            )}
          </YStack>
        </YStack>
      </XStack>
    </Pressable>
  );
}
