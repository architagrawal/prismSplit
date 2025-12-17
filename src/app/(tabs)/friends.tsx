/**
 * PrismSplit Friends Screen
 * 
 * View all friends across groups with direct balances.
 * Allows quick settle-up with individual people.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { RefreshControl, SectionList, Pressable, View, TextInput } from 'react-native';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, UserPlus, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { Screen, Card, Avatar, BalanceBadge } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGroupsStore, useUIStore } from '@/lib/store';
import { demoBalances } from '@/lib/api/demo';
import type { MemberBalance } from '@/types/models';

export default function FriendsScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { groups, fetchGroups } = useGroupsStore();
  const { searchQuery, setSearchQuery } = useUIStore();

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

  // Filter and group data
  const sections = useMemo(() => {
    const filtered = balances.filter(b =>
      b.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const owedToYou = filtered.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
    const youOwe = filtered.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
    const settled = filtered.filter(b => b.balance === 0);

    const result = [];
    if (owedToYou.length > 0) result.push({ title: 'OWED TO YOU', data: owedToYou });
    if (youOwe.length > 0) result.push({ title: 'YOU OWE', data: youOwe });
    if (settled.length > 0) result.push({ title: 'ALL SETTLED', data: settled });

    return result;
  }, [balances, searchQuery]);

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

  const handleRemindPress = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Remind:', userId);
  };

  const renderHeader = () => (
    <YStack paddingTop={insets.top > 0 ? 0 : '$4'} marginBottom="$2" paddingHorizontal="$4">
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$5">
        <YStack>
          <Text fontSize={32} fontWeight="800" color={themeColors.textPrimary} letterSpacing={-0.5}>
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
            colors={[themeColors.primary, '#4c669f']} // Fallback gradient if primaryDark not avail
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: themeColors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <UserPlus size={22} color="white" />
          </LinearGradient>
        </Pressable>
      </XStack>

      <XStack gap="$3" marginBottom="$5">
        <Card variant="elevated" flex={1} padding="$4" borderRadius={20} backgroundColor={themeColors.surface}>
          <YStack gap={4}>
            <Text fontSize={13} fontWeight="600" color={themeColors.textSecondary} textTransform="uppercase" letterSpacing={0.5}>
              Owed to you
            </Text>
            <Text fontSize={24} fontWeight="800" color={themeColors.success} letterSpacing={-0.5}>
              +${totalOwedToYou.toFixed(2)}
            </Text>
          </YStack>
        </Card>
        <Card variant="elevated" flex={1} padding="$4" borderRadius={20} backgroundColor={themeColors.surface}>
          <YStack gap={4}>
            <Text fontSize={13} fontWeight="600" color={themeColors.textSecondary} textTransform="uppercase" letterSpacing={0.5}>
              You owe
            </Text>
            <Text fontSize={24} fontWeight="800" color={themeColors.error} letterSpacing={-0.5}>
              -${totalYouOwe.toFixed(2)}
            </Text>
          </YStack>
        </Card>
      </XStack>

      {/* Custom Search Bar */}
      <XStack 
        backgroundColor={themeColors.surface} 
        height={48} 
        borderRadius={12} 
        alignItems="center" 
        paddingHorizontal="$3"
        borderWidth={1}
        borderColor={themeColors.border}
      >
        <Search size={18} color={themeColors.textMuted} />
        <TextInput
          placeholder="Search friends..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={themeColors.textMuted}
          style={{
            flex: 1,
            marginLeft: 10,
            fontSize: 16,
            color: themeColors.textPrimary,
            height: '100%'
          }}
        />
      </XStack>
    </YStack>
  );

  return (
    <Screen padded={false} backgroundColor={themeColors.background}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item, index, section }) => (
          <FriendRow
            friend={item}
            onPress={() => handleFriendPress(item.user_id)}
            onRemind={() => handleRemindPress(item.user_id)}
            isLast={index === section.data.length - 1}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={{ backgroundColor: themeColors.background, paddingVertical: 12, marginTop: 8, paddingHorizontal: 16 }}>
            <Text 
              fontSize={13} 
              fontWeight="700" 
              color={themeColors.textMuted}
              textTransform="uppercase"
              letterSpacing={1}
            >
              {title}
            </Text>
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<Stack height={100} />}
        ListEmptyComponent={
          <YStack alignItems="center" paddingVertical="$10" gap="$4">
            <Text fontSize={48}>👥</Text>
            <Text fontSize={16} color={themeColors.textSecondary} textAlign="center">
              {searchQuery 
                ? 'No friends found matching your search'
                : 'Add friends to start splitting bills!'
              }
            </Text>
          </YStack>
        }
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </Screen>
  );
}

// Friend row component
interface FriendRowProps {
  friend: MemberBalance;
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
        backgroundColor: pressed ? themeColors.surface : 'transparent', // Fallback from surfaceHighlight
        paddingHorizontal: 16
      })}
    >
      <XStack 
        alignItems="center" 
        gap="$3.5"
        paddingVertical="$3.5"
        borderBottomWidth={isLast ? 0 : 1}
        borderBottomColor={themeColors.border}
      >
        <Avatar
          name={friend.user.full_name}
          colorIndex={friend.color_index}
          size="lg"
        />
        
        <YStack flex={1} gap="$1">
          <Text fontSize={17} fontWeight="600" color={themeColors.textPrimary} numberOfLines={1}>
            {friend.user.full_name}
          </Text>
          <Text fontSize={14} color={themeColors.textSecondary} fontWeight="500">
            {friend.balance > 0 
              ? 'owes you' 
              : friend.balance < 0 
                ? 'you owe'
                : 'settled up'
            }
          </Text>
        </YStack>

        <YStack alignItems="flex-end" gap="$1.5">
          <BalanceBadge amount={friend.balance} size="md" />
          
          {friend.balance > 0 && (
            <Pressable 
              onPress={(e) => {
                e.stopPropagation();
                onRemind?.();
              }}
              hitSlop={10}
            >
              <Text fontSize={13} fontWeight="600" color={themeColors.primary}>
                Remind
              </Text>
            </Pressable>
          )}
        </YStack>
        
        <ChevronRight size={16} color={themeColors.textMuted} opacity={0.5} />
      </XStack>
    </Pressable>
  );
}
