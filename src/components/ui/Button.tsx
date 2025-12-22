/**
 * PrismSplit Button Component
 * 
 * Primary button with gradient, secondary, outlined, and ghost variants.
 * Follows the pastel design system.
 */

import { Stack, Text } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost' | 'ghostDestructive' | 'success' | 'error';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const sizeStyles = {
  sm: { height: 44, paddingHorizontal: 16, fontSize: 14 },
  md: { height: 50, paddingHorizontal: 20, fontSize: 16 },
  lg: { height: 56, paddingHorizontal: 28, fontSize: 18 },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onPress,
  icon,
  iconPosition = 'left',
}: ButtonProps) {
  const themeColors = useThemeColors();
  const sizeStyle = sizeStyles[size];
  
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  // Primary uses gradient
  if (variant === 'primary') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.buttonBase,
          { height: sizeStyle.height }, // Remove padding here, move to content
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <LinearGradient
          colors={[themeColors.primary, themeColors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
             styles.gradient, 
             { borderRadius: 12, paddingHorizontal: sizeStyle.paddingHorizontal },
             fullWidth && { width: '100%' }
          ]}
        >
          <Stack flexDirection="row" alignItems="center" gap="$2">
            {icon && iconPosition === 'left' && icon}
            <Text
              color="white"
              fontSize={sizeStyle.fontSize}
              fontWeight="600"
            >
              {loading ? 'Loading...' : children}
            </Text>
            {icon && iconPosition === 'right' && icon}
          </Stack>
        </LinearGradient>
      </Pressable>
    );
  }

  // Other variants - use theme colors
  const variantStyles = {
    secondary: {
      backgroundColor: themeColors.secondary,
      borderColor: 'transparent',
      textColor: 'white',
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: themeColors.primary,
      textColor: themeColors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: themeColors.primary,
    },
    ghostDestructive: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: themeColors.error,
    },
    success: {
      backgroundColor: themeColors.success,
      borderColor: 'transparent',
      textColor: 'white',
    },
    error: {
      backgroundColor: themeColors.error,
      borderColor: 'transparent',
      textColor: 'white',
    },
  };

  const style = variantStyles[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.buttonBase,
        {
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          borderWidth: variant === 'outlined' ? 1.5 : 0,
        },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Stack flexDirection="row" alignItems="center" justifyContent="center" gap="$2">
        {icon && iconPosition === 'left' && icon}
        <Text
          color={style.textColor}
          fontSize={sizeStyle.fontSize}
          fontWeight="600"
          textAlign="center"
        >
          {loading ? 'Loading...' : children}
        </Text>
        {icon && iconPosition === 'right' && icon}
      </Stack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  gradient: {
    // flex: 1, // Removed to allow auto-width
    justifyContent: 'center',
    alignItems: 'center',
    // width: '100%',
    height: '100%',
  },
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
