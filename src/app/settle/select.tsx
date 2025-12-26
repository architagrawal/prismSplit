/**
 * Settle Selection Screen
 * 
 * Lists people the user owes money to, using balancesStore.
 */

import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { ArrowLeft, Bell, Scale, SendHorizontal } from 'lucide-react-native';
import { Pressable, Alert, SectionList } from 'react-native';

import { Screen, Card, Avatar } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBalancesStore, useGroupsStore } from '@/lib/store';

interface BalanceItem {
  userId: string;
  name: string;
  colorIndex: number;
  balance: number;
  type: 'pay' | 'remind';
}

export default function SettleSelectScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const themeColors = useThemeColors();
  
  const { groupBalances, fetchBalancesForGroup, isLoading } = useBalancesStore();
  const { currentGroup, fetchGroupById } = useGroupsStore();

  // Fetch data on mount
  useEffect(() => {
    if (groupId) {
      fetchBalancesForGroup(groupId);
      fetchGroupById(groupId);
    }
  }, [groupId]);

  const groupBalance = groupId ? groupBalances[groupId] : null;
  const groupName = groupBalance?.groupName || currentGroup?.name || 'Group';

  // Build pay/remind lists from balance data
  const payItems: BalanceItem[] = [];
  const remindItems: BalanceItem[] = [];

  if (groupBalance?.withFriends) {
    Object.entries(groupBalance.withFriends).forEach(([userId, friend]) => {
      if (friend.balance < 0) {
        // Negative balance = I owe them
        payItems.push({
          userId,
          name: friend.name,
          colorIndex: friend.colorIndex,
          balance: friend.balance,
          type: 'pay',
        });
      } else if (friend.balance > 0) {
        // Positive balance = they owe me
        remindItems.push({
          userId,
          name: friend.name,
          colorIndex: friend.colorIndex,
          balance: friend.balance,
          type: 'remind',
        });
      }
    });
  }

  const sections = [
    { title: 'You owe', data: payItems },
    { title: 'Owes you', data: remindItems }
  ].filter(s => s.data.length > 0);

  const handleAction = (item: BalanceItem) => {
    if (item.type === 'pay') {
      router.push(`/settle/${item.userId}?groupId=${groupId}` as any);
    } else {
      // Send Reminder
      Alert.alert(
        "Reminder Sent",
        `A gentle reminder has been sent to ${item.name}.`,
        [{ text: "OK" }]
      );
    }
  };

  const renderItem = ({ item }: { item: BalanceItem }) => (
    <Pressable onPress={() => handleAction(item)}>
      <XStack 
        paddingVertical="$3" 
        paddingHorizontal="$4"
        alignItems="center" 
        justifyContent="space-between"
        backgroundColor={themeColors.surface}
        borderBottomWidth={1}
        borderBottomColor={themeColors.border}
      >
        <XStack alignItems="center" gap="$3">
          <Avatar 
            name={item.name} 
            colorIndex={item.colorIndex}
            size="md"
          />
          <YStack>
            <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
              {item.name}
            </Text>
            <Text fontSize={13} color={item.type === 'pay' ? themeColors.error : themeColors.success}>
              {item.type === 'pay' ? 'You owe' : 'Owes you'} ${Math.abs(item.balance).toFixed(2)}
            </Text>
          </YStack>
        </XStack>
        
        <Stack
             paddingHorizontal="$3"
             paddingVertical="$1.5"
             borderRadius={8}
             backgroundColor={themeColors.surfaceElevated}
             borderColor={themeColors.border}
             borderWidth={1}
             width={100}
             alignItems="center"
        >
             {item.type === 'pay' ? (
                <XStack gap="$2.5" alignItems="center">
                   <SendHorizontal size={14} color={themeColors.primary} />
                   <Text fontSize={13} fontWeight="600" color={themeColors.primary}>Send</Text>
                </XStack>
             ) : (
                <XStack gap="$2" alignItems="center">
                   <Bell size={14} color={themeColors.primary} />
                   <Text fontSize={13} fontWeight="600" color={themeColors.primary}>Remind</Text>
                </XStack>
             )}
        </Stack>
      </XStack>
    </Pressable>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <XStack 
      paddingHorizontal="$4" 
      paddingVertical="$2" 
      backgroundColor={themeColors.background}
      borderBottomWidth={1}
      borderBottomColor={themeColors.border}
    >
      <Text fontSize={13} fontWeight="600" color={themeColors.textSecondary} textTransform="uppercase">
        {title}
      </Text>
    </XStack>
  );

  return (
    <Screen scroll={false}>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$4" paddingBottom="$4">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color={themeColors.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
          Settle Up
        </Text>
        <Stack width={24} />
      </XStack>

      {/* Info Card */}
      <YStack paddingHorizontal="$4" paddingBottom="$4">
         <Card variant="surface" padding="$3">
            <XStack gap="$3" alignItems="flex-start">
               <Scale size={20} color={themeColors.textSecondary} style={{ marginTop: 2 }} />
               <YStack flex={1} gap="$1">
                  <Text fontSize={14} fontWeight="600" color={themeColors.textPrimary}>
                    {groupName} Balances
                  </Text>
                  <Text fontSize={13} color={themeColors.textSecondary} lineHeight={18}>
                    These are your debts within this group only. To settle your total balance across all groups, visit the Friends tab.
                  </Text>
               </YStack>
            </XStack>
         </Card>
      </YStack>

      {/* List */}
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.userId + item.type}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        stickySectionHeadersEnabled={false}
        refreshing={isLoading}
        ListEmptyComponent={
             <YStack padding="$8" alignItems="center">
                 <Text color={themeColors.textSecondary}>
                   {isLoading ? 'Loading...' : 'You are all settled up in this group!'}
                 </Text>
             </YStack>
        }
      />
    </Screen>
  );
}
