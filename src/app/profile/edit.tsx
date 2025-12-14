/**
 * PrismSplit Edit Profile Screen
 * 
 * Allows users to edit their profile information.
 */

import { useState } from 'react';
import { Stack, Text, YStack, XStack, Image } from 'tamagui';
import { useRouter } from 'expo-router';
import { Pressable, Alert, ActionSheetIOS, Platform } from 'react-native';
import { ArrowLeft, Camera, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { Screen, Card, Avatar, Button, Input } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore, useUIStore } from '@/lib/store';

export default function EditProfileScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { user, updateProfile } = useAuthStore();
  const { showToast } = useUIStore();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar_url || null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      showToast({ type: 'error', message: 'Name is required' });
      return;
    }
    
    setIsSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateProfile({ 
      full_name: fullName.trim(), 
      email: email.trim(),
      avatar_url: avatarUri 
    });
    showToast({ type: 'success', message: 'Profile updated!' });
    setIsSaving(false);
    router.back();
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow access to your photo library to change your profile picture.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ type: 'success', message: 'Photo selected!' });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow camera access to take a profile picture.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ type: 'success', message: 'Photo captured!' });
    }
  };

  const handleChangePhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library', 'Remove Photo'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          } else if (buttonIndex === 3) {
            setAvatarUri(null);
            showToast({ type: 'info', message: 'Photo removed' });
          }
        }
      );
    } else {
      // Android - show alert as action sheet
      Alert.alert(
        'Change Profile Photo',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Library', onPress: pickImageFromGallery },
          { 
            text: 'Remove Photo', 
            style: 'destructive',
            onPress: () => {
              setAvatarUri(null);
              showToast({ type: 'info', message: 'Photo removed' });
            }
          },
        ]
      );
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
          Edit Profile
        </Text>
        <Stack width={24} />
      </XStack>

      {/* Avatar Section */}
      <YStack alignItems="center" marginBottom="$6">
        <Pressable onPress={handleChangePhoto}>
          <Stack position="relative">
            {avatarUri ? (
              <Stack
                width={80}
                height={80}
                borderRadius={40}
                overflow="hidden"
              >
                <Image
                  source={{ uri: avatarUri }}
                  width={80}
                  height={80}
                  resizeMode="cover"
                />
              </Stack>
            ) : (
              <Avatar
                name={fullName || user?.full_name || 'User'}
                colorIndex={user?.color_index || 0}
                size="xl"
              />
            )}
            <Stack
              position="absolute"
              bottom={0}
              right={0}
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor={themeColors.primary}
              justifyContent="center"
              alignItems="center"
              borderWidth={2}
              borderColor={themeColors.background}
            >
              <Camera size={16} color="white" />
            </Stack>
          </Stack>
        </Pressable>
        <Pressable onPress={handleChangePhoto}>
          <Text fontSize={14} color={themeColors.primary} marginTop="$2">
            Change Photo
          </Text>
        </Pressable>
      </YStack>

      {/* Form */}
      <YStack gap="$4" marginBottom="$6">
        <Input
          label="Full Name"
          placeholder="Your name"
          value={fullName}
          onChangeText={setFullName}
        />
        
        <Input
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
        />
      </YStack>

      {/* Info Card */}
      <Card variant="surface" marginBottom="$6">
        <YStack gap="$2">
          <Text fontSize={14} fontWeight="500" color={themeColors.textPrimary}>
            About Your Profile
          </Text>
          <Text fontSize={13} color={themeColors.textSecondary}>
            Your name will be visible to other members in your groups. 
            Your email is used for account recovery and notifications.
          </Text>
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
    </Screen>
  );
}
