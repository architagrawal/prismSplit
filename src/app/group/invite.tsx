/**
 * PrismSplit Group Invite Screen
 * 
 * Share invite link or QR code to invite members.
 */

import { useState, useEffect } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, Share, Alert } from 'react-native';
import { ArrowLeft, Copy, Share2, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
// @ts-ignore - QRCode types are not properly exported
import QRCode from 'react-native-qrcode-svg';

import { Screen, Button, Card, GroupImage } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGroupsStore, useUIStore } from '@/lib/store';

export default function GroupInviteScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [copied, setCopied] = useState(false);
  const { showToast } = useUIStore();
  
  const { currentGroup, fetchGroupById, members, fetchGroupMembers } = useGroupsStore();

  useEffect(() => {
    console.log('Invite screen received id:', id);
    if (id) {
      fetchGroupById(id);
      fetchGroupMembers(id);
    }
  }, [id]);

  const group = currentGroup;
  const memberCount = members[id || '']?.length || 0;
  const inviteCode = group?.invite_code || 'XXXXXX';
  const inviteLink = `prismsplit.app/join/${inviteCode}`;

  const handleCopy = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(inviteCode);
    showToast({ type: 'success', message: 'Invite code copied to clipboard!' });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Join my PrismSplit group "${group?.name || 'My Group'}"!\n\nUse code: ${inviteCode}\n\nOr visit: ${inviteLink}`,
      });
    } catch (error) {
      console.log(error);
    }
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
          Invite Members
        </Text>
        <Stack width={24} />
      </XStack>

      {/* Group Info */}
      <YStack alignItems="center" marginBottom="$6">
        <Stack marginBottom="$3">
          <GroupImage groupId={group.id} size="xl" />
        </Stack>
        <Text fontSize={20} fontWeight="600" color={themeColors.textPrimary}>
          {group.name}
        </Text>
        <Text fontSize={14} color={themeColors.textSecondary}>
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </Text>
      </YStack>

      {/* QR Code */}
      <Card variant="elevated" marginBottom="$4">
        <YStack alignItems="center" paddingVertical="$3">
          <Stack
            width={160}
            height={160}
            borderRadius={12}
            backgroundColor="white"
            justifyContent="center"
            alignItems="center"
            marginBottom="$2"
            padding="$2"
          >
            {/* @ts-ignore - QRCode types issue */}
            <QRCode
              value={inviteLink}
              size={140}
              backgroundColor="white"
              color={themeColors.textPrimary}
            />
          </Stack>
          <Text fontSize={12} color={themeColors.textMuted}>
            Scan to join group
          </Text>
        </YStack>
      </Card>

      {/* Invite Code */}
      <YStack marginBottom="$4">
        <Text 
          fontSize={14} 
          fontWeight="500" 
          color={themeColors.textSecondary}
          marginBottom="$2"
        >
          Invite Code
        </Text>
        <Card variant="surface">
          <XStack justifyContent="space-between" alignItems="center">
            <Text 
              fontSize={24} 
              fontWeight="700" 
              color={themeColors.textPrimary}
              letterSpacing={4}
            >
              {inviteCode}
            </Text>
            <Pressable onPress={handleCopy}>
              <Stack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={copied ? themeColors.successBg : themeColors.surfaceElevated}
                justifyContent="center"
                alignItems="center"
              >
                {copied ? (
                  <Check size={20} color={themeColors.success} />
                ) : (
                  <Copy size={20} color={themeColors.primary} />
                )}
              </Stack>
            </Pressable>
          </XStack>
        </Card>
      </YStack>

      {/* Invite Link */}
      <YStack marginBottom="$6">
        <Text 
          fontSize={14} 
          fontWeight="500" 
          color={themeColors.textSecondary}
          marginBottom="$2"
        >
          Invite Link
        </Text>
        <Card variant="surface">
          <XStack justifyContent="space-between" alignItems="center">
            <Text 
              fontSize={14} 
              color={themeColors.textPrimary}
              flex={1}
              numberOfLines={1}
            >
              {inviteLink}
            </Text>
            <Pressable onPress={handleCopy}>
              <Copy size={20} color={themeColors.primary} />
            </Pressable>
          </XStack>
        </Card>
      </YStack>

      {/* Share Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        icon={<Share2 size={20} color="white" />}
        onPress={handleShare}
      >
        Share Invite
      </Button>
      
      {/* Bottom spacer for scroll */}
      <Stack height={20} />
    </Screen>
  );
}
