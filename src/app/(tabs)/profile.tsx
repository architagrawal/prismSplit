/**
 * PrismSplit Profile/Account Tab
 * 
 * Uses authStore and uiStore.
 */

import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Pressable, Linking, Alert } from 'react-native';
import { 
  User, 
  Settings, 
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
    Alert.alert(
      'Edit Profile',
      'Profile editing will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleNotifications = () => {
    router.push('/settings/notifications' as any);
  };

  const handleHelp = () => {
    router.push('/settings/help' as any);
  };

  const handlePrivacy = () => {
    router.push('/settings/privacy' as any);
  };

  return (
    <Screen scroll safeBottom={false}>
      {/* Header */}
      <Stack paddingTop="$2" paddingBottom="$6">
        <Text fontSize={28} fontWeight="700" color={colors.light.textPrimary}>
          Account
        </Text>
      </Stack>

      {/* Profile Card */}
      <Card variant="surface" marginBottom="$6">
        <XStack alignItems="center" gap="$4">
          <Avatar
            name={user?.full_name || 'User'}
            colorIndex={user?.color_index || 0}
            size="xl"
          />
          <YStack flex={1}>
            <Text fontSize={20} fontWeight="600" color={colors.light.textPrimary}>
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
