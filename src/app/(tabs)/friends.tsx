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
import { useGroupsStore } from '@/lib/store';
import { demoBalances } from '@/lib/api/demo';
import type { MemberBalance } from '@/types/models';

export default function FriendsScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { groups, fetchGroups } = useGroupsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [balances, setBalances] = useState<ExtendedMemberBalance[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchGroups();
    // In a real app, we'd fetch friend balances from API
    // Extending demo data with mock group breakdowns for UI demonstration
    const extendedBalances: ExtendedMemberBalance[] = demoBalances.map(b => ({
      ...b,
      groups: generateMockGroupBreakdown(b)
    }));
    setBalances(extendedBalances);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // Helper to generate mock breakdown based on total balance
  const generateMockGroupBreakdown = (member: MemberBalance): GroupBreakdown[] => {
    // This is purely for UI demo since backend doesn't support this yet
    const numGroups = Math.floor(Math.random() * 2) + 1; // 1 or 2 groups
    const breakdown: GroupBreakdown[] = [];
    
    // Just split the total balance into parts for the demo
    if (member.balance !== 0) {
      if (numGroups === 1) {
         breakdown.push({
           groupId: 'g1',
           groupName: groups[0]?.name || 'Roommates',
           amount: member.balance
         });
      } else {
        const amount1 = parseFloat((member.balance * 0.6).toFixed(2));
        const amount2 = parseFloat((member.balance - amount1).toFixed(2));
        breakdown.push({
          groupId: 'g1',
          groupName: groups[0]?.name || 'Roommates',
          amount: amount1
        });
        breakdown.push({
          groupId: 'g2',
          groupName: groups[1]?.name || 'Trip Squad',
          amount: amount2
        });
      }
    }
    return breakdown;
  };

  // Filter and group data
  // Filter and group data - Flattened for the new design (no sections, just list)
  const filteredBalances = useMemo(() => {
      // Sort: positive balances (owed to you) first desc, then negative (you owe) asc
      return balances.sort((a, b) => b.balance - a.balance);
  }, [balances]);

  // Summary calculations


  const handleFriendPress = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/settle/${userId}` as any);
  };

  const handleRemindPress = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Remind:', userId);
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
              {balances.length} people across {groups.length} groups
            </Text>
          </YStack>
          <Pressable 
            onPress={() => router.push('/group/invite' as any)}
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
        sections={[{ data: filteredBalances }]}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item, index }) => (
          <FriendRow
            friend={item}
            onPress={() => handleFriendPress(item.user_id)}
            onRemind={() => handleRemindPress(item.user_id)}
            isLast={index === filteredBalances.length - 1}
          />
        )}
        ListFooterComponent={<Stack height={100} />}
        ListEmptyComponent={
          <YStack alignItems="center" paddingVertical="$10" gap="$4">
            <Text fontSize={48}>👥</Text>
            <Text fontSize={16} color={themeColors.textSecondary} textAlign="center">
              Add friends to start splitting bills!
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

interface ExtendedMemberBalance extends MemberBalance {
  groups: GroupBreakdown[];
}

interface FriendRowProps {
  friend: ExtendedMemberBalance;
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
          name={friend.user.full_name}
          colorIndex={friend.color_index}
          size="lg"
        />
        
        <YStack flex={1} gap="$1" justifyContent="center">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={17} fontWeight="600" color={themeColors.textPrimary} numberOfLines={1}>
              {friend.user.full_name}
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
