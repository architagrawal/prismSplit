/**
 * PrismSplit Group Detail Content Component
 * 
 * Shared component used by both tab and non-tab group detail screens.
 */

import { useState, useEffect, useMemo } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl } from 'react-native';
import { 
  ArrowLeft, 
  Settings, 
  UserPlus,
  Plus,
  SendHorizontal,
  Eye,
  EyeClosed
} from 'lucide-react-native';

import { 
  Card, 
  Avatar, 
  BillListItem,
  BalanceBadge,
  Button
} from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGroupsStore, useBillsStore, useAuthStore } from '@/lib/store';
import { demoGroupMembers } from '@/lib/api/demo';
import { categoryIcons } from '@/types/models';
import type { Group, GroupMember, Bill } from '@/types/models';

interface GroupDetailContentProps {
  groupId: string;
  showBackButton?: boolean; // True for standalone, false for tabs
}

export function GroupDetailContent({ 
  groupId, 
  showBackButton = true 
}: GroupDetailContentProps) {
  const router = useRouter();
  const themeColors = useThemeColors();
  const [activeTab, setActiveTab] = useState<'bills' | 'balances'>('bills');
  const [myViewOnly, setMyViewOnly] = useState(false);

  const { 
    currentGroup, 
    members, 
    isLoading, 
    fetchGroupById, 
    fetchGroupMembers 
  } = useGroupsStore();
  
  const { 
    bills, 
    isLoading: billsLoading, 
    fetchBillsByGroup 
  } = useBillsStore();

  const { user } = useAuthStore();

  // Group bills by Month/Year, then by Day
  const groupedBills = useMemo(() => {
    if (!bills.length) return [];

    // Sort bills by date descending
    const sortedBills = [...bills].sort(
      (a, b) => new Date(b.bill_date).getTime() - new Date(a.bill_date).getTime()
    );

    // Group by month
    const monthGroups: Record<string, { monthLabel: string; days: Record<string, Bill[]> }> = {};

    sortedBills.forEach((bill) => {
      const date = new Date(bill.bill_date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const dayKey = date.toISOString().split('T')[0];

      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = { monthLabel, days: {} };
      }
      if (!monthGroups[monthKey].days[dayKey]) {
        monthGroups[monthKey].days[dayKey] = [];
      }
      monthGroups[monthKey].days[dayKey].push(bill);
    });

    // Convert to array format with daily totals
    return Object.entries(monthGroups).map(([monthKey, { monthLabel, days }]) => ({
      monthKey,
      monthLabel,
      days: Object.entries(days).map(([dayKey, dayBills]) => {
        const date = new Date(dayKey);
        // Calculate daily total (user's share for the day)
        const dailyTotal = dayBills.reduce((sum, bill) => {
          const share = bill.your_share ?? 0;
          return sum + share;
        }, 0);
        return {
          dayKey,
          dayLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          bills: dayBills,
          dailyTotal,
        };
      }),
    }));
  }, [bills]);

  // Filter grouped bills based on myViewOnly toggle
  const filteredGroupedBills = useMemo(() => {
    if (!myViewOnly) return groupedBills;

    return groupedBills
      .map((monthGroup) => ({
        ...monthGroup,
        days: monthGroup.days
          .map((dayGroup) => {
            const filteredBills = dayGroup.bills.filter((bill) => {
              const isPayer = bill.payer.id === user?.id;
              const yourShare = bill.your_share ?? 0;
              return yourShare > 0 || isPayer;
            });
            const dailyTotal = filteredBills.reduce((sum, bill) => sum + (bill.your_share ?? 0), 0);
            return {
              ...dayGroup,
              bills: filteredBills,
              dailyTotal,
            };
          })
          .filter((dayGroup) => dayGroup.bills.length > 0),
      }))
      .filter((monthGroup) => monthGroup.days.length > 0);
  }, [groupedBills, myViewOnly, user?.id]);

  useEffect(() => {
    if (groupId) {
      fetchGroupById(groupId);
      fetchGroupMembers(groupId);
      fetchBillsByGroup(groupId);
    }
  }, [groupId]);

  const group = currentGroup;
  const groupMembers = members[groupId || ''] || demoGroupMembers[groupId || ''] || [];

  const onRefresh = () => {
    if (groupId) {
      fetchGroupById(groupId);
      fetchGroupMembers(groupId);
      fetchBillsByGroup(groupId);
    }
  };

  if (!group) {
    return (
      <Stack flex={1} justifyContent="center" alignItems="center">
        <Text color={themeColors.textSecondary}>Loading...</Text>
      </Stack>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={isLoading || billsLoading} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Stack paddingHorizontal="$4" paddingTop="$2" paddingBottom="$4">
        <XStack justifyContent={showBackButton ? "space-between" : "flex-end"} alignItems="center" marginBottom="$4">
          {showBackButton && (
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={24} color={themeColors.textPrimary} />
            </Pressable>
          )}
          <Pressable onPress={() => router.push(`/group/settings?id=${groupId}` as any)}>
            <Settings size={24} color={themeColors.textPrimary} />
          </Pressable>
        </XStack>

        {/* Group Info */}
        <YStack alignItems="center" gap="$2" marginBottom="$4">
          <Stack
            width={80}
            height={80}
            borderRadius={20}
            backgroundColor={themeColors.surfaceElevated}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize={40}>{group.emoji}</Text>
          </Stack>
          <Text fontSize={24} fontWeight="700" color={themeColors.textPrimary}>
            {group.name}
          </Text>
          <Text fontSize={14} color={themeColors.textSecondary}>
            {group.member_count} members • {group.currency}
          </Text>
        </YStack>

        {/* Balance Card with Settle Up */}
        <Card variant="elevated" marginBottom="$4">
          <YStack alignItems="center" gap="$2">
            <Text fontSize={14} color={themeColors.textSecondary}>
              Your Balance
            </Text>
            <BalanceBadge amount={group.your_balance ?? 0} size="lg" />
            {(group.your_balance ?? 0) !== 0 && (
              <Button
                variant={group.your_balance! < 0 ? 'primary' : 'outlined'}
                size="sm"
                icon={<SendHorizontal size={16} color={group.your_balance! < 0 ? 'white' : themeColors.primary} />}
                onPress={() => {
                  // TODO: Navigate to settle up flow
                  router.push(`/group/settings?id=${groupId}` as any);
                }}
              >
                Settle Up
              </Button>
            )}
          </YStack>
        </Card>

        {/* Members */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
          <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
            Members
          </Text>
          <Pressable onPress={() => router.push(`/group/invite?id=${groupId}` as any)}>
            <XStack alignItems="center" gap="$1">
              <UserPlus size={18} color={themeColors.primary} />
              <Text fontSize={14} color={themeColors.primary}>Invite</Text>
            </XStack>
          </Pressable>
        </XStack>

        <XStack gap="$3" marginBottom="$6">
          {groupMembers.slice(0, 5).map((member: GroupMember) => (
            <YStack key={member.id} alignItems="center" gap="$1">
              <Avatar
                name={member.user.full_name}
                colorIndex={member.color_index}
                size="lg"
              />
              <Text 
                fontSize={12} 
                color={themeColors.textSecondary}
                numberOfLines={1}
              >
                {member.user.full_name.split(' ')[0]}
              </Text>
            </YStack>
          ))}
          {groupMembers.length > 5 && (
            <YStack alignItems="center" gap="$1">
              <Stack
                width={48}
                height={48}
                borderRadius={24}
                backgroundColor={themeColors.border}
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize={14} color={themeColors.textSecondary}>
                  +{groupMembers.length - 5}
                </Text>
              </Stack>
            </YStack>
          )}
        </XStack>

        {/* Tabs */}
        <XStack 
          backgroundColor={themeColors.surfaceElevated}
          borderRadius={12}
          padding="$1"
          marginBottom="$4"
        >
          <Pressable 
            style={{ flex: 1 }}
            onPress={() => setActiveTab('bills')}
          >
            <Stack
              paddingVertical="$2"
              borderRadius={10}
              backgroundColor={activeTab === 'bills' ? themeColors.surface : 'transparent'}
              alignItems="center"
            >
              <Text 
                fontWeight={activeTab === 'bills' ? '600' : '400'}
                color={activeTab === 'bills' ? themeColors.textPrimary : themeColors.textSecondary}
              >
                Bills
              </Text>
            </Stack>
          </Pressable>
          <Pressable 
            style={{ flex: 1 }}
            onPress={() => setActiveTab('balances')}
          >
            <Stack
              paddingVertical="$2"
              borderRadius={10}
              backgroundColor={activeTab === 'balances' ? themeColors.surface : 'transparent'}
              alignItems="center"
            >
              <Text 
                fontWeight={activeTab === 'balances' ? '600' : '400'}
                color={activeTab === 'balances' ? themeColors.textPrimary : themeColors.textSecondary}
              >
                Balances
              </Text>
            </Stack>
          </Pressable>
        </XStack>

            {/* My View Toggle - shows action, not current state */}
        {activeTab === 'bills' && bills.length > 0 && (
          <Pressable onPress={() => setMyViewOnly(!myViewOnly)}>
            <XStack 
              alignItems="center" 
              justifyContent="flex-end"
              gap="$2"
              paddingVertical="$2"
            >
              {myViewOnly ? (
                <EyeClosed size={16} color={themeColors.primary} />
              ) : (
                <Eye size={16} color={themeColors.primary} />
              )}
              <Text
                fontSize={13}
                fontWeight="500"
                color={themeColors.primary}
                minWidth={60}
                textAlign="left"
              >
              {myViewOnly ? 'Your Bills' : 'All Bills'}
              </Text>
            </XStack>
          </Pressable>
        )}
      </Stack>

      {/* Content */}
      <YStack paddingHorizontal="$4" paddingBottom="$8">
        {activeTab === 'bills' ? (
          filteredGroupedBills.length > 0 ? (
            filteredGroupedBills.map((monthGroup) => (
              <YStack key={monthGroup.monthKey} gap="$2">
                {/* Month Header */}
                <Text
                  fontSize={13}
                  fontWeight="600"
                  color={themeColors.textMuted}
                  marginTop="$4"
                  marginBottom="$2"
                >
                  {monthGroup.monthLabel}
                </Text>

                  {monthGroup.days.map((dayGroup) => (
                    <YStack key={dayGroup.dayKey}>
                      {/* Day Header with Daily Total */}
                      <XStack 
                        paddingVertical="$2" 
                        alignItems="center"
                        justifyContent="space-between"
                        borderBottomWidth={1}
                        borderBottomColor={themeColors.border}
                      >
                        <Text
                          fontSize={12}
                          fontWeight="500"
                          color={themeColors.textSecondary}
                        >
                          {dayGroup.dayLabel}
                        </Text>
                        {dayGroup.dailyTotal > 0 && (
                          <Text
                            fontSize={12}
                            fontWeight="500"
                            color={themeColors.textMuted}
                          >
                            Your share: ${dayGroup.dailyTotal.toFixed(2)}
                          </Text>
                        )}
                      </XStack>

                    {/* Bills for this day */}
                    {dayGroup.bills.map((bill) => (
                      <BillListItem
                        key={bill.id}
                        title={bill.title}
                        category={bill.category}
                        categoryIcon={categoryIcons[bill.category]}
                        amount={bill.total_amount}
                        yourShare={bill.your_share ?? 0}
                        date={new Date(bill.bill_date).toLocaleDateString()}
                        payerName={bill.payer.full_name}
                        participants={[]}
                        variant="compact"
                        isPayer={bill.payer.id === user?.id}
                        onPress={() => router.push(`/bill/${bill.id}` as any)}
                      />
                    ))}
                  </YStack>
                ))}
              </YStack>
            ))
          ) : (
            <YStack alignItems="center" paddingVertical="$8" gap="$4">
              <Text fontSize={16} color={themeColors.textSecondary}>
                No bills yet
              </Text>
              <Button
                variant="primary"
                icon={<Plus size={18} color="white" />}
                onPress={() => router.push('/bill/create' as any)}
              >
                Create First Bill
              </Button>
            </YStack>
          )
        ) : (
          groupMembers.map((member: GroupMember) => (
            <Card key={member.id} variant="surface">
              <XStack alignItems="center" gap="$3">
                <Avatar
                  name={member.user.full_name}
                  colorIndex={member.color_index}
                  size="md"
                />
                <YStack flex={1}>
                  <Text fontSize={16} fontWeight="500" color={themeColors.textPrimary}>
                    {member.user.full_name}
                  </Text>
                  <Text fontSize={12} color={themeColors.textSecondary}>
                    {member.role === 'admin' ? 'Admin' : 'Member'}
                  </Text>
                </YStack>
                <BalanceBadge amount={0} size="sm" />
              </XStack>
            </Card>
          ))
        )}
      </YStack>
    </ScrollView>
  );
}
