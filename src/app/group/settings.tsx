/**
 * PrismSplit Group Settings Screen
 */

import { useState } from 'react';
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

import { Screen, Card, Avatar, Button } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { demoGroups, demoGroupMembers, currentUser } from '@/lib/api/demo';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingsRow({ icon, label, onPress, danger }: SettingsRowProps) {
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
            backgroundColor={danger ? colors.light.errorBg : colors.light.surfaceElevated}
            justifyContent="center"
            alignItems="center"
          >
            {icon}
          </Stack>
          <Text 
            fontSize={16} 
            color={danger ? colors.light.error : colors.light.textPrimary}
          >
            {label}
          </Text>
        </XStack>
        <ChevronRight size={20} color={colors.light.textMuted} />
      </XStack>
    </Pressable>
  );
}

export default function GroupSettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const group = demoGroups.find(g => g.id === id) || demoGroups[0];
  const members = demoGroupMembers[group.id] || [];
  const isAdmin = members.find(m => m.user_id === currentUser.id)?.role === 'admin';

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
          onPress: () => router.replace('/(tabs)/groups' as any)
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
          onPress: () => router.replace('/(tabs)/groups' as any)
        },
      ]
    );
  };

  return (
    <Screen scroll>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.light.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
          Group Settings
        </Text>
        <Stack width={24} />
      </XStack>

      {/* Group Info */}
      <Card variant="elevated" marginBottom="$6">
        <YStack alignItems="center" gap="$3">
          <Stack
            width={80}
            height={80}
            borderRadius={20}
            backgroundColor={colors.light.surfaceElevated}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize={40}>{group.emoji}</Text>
          </Stack>
          <YStack alignItems="center">
            <Text fontSize={20} fontWeight="600" color={colors.light.textPrimary}>
              {group.name}
            </Text>
            <Text fontSize={14} color={colors.light.textSecondary}>
              {group.member_count} members • {group.currency}
            </Text>
          </YStack>
          {isAdmin && (
            <Button
              variant="outlined"
              size="sm"
              icon={<Edit size={16} color={colors.light.primary} />}
            >
              Edit Group
            </Button>
          )}
        </YStack>
      </Card>

      {/* Members */}
      <YStack marginBottom="$6">
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
          <Text fontSize={14} fontWeight="600" color={colors.light.textMuted}>
            MEMBERS
          </Text>
          <Pressable onPress={() => router.push(`/group/invite?id=${group.id}` as any)}>
            <XStack alignItems="center" gap="$1">
              <UserPlus size={16} color={colors.light.primary} />
              <Text fontSize={14} color={colors.light.primary}>Invite</Text>
            </XStack>
          </Pressable>
        </XStack>
        
        <Card variant="surface">
          {members.map((member, index) => (
            <XStack 
              key={member.id}
              alignItems="center"
              gap="$3"
              paddingVertical="$3"
              borderTopWidth={index > 0 ? 1 : 0}
              borderTopColor={colors.light.border}
            >
              <Avatar
                name={member.user.full_name}
                colorIndex={member.color_index}
                size="md"
              />
              <YStack flex={1}>
                <XStack alignItems="center" gap="$2">
                  <Text fontSize={16} fontWeight="500" color={colors.light.textPrimary}>
                    {member.user.full_name}
                  </Text>
                  {member.user_id === currentUser.id && (
                    <Text fontSize={12} color={colors.light.textMuted}>(You)</Text>
                  )}
                </XStack>
                <Text fontSize={12} color={colors.light.textSecondary}>
                  {member.role === 'admin' ? 'Admin' : 'Member'}
                </Text>
              </YStack>
            </XStack>
          ))}
        </Card>
      </YStack>

      {/* Settings */}
      <YStack marginBottom="$6">
        <Text fontSize={14} fontWeight="600" color={colors.light.textMuted} marginBottom="$3">
          SETTINGS
        </Text>
        <Card variant="surface">
          <SettingsRow
            icon={<Bell size={18} color={colors.light.textSecondary} />}
            label="Notifications"
          />
          <SettingsRow
            icon={<UserPlus size={18} color={colors.light.textSecondary} />}
            label="Invite Members"
            onPress={() => router.push(`/group/invite?id=${group.id}` as any)}
          />
        </Card>
      </YStack>

      {/* Danger Zone */}
      <YStack>
        <Text fontSize={14} fontWeight="600" color={colors.light.textMuted} marginBottom="$3">
          DANGER ZONE
        </Text>
        <Card variant="surface">
          <SettingsRow
            icon={<LogOut size={18} color={colors.light.error} />}
            label="Leave Group"
            danger
            onPress={handleLeave}
          />
          {isAdmin && (
            <SettingsRow
              icon={<Trash2 size={18} color={colors.light.error} />}
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
