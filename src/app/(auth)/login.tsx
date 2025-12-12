/**
 * PrismSplit Login Screen
 * 
 * Uses authStore for authentication state.
 */

import { useState } from 'react';
import { Stack, Text, YStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

import { Button, Input, Screen } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { useAuthStore } from '@/lib/store';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      setErrors({ email: 'Invalid credentials' });
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
      <Stack flex={1} paddingTop="$12" justifyContent="center">
        {/* Logo / Header */}
        <YStack alignItems="center" marginBottom="$10">
          <Stack
            width={80}
            height={80}
            borderRadius={20}
            backgroundColor={colors.light.primary}
            justifyContent="center"
            alignItems="center"
            marginBottom="$4"
          >
            <Text fontSize={36}>💎</Text>
          </Stack>
          <Text
            fontSize={32}
            fontWeight="700"
            color={colors.light.textPrimary}
          >
            Welcome Back
          </Text>
          <Text
            fontSize={16}
            color={colors.light.textSecondary}
          >
            Log in to continue
          </Text>
        </YStack>

        {/* Form */}
        <YStack gap="$4">
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
            placeholder="Enter your password"
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

          {/* Forgot password */}
          <Stack alignItems="flex-end">
            <Text
              fontSize={14}
              fontWeight="500"
              color={colors.light.primary}
              onPress={() => {/* TODO: Forgot password */}}
            >
              Forgot password?
            </Text>
          </Stack>
        </YStack>

        {/* Submit */}
        <YStack marginTop="$8" gap="$4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleLogin}
          >
            Log In
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

        {/* Signup link */}
        <Stack 
          flexDirection="row" 
          justifyContent="center" 
          marginTop="$6"
          gap="$1"
        >
          <Text fontSize={14} color={colors.light.textSecondary}>
            Don't have an account?
          </Text>
          <Text
            fontSize={14}
            fontWeight="600"
            color={colors.light.primary}
            onPress={() => router.push('/(auth)/signup' as any)}
          >
            Sign up
          </Text>
        </Stack>
      </Stack>
    </Screen>
  );
}
