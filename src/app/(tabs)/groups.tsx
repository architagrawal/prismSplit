/**
 * PrismSplit Groups Tab
 * 
 * Uses groupsStore for state management.
 */

import { useEffect } from 'react';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView } from 'react-native';
import { useState } from 'react';
import { Plus, Users, Search } from 'lucide-react-native';

import { Screen, GroupListItem, Button, Input } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { useGroupsStore, useUIStore } from '@/lib/store';

export default function GroupsScreen() {
  const router = useRouter();
  const { groups, isLoading, fetchGroups } = useGroupsStore();
  const { searchQuery, setSearchQuery, clearSearch } = useUIStore();

  // Fetch on mount
  useEffect(() => {
    fetchGroups();
    return () => clearSearch();
  }, []);

  const filteredGroups = searchQuery
    ? groups.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groups;

  const onRefresh = () => {
    fetchGroups();
  };

  return (
    <Screen padded={false}>
      <YStack flex={1}>
        {/* Header */}
        <Stack paddingHorizontal="$4" paddingTop="$2" paddingBottom="$4">
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <Text fontSize={28} fontWeight="700" color={colors.light.textPrimary}>
              Groups
            </Text>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} color="white" />}
              onPress={() => router.push('/group/create' as any)}
            >
              New
            </Button>
          </XStack>

          {/* Search */}
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={20} color={colors.light.textMuted} />}
          />
        </Stack>

        {/* Groups List */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        >
          <YStack gap="$3">
            {filteredGroups.length === 0 ? (
              <YStack flex={1} justifyContent="center" alignItems="center" gap="$4" paddingTop="$12">
                <Stack
                  width={80}
                  height={80}
                  borderRadius={40}
                  backgroundColor={colors.light.surfaceElevated}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Users size={40} color={colors.light.textMuted} />
                </Stack>
                <Text fontSize={16} color={colors.light.textSecondary}>
                  {searchQuery ? 'No groups found' : 'No groups yet'}
                </Text>
                {!searchQuery && (
                  <Button
                    variant="primary"
                    onPress={() => router.push('/group/create' as any)}
                  >
                    Create your first group
                  </Button>
                )}
              </YStack>
            ) : (
              filteredGroups.map((group) => (
                <GroupListItem
                  key={group.id}
                  name={group.name}
                  emoji={group.emoji}
                  memberCount={group.member_count}
                  balance={group.your_balance}
                  onPress={() => router.push(`/group/${group.id}` as any)}
                />
              ))
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </Screen>
  );
}
