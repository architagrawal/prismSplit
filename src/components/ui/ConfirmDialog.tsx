/**
 * PrismSplit Confirm Dialog
 * 
 * Cross-platform confirmation dialog that supports:
 * - Tapping outside to dismiss (stay on page)
 * - Custom buttons with different styles
 * - Works on both iOS and Android
 */

import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Stack, Text, YStack } from 'tamagui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Button } from './Button';

interface ConfirmDialogButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'primary';
}

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: ConfirmDialogButton[];
  onDismiss: () => void; // Called when tapping outside
}

export function ConfirmDialog({
  visible,
  title,
  message,
  buttons,
  onDismiss,
}: ConfirmDialogProps) {
  const themeColors = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      {/* Backdrop - tapping dismisses */}
      <Pressable 
        style={styles.backdrop} 
        onPress={onDismiss}
      >
        {/* Dialog Container - stop propagation */}
        <Pressable 
          style={[
            styles.dialog,
            { backgroundColor: themeColors.surfaceElevated }
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <YStack gap="$3" padding="$4">
            {/* Title */}
            <Text 
              fontSize={18} 
              fontWeight="600" 
              color={themeColors.textPrimary}
              textAlign="center"
            >
              {title}
            </Text>
            
            {/* Message */}
            <Text 
              fontSize={14} 
              color={themeColors.textSecondary}
              textAlign="center"
            >
              {message}
            </Text>
            
            {/* Buttons - equal width with original styling */}
            <View style={styles.buttonContainer}>
              <View style={styles.buttonWrapper}>
                <Button
                  variant={buttons[0].style === 'destructive' ? 'ghostDestructive' : 'ghost'}
                  size="md"
                  fullWidth
                  onPress={buttons[0].onPress}
                >
                  {buttons[0].text}
                </Button>
              </View>
              <View style={styles.buttonWrapper}>
                <Button
                  variant={
                    buttons[1].style === 'primary' ? 'primary' :
                    buttons[1].style === 'destructive' ? 'outlined' : 'ghost'
                  }
                  size="md"
                  fullWidth
                  onPress={buttons[1].onPress}
                >
                  {buttons[1].text}
                </Button>
              </View>
            </View>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  buttonWrapper: {
    flex: 1,
    minWidth: 0,
    alignItems: 'stretch',
  },
});

export default ConfirmDialog;
