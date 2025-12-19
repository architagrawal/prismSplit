/**
 * PrismSplit Group Detail Content Component
 * 
 * Shared component used by both tab and non-tab group detail screens.
 */

import { useState, useEffect, useMemo } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, SectionList } from 'react-native';
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
  Button,
  GroupImage,
  AnimatedSearchBar
} from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGroupsStore, useBillsStore, useAuthStore } from '@/lib/store';
import { demoGroupMembers, demoBalances } from '@/lib/api/demo';
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
  const [searchQuery, setSearchQuery] = useState('');

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

    // Convert to array format with daily and monthly totals
    return Object.entries(monthGroups).map(([monthKey, { monthLabel, days }]) => {
      const daysArray = Object.entries(days).map(([dayKey, dayBills]) => {
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
      });
      
      // Calculate monthly total
      const monthlyTotal = daysArray.reduce((sum, day) => sum + day.dailyTotal, 0);
      
      return {
        monthKey,
        monthLabel,
        monthlyTotal,
        days: daysArray,
      };
    });
  }, [bills]);

  // Filter grouped bills based on myViewOnly toggle, search, and category
  const filteredGroupedBills = useMemo(() => {
    return groupedBills
      .map((monthGroup) => {
        const filteredDays = monthGroup.days
          .map((dayGroup) => {
            const filteredBills = dayGroup.bills.filter((bill) => {
              // My View filter
              if (myViewOnly) {
                const isPayer = bill.payer.id === user?.id;
                const yourShare = bill.your_share ?? 0;
                if (!(yourShare > 0 || isPayer)) return false;
              }
              
              // Search filter
              if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                if (!bill.title.toLowerCase().includes(query)) return false;
              }
              
              return true;
            });
            const dailyTotal = filteredBills.reduce((sum, bill) => sum + (bill.your_share ?? 0), 0);
            return {
              ...dayGroup,
              bills: filteredBills,
              dailyTotal,
            };
          })
          .filter((dayGroup) => dayGroup.bills.length > 0);
        
        // Recalculate monthly total for filtered bills
        const monthlyTotal = filteredDays.reduce((sum, day) => sum + day.dailyTotal, 0);
        
        return {
          ...monthGroup,
          days: filteredDays,
          monthlyTotal,
        };
      })
      .filter((monthGroup) => monthGroup.days.length > 0);
  }, [groupedBills, myViewOnly, searchQuery, user?.id]);

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

  // Tab toggle UI - extracted to avoid type narrowing issues
  const tabsUI = (
    <XStack 
      backgroundColor={themeColors.surfaceElevated}
      borderRadius={10}
      padding="$0.5"
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
  );

  // Header content rendered for both tabs - using useMemo to prevent remounting
  const headerContent = (
    <Stack paddingHorizontal="$4" paddingTop="$2" paddingBottom="$2">
      {/* Top bar with back/settings */}
      <XStack justifyContent={showBackButton ? "space-between" : "flex-end"} alignItems="center" marginBottom="$2">
        {showBackButton && (
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={themeColors.textPrimary} />
          </Pressable>
        )}
        <Pressable onPress={() => router.push(`/group/settings?id=${groupId}` as any)}>
          <Settings size={24} color={themeColors.textPrimary} />
        </Pressable>
      </XStack>

      {/* Hero Row: Group Info + Members */}
      <XStack alignItems="center" justifyContent="space-between" marginBottom="$3">
        {/* Left: Group image + name */}
        <XStack alignItems="center" gap="$3" flex={1}>
          <GroupImage groupId={groupId} size="md" />
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="700" color={themeColors.textPrimary} numberOfLines={1}>
              {group.name}
            </Text>
            <Text fontSize={12} color={themeColors.textSecondary}>
              {group.member_count} members • {group.currency}
            </Text>
          </YStack>
        </XStack>
        
        {/* Right: Member avatars */}
        <XStack alignItems="center">
          {groupMembers.slice(0, 4).map((member: GroupMember, index: number) => (
            <Stack 
              key={member.id} 
              marginLeft={index > 0 ? -8 : 0}
              borderWidth={2}
              borderColor={themeColors.background}
              borderRadius={16}
            >
              <Avatar
                name={member.user.full_name}
                colorIndex={member.color_index}
                size="sm"
              />
            </Stack>
          ))}
          {groupMembers.length > 4 && (
            <Stack
              marginLeft={-8}
              width={28}
              height={28}
              borderRadius={14}
              backgroundColor={themeColors.border}
              justifyContent="center"
              alignItems="center"
              borderWidth={2}
              borderColor={themeColors.background}
            >
              <Text fontSize={10} color={themeColors.textSecondary}>
              +{groupMembers.length - 4}
              </Text>
            </Stack>
          )}
        </XStack>
      </XStack>
    </Stack>
  );

  // Balance Row Component
  const balanceRow = (
    <XStack 
      paddingHorizontal="$4" 
      paddingBottom="$2"
      alignItems="center"
      justifyContent="space-between"
    >
      <XStack 
        backgroundColor={themeColors.surfaceElevated}
        borderRadius={10}
        padding="$2"
        paddingHorizontal="$3"
        alignItems="center"
        justifyContent="space-between"
        flex={1}
      >
        <XStack alignItems="center" gap="$2">
          <Text fontSize={12} color={themeColors.textSecondary}>Balance:</Text>
          <BalanceBadge amount={group.your_balance ?? 0} size="md" />
        </XStack>
        {(group.your_balance ?? 0) !== 0 && (
          <Button
            variant={group.your_balance! < 0 ? 'primary' : 'outlined'}
            size="sm"
            icon={<SendHorizontal size={14} color={group.your_balance! < 0 ? 'white' : themeColors.primary} />}
            onPress={() => {
              router.push(`/group/settings?id=${groupId}` as any);
            }}
          >
            Settle Up
          </Button>
        )}
      </XStack>
    </XStack>
  );

  // Filters Component (Search + View Toggle)
  const filtersUI = (
    <XStack 
      alignItems="center" 
      justifyContent="space-between"
      paddingHorizontal="$4"
      paddingTop="$2"
      paddingBottom="$2"
    >
      {/* Animated Search Bar */}
      <AnimatedSearchBar
        placeholder="Search..."
        onSearchChange={setSearchQuery}
        expandedWidth={120}
        iconSize={22}
      />

      {/* My View Toggle */}
      <Pressable onPress={() => setMyViewOnly(!myViewOnly)}>
        <XStack 
          alignItems="center" 
          gap="$2"
        >
          {myViewOnly ? (
            <EyeClosed size={17} color={themeColors.primary} />
          ) : (
            <Eye size={17} color={themeColors.primary} />
          )}
          <Text
            fontSize={14}
            fontWeight="500"
            color={themeColors.primary}
          >
            {myViewOnly ? 'Your Bills' : 'All Bills'}
          </Text>
        </XStack>
      </Pressable>
    </XStack>
  );

  return (
    <Stack flex={1} backgroundColor={themeColors.background}>
      {/* Persistent Header Section */}
      <Stack zIndex={10} backgroundColor={themeColors.background}>
        {headerContent}
        {balanceRow}
        <Stack paddingHorizontal="$4" paddingBottom="$2">
          {tabsUI}
        </Stack>
      </Stack>

      {/* Scrollable Content Area */}
      <Stack flex={1}>
        {activeTab === 'bills' ? (
          <SectionList
            sections={filteredGroupedBills.map((monthGroup) => ({
              key: monthGroup.monthKey,
              monthLabel: monthGroup.monthLabel,
              monthlyTotal: monthGroup.monthlyTotal,
              data: monthGroup.days.flatMap((dayGroup) => 
                dayGroup.bills.map((bill) => ({ ...bill, dayLabel: dayGroup.dayLabel, dayKey: dayGroup.dayKey }))
              ),
            }))}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled={true}
            refreshControl={
              <RefreshControl refreshing={isLoading || billsLoading} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 32 }}
            ListHeaderComponent={filtersUI}
            renderSectionHeader={({ section }) => (
            <XStack
              justifyContent="space-between"
              alignItems="center"
              backgroundColor={themeColors.background}
              paddingVertical="$3"
              paddingHorizontal="$4"
            >
              <Text
                fontSize={14}
                fontWeight="700"
                color={themeColors.textPrimary}
              >
                {section.monthLabel}
              </Text>
              {section.monthlyTotal > 0 && (
                <Text
                  fontSize={12}
                  fontWeight="500"
                  color={themeColors.textSecondary}
                >
                  Your Total: ${section.monthlyTotal.toFixed(2)}
                </Text>
              )}
            </XStack>
          )}
          renderItem={({ item, index, section }) => {
            const prevItem = index > 0 ? section.data[index - 1] : null;
            const showDayHeader = !prevItem || prevItem.dayKey !== item.dayKey;
            
            return (
              <YStack paddingHorizontal="$4">
                {showDayHeader && (
                  <XStack 
                    paddingVertical="$2" 
                    alignItems="center"
                    borderBottomWidth={1}
                    borderBottomColor={themeColors.border}
                    marginTop={index === 0 ? 0 : '$2'}
                  >
                    <Text
                      fontSize={12}
                      fontWeight="500"
                      color={themeColors.textSecondary}
                    >
                      {item.dayLabel}
                    </Text>
                  </XStack>
                )}
                <BillListItem
                  title={item.title}
                  category={item.category}
                  categoryIcon={categoryIcons[item.category]}
                  amount={item.total_amount}
                  yourShare={item.your_share ?? 0}
                  date={new Date(item.bill_date).toLocaleDateString()}
                  payerName={item.payer.full_name}
                  payerColorIndex={groupMembers.find(m => m.user_id === item.payer.id)?.color_index ?? 0}
                  participants={[]}
                  variant="compact"
                  isPayer={item.payer.id === user?.id}
                  itemCount={(item as any).item_count ?? 0}
                  onPress={() => router.push(`/bill/${item.id}` as any)}
                />
              </YStack>
            );
          }}
          ListEmptyComponent={
            <YStack alignItems="center" paddingVertical="$8" paddingHorizontal="$4" gap="$4">
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
          }
        />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={isLoading || billsLoading} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            <YStack paddingHorizontal="$4" paddingBottom="$8" paddingTop="$4">
              {groupMembers.map((member: GroupMember, index: number) => {
                // Get balance from demo data (mocking store)
                const balanceObj = demoBalances.find(b => b.user_id === member.user_id);
                const balance = balanceObj ? balanceObj.balance : 0;

                // Calculate participation metrics
                const participationCount = bills.filter(bill => {
                  const isPayer = bill.payer.id === member.user_id;
                  // In demo data, participant_avatars contains user IDs
                  const isParticipant = bill.participant_avatars?.includes(member.user_id);
                  return isPayer || isParticipant;
                }).length;

                return (
                <XStack 
                  key={member.id} 
                  alignItems="center" 
                  gap="$3"
                  paddingVertical="$3"
                  borderBottomWidth={index === groupMembers.length - 1 ? 0 : 1}
                  borderBottomColor={themeColors.border}
                >
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
                      Involved in {participationCount} expense{participationCount === 1 ? '' : 's'}
                    </Text>
                  </YStack>
                  
                  {/* Stacked Balance Display */}
                  <YStack alignItems="flex-end" justifyContent="center">
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
                  </YStack>
                </XStack>
              );
              })}
            </YStack>
          </ScrollView>
        )}
      </Stack>
    </Stack>
  );
}
