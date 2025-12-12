/**
 * PrismSplit Join Group Screen
 * 
 * Join a group via invite code or deep link.
 */

import { useState } from 'react';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Pressable, TextInput, StyleSheet } from 'react-native';
import { ArrowLeft, Check, Camera } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Button, Card } from '@/components/ui';
import { colors } from '@/theme/tokens';

export default function JoinGroupScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    if (code.length < 6) return;
    
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setTimeout(() => {
      setLoading(false);
      setJoined(true);
      
      setTimeout(() => {
        router.replace('/(tabs)/groups' as any);
      }, 1500);
    }, 1000);
  };

  if (joined) {
    return (
      <Screen>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$6">
          <Stack
            width={100}
            height={100}
            borderRadius={50}
            backgroundColor={colors.light.successBg}
            justifyContent="center"
            alignItems="center"
          >
            <Check size={48} color={colors.light.success} />
          </Stack>
          <YStack alignItems="center" gap="$2">
            <Text fontSize={24} fontWeight="700" color={colors.light.textPrimary}>
              You're In!
            </Text>
            <Text fontSize={16} color={colors.light.textSecondary} textAlign="center">
              You've joined the group. Redirecting...
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
          <ArrowLeft size={24} color={colors.light.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
          Join Group
        </Text>
        <Stack width={24} />
      </XStack>

      {/* Instructions */}
      <YStack alignItems="center" marginBottom="$8">
        <Text 
          fontSize={16} 
          color={colors.light.textSecondary}
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
            onChangeText={(text) => setCode(text.toUpperCase().slice(0, 6))}
            placeholder="XXXXXX"
            placeholderTextColor={colors.light.textMuted}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
            style={styles.codeInput}
          />
          <Text fontSize={12} color={colors.light.textMuted}>
            {code.length}/6 characters
          </Text>
        </YStack>
      </Card>

      {/* QR Scanner Button */}
      <Card variant="outlined" marginBottom="$6">
        <Pressable>
          <XStack justifyContent="center" alignItems="center" gap="$2">
            <Camera size={20} color={colors.light.primary} />
            <Text fontSize={14} fontWeight="500" color={colors.light.primary}>
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
        loading={loading}
        disabled={code.length < 6}
        onPress={handleJoin}
      >
        Join Group
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeInput: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.light.textPrimary,
    paddingVertical: 16,
    width: '100%',
  },
});
