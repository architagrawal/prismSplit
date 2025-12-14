/**
 * PrismSplit Signup Screen
 * 
 * Uses authStore for registration.
 */

import { useState } from 'react';
import { Stack, Text, YStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { Button, Input, Screen } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/lib/store';

export default function SignupScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { signup, loginWithGoogle, isLoading } = useAuthStore();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    
    try {
      await signup(fullName, email, password);
      router.replace('/(tabs)');
    } catch (error) {
      setErrors({ email: 'Failed to create account' });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.replace('/(tabs)');
    } catch (error) {
      setErrors({ email: 'Google login failed' });
    }
  };

  return (
    <Screen scroll keyboardAvoiding>
      <Stack flex={1} paddingTop="$10">
        {/* Header */}
        <YStack alignItems="center" marginBottom="$6">
          <Text
            fontSize={28}
            fontWeight="700"
            color={themeColors.textPrimary}
            marginBottom="$2"
          >
            Create Account
          </Text>
          <Text
            fontSize={15}
            color={themeColors.textSecondary}
            marginBottom="$4"
          >
            Join PrismSplit to start splitting
          </Text>
          
          {/* Login prompt - stylish pill */}
          <Pressable onPress={() => router.push('/(auth)/login' as any)}>
            <Stack
              flexDirection="row"
              alignItems="center"
              gap="$2"
              backgroundColor={`${themeColors.primary}12`}
              paddingHorizontal="$4"
              paddingVertical="$2"
              borderRadius={20}
            >
              <Text fontSize={13} color={themeColors.primary}>
                Already have an account?
              </Text>
              <Stack
                flexDirection="row"
                alignItems="center"
                gap="$1"
              >
                <Text fontSize={13} fontWeight="600" color={themeColors.primary}>
                  Log in
                </Text>
                <ArrowRight size={14} color={themeColors.primary} />
              </Stack>
            </Stack>
          </Pressable>
        </YStack>

        {/* Form */}
        <YStack gap="$4">
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            leftIcon={<User size={20} color={themeColors.textMuted} />}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            leftIcon={<Mail size={20} color={themeColors.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={20} color={themeColors.textMuted} />}
            rightIcon={
              <Stack onPress={() => setShowPassword(!showPassword)}>
                {showPassword 
                  ? <EyeOff size={20} color={themeColors.textMuted} /> 
                  : <Eye size={20} color={themeColors.textMuted} />
                }
              </Stack>
            }
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={20} color={themeColors.textMuted} />}
          />
        </YStack>

        {/* Submit */}
        <YStack marginTop="$8" gap="$4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleSignup}
          >
            Create Account
          </Button>

          {/* Divider */}
          <Stack flexDirection="row" alignItems="center" gap="$3">
            <Stack flex={1} height={1} backgroundColor={themeColors.border} />
            <Text fontSize={14} color={themeColors.textMuted}>or</Text>
            <Stack flex={1} height={1} backgroundColor={themeColors.border} />
          </Stack>

          {/* Google OAuth */}
          <Button
            variant="outlined"
            size="lg"
            fullWidth
            onPress={handleGoogleLogin}
          >
            Continue with Google
          </Button>
        </YStack>
      </Stack>
    </Screen>
  );
}
