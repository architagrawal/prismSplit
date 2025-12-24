/**
 * PrismSplit Login Screen
 * 
 * Uses authStore for authentication state.
 */

import { useState } from 'react';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

import { Button, Input, Screen } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/lib/store';

export default function LoginScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { login, loginWithGoogle, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
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
    } catch (error: any) {
      // Map Supabase error messages to user-friendly messages
      const errorMessage = error?.message?.toLowerCase() || '';
      
      if (errorMessage.includes('invalid login credentials') || 
          errorMessage.includes('invalid email or password')) {
        setErrors({ general: 'Incorrect email or password. Please try again.' });
      } else if (errorMessage.includes('email not confirmed')) {
        setErrors({ general: 'Please check your email and confirm your account.' });
      } else if (errorMessage.includes('too many requests')) {
        setErrors({ general: 'Too many login attempts. Please wait a moment.' });
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setErrors({ general: 'Network error. Please check your connection.' });
      } else if (errorMessage.includes('validation')) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
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
    <Screen keyboardAvoiding>
      <Stack flex={1} justifyContent="center">
        {/* Logo / Header - Compact */}
        <YStack alignItems="center" marginBottom="$2">
          <XStack alignItems="center" gap="$5" marginBottom="$8">
            <Stack
              width={50}
              height={50}
              borderRadius={14}
              backgroundColor={themeColors.primary}
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize={24}>💎</Text>
            </Stack>
            <Text
              fontSize={28}
              fontWeight="700"
              color={themeColors.textPrimary}
            >
              PrismSplit
            </Text>
          </XStack>
          <Text
            fontSize={15}
            color={themeColors.textSecondary}
          >
            Log in to continue
          </Text>
        </YStack>

        {/* Form */}
        <YStack gap="$3">
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            leftIcon={<Mail size={18} color={themeColors.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={18} color={themeColors.textMuted} />}
            rightIcon={
              <Stack onPress={() => setShowPassword(!showPassword)}>
                {showPassword 
                  ? <EyeOff size={18} color={themeColors.textMuted} /> 
                  : <Eye size={18} color={themeColors.textMuted} />
                }
              </Stack>
            }
          />

          {/* Forgot password */}
          <Stack alignItems="flex-end">
            <Text
              fontSize={13}
              fontWeight="500"
              color={themeColors.primary}
              onPress={() => {/* TODO: Forgot password */}}
            >
              Forgot password?
            </Text>
          </Stack>
        </YStack>

        {/* General Error Message */}
        {errors.general && (
          <Stack 
            backgroundColor="rgba(239, 68, 68, 0.1)" 
            padding="$3" 
            borderRadius="$3"
            marginTop="$3"
          >
            <Text color={themeColors.error} fontSize={14} textAlign="center">
              {errors.general}
            </Text>
          </Stack>
        )}

        {/* Submit */}
        <YStack marginTop="$5" gap="$3">
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
            <Stack flex={1} height={1} backgroundColor={themeColors.border} />
            <Text fontSize={13} color={themeColors.textMuted}>or</Text>
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

        {/* Signup link */}
        <Stack 
          flexDirection="row" 
          justifyContent="center" 
          marginTop="$4"
          gap="$1"
        >
          <Text fontSize={14} color={themeColors.textSecondary}>
            Don't have an account?
          </Text>
          <Text
            fontSize={14}
            fontWeight="600"
            color={themeColors.primary}
            onPress={() => router.push('/(auth)/signup' as any)}
          >
            Sign up
          </Text>
        </Stack>
      </Stack>
    </Screen>
  );
}
