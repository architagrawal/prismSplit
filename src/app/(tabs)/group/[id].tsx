/**
 * PrismSplit Group Detail Screen (with Tab Bar)
 * 
 * Uses groupsStore and billsStore.
 */

import { useState, useEffect } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, RefreshControl } from 'react-native';
import { 
  Settings, 
  UserPlus,
  Plus
} from 'lucide-react-native';

import { 
  Screen, 
  Card, 
  Avatar, 
  BillListItem,
  BalanceBadge,
  Button
} from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGroupsStore, useBillsStore } from '@/lib/store';
import { demoGroupMembers } from '@/lib/api/demo';
import { categoryIcons } from '@/types/models';

export default function GroupDetailScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'bills' | 'balances'>('bills');

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

  useEffect(() => {
    if (id) {
      fetchGroupById(id);
      fetchGroupMembers(id);
      fetchBillsByGroup(id);
    }
  }, [id]);

  const group = currentGroup;
  const groupMembers = members[id || ''] || demoGroupMembers[id || ''] || [];

  const onRefresh = () => {
    if (id) {
      fetchGroupById(id);
      fetchGroupMembers(id);
      fetchBillsByGroup(id);
    }
  };

  if (!group) {
    return (
      <Screen safeBottom={false}>
        <Stack flex={1} justifyContent="center" alignItems="center">
          <Text color={themeColors.textSecondary}>Loading...</Text>
        </Stack>
      </Screen>
    );
  }

  return (
    <Screen padded={false} safeBottom={false}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading || billsLoading} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Stack paddingHorizontal="$4" paddingTop="$2" paddingBottom="$4">
          <XStack justifyContent="flex-end" alignItems="center" marginBottom="$4">
            <Pressable onPress={() => router.push(`/group/settings?id=${id}` as any)}>
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

          {/* Balance Card */}
          <Card variant="elevated" marginBottom="$4">
            <YStack alignItems="center" gap="$1">
              <Text fontSize={14} color={themeColors.textSecondary}>
                Your Balance
              </Text>
              <BalanceBadge amount={group.your_balance ?? 0} size="lg" />
            </YStack>
          </Card>

          {/* Members */}
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
            <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
              Members
            </Text>
            <Pressable onPress={() => router.push(`/group/invite?id=${id}` as any)}>
              <XStack alignItems="center" gap="$1">
                <UserPlus size={18} color={themeColors.primary} />
                <Text fontSize={14} color={themeColors.primary}>Invite</Text>
              </XStack>
            </Pressable>
          </XStack>

          <XStack gap="$3" marginBottom="$6">
            {groupMembers.slice(0, 5).map((member) => (
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
        </Stack>

        {/* Content */}
        <YStack paddingHorizontal="$4" gap="$3" paddingBottom="$8">
          {activeTab === 'bills' ? (
            bills.length > 0 ? (
              bills.map((bill) => (
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
                  onPress={() => router.push(`/bill/${bill.id}` as any)}
                />
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
            groupMembers.map((member) => (
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
    </Screen>
  );
}
