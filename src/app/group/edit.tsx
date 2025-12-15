/**
 * PrismSplit Edit Group Screen
 * 
 * Allows editing group name, emoji, and currency.
 */

import { useState } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Card, Button, Input, ConfirmDialog } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGroupsStore, useUIStore } from '@/lib/store';
import { demoGroups } from '@/lib/api/demo';

const EMOJIS = ['🏠', '✈️', '🍕', '🎉', '🏢', '👨‍👩‍👧‍👦', '🎓', '💼', '🏖️', '🎮', '⚽', '🎬', '🍔', '🚗', '💒'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

export default function EditGroupScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useUIStore();
  
  const group = demoGroups.find(g => g.id === id) || demoGroups[0];
  
  const [name, setName] = useState(group.name);
  const [selectedEmoji, setSelectedEmoji] = useState(group.emoji);
  const [selectedCurrency, setSelectedCurrency] = useState(group.currency);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast({ type: 'error', message: 'Group name is required' });
      return;
    }
    
    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    showToast({ type: 'success', message: 'Group updated!' });
    setIsSaving(false);
    router.back();
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      router.back();
    }
  };

  return (
    <Screen scroll keyboardAvoiding>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
        <Pressable onPress={handleCancel}>
          <ArrowLeft size={24} color={themeColors.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
          Edit Group
        </Text>
        <Stack width={24} />
      </XStack>

      {/* Group Name */}
      <YStack marginBottom="$6">
        <Input
          label="Group Name"
          placeholder="Enter group name"
          value={name}
          onChangeText={(val) => { setName(val); setHasChanges(true); }}
        />
      </YStack>

      {/* Emoji Selector */}
      <YStack marginBottom="$6">
        <Text fontSize={14} fontWeight="500" color={themeColors.textSecondary} marginBottom="$2">
          Group Icon
        </Text>
        <Card variant="surface">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$2" paddingVertical="$2">
              {EMOJIS.map((emoji) => (
                <Pressable 
                  key={emoji} 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedEmoji(emoji);
                    setHasChanges(true);
                  }}
                >
                  <Stack
                    width={48}
                    height={48}
                    borderRadius={12}
                    backgroundColor={selectedEmoji === emoji ? themeColors.primaryLight : themeColors.surfaceElevated}
                    borderWidth={selectedEmoji === emoji ? 2 : 0}
                    borderColor={themeColors.primary}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text fontSize={24}>{emoji}</Text>
                  </Stack>
                </Pressable>
              ))}
            </XStack>
          </ScrollView>
        </Card>
      </YStack>

      {/* Currency Selector */}
      <YStack marginBottom="$6">
        <Text fontSize={14} fontWeight="500" color={themeColors.textSecondary} marginBottom="$2">
          Currency
        </Text>
        <Card variant="surface">
          <XStack flexWrap="wrap" gap="$2">
            {CURRENCIES.map((currency) => (
              <Pressable 
                key={currency} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCurrency(currency);
                  setHasChanges(true);
                }}
              >
                <Stack
                  paddingHorizontal="$4"
                  paddingVertical="$2"
                  borderRadius={20}
                  backgroundColor={selectedCurrency === currency ? themeColors.primary : themeColors.surfaceElevated}
                >
                  <Text
                    fontSize={14}
                    fontWeight="500"
                    color={selectedCurrency === currency ? 'white' : themeColors.textPrimary}
                  >
                    {currency}
                  </Text>
                </Stack>
              </Pressable>
            ))}
          </XStack>
        </Card>
      </YStack>

      {/* Preview */}
      <Card variant="elevated" marginBottom="$6">
        <YStack alignItems="center" gap="$2">
          <Text fontSize={14} color={themeColors.textSecondary}>Preview</Text>
          <XStack alignItems="center" gap="$3">
            <Stack
              width={56}
              height={56}
              borderRadius={14}
              backgroundColor={themeColors.surfaceElevated}
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize={28}>{selectedEmoji}</Text>
            </Stack>
            <YStack>
              <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
                {name || 'Group Name'}
              </Text>
              <Text fontSize={14} color={themeColors.textSecondary}>
                Currency: {selectedCurrency}
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </Card>

      {/* Save Button */}
      <Stack flex={1} />
      <Button
        variant="primary"
        size="lg"
        fullWidth
        loading={isSaving}
        onPress={handleSave}
        icon={<Check size={20} color="white" />}
      >
        Save Changes
      </Button>

      <ConfirmDialog
        visible={showConfirmDialog}
        title="Unsaved Changes"
        message="You have changes that haven't been saved yet."
        buttons={[
          { text: 'Discard Changes', style: 'destructive', onPress: () => { setShowConfirmDialog(false); router.back(); } },
          { text: 'Save', style: 'primary', onPress: () => { setShowConfirmDialog(false); handleSave(); } },
        ]}
        onDismiss={() => setShowConfirmDialog(false)}
      />
    </Screen>
  );
}
