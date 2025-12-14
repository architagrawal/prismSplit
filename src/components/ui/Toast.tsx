/**
 * PrismSplit Toast Component
 * 
 * Animated toast notifications with support for success, error, info, and warning states.
 */

import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Stack, Text, XStack } from 'tamagui';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/useThemeColors';
import { useUIStore } from '@/lib/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOAST_DURATION = 300; // Animation duration

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface SingleToastProps {
  id: string;
  type: ToastType;
  message: string;
  onDismiss: (id: string) => void;
  index: number;
}

function SingleToast({ id, type, message, onDismiss, index }: SingleToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const themeColors = useThemeColors();

  // Get toast config based on type and current theme
  const getToastConfig = () => ({
    success: {
      backgroundColor: themeColors.successBg,
      borderColor: themeColors.success,
      iconColor: themeColors.success,
    },
    error: {
      backgroundColor: themeColors.errorBg,
      borderColor: themeColors.error,
      iconColor: themeColors.error,
    },
    info: {
      backgroundColor: themeColors.infoBg,
      borderColor: themeColors.info,
      iconColor: themeColors.info,
    },
    warning: {
      backgroundColor: themeColors.warningBg,
      borderColor: themeColors.warning,
      iconColor: themeColors.warning,
    },
  });

  const config = getToastConfig()[type];

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: TOAST_DURATION,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
    ]).start();
  }, []);

  const handleDismiss = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(id);
    });
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [
            { translateY },
            { scale },
          ],
          opacity,
          marginTop: index * 8,
        },
      ]}
    >
      <Pressable onPress={handleDismiss}>
        <Stack
          backgroundColor={config.backgroundColor}
          borderWidth={1}
          borderColor={config.borderColor}
          borderRadius={12}
          paddingHorizontal="$4"
          paddingVertical="$3"
          minWidth={200}
          maxWidth={SCREEN_WIDTH - 48}
          shadowColor="black"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.1}
          shadowRadius={12}
        >
          <XStack alignItems="center" gap="$3">
            <Stack>
              {type === 'success' && <CheckCircle size={20} color={config.iconColor} />}
              {type === 'error' && <XCircle size={20} color={config.iconColor} />}
              {type === 'info' && <Info size={20} color={config.iconColor} />}
              {type === 'warning' && <AlertCircle size={20} color={config.iconColor} />}
            </Stack>
            
            <Text 
              flex={1}
              fontSize={14} 
              fontWeight="500"
              color={themeColors.textPrimary}
            >
              {message}
            </Text>
            
            <Pressable onPress={handleDismiss} hitSlop={8}>
              <X size={16} color={themeColors.textMuted} />
            </Pressable>
          </XStack>
        </Stack>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Toast Container
 * 
 * Renders all active toasts. Add this to your root layout.
 */
export function ToastContainer() {
  const insets = useSafeAreaInsets();
  const { toasts, dismissToast } = useUIStore();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <Stack
      position="absolute"
      top={insets.top + 8}
      left={0}
      right={0}
      alignItems="center"
      pointerEvents="box-none"
      zIndex={9999}
    >
      {toasts.map((toast, index) => (
        <SingleToast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onDismiss={dismissToast}
          index={index}
        />
      ))}
    </Stack>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
});

export default ToastContainer;
