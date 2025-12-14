/**
 * PrismSplit Notifications Settings Screen
 */

import { useState } from 'react';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Pressable, Switch } from 'react-native';
import { ArrowLeft, Bell, MessageSquare, CreditCard, Users, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Card, Button } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { useUIStore } from '@/lib/store';

interface NotificationToggleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function NotificationToggle({ icon, title, description, value, onValueChange }: NotificationToggleProps) {
  return (
    <XStack 
      alignItems="center" 
      justifyContent="space-between"
      paddingVertical="$3"
    >
      <XStack alignItems="center" gap="$3" flex={1}>
        <Stack 
          width={40} 
          height={40} 
          borderRadius={10}
          backgroundColor={colors.light.surfaceElevated}
          justifyContent="center"
          alignItems="center"
        >
          {icon}
        </Stack>
        <YStack flex={1}>
          <Text fontSize={16} fontWeight="500" color={colors.light.textPrimary}>
            {title}
          </Text>
          <Text fontSize={13} color={colors.light.textSecondary}>
            {description}
          </Text>
        </YStack>
      </XStack>
      <Switch
        value={value}
        onValueChange={(val) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onValueChange(val);
        }}
        trackColor={{ false: colors.light.border, true: colors.light.primary }}
        thumbColor="white"
      />
    </XStack>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { showToast } = useUIStore();
  
  const [billReminders, setBillReminders] = useState(true);
  const [newExpenses, setNewExpenses] = useState(true);
  const [settlements, setSettlements] = useState(true);
  const [groupUpdates, setGroupUpdates] = useState(false);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast({ type: 'success', message: 'Notification preferences saved!' });
    router.back();
  };

  return (
    <Screen scroll>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.light.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
          Notifications
        </Text>
        <Stack width={24} />
      </XStack>

      {/* Push Notifications */}
      <YStack marginBottom="$6">
        <Text fontSize={14} fontWeight="600" color={colors.light.textMuted} marginBottom="$2">
          PUSH NOTIFICATIONS
        </Text>
        <Card variant="surface">
          <NotificationToggle
            icon={<Bell size={20} color={colors.light.textSecondary} />}
            title="Bill Reminders"
            description="Get reminded about pending bills"
            value={billReminders}
            onValueChange={setBillReminders}
          />
          <Stack height={1} backgroundColor={colors.light.border} />
          <NotificationToggle
            icon={<CreditCard size={20} color={colors.light.textSecondary} />}
            title="New Expenses"
            description="When someone adds an expense"
            value={newExpenses}
            onValueChange={setNewExpenses}
          />
          <Stack height={1} backgroundColor={colors.light.border} />
          <NotificationToggle
            icon={<MessageSquare size={20} color={colors.light.textSecondary} />}
            title="Settlements"
            description="When someone settles with you"
            value={settlements}
            onValueChange={setSettlements}
          />
          <Stack height={1} backgroundColor={colors.light.border} />
          <NotificationToggle
            icon={<Users size={20} color={colors.light.textSecondary} />}
            title="Group Updates"
            description="New members and group changes"
            value={groupUpdates}
            onValueChange={setGroupUpdates}
          />
        </Card>
      </YStack>

      {/* Info */}
      <Card variant="surface" marginBottom="$6">
        <YStack gap="$2">
          <Text fontSize={14} fontWeight="500" color={colors.light.textPrimary}>
            About Notifications
          </Text>
          <Text fontSize={13} color={colors.light.textSecondary}>
            You can also manage notification permissions in your device settings. 
            Some notifications may be required for important account updates.
          </Text>
        </YStack>
      </Card>

      {/* Save Button */}
      <Stack flex={1} />
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={handleSave}
        icon={<Check size={20} color="white" />}
      >
        Save Preferences
      </Button>
    </Screen>
  );
}
