/**
 * PrismSplit Settle Screen
 * 
 * Record a settlement between users.
 */

import { useState } from 'react';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Card, Avatar, Button, CurrencyInput } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { demoUsers, demoBalances, currentUser } from '@/lib/api/demo';

export default function SettleScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  
  // Find the person to settle with
  const person = demoUsers.find(u => u.id === userId) || demoUsers[1];
  const balance = demoBalances.find(b => b.user_id === userId);
  const amountOwed = balance?.balance || 0;
  
  const [amount, setAmount] = useState(Math.abs(amountOwed).toFixed(2));
  const [settled, setSettled] = useState(false);

  const handleSettle = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSettled(true);
    
    // Auto navigate back after showing success
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  if (settled) {
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
              Settled!
            </Text>
            <Text fontSize={16} color={colors.light.textSecondary} textAlign="center">
              You recorded a payment of ${parseFloat(amount).toFixed(2)} to {person.full_name}
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
          Settle Up
        </Text>
        <Stack width={24} />
      </XStack>

      {/* Person Card */}
      <Card variant="elevated" marginBottom="$6">
        <YStack alignItems="center" gap="$3">
          <Avatar 
            name={person.full_name} 
            colorIndex={balance?.color_index || 1} 
            size="xl" 
          />
          <YStack alignItems="center">
            <Text fontSize={20} fontWeight="600" color={colors.light.textPrimary}>
              {person.full_name}
            </Text>
            <Text fontSize={14} color={colors.light.textSecondary}>
              {amountOwed < 0 ? 'You owe' : 'Owes you'} ${Math.abs(amountOwed).toFixed(2)}
            </Text>
          </YStack>
        </YStack>
      </Card>

      {/* Amount Input */}
      <YStack marginBottom="$6">
        <Text 
          fontSize={14} 
          fontWeight="500" 
          color={colors.light.textSecondary}
          marginBottom="$2"
        >
          Settlement Amount
        </Text>
        <CurrencyInput
          value={amount}
          onChangeText={setAmount}
        />
        
        {/* Quick amount buttons */}
        <XStack gap="$2" marginTop="$3">
          {[10, 20, 50, Math.abs(amountOwed)].filter(v => v > 0).map((quickAmount) => (
            <Pressable
              key={quickAmount}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAmount(quickAmount.toFixed(2));
              }}
              style={{ flex: 1 }}
            >
              <Card 
                variant={amount === quickAmount.toFixed(2) ? 'elevated' : 'outlined'}
                padding="$2"
              >
                <Text 
                  fontSize={14} 
                  fontWeight="500" 
                  color={amount === quickAmount.toFixed(2) ? colors.light.primary : colors.light.textSecondary}
                  textAlign="center"
                >
                  ${quickAmount.toFixed(0)}
                </Text>
              </Card>
            </Pressable>
          ))}
        </XStack>
      </YStack>

      {/* Payment Method Info */}
      <Card variant="surface" marginBottom="$6">
        <YStack gap="$2">
          <Text fontSize={14} fontWeight="500" color={colors.light.textPrimary}>
            Record Payment
          </Text>
          <Text fontSize={13} color={colors.light.textSecondary}>
            This records that a payment was made outside the app (cash, Venmo, etc.).
            PrismSplit does not process actual payments.
          </Text>
        </YStack>
      </Card>

      {/* Action */}
      <Stack flex={1} />
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={handleSettle}
        disabled={!amount || parseFloat(amount) <= 0}
      >
        Record ${parseFloat(amount || '0').toFixed(2)} Payment
      </Button>
    </Screen>
  );
}
