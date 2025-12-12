/**
 * PrismSplit Input Component
 * 
 * Text and numeric input with error states and labels.
 */

import { useState } from 'react';
import { styled, Stack, Text, Input as TamaguiInput, GetProps } from 'tamagui';
import { TextInput, StyleSheet } from 'react-native';

import { colors } from '@/theme/tokens';

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
  
  const borderColor = error 
    ? colors.light.error 
    : isFocused 
      ? colors.light.primary 
      : colors.light.border;

  return (
    <Stack gap="$1">
      {label && (
        <Text
          fontSize={14}
          fontWeight="500"
          color={colors.light.textSecondary}
          marginBottom="$1"
        >
          {label}
        </Text>
      )}
      
      <Stack
        flexDirection="row"
        alignItems="center"
        backgroundColor={colors.light.surface}
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
          placeholderTextColor={colors.light.textMuted}
          editable={!disabled}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
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
          color={error ? colors.light.error : colors.light.textMuted}
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
  
  const borderColor = error 
    ? colors.light.error 
    : isFocused 
      ? colors.light.primary 
      : colors.light.border;

  return (
    <Stack gap="$1">
      {label && (
        <Text
          fontSize={14}
          fontWeight="500"
          color={colors.light.textSecondary}
          marginBottom="$1"
        >
          {label}
        </Text>
      )}
      
      <Stack
        flexDirection="row"
        alignItems="center"
        backgroundColor={colors.light.surface}
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
          color={colors.light.textSecondary}
          marginRight="$2"
        >
          {currency}
        </Text>
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="0.00"
          placeholderTextColor={colors.light.textMuted}
          editable={!disabled}
          keyboardType="decimal-pad"
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.currencyInput}
        />
      </Stack>
      
      {error && (
        <Text
          fontSize={12}
          color={colors.light.error}
          marginTop="$1"
        >
          {error}
        </Text>
      )}
    </Stack>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.light.textPrimary,
    paddingVertical: 12,
  },
  currencyInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: colors.light.textPrimary,
  },
});
