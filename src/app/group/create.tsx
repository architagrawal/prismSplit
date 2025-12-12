/**
 * PrismSplit Create Group Screen
 * 
 * Uses groupsStore for creation.
 */

import { useState } from 'react';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Button, Input, Card } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { supportedCurrencies, currencySymbols, type Currency } from '@/types/models';
import { useGroupsStore, useUIStore } from '@/lib/store';

const emojis = ['🏠', '✈️', '🍕', '🎉', '🛒', '💼', '🎮', '🏖️', '🚗', '🎬', '🍔', '☕'];

export default function CreateGroupScreen() {
  const router = useRouter();
  const { createGroup, isLoading } = useGroupsStore();
  const { showToast } = useUIStore();
  
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🏠');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast({ type: 'error', message: 'Please enter a group name' });
      return;
    }
    
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newGroup = await createGroup(name, selectedEmoji, selectedCurrency);
      showToast({ type: 'success', message: 'Group created!' });
      router.replace(`/group/${newGroup.id}` as any);
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to create group' });
    }
  };

  return (
    <Screen scroll keyboardAvoiding>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.light.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
          New Group
        </Text>
        <Stack width={24} />
      </XStack>


      {/* Group Name */}
      <YStack marginBottom="$6">
          <Input
            label="Group Name"
            placeholder="e.g., Roommates, Trip Squad"
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </YStack>

        {/* Emoji Selection */}
        <YStack marginBottom="$6">
          <Text 
            fontSize={14} 
            fontWeight="500" 
            color={colors.light.textSecondary}
            marginBottom="$2"
          >
            Group Icon
          </Text>
          <XStack flexWrap="wrap" gap="$2">
            {emojis.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedEmoji(emoji);
                }}
              >
                <Stack
                  width={56}
                  height={56}
                  borderRadius={12}
                  backgroundColor={selectedEmoji === emoji 
                    ? `${colors.light.primary}20` 
                    : colors.light.surfaceElevated
                  }
                  borderWidth={selectedEmoji === emoji ? 2 : 0}
                  borderColor={colors.light.primary}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text fontSize={28}>{emoji}</Text>
                </Stack>
              </Pressable>
            ))}
          </XStack>
        </YStack>

        {/* Currency Selection */}
        <YStack marginBottom="$6">
          <Text 
            fontSize={14} 
            fontWeight="500" 
            color={colors.light.textSecondary}
            marginBottom="$2"
          >
            Currency
          </Text>
          <XStack flexWrap="wrap" gap="$2">
            {supportedCurrencies.map((currency) => (
              <Pressable
                key={currency}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCurrency(currency);
                }}
              >
                <Card
                  variant={selectedCurrency === currency ? 'elevated' : 'outlined'}
                  padding="$2"
                  borderColor={selectedCurrency === currency 
                    ? colors.light.primary 
                    : colors.light.border
                  }
                  borderWidth={selectedCurrency === currency ? 2 : 1}
                >
                  <XStack alignItems="center" gap="$1">
                    <Text fontSize={16} fontWeight="500" color={colors.light.textPrimary}>
                      {currencySymbols[currency]}
                    </Text>
                    <Text fontSize={14} color={colors.light.textSecondary}>
                      {currency}
                    </Text>
                  </XStack>
                </Card>
              </Pressable>
            ))}
          </XStack>
        </YStack>

        {/* Preview */}
        <Card variant="surface" marginBottom="$6">
          <YStack alignItems="center" gap="$2">
            <Stack
              width={64}
              height={64}
              borderRadius={16}
              backgroundColor={colors.light.surfaceElevated}
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize={32}>{selectedEmoji}</Text>
            </Stack>
            <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
              {name || 'Group Name'}
            </Text>
            <Text fontSize={14} color={colors.light.textSecondary}>
              1 member • {selectedCurrency}
            </Text>
          </YStack>
        </Card>

      {/* Create Button */}
      <Stack paddingTop="$4" paddingBottom="$8">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={!name.trim()}
          onPress={handleCreate}
        >
          Create Group
        </Button>
      </Stack>
    </Screen>
  );
}
