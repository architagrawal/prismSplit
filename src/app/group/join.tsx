/**
 * PrismSplit Join Group Screen
 * 
 * Join a group via invite code or deep link.
 */

import { useState } from 'react';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Pressable, TextInput } from 'react-native';
import { ArrowLeft, Check, Camera } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Button, Card } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGroupsStore, useUIStore } from '@/lib/store';

export default function JoinGroupScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const [code, setCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [joinedGroupName, setJoinedGroupName] = useState('');
  
  const { joinGroup, isLoading, error } = useGroupsStore();
  const { showToast } = useUIStore();

  const handleJoin = async () => {
    if (code.length < 6) return;
    
    try {
      const group = await joinGroup(code.toUpperCase());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setJoinedGroupName(group.name);
      setJoined(true);
      
      setTimeout(() => {
        router.replace(`/group/${group.id}` as any);
      }, 1500);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast({ type: 'error', message: err.message || 'Invalid invite code' });
    }
  };

  if (joined) {
    return (
      <Screen>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$6">
          <Stack
            width={100}
            height={100}
            borderRadius={50}
            backgroundColor={themeColors.successBg}
            justifyContent="center"
            alignItems="center"
          >
            <Check size={48} color={themeColors.success} />
          </Stack>
          <YStack alignItems="center" gap="$2">
            <Text fontSize={24} fontWeight="700" color={themeColors.textPrimary}>
              You're In!
            </Text>
            <Text fontSize={16} color={themeColors.textSecondary} textAlign="center">
              You've joined {joinedGroupName}. Redirecting...
            </Text>
          </YStack>
        </YStack>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color={themeColors.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
          Join Group
        </Text>
        <Stack width={24} />
      </XStack>

      {/* Instructions */}
      <YStack alignItems="center" marginBottom="$8">
        <Text 
          fontSize={16} 
          color={themeColors.textSecondary}
          textAlign="center"
        >
          Enter the 6-character invite code to join a group
        </Text>
      </YStack>

      {/* Code Input */}
      <Card variant="elevated" marginBottom="$6">
        <YStack alignItems="center" gap="$3">
          <TextInput
            value={code}
            onChangeText={(text: string) => setCode(text.toUpperCase().slice(0, 6))}
            placeholder="XXXXXX"
            placeholderTextColor={themeColors.textMuted}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
            style={{
              fontSize: 36,
              fontWeight: '700',
              letterSpacing: 8,
              textAlign: 'center',
              color: themeColors.textPrimary,
              paddingVertical: 16,
              width: '100%',
            }}
          />
          <Text fontSize={12} color={themeColors.textMuted}>
            {code.length}/6 characters
          </Text>
        </YStack>
      </Card>

      {/* QR Scanner Button */}
      <Card variant="outlined" marginBottom="$6">
        <Pressable onPress={() => router.push('/group/scan' as any)}>
          <XStack justifyContent="center" alignItems="center" gap="$2">
            <Camera size={20} color={themeColors.primary} />
            <Text fontSize={14} fontWeight="500" color={themeColors.primary}>
              Scan QR Code Instead
            </Text>
          </XStack>
        </Pressable>
      </Card>

      {/* Join Button */}
      <Stack flex={1} />
      <Button
        variant="primary"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={code.length < 6}
        onPress={handleJoin}
      >
        Join Group
      </Button>
    </Screen>
  );
}
