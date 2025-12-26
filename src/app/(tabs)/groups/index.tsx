/**
 * PrismSplit Groups Tab
 * 
 * Clean design with filter pills, search, balance display, and group images.
 */

import { useEffect, useState, useMemo } from 'react';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, Pressable } from 'react-native';
import { Sparkles, Plus } from 'lucide-react-native';

import { Screen, AvatarGroup, GroupImage, Button, AnimatedSearchBar } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGroupsStore, useUIStore } from '@/lib/store';

type FilterOption = 'all' | 'owe' | 'owed';

export default function GroupsScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { groups, members, isLoading, fetchGroups, fetchGroupMembers } = useGroupsStore();
  const { searchQuery, setSearchQuery, clearSearch } = useUIStore();
  
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  useEffect(() => {
    fetchGroups();
    return () => clearSearch();
  }, []);

  // Fetch members for each group when groups change
  useEffect(() => {
    groups.forEach(group => {
      if (!members[group.id]) {
        fetchGroupMembers(group.id);
      }
    });
  }, [groups]);

  // Filter and sort groups
  const processedGroups = useMemo(() => {
    let result = [...groups];
    
    if (searchQuery) {
      result = result.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterBy === 'owe') {
      result = result.filter(g => (g.your_balance || 0) < 0);
    } else if (filterBy === 'owed') {
      result = result.filter(g => (g.your_balance || 0) > 0);
    }
    
    return result;
  }, [groups, searchQuery, filterBy]);

  const onRefresh = () => {
    fetchGroups();
  };

  const getMemberPreviews = (groupId: string) => {
    const groupMembers = members[groupId] || [];
    return groupMembers.map(m => ({
      name: m.user.full_name,
      imageUrl: m.user.avatar_url,
      colorIndex: m.color_index,
    }));
  };

  // Filter chip component
  const FilterChip = ({ label, value, isActive }: { label: string; value: FilterOption; isActive: boolean }) => (
    <Pressable onPress={() => setFilterBy(value)}>
      <Stack
        paddingHorizontal="$4"
        paddingVertical={10}
        borderRadius={24}
        backgroundColor={isActive ? themeColors.primary : 'transparent'}
        borderWidth={1}
        borderColor={isActive ? themeColors.primary : themeColors.border}
      >
        <Text
          fontSize={13}
          fontWeight={isActive ? '600' : '500'}
          color={isActive ? 'white' : themeColors.textSecondary}
        >
          {label}
        </Text>
      </Stack>
    </Pressable>
  );

  return (
    <Screen padded={false}>
      <YStack flex={1} backgroundColor={themeColors.background}>
        {/* Header */}
        <YStack paddingHorizontal="$4" paddingTop="$3" paddingBottom="$2">
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
            <Text fontSize={28} fontWeight="700" color={themeColors.textPrimary}>
              Groups
            </Text>
            
            <XStack alignItems="center" gap="$3">
              {/* Animated Search */}
              {groups.length >= 5 && (
                <AnimatedSearchBar
                  placeholder="Search..."
                  onSearchChange={setSearchQuery}
                  expandedWidth={80}
                />
              )}
              
              {/* Join Button */}
              <Pressable onPress={() => router.push('/group/join' as any)}>
                <XStack 
                  alignItems="center" 
                  gap="$2"
                  backgroundColor={themeColors.surfaceElevated}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius={20}
                >
                  <Text fontSize={13} fontWeight="600" color={themeColors.primary}>
                    Join
                  </Text>
                </XStack>
              </Pressable>
            </XStack>
          </XStack>

          {/* Filter Chips */}
          {groups.length > 0 && (
            <XStack gap="$2">
              <FilterChip label="All" value="all" isActive={filterBy === 'all'} />
              <FilterChip label="You owe" value="owe" isActive={filterBy === 'owe'} />
              <FilterChip label="Owed to you" value="owed" isActive={filterBy === 'owed'} />
            </XStack>
          )}
        </YStack>

        {/* Groups List */}
        <ScrollView
          refreshControl={
            <RefreshControl 
              refreshing={isLoading} 
              onRefresh={onRefresh}
              tintColor={themeColors.primary}
              colors={[themeColors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Promotional Prompt - always show when groups exist */}
          {groups.length > 0 && (
            <Pressable onPress={() => router.push('/group/create' as any)}>
              <XStack 
                marginHorizontal="$4"
                marginTop="$3"
                backgroundColor={themeColors.surfaceElevated}
                borderRadius={16}
                padding="$3"
                alignItems="center"
                gap="$3"
                borderWidth={1}
                borderColor={themeColors.border}
              >
                <Stack
                  width={40}
                  height={40}
                  borderRadius={12}
                  backgroundColor={themeColors.primary + '15'}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Sparkles size={20} color={themeColors.primary} />
                </Stack>
                <YStack flex={1}>
                  <Text fontSize={14} fontWeight="600" color={themeColors.textPrimary}>
                    Create a new group
                  </Text>
                  <Text fontSize={12} color={themeColors.textMuted}>
                    Track expenses with friends
                  </Text>
                </YStack>
                <Stack
                  width={28}
                  height={28}
                  borderRadius={14}
                  backgroundColor={themeColors.primary}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Plus size={16} color="white" />
                </Stack>
              </XStack>
            </Pressable>
          )}

          {/* Group List */}
          <YStack paddingTop="$3">
            {processedGroups.map((group) => {
              const members = getMemberPreviews(group.id);
              
              return (
                <Pressable 
                  key={group.id}
                  onPress={() => router.push(`/(tabs)/groups/${group.id}` as any)}
                >
                  <XStack
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                    alignItems="center"
                    gap="$3"
                    borderBottomWidth={1}
                    borderBottomColor={themeColors.border}
                  >
                    {/* Group Image */}
                    <GroupImage groupId={group.id} size="lg" />
                    
                    {/* Content */}
                    <YStack flex={1} gap={4}>
                      <Text 
                        fontSize={16} 
                        fontWeight="600" 
                        color={themeColors.textPrimary}
                      >
                        {group.name}
                      </Text>
                      
                      {/* Member Avatars */}
                      <AvatarGroup users={members} size="sm" max={4} />
                    </YStack>
                    
                    {/* Balance */}
                    <YStack alignItems="flex-end" justifyContent="center">
                      {(group.your_balance || 0) !== 0 ? (
                        <>
                          <Text fontSize={11} color={themeColors.textMuted}>
                            {(group.your_balance || 0) > 0 ? 'you get' : 'you give'}
                          </Text>
                          <Text 
                            fontSize={16} 
                            fontWeight="700" 
                            color={(group.your_balance || 0) > 0 ? themeColors.success : themeColors.error}
                          >
                            ${Math.abs(group.your_balance || 0).toFixed(2)}
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
                </Pressable>
              );
            })}
          </YStack>
          
          {/* Empty State */}
          {processedGroups.length === 0 && (
            <YStack 
              flex={1} 
              justifyContent="center" 
              alignItems="center" 
              paddingTop="$16"
              paddingHorizontal="$4"
              gap="$4"
            >
              {groups.length === 0 && !isLoading ? (
                <>
                  <Stack
                    width={88}
                    height={88}
                    borderRadius={44}
                    backgroundColor={themeColors.surfaceElevated}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text fontSize={40}>👥</Text>
                  </Stack>
                  <YStack alignItems="center" gap="$2">
                    <Text fontSize={20} fontWeight="600" color={themeColors.textPrimary}>
                      No groups yet
                    </Text>
                    <Text fontSize={15} color={themeColors.textSecondary} textAlign="center">
                      Create a group to start splitting{'\n'}expenses with friends
                    </Text>
                  </YStack>
                  <YStack gap="$3" width="100%">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onPress={() => router.push('/group/create' as any)}
                      icon={<Plus size={18} color="white" />}
                    >
                      Create Group
                    </Button>
                  </YStack>
                </>
              ) : (
                <>
                  <Text fontSize={15} color={themeColors.textSecondary}>
                    No groups match this filter
                  </Text>
                  <Button
                    variant="secondary"
                    size="md"
                    onPress={() => {
                      setFilterBy('all');
                      clearSearch();
                    }}
                  >
                    Show all groups
                  </Button>
                </>
              )}
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </Screen>
  );
}
