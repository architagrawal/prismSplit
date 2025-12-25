/**
 * PrismSplit Group Settings Screen
 */

import { useState, useEffect } from 'react';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, Alert } from 'react-native';
import { 
  ArrowLeft, 
  Edit, 
  UserPlus, 
  Bell, 
  Trash2,
  ChevronRight,
  LogOut
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Card, Avatar, Button, GroupImage } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGroupsStore, useAuthStore } from '@/lib/store';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingsRow({ icon, label, onPress, danger }: SettingsRowProps) {
  const themeColors = useThemeColors();
  
  return (
    <Pressable onPress={onPress}>
      <XStack 
        paddingVertical="$3" 
        alignItems="center"
        justifyContent="space-between"
      >
        <XStack alignItems="center" gap="$3">
          <Stack 
            width={36} 
            height={36} 
            borderRadius={8}
            backgroundColor={danger ? themeColors.errorBg : themeColors.surfaceElevated}
            justifyContent="center"
            alignItems="center"
          >
            {icon}
          </Stack>
          <Text 
            fontSize={16} 
            color={danger ? themeColors.error : themeColors.textPrimary}
          >
            {label}
          </Text>
        </XStack>
        <ChevronRight size={20} color={themeColors.textMuted} />
      </XStack>
    </Pressable>
  );
}

export default function GroupSettingsScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { currentGroup, members, fetchGroupById, fetchGroupMembers, leaveGroup, deleteGroup } = useGroupsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchGroupById(id);
      fetchGroupMembers(id);
    }
  }, [id]);

  const group = currentGroup;
  const groupMembers = members[id || ''] || [];
  const memberCount = groupMembers.length;
  const currentMember = groupMembers.find(m => m.user_id === user?.id);
  const isAdmin = currentMember?.role === 'admin';

  const handleLeave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You can rejoin later with an invite.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await leaveGroup(id);
              router.replace('/(tabs)/groups' as any);
            }
          }
        },
      ]
    );
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Group',
      'This will permanently delete the group and all its bills. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteGroup(id);
              router.replace('/(tabs)/groups' as any);
            }
          }
        },
      ]
    );
  };

  if (!group) {
    return (
      <Screen>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text color={themeColors.textSecondary}>Loading...</Text>
        </YStack>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color={themeColors.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
          Group Settings
        </Text>
        <Stack width={24} />
      </XStack>

      {/* Group Info */}
      <Card variant="elevated" marginBottom="$6">
        <YStack alignItems="center" gap="$3">
          <GroupImage groupId={group.id} size="xl" />
          <YStack alignItems="center">
            <Text fontSize={20} fontWeight="600" color={themeColors.textPrimary}>
              {group.name}
            </Text>
            <Text fontSize={14} color={themeColors.textSecondary}>
              {memberCount} member{memberCount !== 1 ? 's' : ''} • {group.currency}
            </Text>
          </YStack>
          {isAdmin && (
            <Button
              variant="outlined"
              size="sm"
              icon={<Edit size={16} color={themeColors.primary} />}
              onPress={() => router.push(`/group/edit?id=${group.id}` as any)}
            >
              Edit Group
            </Button>
          )}
        </YStack>
      </Card>

      {/* Members */}
      <YStack marginBottom="$6">
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
          <Text fontSize={14} fontWeight="600" color={themeColors.textMuted}>
            MEMBERS
          </Text>
          <Pressable onPress={() => router.push(`/group/invite?id=${group.id}` as any)}>
            <XStack alignItems="center" gap="$1">
              <UserPlus size={16} color={themeColors.primary} />
              <Text fontSize={14} color={themeColors.primary}>Invite</Text>
            </XStack>
          </Pressable>
        </XStack>
        
        <Card variant="surface">
          {groupMembers.map((member, index) => (
            <XStack 
              key={member.id}
              alignItems="center"
              gap="$3"
              paddingVertical="$3"
              borderTopWidth={index > 0 ? 1 : 0}
              borderTopColor={themeColors.border}
            >
              <Avatar
                name={member.user.full_name}
                colorIndex={member.color_index}
                size="md"
              />
              <YStack flex={1}>
                <XStack alignItems="center" gap="$2">
                  <Text fontSize={16} fontWeight="500" color={themeColors.textPrimary}>
                    {member.user.full_name}
                  </Text>
                  {member.user_id === user?.id && (
                    <Text fontSize={12} color={themeColors.textMuted}>(You)</Text>
                  )}
                </XStack>
                <Text fontSize={12} color={themeColors.textSecondary}>
                  {member.role === 'admin' ? 'Admin' : 'Member'}
                </Text>
              </YStack>
            </XStack>
          ))}
        </Card>
      </YStack>

      {/* Settings */}
      <YStack marginBottom="$6">
        <Text fontSize={14} fontWeight="600" color={themeColors.textMuted} marginBottom="$3">
          SETTINGS
        </Text>
        <Card variant="surface">
          <SettingsRow
            icon={<Bell size={18} color={themeColors.textSecondary} />}
            label="Notifications"
            onPress={() => router.push('/settings/notifications' as any)}
          />
          <SettingsRow
            icon={<UserPlus size={18} color={themeColors.textSecondary} />}
            label="Invite Members"
            onPress={() => router.push(`/group/invite?id=${group.id}` as any)}
          />
        </Card>
      </YStack>

      {/* Danger Zone */}
      <YStack>
        <Text fontSize={14} fontWeight="600" color={themeColors.textMuted} marginBottom="$3">
          DANGER ZONE
        </Text>
        <Card variant="surface">
          <SettingsRow
            icon={<LogOut size={18} color={themeColors.error} />}
            label="Leave Group"
            danger
            onPress={handleLeave}
          />
          {isAdmin && (
            <SettingsRow
              icon={<Trash2 size={18} color={themeColors.error} />}
              label="Delete Group"
              danger
              onPress={handleDelete}
            />
          )}
        </Card>
      </YStack>
    </Screen>
  );
}
