/**
 * PrismSplit Home Dashboard
 * 
 * Uses authStore, groupsStore, and activityStore.
 */

import { useEffect } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { RefreshControl, Pressable } from 'react-native';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Plus 
} from 'lucide-react-native';

import { 
  Screen, 
  Card, 
  BalanceCard, 
  Avatar, 
  GroupListItem,
  BalanceBadge,
  Button,
  GroupImage
} from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore, useGroupsStore, useActivityStore } from '@/lib/store';
import { demoBalances } from '@/lib/api/demo';

export default function HomeScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { user } = useAuthStore();
  const { groups, isLoading: groupsLoading, fetchGroups } = useGroupsStore();
  const { activities, isLoading: activitiesLoading, fetchActivities } = useActivityStore();

  // Fetch data on mount
  useEffect(() => {
    fetchGroups();
    fetchActivities();
  }, []);

  // Calculate total balances
  const totalOwed = demoBalances
    .filter(b => b.balance > 0)
    .reduce((sum, b) => sum + b.balance, 0);
  const totalOwing = demoBalances
    .filter(b => b.balance < 0)
    .reduce((sum, b) => sum + Math.abs(b.balance), 0);
  const netBalance = totalOwed - totalOwing;

  const onRefresh = () => {
    fetchGroups();
    fetchActivities();
  };

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <Screen scroll padded={false}>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={groupsLoading || activitiesLoading} 
            onRefresh={onRefresh} 
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Stack paddingHorizontal="$4" paddingTop="$2" paddingBottom="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <YStack>
              <Text fontSize={14} color={themeColors.textSecondary}>
                Welcome back,
              </Text>
              <Text fontSize={28} fontWeight="700" color={themeColors.textPrimary}>
                {firstName}
              </Text>
            </YStack>
            <Pressable onPress={() => router.push('/profile' as any)}>
              <Avatar 
                name={user?.full_name || 'User'}
                colorIndex={user?.color_index || 0}
                size="lg"
              />
            </Pressable>
          </XStack>
        </Stack>

        {/* Balance Summary */}
        <Stack paddingHorizontal="$4" marginBottom="$6">
          <BalanceCard type={netBalance >= 0 ? 'owed' : 'owing'}>
            <YStack alignItems="center" gap="$1">
              <Text fontSize={14} color={themeColors.textSecondary}>
                Overall Balance
              </Text>
              <BalanceBadge amount={netBalance} size="lg" />
            </YStack>
            
            <XStack 
              justifyContent="space-around" 
              marginTop="$4" 
              paddingTop="$4"
              borderTopWidth={1}
              borderTopColor={themeColors.border}
            >
              <YStack alignItems="center" gap="$1">
                <XStack alignItems="center" gap="$1">
                  <TrendingUp size={16} color={themeColors.success} />
                  <Text fontSize={12} color={themeColors.textSecondary}>
                    You're owed
                  </Text>
                </XStack>
                <Text fontSize={18} fontWeight="600" color={themeColors.success}>
                  ${totalOwed.toFixed(2)}
                </Text>
              </YStack>
              
              <Stack width={1} backgroundColor={themeColors.border} />
              
              <YStack alignItems="center" gap="$1">
                <XStack alignItems="center" gap="$1">
                  <TrendingDown size={16} color={themeColors.error} />
                  <Text fontSize={12} color={themeColors.textSecondary}>
                    You owe
                  </Text>
                </XStack>
                <Text fontSize={18} fontWeight="600" color={themeColors.error}>
                  ${totalOwing.toFixed(2)}
                </Text>
              </YStack>
            </XStack>
          </BalanceCard>
        </Stack>

        {/* Quick Actions */}
        <Stack paddingHorizontal="$4" marginBottom="$6">
          <XStack gap="$3">
            <Stack flex={1}>
              <Button
                variant="primary"
                size="md"
                fullWidth
                icon={<Plus size={20} color="white" />}
                onPress={() => router.push('/bill/create' as any)}
              >
                New Bill
              </Button>
            </Stack>
            <Stack flex={1}>
              <Button
                variant="outlined"
                size="md"
                fullWidth
                onPress={() => router.push('/(tabs)/groups' as any)}
              >
                View Groups
              </Button>
            </Stack>
          </XStack>
        </Stack>

        {/* Recent Groups */}
        <Stack paddingHorizontal="$4" marginBottom="$6">
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
            <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
              Your Groups
            </Text>
            <XStack 
              alignItems="center" 
              gap="$1"
              onPress={() => router.push('/(tabs)/groups' as any)}
            >
              <Text fontSize={14} color={themeColors.primary}>See all</Text>
              <ArrowRight size={16} color={themeColors.primary} />
            </XStack>
          </XStack>
          
          <YStack gap="$3">
            {groups.slice(0, 3).map((group) => (
              <GroupListItem
                key={group.id}
                name={group.name}
                groupId={group.id}
                memberCount={group.member_count}
                balance={group.your_balance}
                onPress={() => router.push(`/(tabs)/group/${group.id}` as any)}
              />
            ))}
            {groups.length === 0 && !groupsLoading && (
              <Card variant="surface">
                <YStack alignItems="center" paddingVertical="$4" gap="$2">
                  <Text fontSize={16} color={themeColors.textSecondary}>
                    No groups yet
                  </Text>
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => router.push('/group/create' as any)}
                  >
                    Create Group
                  </Button>
                </YStack>
              </Card>
            )}
          </YStack>
        </Stack>

        {/* Recent Activity */}
        <Stack paddingHorizontal="$4" marginBottom="$8">
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
            <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
              Recent Activity
            </Text>
            <XStack 
              alignItems="center" 
              gap="$1"
              onPress={() => router.push('/(tabs)/activity' as any)}
            >
              <Text fontSize={14} color={themeColors.primary}>See all</Text>
              <ArrowRight size={16} color={themeColors.primary} />
            </XStack>
          </XStack>
          
          <YStack gap="$3">
            {activities.slice(0, 3).map((activity) => (
              <Card key={activity.id} variant="surface">
                <XStack alignItems="center" gap="$3">
                  <Avatar 
                    name={activity.user.full_name}
                    colorIndex={0}
                    size="md"
                  />
                  <YStack flex={1}>
                    <Text fontSize={14} fontWeight="500" color={themeColors.textPrimary}>
                      {activity.user.full_name}
                    </Text>
                    <XStack alignItems="center" gap="$2">
                      <Text fontSize={12} color={themeColors.textSecondary}>
                        {activity.type === 'bill_created' && 'Created a bill'}
                        {activity.type === 'item_selected' && 'Selected items'}
                        {activity.type === 'settlement_created' && 'Settled up'}
                      </Text>
                    </XStack>
                  </YStack>
                  <GroupImage groupId={activity.group.id} size="sm" />
                </XStack>
              </Card>
            ))}
          </YStack>
        </Stack>
      </ScrollView>
    </Screen>
  );
}
