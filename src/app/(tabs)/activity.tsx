/**
 * PrismSplit Activity Tab
 * 
 * Uses activityStore for state management.
 */

import { useEffect, useState } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Receipt, CheckCircle, UserPlus, MousePointer } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Card, Avatar, GroupImage, AnimatedSearchBar } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useActivityStore } from '@/lib/store';
import type { ActivityType } from '@/types/models';

const activityLabels: Record<ActivityType, string> = {
  bill_created: 'created a bill',
  bill_shared: 'shared a bill',
  bill_finalized: 'finalized a bill',
  item_selected: 'selected items',
  settlement_created: 'settled up',
  member_joined: 'joined the group',
};

export default function ActivityScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { activities, isLoading, fetchActivities, markAsRead } = useActivityStore();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Activity icons - use themeColors
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'bill_created':
      case 'bill_shared':
      case 'bill_finalized':
        return <Receipt size={18} color={themeColors.primary} />;
      case 'settlement_created':
        return <CheckCircle size={18} color={themeColors.success} />;
      case 'member_joined':
        return <UserPlus size={18} color={themeColors.info} />;
      case 'item_selected':
        return <MousePointer size={18} color={themeColors.warning} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const onRefresh = () => {
    fetchActivities();
  };

  const handleActivityPress = (activity: typeof activities[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markAsRead(activity.id);
    
    // Navigate based on activity type
    if (activity.entity_type === 'bill') {
      router.push(`/bill/${activity.entity_id}`);
    } else if (activity.entity_type === 'group') {
      router.push(`/group/${activity.group.id}`);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month} ${day}, ${hours}:${minutes} ${ampm}`;
  };
  
  // Filter activities based on search query
  const filteredActivities = searchQuery.trim() === '' 
    ? activities 
    : activities.filter(activity => {
        const query = searchQuery.toLowerCase();
        return (
          activity.user.full_name.toLowerCase().includes(query) ||
          activity.group.name.toLowerCase().includes(query) ||
          activityLabels[activity.type].toLowerCase().includes(query)
        );
      });

  return (
    <Screen padded={false}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[0]}
      >
        {/* Header */}
        <Stack 
          paddingHorizontal="$4" 
          paddingTop="$2" 
          paddingBottom="$4"
          backgroundColor={themeColors.background}
          zIndex={10}
        >
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={28} fontWeight="700" color={themeColors.textPrimary}>
              Activity
            </Text>
            
            {/* Animated Search Bar Component */}
            <AnimatedSearchBar
              placeholder="Search..."
              onSearchChange={setSearchQuery}
            />
          </XStack>
        </Stack>

        {/* Activity List */}
        <YStack paddingHorizontal="$4" paddingBottom="$8">
          {filteredActivities.length === 0 && !isLoading ? (
            <YStack alignItems="center" paddingVertical="$12" gap="$2">
              <Text fontSize={16} color={themeColors.textSecondary}>
                {searchQuery.trim() !== '' ? 'No matching activities' : 'No activity yet'}
              </Text>
            </YStack>
          ) : (
            (() => {
              // Group activities by month
              const groupedByMonth: { [key: string]: typeof filteredActivities } = {};
              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
              
              filteredActivities.forEach(activity => {
                const date = new Date(activity.created_at);
                const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                if (!groupedByMonth[monthKey]) {
                  groupedByMonth[monthKey] = [];
                }
                groupedByMonth[monthKey].push(activity);
              });
              
              // Sort months in reverse chronological order
              const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
                const [monthA, yearA] = a.split(' ');
                const [monthB, yearB] = b.split(' ');
                const dateA = new Date(`${monthA} 1, ${yearA}`);
                const dateB = new Date(`${monthB} 1, ${yearB}`);
                return dateB.getTime() - dateA.getTime();
              });
              
              return sortedMonths.map((monthKey) => (
                <YStack key={monthKey}>
                  {/* Month Header */}
                  <Text 
                    fontSize={12} 
                    fontWeight="700" 
                    color={themeColors.textSecondary}
                    marginTop="$4"
                    marginBottom="$2"
                    textTransform="uppercase"
                    letterSpacing={1}
                  >
                    {monthKey}
                  </Text>
                  
                  {/* Activities in this month */}
                  {groupedByMonth[monthKey].map((activity, index) => (
                    <Pressable 
                      key={activity.id}
                      onPress={() => handleActivityPress(activity)}
                    >
                      <XStack 
                        alignItems="center" 
                        gap="$3"
                        paddingVertical="$3"
                        borderBottomWidth={index === groupedByMonth[monthKey].length - 1 ? 0 : 1}
                        borderBottomColor={themeColors.border}
                      >
                        {/* Left: Group Image with Activity Icon Badge */}
                        <YStack alignItems="center" gap="$1">
                          <Stack position="relative">
                            <GroupImage groupId={activity.group.id} size="md" />
                            {/* Activity Icon Badge - centered on group image */}
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
                                width={32}
                                height={32}
                                borderRadius={16}
                                backgroundColor={themeColors.surface}
                                justifyContent="center"
                                alignItems="center"
                                shadowColor="#000"
                                shadowOffset={{ width: 0, height: 2 }}
                                shadowOpacity={0.35}
                                shadowRadius={4}
                                borderWidth={2}
                                borderColor={themeColors.background}
                              >
                                {getActivityIcon(activity.type)}
                              </Stack>
                            </Stack>
                          </Stack>
                          <Text fontSize={13} color={themeColors.textMuted} numberOfLines={1}>
                            {activity.group.name}
                          </Text>
                        </YStack>
                        
                        {/* Center: Activity Details - Action as main point */}
                        <YStack flex={1} gap="$1">
                          <Text fontSize={15} fontWeight="600" color={themeColors.textPrimary}>
                            {activityLabels[activity.type].charAt(0).toUpperCase() + activityLabels[activity.type].slice(1)}
                          </Text>
                          <XStack alignItems="center" gap="$2">
                            <Avatar
                              name={activity.user.full_name}
                              imageUrl={activity.user.avatar_url}
                              colorIndex={activity.user.color_index ?? 0}
                              size="xs"
                            />
                            <Text fontSize={13} color={themeColors.textSecondary}>
                              {activity.user.full_name}
                            </Text>
                          </XStack>
                          <Text fontSize={12} color={themeColors.textMuted}>
                            {formatTime(activity.created_at)}
                          </Text>
                        </YStack>
                        
                        {/* Right: Share Amount */}
                        {(() => {
                          // Get share amount from activity metadata
                          const amount = (activity.metadata?.your_share as number) || 
                                        (activity.metadata?.amount as number) || 
                                        (Math.random() * 50 + 5); // Mock for demo
                          const isPositive = activity.type === 'settlement_created' || 
                                            (activity.metadata?.direction === 'receive');
                          
                          // For bill activities, you typically owe
                          // For settlement, it depends on direction
                          return (
                            <YStack alignItems="flex-end" justifyContent="center">
                              <Text fontSize={11} color={themeColors.textMuted}>
                                {isPositive ? 'you get' : 'you give'}
                              </Text>
                              <Text 
                                fontSize={16} 
                                fontWeight="700" 
                                color={isPositive ? themeColors.success : themeColors.error}
                              >
                                ${amount.toFixed(2)}
                              </Text>
                            </YStack>
                          );
                        })()}
                      </XStack>
                    </Pressable>
                  ))}
                </YStack>
              ));
            })()
          )}
        </YStack>
      </ScrollView>
    </Screen>
  );
}
