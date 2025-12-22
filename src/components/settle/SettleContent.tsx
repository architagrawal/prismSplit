/**
 * PrismSplit Settle Content Component
 * 
 * Shared component used by both tab and non-tab settle screens.
 */

import { useState } from 'react';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Card, Avatar, Button, CurrencyInput } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { demoUsers, demoBalances } from '@/lib/api/demo';
import { useBillsStore, useAuthStore } from '@/lib/store';

interface SettleContentProps {
  userId: string;
  showBackButton?: boolean;
}

export function SettleContent({ 
  userId, 
  showBackButton = true 
}: SettleContentProps) {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { recordPayment, isLoading } = useBillsStore();
  const { user: currentUser } = useAuthStore();
  
  // Find the person to settle with
  const person = demoUsers.find(u => u.id === userId) || demoUsers[1];
  
  // Get real balance if possible, or fallback to demo
  const balance = demoBalances.find(b => b.user_id === userId); // TODO: Use real balance store
  const amountOwed = balance?.balance || 0;
  
  const [amount, setAmount] = useState(Math.abs(amountOwed).toFixed(2));
  const [settled, setSettled] = useState(false);

  const handleSettle = async () => {
    if (!currentUser || !groupId) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Call Store Action
    const success = await recordPayment(groupId, currentUser.id, userId, parseFloat(amount));
    
    if (success) {
      setSettled(true);
      // Auto navigate back after showing success
      setTimeout(() => {
        router.back();
      }, 1500);
    }
  };

  if (settled) {
    return (
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
            Settled!
          </Text>
          <Text fontSize={16} color={themeColors.textSecondary} textAlign="center">
            You recorded a payment of ${parseFloat(amount).toFixed(2)} to {person.full_name}
          </Text>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack flex={1}>
      {/* Header */}
      <XStack 
        justifyContent={showBackButton ? "space-between" : "center"} 
        alignItems="center" 
        marginBottom="$6"
      >
        {showBackButton && (
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={themeColors.textPrimary} />
          </Pressable>
        )}
        <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
          Settle Up
        </Text>
        {showBackButton && <Stack width={24} />}
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
            <Text fontSize={20} fontWeight="600" color={themeColors.textPrimary}>
              {person.full_name}
            </Text>
            <Text fontSize={14} color={themeColors.textSecondary}>
              Paying for shared expenses
            </Text>
          </YStack>
        </YStack>
      </Card>

      {/* Amount Input */}
      <YStack marginBottom="$6">
        <Text 
          fontSize={14} 
          fontWeight="500" 
          color={themeColors.textSecondary}
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
                  color={amount === quickAmount.toFixed(2) ? themeColors.primary : themeColors.textSecondary}
                  textAlign="center"
                  numberOfLines={1}
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
          <Text fontSize={14} fontWeight="500" color={themeColors.textPrimary}>
            Record Payment
          </Text>
          <Text fontSize={13} color={themeColors.textSecondary}>
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
        disabled={!amount || parseFloat(amount) <= 0 || isLoading}
      >
        {isLoading ? 'Recording...' : `Record ${parseFloat(amount || '0').toFixed(2)} Payment`}
      </Button>
    </YStack>
  );
}
