/**
 * PrismSplit Group Invite Screen
 * 
 * Share invite link or QR code to invite members.
 */

import { useState } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, Share } from 'react-native';
import { ArrowLeft, Copy, Share2, QrCode, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Button, Card } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { demoGroups } from '@/lib/api/demo';

export default function GroupInviteScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const group = demoGroups.find(g => g.id === id) || demoGroups[0];
  const inviteLink = `prismsplit.app/join/${group.invite_code}`;
  const inviteCode = group.invite_code;

  const handleCopy = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // In real app, copy to clipboard
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Join my PrismSplit group "${group.name}"!\n\n${inviteLink}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

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
        <Stack
          width={80}
          height={80}
          borderRadius={20}
          backgroundColor={themeColors.surfaceElevated}
          justifyContent="center"
          alignItems="center"
          marginBottom="$3"
        >
          <Text fontSize={40}>{group.emoji}</Text>
        </Stack>
        <Text fontSize={20} fontWeight="600" color={themeColors.textPrimary}>
          {group.name}
        </Text>
        <Text fontSize={14} color={themeColors.textSecondary}>
          {group.member_count} members
        </Text>
      </YStack>

      {/* QR Code Placeholder */}
      <Card variant="elevated" marginBottom="$4">
        <YStack alignItems="center" paddingVertical="$3">
          <Stack
            width={140}
            height={140}
            borderRadius={12}
            backgroundColor={themeColors.surfaceElevated}
            justifyContent="center"
            alignItems="center"
            marginBottom="$2"
          >
            <QrCode size={80} color={themeColors.textMuted} />
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
