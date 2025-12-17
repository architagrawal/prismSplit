/**
 * PrismSplit Activity Tab
 * 
 * Uses activityStore for state management.
 */

import { useEffect } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Receipt, CheckCircle, UserPlus, MousePointer } from 'lucide-react-native';

import { Screen, Card, Avatar, GroupImage } from '@/components/ui';
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

  // Activity icons - use themeColors
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'bill_created':
        return <Receipt size={16} color={themeColors.primary} />;
      case 'bill_shared':
        return <Receipt size={16} color={themeColors.secondary} />;
      case 'bill_finalized':
        return <CheckCircle size={16} color={themeColors.success} />;
      case 'item_selected':
        return <MousePointer size={16} color={themeColors.primary} />;
      case 'settlement_created':
        return <CheckCircle size={16} color={themeColors.success} />;
      case 'member_joined':
        return <UserPlus size={16} color={themeColors.info} />;
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Screen padded={false}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Stack paddingHorizontal="$4" paddingTop="$2" paddingBottom="$4">
          <Text fontSize={28} fontWeight="700" color={themeColors.textPrimary}>
            Activity
          </Text>
        </Stack>

        {/* Activity List */}
        <YStack paddingHorizontal="$4" gap="$3" paddingBottom="$8">
          {activities.length === 0 && !isLoading ? (
            <YStack alignItems="center" paddingVertical="$12" gap="$2">
              <Text fontSize={16} color={themeColors.textSecondary}>
                No activity yet
              </Text>
            </YStack>
          ) : (
            activities.map((activity) => (
              <Card 
                key={activity.id} 
                variant="surface" 
                pressable
                onPress={() => markAsRead(activity.id)}
              >
                <XStack alignItems="flex-start" gap="$3">
                  <Avatar
                    name={activity.user.full_name}
                    colorIndex={0}
                    size="md"
                  />
                  <YStack flex={1} gap="$1">
                    <XStack alignItems="center" gap="$2" flexWrap="wrap">
                      <Text fontSize={14} fontWeight="600" color={themeColors.textPrimary}>
                        {activity.user.full_name}
                      </Text>
                      <Text fontSize={14} color={themeColors.textSecondary}>
                        {activityLabels[activity.type]}
                      </Text>
                    </XStack>
                    
                    <XStack alignItems="center" gap="$2">
                      <GroupImage groupId={activity.group.id} size="sm" />
                      <Text fontSize={13} color={themeColors.textMuted}>
                        {activity.group.name}
                      </Text>
                      <Text fontSize={13} color={themeColors.textMuted}>
                        •
                      </Text>
                      <Text fontSize={13} color={themeColors.textMuted}>
                        {formatTime(activity.created_at)}
                      </Text>
                    </XStack>
                  </YStack>
                  
                  <Stack padding="$2">
                    {getActivityIcon(activity.type)}
                  </Stack>
                </XStack>
              </Card>
            ))
          )}
        </YStack>
      </ScrollView>
    </Screen>
  );
}
