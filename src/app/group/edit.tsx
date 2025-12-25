/**
 * PrismSplit Edit Group Screen
 * 
 * Allows editing group name and currency.
 * Emoji removed - uses auto-generated group images.
 */

import { useState, useEffect } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Card, Button, Input, ConfirmDialog, GroupImage } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useGroupsStore, useUIStore } from '@/lib/store';
import type { Currency } from '@/types/models';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

export default function EditGroupScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useUIStore();
  const { currentGroup, fetchGroupById, updateGroup } = useGroupsStore();
  
  const [name, setName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGroupById(id);
    }
  }, [id]);

  // Initialize form with current group data
  useEffect(() => {
    if (currentGroup && !initialized) {
      setName(currentGroup.name);
      setSelectedCurrency(currentGroup.currency);
      setInitialized(true);
    }
  }, [currentGroup, initialized]);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast({ type: 'error', message: 'Group name is required' });
      return;
    }
    
    if (!id) return;
    
    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    await updateGroup(id, { 
      name: name.trim(), 
      currency: selectedCurrency as Currency 
    });
    
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

  if (!currentGroup) {
    return (
      <Screen>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text color={themeColors.textSecondary}>Loading...</Text>
        </YStack>
      </Screen>
    );
  }

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

      {/* Preview */}
      <Card variant="elevated" marginBottom="$6">
        <YStack alignItems="center" gap="$3">
          <GroupImage groupId={id || ''} size="xl" />
          <YStack alignItems="center">
            <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
              {name || 'Group Name'}
            </Text>
            <Text fontSize={14} color={themeColors.textSecondary}>
              Currency: {selectedCurrency}
            </Text>
          </YStack>
        </YStack>
      </Card>

      {/* Group Name */}
      <YStack marginBottom="$6">
        <Input
          label="Group Name"
          placeholder="Enter group name"
          value={name}
          onChangeText={(val) => { setName(val); setHasChanges(true); }}
        />
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
          { text: 'Discard', style: 'destructive', onPress: () => { setShowConfirmDialog(false); router.back(); } },
          { text: 'Save', style: 'primary', onPress: () => { setShowConfirmDialog(false); handleSave(); } },
        ]}
        onDismiss={() => setShowConfirmDialog(false)}
      />
    </Screen>
  );
}
