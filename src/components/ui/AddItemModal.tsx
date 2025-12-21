
import { useState } from 'react';
import { Modal, KeyboardAvoidingView, Platform, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { Stack, Text, XStack, YStack } from 'tamagui';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Button } from './Button';
import { CategoryBadge } from './Badge';
import { useThemeColors } from '@/hooks/useThemeColors';
import { categoryIcons, type Category } from '@/types/models';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, price: number, category: Category) => void;
}

const categories: { key: Category; icon: string; label: string }[] = [
  { key: 'groceries', icon: '🛒', label: 'Groceries' },
  { key: 'dining', icon: '🍔', label: 'Dining' },
  { key: 'transport', icon: '🚗', label: 'Transport' },
  { key: 'utilities', icon: '💡', label: 'Utilities' },
  { key: 'entertainment', icon: '🎮', label: 'Entertainment' },
  { key: 'travel', icon: '✈️', label: 'Travel' },
  { key: 'shopping', icon: '🛍️', label: 'Shopping' },
  { key: 'other', icon: '📦', label: 'Other' },
];

export function AddItemModal({ visible, onClose, onAdd }: AddItemModalProps) {
  const themeColors = useThemeColors();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category>('groceries');

  const handleAdd = () => {
    if (!name.trim()) return;
    
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAdd(name.trim(), priceNum, category);
    
    // Reset and close
    setName('');
    setPrice('');
    setCategory('groceries');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setPrice('');
    setCategory('groceries');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Stack 
          backgroundColor={themeColors.surface} 
          width="100%" 
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          padding="$4"
          paddingBottom={Platform.OS === 'ios' ? 40 : 24}
          shadowColor="black"
          shadowOffset={{ width: 0, height: -2 }}
          shadowOpacity={0.1}

          shadowRadius={10}
        >
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
              Add New Item
            </Text>
            <Button variant="ghost" size="sm" onPress={handleClose} icon={<X size={20} color={themeColors.textSecondary} />}>
              {''}
            </Button>
          </XStack>

          {/* Form */}
          <YStack gap="$4">
            <YStack gap="$2">
              <Text fontSize={14} fontWeight="500" color={themeColors.textSecondary}>
                Item Name
              </Text>
              <TextInput
                placeholder="e.g., Pizza"
                placeholderTextColor={themeColors.textMuted}
                value={name}
                onChangeText={setName}
                style={[
                  styles.input, 
                  { 
                    backgroundColor: themeColors.surfaceElevated,
                    color: themeColors.textPrimary,
                    borderColor: themeColors.border
                  }
                ]}
                autoFocus
                scrollEnabled={false}
              />
            </YStack>

            <YStack gap="$2">
              <Text fontSize={14} fontWeight="500" color={themeColors.textSecondary}>
                Price
              </Text>
              <XStack alignItems="center" gap="$2">
                <Text fontSize={20} color={themeColors.textPrimary}>$</Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={themeColors.textMuted}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  scrollEnabled={false}
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: themeColors.surfaceElevated,
                      color: themeColors.textPrimary,
                      borderColor: themeColors.border,
                      flex: 1
                    }
                  ]}
                />
              </XStack>
            </YStack>

            {/* Category Selector */}
             <YStack gap="$2">
              <Text fontSize={14} fontWeight="500" color={themeColors.textSecondary}>
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                <XStack gap="$2">
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.key}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setCategory(cat.key);
                      }}
                    >
                      <Stack
                        paddingHorizontal="$3"
                        paddingVertical="$2"
                        borderRadius={12}
                        backgroundColor={category === cat.key 
                          ? `${themeColors.primary}20` 
                          : themeColors.surfaceElevated
                        }
                        borderWidth={1}
                        borderColor={category === cat.key ? themeColors.primary : 'transparent'}
                      >
                        <XStack alignItems="center" gap="$1.5">
                          <Text fontSize={16}>{cat.icon}</Text>
                          <Text 
                            fontSize={14} 
                            color={category === cat.key 
                              ? themeColors.primary 
                              : themeColors.textSecondary
                            }
                            fontWeight={category === cat.key ? '600' : '400'}
                          >
                            {cat.label}
                          </Text>
                        </XStack>
                      </Stack>
                    </Pressable>
                  ))}
                </XStack>
              </ScrollView>
            </YStack>

            <Button 
              variant="primary" 
              size="lg" 
              onPress={handleAdd}
              disabled={!name.trim() || !price || parseFloat(price) <= 0}
            >
              Add Item
            </Button>
          </YStack>
        </Stack>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
});
