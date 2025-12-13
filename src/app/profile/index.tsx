/**
 * PrismSplit Profile/Account Screen
 * 
 * Uses authStore and uiStore.
 * This screen is outside tabs so it doesn't show the tab bar.
 */

import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Pressable, Linking, Alert } from 'react-native';
import { 
  User, 
  ArrowLeft,
  Bell, 
  LogOut, 
  ChevronRight,
  Moon,
  HelpCircle,
  Shield
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Card, Avatar, Button } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { useAuthStore, useUIStore } from '@/lib/store';

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
}

function SettingsItem({ icon, label, onPress, showChevron = true, rightElement }: SettingsItemProps) {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Pressable onPress={handlePress} disabled={!onPress}>
      <Stack 
        flexDirection="row" 
        alignItems="center" 
        paddingVertical="$3"
      >
        <Stack 
          width={40} 
          height={40} 
          borderRadius={10}
          backgroundColor={colors.light.surfaceElevated}
          justifyContent="center"
          alignItems="center"
          marginRight="$3"
        >
          {icon}
        </Stack>
        <Text flex={1} fontSize={16} color={colors.light.textPrimary}>
          {label}
        </Text>
        {rightElement}
        {showChevron && !rightElement && (
          <ChevronRight size={20} color={colors.light.textMuted} />
        )}
      </Stack>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, setTheme, showToast } = useUIStore();

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    logout();
    router.replace('/(auth)/welcome' as any);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit' as any);
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notifications',
      'Notification settings will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    showToast({ type: 'info', message: 'Opening Help center...' });
    Linking.openURL('https://example.com/help');
  };

  const handlePrivacy = () => {
    showToast({ type: 'info', message: 'Opening Privacy Policy...' });
    Linking.openURL('https://example.com/privacy');
  };

  return (
    <Screen scroll>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.light.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
          Account
        </Text>
        <Stack width={24} />
      </XStack>

      {/* Profile Card */}
      <Card variant="surface" marginBottom="$6">
        <XStack alignItems="center" gap="$3" marginBottom="$4">
          <Avatar
            name={user?.full_name || 'User'}
            colorIndex={user?.color_index || 0}
            size="lg"
          />
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
              {user?.full_name || 'User'}
            </Text>
            <Text fontSize={14} color={colors.light.textSecondary}>
              {user?.email || 'email@example.com'}
            </Text>
          </YStack>
        </XStack>
        
        <Button
          variant="outlined"
          size="sm"
          fullWidth
          onPress={handleEditProfile}
          icon={<User size={16} color={colors.light.primary} />}
        >
          Edit Profile
        </Button>
      </Card>

      {/* Settings */}
      <YStack>
        <Text fontSize={14} fontWeight="600" color={colors.light.textMuted} marginBottom="$2">
          PREFERENCES
        </Text>
        
        <Card variant="surface" marginBottom="$4">
          <SettingsItem
            icon={<Bell size={20} color={colors.light.textSecondary} />}
            label="Notifications"
            onPress={handleNotifications}
          />
          <SettingsItem
            icon={<Moon size={20} color={colors.light.textSecondary} />}
            label="Dark Mode"
            showChevron={false}
            onPress={toggleTheme}
            rightElement={
              <Stack
                width={50}
                height={28}
                borderRadius={14}
                backgroundColor={theme === 'dark' ? colors.light.primary : colors.light.border}
                padding="$1"
                justifyContent={theme === 'dark' ? 'flex-end' : 'flex-start'}
                flexDirection="row"
              >
                <Stack
                  width={22}
                  height={22}
                  borderRadius={11}
                  backgroundColor="white"
                />
              </Stack>
            }
          />
        </Card>

        <Text fontSize={14} fontWeight="600" color={colors.light.textMuted} marginBottom="$2">
          SUPPORT
        </Text>
        
        <Card variant="surface" marginBottom="$4">
          <SettingsItem
            icon={<HelpCircle size={20} color={colors.light.textSecondary} />}
            label="Help & FAQ"
            onPress={handleHelp}
          />
          <SettingsItem
            icon={<Shield size={20} color={colors.light.textSecondary} />}
            label="Privacy Policy"
            onPress={handlePrivacy}
          />
        </Card>

        <Button
          variant="error"
          size="md"
          fullWidth
          icon={<LogOut size={18} color="white" />}
          onPress={handleLogout}
        >
          Log Out
        </Button>
      </YStack>
    </Screen>
  );
}
