/**
 * Settle Selection Screen
 * 
 * Lists people the user owes money to.
 */

import { useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { ArrowLeft, User, Search, Bell, Scale, SendHorizontal } from 'lucide-react-native';
import { Pressable, Alert, SectionList } from 'react-native';

import { Screen, Card, Avatar, AnimatedSearchBar } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { demoBalances, demoUsers, demoGroups } from '@/lib/api/demo';

export default function SettleSelectScreen() {
  const { groupId, type } = useLocalSearchParams<{ groupId: string, type?: string }>();
  const router = useRouter();
  const themeColors = useThemeColors();

  // Find Group Name
  const group = demoGroups.find(g => g.id === groupId);
  const groupName = group?.name || 'Group';

  // 1. People I owe (Pay)
  const payItems = demoBalances
    .filter(b => b.balance < 0)
    .map(b => {
       const user = demoUsers.find(u => u.id === b.user_id);
       return { ...b, user: user || demoUsers[0], type: 'pay' as const };
    });

  // 2. People who owe me (Remind)
  const remindItems = demoBalances
    .filter(b => b.balance > 0)
    .map(b => {
       const user = demoUsers.find(u => u.id === b.user_id);
       return { ...b, user: user || demoUsers[0], type: 'remind' as const };
    });

  const sections = [
    { title: 'You owe', data: payItems },
    { title: 'Owes you', data: remindItems }
  ].filter(s => s.data.length > 0);

  const handleAction = (item: typeof payItems[0] | typeof remindItems[0]) => {
    if (item.type === 'pay') {
      router.push(`/settle/${item.user_id}?groupId=${groupId}` as any);
    } else {
      // Send Reminder
      Alert.alert(
        "Reminder Sent",
        `A gentle reminder has been sent to ${item.user.full_name}.`,
        [{ text: "OK" }]
      );
    }
  };

  const renderItem = ({ item }: { item: typeof payItems[0] | typeof remindItems[0] }) => (
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
            name={item.user.full_name} 
            colorIndex={item.color_index}
            size="md"
          />
          <YStack>
            <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
              {item.user.full_name}
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
             width={100} // Fixed width for alignment
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
        keyExtractor={(item) => item.user_id + item.type}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
             <YStack padding="$8" alignItems="center">
                 <Text color={themeColors.textSecondary}>You are all settled up in this group!</Text>
             </YStack>
        }
      />
    </Screen>
  );
}
