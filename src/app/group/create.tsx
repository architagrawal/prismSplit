/**
 * PrismSplit Create Group Screen
 * 
 * Simplified - no emoji selection, uses auto-generated group image.
 */

import { useState } from 'react';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Button, Input, Card, GroupImage } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supportedCurrencies, currencySymbols, type Currency } from '@/types/models';
import { useGroupsStore, useUIStore } from '@/lib/store';

export default function CreateGroupScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { createGroup, isLoading } = useGroupsStore();
  const { showToast } = useUIStore();
  
  const [name, setName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');

  // Generate a preview ID based on name for consistent preview
  const previewId = `preview-${name.toLowerCase().replace(/\s/g, '-')}`;

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast({ type: 'error', message: 'Please enter a group name' });
      return;
    }
    
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const newGroup = await createGroup(name, '', selectedCurrency);
      showToast({ type: 'success', message: 'Group created!' });
      router.replace(`/(tabs)/group/${newGroup.id}` as any);
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to create group' });
    }
  };

  return (
    <Screen scroll keyboardAvoiding>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color={themeColors.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
          New Group
        </Text>
        <Stack width={24} />
      </XStack>

      {/* Preview Card */}
      <Card variant="surface" marginBottom="$6">
        <YStack alignItems="center" gap="$3">
          <GroupImage groupId={previewId} size="xl" />
          <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
            {name || 'Group Name'}
          </Text>
          <Text fontSize={14} color={themeColors.textSecondary}>
            1 member • {selectedCurrency}
          </Text>
        </YStack>
      </Card>

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

      {/* Currency Selection */}
      <YStack marginBottom="$6">
        <Text 
          fontSize={14} 
          fontWeight="500" 
          color={themeColors.textSecondary}
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
                  ? themeColors.primary 
                  : themeColors.border
                }
                borderWidth={selectedCurrency === currency ? 2 : 1}
              >
                <XStack alignItems="center" gap="$1">
                  <Text fontSize={16} fontWeight="500" color={themeColors.textPrimary}>
                    {currencySymbols[currency]}
                  </Text>
                  <Text fontSize={14} color={themeColors.textSecondary}>
                    {currency}
                  </Text>
                </XStack>
              </Card>
            </Pressable>
          ))}
        </XStack>
      </YStack>

      {/* Create Button */}
      <Stack paddingTop="$4" paddingBottom="$2">
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
