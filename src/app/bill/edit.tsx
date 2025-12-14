/**
 * PrismSplit Bill Edit Screen
 * 
 * Edit existing bills - items, prices, tax, tip.
 * Editing resets participant selections if items change.
 */

import { useState, useEffect, useRef } from 'react';
import { ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Stack, Text, XStack, YStack } from 'tamagui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Plus, Trash2, Save } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Button, Input, CurrencyInput, Card, CategoryBadge } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBillsStore, useUIStore } from '@/lib/store';
import { categoryIcons, type Category } from '@/types/models';

interface EditItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
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

export default function BillEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const themeColors = useThemeColors();
  
  const { currentBill, fetchBillById, billItems, fetchBillItems, updateBill, isLoading } = useBillsStore();
  const { showToast } = useUIStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('groceries');
  const [items, setItems] = useState<EditItem[]>([]);
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Load bill data
  useEffect(() => {
    if (id) {
      fetchBillById(id);
      fetchBillItems(id);
    }
  }, [id]);

  // Populate form when bill loads
  useEffect(() => {
    if (currentBill) {
      setTitle(currentBill.title);
      setCategory(currentBill.category);
      setTax(currentBill.tax_amount.toString());
      setTip(currentBill.tip_amount.toString());
    }
  }, [currentBill]);

  // Populate items
  useEffect(() => {
    if (id && billItems[id]) {
      setItems(billItems[id].map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })));
    }
  }, [id, billItems]);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + (parseFloat(tax) || 0) + (parseFloat(tip) || 0);

  const handleItemChange = (index: number, field: keyof EditItem, value: string | number) => {
    setHasChanges(true);
    setItems(prev => {
      const updated = [...prev];
      if (field === 'name') {
        updated[index] = { ...updated[index], name: value as string };
      } else if (field === 'price') {
        updated[index] = { ...updated[index], price: parseFloat(value as string) || 0 };
      } else if (field === 'quantity') {
        updated[index] = { ...updated[index], quantity: parseInt(value as string) || 1 };
      }
      return updated;
    });
  };

  const handleAddItem = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasChanges(true);
    setItems(prev => [
      ...prev,
      { id: `new-${Date.now()}`, name: '', price: 0, quantity: 1 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasChanges(true);
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast({ type: 'error', message: 'Please enter a bill title' });
      return;
    }

    const validItems = items.filter(item => item.name.trim() && item.price > 0);
    if (validItems.length === 0) {
      showToast({ type: 'error', message: 'Please add at least one item' });
      return;
    }

    try {
      await updateBill(id!, {
        title,
        category,
        tax_amount: parseFloat(tax) || 0,
        tip_amount: parseFloat(tip) || 0,
        total_amount: total,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ type: 'success', message: 'Bill updated!' });
      router.back();
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to save changes' });
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  if (!currentBill) {
    return (
      <Screen>
        <Text>Loading...</Text>
      </Screen>
    );
  }

  return (
    <Screen keyboardAvoiding>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
        <Pressable onPress={handleCancel}>
          <X size={24} color={themeColors.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
          Edit Bill
        </Text>
        <Pressable onPress={handleSave} disabled={isLoading}>
          <Save size={24} color={themeColors.primary} />
        </Pressable>
      </XStack>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Title */}
          <YStack marginBottom="$4">
            <Input
              label="Bill Title"
              placeholder="e.g., Costco Trip"
              value={title}
              onChangeText={(val) => { setTitle(val); setHasChanges(true); }}
            />
          </YStack>

          {/* Category */}
          <YStack marginBottom="$4">
            <Text fontSize={14} fontWeight="500" color={themeColors.textSecondary} marginBottom="$2">
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$2">
                {categories.map((cat) => (
                  <Pressable
                    key={cat.key}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setCategory(cat.key);
                      setHasChanges(true);
                    }}
                  >
                    <Stack
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                      borderRadius={20}
                      backgroundColor={category === cat.key 
                        ? `${themeColors.primary}20` 
                        : themeColors.surfaceElevated
                      }
                      borderWidth={category === cat.key ? 2 : 0}
                      borderColor={themeColors.primary}
                    >
                      <XStack alignItems="center" gap="$1">
                        <Text fontSize={16}>{cat.icon}</Text>
                        <Text 
                          fontSize={14} 
                          color={category === cat.key 
                            ? themeColors.primary 
                            : themeColors.textSecondary
                          }
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

          {/* Items */}
          <YStack marginBottom="$4">
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
              <Text fontSize={14} fontWeight="500" color={themeColors.textSecondary}>
                Items ({items.length})
              </Text>
              <Pressable onPress={handleAddItem}>
                <XStack alignItems="center" gap="$1">
                  <Plus size={16} color={themeColors.primary} />
                  <Text fontSize={14} color={themeColors.primary}>Add Item</Text>
                </XStack>
              </Pressable>
            </XStack>

            {items.map((item, index) => (
              <Card key={item.id} variant="surface" marginBottom="$2">
                <XStack alignItems="center" gap="$2">
                  <YStack flex={1} gap="$2">
                    <TextInput
                      placeholder="Item name"
                      value={item.name}
                      onChangeText={(val) => handleItemChange(index, 'name', val)}
                      style={{
                        fontSize: 16,
                        color: themeColors.textPrimary,
                        padding: 0,
                      }}
                      placeholderTextColor={themeColors.textMuted}
                    />
                    <XStack gap="$3">
                      <XStack alignItems="center" gap="$1" flex={1}>
                        <Text fontSize={14} color={themeColors.textMuted}>$</Text>
                        <TextInput
                          placeholder="0.00"
                          value={item.price > 0 ? item.price.toString() : ''}
                          onChangeText={(val) => handleItemChange(index, 'price', val)}
                          keyboardType="decimal-pad"
                          style={{
                            flex: 1,
                            fontSize: 14,
                            color: themeColors.textPrimary,
                            padding: 0,
                          }}
                          placeholderTextColor={themeColors.textMuted}
                        />
                      </XStack>
                      <XStack alignItems="center" gap="$1">
                        <Text fontSize={14} color={themeColors.textMuted}>Qty:</Text>
                        <TextInput
                          value={item.quantity.toString()}
                          onChangeText={(val) => handleItemChange(index, 'quantity', val)}
                          keyboardType="number-pad"
                          style={{
                            width: 40,
                            fontSize: 14,
                            color: themeColors.textPrimary,
                            padding: 0,
                            textAlign: 'center',
                          }}
                        />
                      </XStack>
                    </XStack>
                  </YStack>
                  
                  {items.length > 1 && (
                    <Pressable onPress={() => handleRemoveItem(index)}>
                      <Trash2 size={18} color={themeColors.error} />
                    </Pressable>
                  )}
                </XStack>
              </Card>
            ))}
          </YStack>

          {/* Tax & Tip */}
          <Card variant="surface" marginBottom="$4">
            <YStack gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color={themeColors.textSecondary}>Subtotal</Text>
                <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
                  ${subtotal.toFixed(2)}
                </Text>
              </XStack>
              
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color={themeColors.textSecondary}>Tax</Text>
                <XStack alignItems="center" gap="$1">
                  <Text fontSize={14} color={themeColors.textMuted}>$</Text>
                  <TextInput
                    placeholder="0.00"
                    value={tax}
                    onChangeText={(val) => { setTax(val); setHasChanges(true); }}
                    keyboardType="decimal-pad"
                    style={{
                      width: 60,
                      fontSize: 16,
                      color: themeColors.textPrimary,
                      textAlign: 'right',
                    }}
                    placeholderTextColor={themeColors.textMuted}
                  />
                </XStack>
              </XStack>

              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color={themeColors.textSecondary}>Tip</Text>
                <XStack alignItems="center" gap="$1">
                  <Text fontSize={14} color={themeColors.textMuted}>$</Text>
                  <TextInput
                    placeholder="0.00"
                    value={tip}
                    onChangeText={(val) => { setTip(val); setHasChanges(true); }}
                    keyboardType="decimal-pad"
                    style={{
                      width: 60,
                      fontSize: 16,
                      color: themeColors.textPrimary,
                      textAlign: 'right',
                    }}
                    placeholderTextColor={themeColors.textMuted}
                  />
                </XStack>
              </XStack>

              <Stack height={1} backgroundColor={themeColors.border} />

              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>Total</Text>
                <Text fontSize={20} fontWeight="700" color={themeColors.primary}>
                  ${total.toFixed(2)}
                </Text>
              </XStack>
            </YStack>
          </Card>

          {/* Warning about selections reset */}
          {hasChanges && (
            <Card 
              variant="surface" 
              marginBottom="$4"
              backgroundColor={themeColors.warningBg}
              borderWidth={1}
              borderColor={themeColors.warning}
            >
              <Text fontSize={14} color={themeColors.textPrimary}>
                ⚠️ Editing item names or prices will reset participant selections. They'll need to re-select their items.
              </Text>
            </Card>
          )}
        </ScrollView>

        {/* Save Button */}
        <Stack paddingTop="$4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={!hasChanges}
            onPress={handleSave}
          >
            Save Changes
          </Button>
        </Stack>
      </KeyboardAvoidingView>
    </Screen>
  );
}
