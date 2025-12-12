/**
 * PrismSplit Signup Screen
 * 
 * Uses authStore for registration.
 */

import { useState } from 'react';
import { Stack, Text, YStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

import { Button, Input, Screen } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { useAuthStore } from '@/lib/store';

export default function SignupScreen() {
  const router = useRouter();
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
    <Screen scroll keyboardAvoiding backgroundColor={colors.light.background}>
      <Stack flex={1} paddingTop="$10">
        {/* Header */}
        <YStack alignItems="center" marginBottom="$8">
          <Text
            fontSize={32}
            fontWeight="700"
            color={colors.light.textPrimary}
            marginBottom="$2"
          >
            Create Account
          </Text>
          <Text
            fontSize={16}
            color={colors.light.textSecondary}
          >
            Join PrismSplit to start splitting
          </Text>
        </YStack>

        {/* Form */}
        <YStack gap="$4">
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            leftIcon={<User size={20} color={colors.light.textMuted} />}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            leftIcon={<Mail size={20} color={colors.light.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={20} color={colors.light.textMuted} />}
            rightIcon={
              <Stack onPress={() => setShowPassword(!showPassword)}>
                {showPassword 
                  ? <EyeOff size={20} color={colors.light.textMuted} /> 
                  : <Eye size={20} color={colors.light.textMuted} />
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
            leftIcon={<Lock size={20} color={colors.light.textMuted} />}
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
            <Stack flex={1} height={1} backgroundColor={colors.light.border} />
            <Text fontSize={14} color={colors.light.textMuted}>or</Text>
            <Stack flex={1} height={1} backgroundColor={colors.light.border} />
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

        {/* Login link */}
        <Stack 
          flexDirection="row" 
          justifyContent="center" 
          marginTop="$6"
          gap="$1"
        >
          <Text fontSize={14} color={colors.light.textSecondary}>
            Already have an account?
          </Text>
          <Text
            fontSize={14}
            fontWeight="600"
            color={colors.light.primary}
            onPress={() => router.push('/(auth)/login' as any)}
          >
            Log in
          </Text>
        </Stack>
      </Stack>
    </Screen>
  );
}
