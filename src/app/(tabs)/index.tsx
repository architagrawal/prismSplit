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
  Plus,
  Receipt,
  CheckCircle,
  MousePointer
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { 
  Screen, 
  Card,
  BalanceCard, 
  Avatar, 
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

  const handleGroupPress = (groupId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/group/${groupId}` as any);
  };

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
            <Pressable onPress={() => router.push('/(tabs)/groups' as any)}>
              <XStack alignItems="center" gap="$1">
                <Text fontSize={14} color={themeColors.primary}>See all</Text>
                <ArrowRight size={16} color={themeColors.primary} />
              </XStack>
            </Pressable>
          </XStack>
          
          <YStack>
            {groups.slice(0, 3).map((group, index) => (
              <Pressable 
                key={group.id}
                onPress={() => handleGroupPress(group.id)}
              >
                <XStack 
                  alignItems="center" 
                  gap="$3"
                  paddingVertical="$3"
                  borderBottomWidth={index === Math.min(groups.length, 3) - 1 ? 0 : 1}
                  borderBottomColor={themeColors.border}
                >
                  <GroupImage groupId={group.id} size="md" />
                  <YStack flex={1}>
                    <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
                      {group.name}
                    </Text>
                    <Text fontSize={13} color={themeColors.textMuted}>
                      {group.member_count} members
                    </Text>
                  </YStack>
                  <BalanceBadge amount={group.your_balance || 0} size="sm" />
                </XStack>
              </Pressable>
            ))}
            {groups.length === 0 && !groupsLoading && (
              <YStack alignItems="center" paddingVertical="$6" gap="$3">
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
            )}
          </YStack>
        </Stack>

        {/* Recent Activity */}
        <Stack paddingHorizontal="$4" marginBottom="$8">
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
            <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
              Recent Activity
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/activity' as any)}>
              <XStack alignItems="center" gap="$1">
                <Text fontSize={14} color={themeColors.primary}>See all</Text>
                <ArrowRight size={16} color={themeColors.primary} />
              </XStack>
            </Pressable>
          </XStack>
          
          <YStack>
            {activities.slice(0, 3).map((activity, index) => {
              // Get activity icon
              const getIcon = () => {
                switch (activity.type) {
                  case 'bill_created':
                    return <Receipt size={16} color={themeColors.primary} />;
                  case 'item_selected':
                    return <MousePointer size={16} color={themeColors.primary} />;
                  case 'settlement_created':
                    return <CheckCircle size={16} color={themeColors.success} />;
                  default:
                    return <Receipt size={16} color={themeColors.primary} />;
                }
              };
              
              return (
                <XStack 
                  key={activity.id} 
                  alignItems="center" 
                  gap="$3"
                  paddingVertical="$3"
                  borderBottomWidth={index === Math.min(activities.length, 3) - 1 ? 0 : 1}
                  borderBottomColor={themeColors.border}
                >
                  <Avatar 
                    name={activity.user.full_name}
                    imageUrl={activity.user.avatar_url}
                    colorIndex={activity.user.color_index ?? 0}
                    size="md"
                  />
                  <YStack flex={1}>
                    <Text fontSize={14} fontWeight="500" color={themeColors.textPrimary}>
                      {activity.user.full_name}
                    </Text>
                    <Text fontSize={12} color={themeColors.textSecondary}>
                      {activity.type === 'bill_created' && 'Created a bill'}
                      {activity.type === 'item_selected' && 'Selected items'}
                      {activity.type === 'settlement_created' && 'Settled up'}
                    </Text>
                  </YStack>
                  
                  {/* Group Image with Icon Badge */}
                  <YStack alignItems="center" gap="$1">
                    <Stack position="relative">
                      <GroupImage groupId={activity.group.id} size="sm" />
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
                          width={24}
                          height={24}
                          borderRadius={12}
                          backgroundColor={themeColors.surface}
                          justifyContent="center"
                          alignItems="center"
                          shadowColor="#000"
                          shadowOffset={{ width: 0, height: 1 }}
                          shadowOpacity={0.2}
                          shadowRadius={2}
                        >
                          {getIcon()}
                        </Stack>
                      </Stack>
                    </Stack>
                    <Text fontSize={10} color={themeColors.textMuted} numberOfLines={1}>
                      {activity.group.name}
                    </Text>
                  </YStack>
                </XStack>
              );
            })}
          </YStack>
        </Stack>
      </ScrollView>
    </Screen>
  );
}
