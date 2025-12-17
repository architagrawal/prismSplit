/**
 * PrismSplit Input Component
 * 
 * Text and numeric input with error states and labels.
 */

import { useState } from 'react';
import { Stack, Text } from 'tamagui';
import { TextInput, StyleSheet } from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  disabled = false,
  keyboardType = 'default',
  autoFocus = false,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const themeColors = useThemeColors();
  
  const borderColor = error 
    ? themeColors.error 
    : isFocused 
      ? themeColors.primary 
      : themeColors.border;

  return (
    <Stack gap="$1">
      {label && (
        <Text
          fontSize={14}
          fontWeight="500"
          color={themeColors.textSecondary}
          marginBottom="$1"
        >
          {label}
        </Text>
      )}
      
      <Stack
        flexDirection="row"
        alignItems="center"
        backgroundColor={themeColors.surface}
        borderWidth={2}
        borderColor={borderColor}
        borderRadius={12}
        paddingHorizontal="$3"
        opacity={disabled ? 0.5 : 1}
      >
        {leftIcon && (
          <Stack marginRight="$2">
            {leftIcon}
          </Stack>
        )}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={themeColors.textMuted}
          editable={!disabled}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          scrollEnabled={multiline}
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: themeColors.textPrimary,
              paddingVertical: 12,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            multiline && { minHeight: numberOfLines * 24 },
          ]}
        />
        
        {rightIcon && (
          <Stack marginLeft="$2">
            {rightIcon}
          </Stack>
        )}
      </Stack>
      
      {(error || helperText) && (
        <Text
          fontSize={12}
          color={error ? themeColors.error : themeColors.textMuted}
          marginTop="$1"
        >
          {error || helperText}
        </Text>
      )}
    </Stack>
  );
}

/**
 * Currency input with automatic formatting
 */
interface CurrencyInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  currency?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function CurrencyInput({
  label,
  value,
  onChangeText,
  currency = '$',
  error,
  disabled = false,
  autoFocus = false,
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const themeColors = useThemeColors();
  
  const borderColor = error 
    ? themeColors.error 
    : isFocused 
      ? themeColors.primary 
      : themeColors.border;

  return (
    <Stack gap="$1">
      {label && (
        <Text
          fontSize={14}
          fontWeight="500"
          color={themeColors.textSecondary}
          marginBottom="$1"
        >
          {label}
        </Text>
      )}
      
      <Stack
        flexDirection="row"
        alignItems="center"
        backgroundColor={themeColors.surface}
        borderWidth={2}
        borderColor={borderColor}
        borderRadius={12}
        paddingHorizontal="$4"
        height={52}
        opacity={disabled ? 0.5 : 1}
      >
        <Text
          fontSize={24}
          fontWeight="600"
          color={themeColors.textSecondary}
          marginRight="$2"
        >
          {currency}
        </Text>
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="0.00"
          placeholderTextColor={themeColors.textMuted}
          editable={!disabled}
          keyboardType="decimal-pad"
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          scrollEnabled={false}
          multiline={false}
          style={{
            flex: 1,
            fontSize: 28,
            fontWeight: '600',
            color: themeColors.textPrimary,
            textAlignVertical: 'center',
            padding: 0,
          }}
        />
      </Stack>
      
      {error && (
        <Text
          fontSize={12}
          color={themeColors.error}
          marginTop="$1"
        >
          {error}
        </Text>
      )}
    </Stack>
  );
}
