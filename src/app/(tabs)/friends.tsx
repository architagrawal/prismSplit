/**
 * PrismSplit Friends Screen
 * 
 * View all friends across groups with direct balances.
 * Allows quick settle-up with individual people.
 */

import { useEffect, useState, useCallback } from 'react';
import { RefreshControl, ScrollView, Pressable, TextInput } from 'react-native';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, UserPlus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Card, Avatar, BalanceBadge, Button, Input } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore, useGroupsStore, useUIStore } from '@/lib/store';
import { demoBalances } from '@/lib/api/demo';
import type { MemberBalance } from '@/types/models';

export default function FriendsScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { groups, fetchGroups, isLoading: groupsLoading } = useGroupsStore();
  const { searchQuery, setSearchQuery, clearSearch } = useUIStore();

  const [refreshing, setRefreshing] = useState(false);
  const [balances, setBalances] = useState<MemberBalance[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchGroups();
    // In a real app, we'd fetch friend balances from API
    setBalances(demoBalances);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // Filter balances by search
  const filteredBalances = balances.filter(b =>
    b.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Summary calculations
  const totalOwedToYou = balances
    .filter(b => b.balance > 0)
    .reduce((sum, b) => sum + b.balance, 0);
  
  const totalYouOwe = balances
    .filter(b => b.balance < 0)
    .reduce((sum, b) => sum + Math.abs(b.balance), 0);

  const handleFriendPress = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/settle/${userId}` as any);
  };

  const handleRemindPress = (userId: string, userName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In a real app, send reminder notification
    console.log('Remind:', userId);
  };

  return (
    <Screen>
      {/* Header */}
      <YStack paddingTop={insets.top > 0 ? 0 : '$4'} marginBottom="$4">
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <YStack>
            <Text fontSize={28} fontWeight="700" color={themeColors.textPrimary}>
              Friends
            </Text>
            <Text fontSize={14} color={themeColors.textSecondary}>
              {balances.length} people across {groups.length} groups
            </Text>
          </YStack>
          <Pressable onPress={() => router.push('/group/invite' as any)}>
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={themeColors.surfaceElevated}
              justifyContent="center"
              alignItems="center"
            >
              <UserPlus size={20} color={themeColors.primary} />
            </Stack>
          </Pressable>
        </XStack>

        {/* Summary Cards */}
        <XStack gap="$3" marginBottom="$4">
          <Card variant="elevated" flex={1}>
            <YStack alignItems="center" gap="$1">
              <Text fontSize={12} color={themeColors.textSecondary}>
                Owed to you
              </Text>
              <Text fontSize={20} fontWeight="700" color={themeColors.success}>
                +${totalOwedToYou.toFixed(2)}
              </Text>
            </YStack>
          </Card>
          <Card variant="elevated" flex={1}>
            <YStack alignItems="center" gap="$1">
              <Text fontSize={12} color={themeColors.textSecondary}>
                You owe
              </Text>
              <Text fontSize={20} fontWeight="700" color={themeColors.error}>
                -${totalYouOwe.toFixed(2)}
              </Text>
            </YStack>
          </Card>
        </XStack>

        {/* Search */}
        <Input
          placeholder="Search friends..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={18} color={themeColors.textMuted} />}
        />
      </YStack>

      {/* Friends List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ flex: 1 }}
      >
        {filteredBalances.length === 0 ? (
          <YStack alignItems="center" paddingVertical="$8" gap="$4">
            <Text fontSize={48}>👥</Text>
            <Text fontSize={16} color={themeColors.textSecondary} textAlign="center">
              {searchQuery 
                ? 'No friends match your search'
                : 'No balances with friends yet'
              }
            </Text>
          </YStack>
        ) : (
          <YStack>
            {/* Owed to you section */}
            {(() => {
              const owedToYou = filteredBalances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
              if (owedToYou.length === 0) return null;
              return (
                <>
                  <Text 
                    fontSize={14} 
                    fontWeight="600" 
                    color={themeColors.textSecondary}
                    marginTop="$2"
                    marginBottom="$1"
                  >
                    OWED TO YOU
                  </Text>
                  {owedToYou.map((friend, index) => (
                    <FriendRow
                      key={friend.user_id}
                      friend={friend}
                      onPress={() => handleFriendPress(friend.user_id)}
                      onRemind={() => handleRemindPress(friend.user_id, friend.user.full_name)}
                      showRemind
                      isLast={index === owedToYou.length - 1}
                    />
                  ))}
                </>
              );
            })()}

            {/* You owe section */}
            {(() => {
              const youOwe = filteredBalances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
              if (youOwe.length === 0) return null;
              return (
                <>
                  <Text 
                    fontSize={14} 
                    fontWeight="600" 
                    color={themeColors.textSecondary}
                    marginTop="$4"
                    marginBottom="$1"
                  >
                    YOU OWE
                  </Text>
                  {youOwe.map((friend, index) => (
                    <FriendRow
                      key={friend.user_id}
                      friend={friend}
                      onPress={() => handleFriendPress(friend.user_id)}
                      isLast={index === youOwe.length - 1}
                    />
                  ))}
                </>
              );
            })()}

            {/* Settled section */}
            {(() => {
              const settled = filteredBalances.filter(b => b.balance === 0);
              if (settled.length === 0) return null;
              return (
                <>
                  <Text 
                    fontSize={14} 
                    fontWeight="600" 
                    color={themeColors.textSecondary}
                    marginTop="$4"
                    marginBottom="$1"
                  >
                    ALL SETTLED
                  </Text>
                  {settled.map((friend, index) => (
                    <FriendRow
                      key={friend.user_id}
                      friend={friend}
                      onPress={() => handleFriendPress(friend.user_id)}
                      isLast={index === settled.length - 1}
                    />
                  ))}
                </>
              );
            })()}
          </YStack>
        )}

        <Stack height={100} />
      </ScrollView>
    </Screen>
  );
}

// Friend row component (list style)
interface FriendRowProps {
  friend: MemberBalance;
  onPress: () => void;
  onRemind?: () => void;
  showRemind?: boolean;
  isLast?: boolean;
}

function FriendRow({ friend, onPress, onRemind, showRemind, isLast }: FriendRowProps) {
  const themeColors = useThemeColors();
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  
  return (
    <Pressable onPress={handlePress}>
      <XStack 
        alignItems="center" 
        gap="$3"
        paddingVertical="$3"
        borderBottomWidth={isLast ? 0 : 1}
        borderBottomColor={themeColors.border}
      >
        <Avatar
          name={friend.user.full_name}
          colorIndex={friend.color_index}
          size="lg"
        />
        
        <YStack flex={1}>
          <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
            {friend.user.full_name}
          </Text>
          <Text fontSize={14} color={themeColors.textSecondary}>
            {friend.balance > 0 
              ? 'owes you' 
              : friend.balance < 0 
                ? 'you owe'
                : 'settled up'
            }
          </Text>
        </YStack>

        <YStack alignItems="flex-end" gap="$1">
          <BalanceBadge amount={friend.balance} size="md" />
          
          {showRemind && friend.balance > 0 && (
            <Pressable 
              onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onRemind?.();
              }}
            >
              <Text fontSize={12} color={themeColors.primary}>
                Remind
              </Text>
            </Pressable>
          )}
        </YStack>
      </XStack>
    </Pressable>
  );
}
