import { useState, useEffect, useRef } from 'react';
import { ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, Text, XStack, YStack } from 'tamagui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Plus, Trash2, Save } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { 
  Screen, 
  ScreenHeader,
  Button, 
  Input, 
  Card, 
  ConfirmDialog 
} from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBillsStore, useUIStore, useActivityStore, useAuthStore } from '@/lib/store';
import { categoryIcons, type Category, type Activity } from '@/types/models';

interface EditItem {
  id: string;
  name: string;
  totalPrice: string; // User enters TOTAL price for the line
  quantity: string;
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
  const { id, autoAdd } = useLocalSearchParams<{ id: string; autoAdd?: string }>();
  const router = useRouter();
  const themeColors = useThemeColors();
  const autoAddProcessed = useRef(false);
  
  const { currentBill, fetchBillById, billItems, fetchBillItems, updateBill, updateBillItems, isLoading } = useBillsStore();
  const { showToast } = useUIStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('groceries');
  const [items, setItems] = useState<EditItem[]>([]);
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [taxSplitMode, setTaxSplitMode] = useState<'equal' | 'proportional' | 'custom'>('proportional');
  const [tipSplitMode, setTipSplitMode] = useState<'equal' | 'proportional' | 'custom'>('proportional');

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
      setTaxSplitMode(currentBill.tax_split_mode || 'proportional');
      setTipSplitMode(currentBill.tip_split_mode || 'proportional');
    }
  }, [currentBill]);

  // Populate items and handle autoAdd
  useEffect(() => {
    if (id && billItems[id]) {
      const rawItems = billItems[id];
      // Aggregate items for display (reversing the explosion from store)
      // Group by name + price
      const aggregatedMap = new Map<string, { id: string, name: string, unitPrice: number, quantity: number }>();
      
      // Helper to strip (1/3) suffix
      const normalizeName = (name: string) => name.replace(/\s\(\d+\/\d+\)$/, '');

      rawItems.forEach(item => {
        const cleanName = normalizeName(item.name);
        // Round price to 2 decimals to ensure key matching works for float variations
        const priceKey = item.price.toFixed(2);
        const key = `${cleanName}-${priceKey}`;
        
        if (aggregatedMap.has(key)) {
            const existing = aggregatedMap.get(key)!;
            aggregatedMap.set(key, { ...existing, quantity: existing.quantity + item.quantity });
        } else {
            aggregatedMap.set(key, {
                id: item.id.split('-')[0] === 'collapsed' ? item.id : `agg-${key}`, // Use reliable temporary ID for editing
                name: cleanName,
                unitPrice: item.price,
                quantity: item.quantity,
            });
        }
      });

      const loadedItems: EditItem[] = Array.from(aggregatedMap.values()).map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity.toString(),
          totalPrice: (i.unitPrice * i.quantity).toFixed(2)
      }));
      setItems(loadedItems);

      // Handle autoAdd if requested and not yet processed
      if (autoAdd === 'true' && !autoAddProcessed.current) {
        autoAddProcessed.current = true;
        setTimeout(() => {
            const newItem = { id: `new-${Date.now()}`, name: '', totalPrice: '', quantity: '1' };
            // If we have items, append. If empty, just set it.
            setItems(prev => [...prev, newItem]);
            setHasChanges(true); 
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 100);
      }
    }
  }, [id, billItems, autoAdd]);

  // Subtotal is straight sum of Total Prices
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
  const total = subtotal + (parseFloat(tax) || 0) + (parseFloat(tip) || 0);

  const handleItemChange = (index: number, field: keyof EditItem, value: string) => {
    setHasChanges(true);
    setItems(prev => {
      const updated = [...prev];
      if (field === 'name') {
        updated[index] = { ...updated[index], name: value };
      } else if (field === 'totalPrice') {
        updated[index] = { ...updated[index], totalPrice: value };
      } else if (field === 'quantity') {
        updated[index] = { ...updated[index], quantity: value };
      }
      return updated;
    });
  };

  const handleAddItem = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasChanges(true);
    setItems(prev => [
      ...prev,
      { id: `new-${Date.now()}`, name: '', totalPrice: '', quantity: '1' }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasChanges(true);
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast({ type: 'error', message: 'Please enter a bill title' });
      return;
    }

    // Filter and transform to store format (deriving unit price)
    const validItems: { name: string, price: number, quantity: number }[] = [];
    
    items.forEach(item => {
        const total = parseFloat(item.totalPrice) || 0;
        const qty = parseInt(item.quantity) || 0;
        
        if (item.name.trim() && total > 0 && qty > 0) {
            validItems.push({
                name: item.name,
                price: total / qty, // Derive unit price
                quantity: qty
            });
        }
    });

    if (validItems.length === 0) {
      showToast({ type: 'error', message: 'Please add at least one item' });
      return;
    }

    try {
      let finalTax = parseFloat(tax) || 0;
      let finalTip = parseFloat(tip) || 0;
      let finalTaxSplitMode: 'equal' | 'proportional' | undefined = taxSplitMode === 'custom' ? undefined : taxSplitMode;
      let finalTipSplitMode: 'equal' | 'proportional' | undefined = tipSplitMode === 'custom' ? undefined : tipSplitMode;
      
      // 1. Update Bill Metadata
      await updateBill(id!, {
        title,
        category,
        tax_amount: finalTax,
        tip_amount: finalTip,
        total_amount: total, // Recalculated total
        tax_split_mode: finalTaxSplitMode,
        tip_split_mode: finalTipSplitMode,
      });

      // 2. Update Bill Items
      await updateBillItems(id!, validItems.map(i => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })));

      
      // Log activity
      const { user } = useAuthStore.getState();
      const { addActivity } = useActivityStore.getState();
      
      if (user && currentBill) {
        const activity: Activity = {
          id: `act-${Date.now()}`,
          group_id: currentBill.group_id,
          group: { id: currentBill.group_id, name: 'Group', emoji: '👥' }, // Simplified for demo
          user_id: user.id,
          user: user,
          type: 'bill_shared', 
          entity_type: 'bill',
          entity_id: id!,
          metadata: { action: 'updated', billTitle: title },
          created_at: new Date().toISOString(),
          is_read: false
        };
        addActivity(activity);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ type: 'success', message: 'Bill updated! Participants notified.' });
      router.back();
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to save changes' });
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
        setShowConfirmDialog(true);
    } else {
        router.back();
    }
  };

  return (
    <Screen keyboardAvoiding>
      {/* Header */}
      <ScreenHeader 
        title="Edit Bill"
        leftAction={
          <Pressable onPress={handleCancel} hitSlop={10}>
             <X size={24} color={themeColors.textPrimary} />
          </Pressable>
        }
        rightAction={
          <Pressable onPress={handleSave} disabled={isLoading} hitSlop={10}>
             <Save size={24} color={themeColors.primary} />
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
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
                      borderWidth={1}
                      borderColor={category === cat.key ? themeColors.primary : themeColors.border}
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
              <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
                Items ({items.length})
              </Text>
              <Pressable onPress={handleAddItem} hitSlop={10}>
                <XStack alignItems="center" gap="$1">
                  <Plus size={16} color={themeColors.primary} />
                  <Text fontSize={14} color={themeColors.primary}>Add Item</Text>
                </XStack>
              </Pressable>
            </XStack>
            
            {/* List Row Style Container */}
            <Stack 
                backgroundColor={themeColors.surface} 
                borderRadius={12} 
                borderWidth={1} 
                borderColor={themeColors.border}
                overflow="hidden"
            >
                {items.map((item, index) => (
                <Stack 
                    key={item.id} 
                    borderBottomWidth={index < items.length - 1 ? 1 : 0}
                    borderBottomColor={themeColors.border}
                    paddingHorizontal="$3"
                    paddingVertical="$3"
                    backgroundColor={themeColors.surface}
                >
                    <XStack alignItems="center" gap="$3">
                        {/* 1. Qty Input (Left) */}
                        <Stack 
                            width={32}
                            height={32} 
                            backgroundColor={themeColors.background} 
                            borderRadius={6} 
                            justifyContent="center" 
                            alignItems="center"
                            borderWidth={1}
                            borderColor={themeColors.border}
                        >
                            <TextInput
                                value={item.quantity}
                                onChangeText={(val) => handleItemChange(index, 'quantity', val)}
                                keyboardType="number-pad"
                                style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: themeColors.textPrimary,
                                    textAlign: 'center',
                                    textAlignVertical: 'center',
                                    width: '100%',
                                    height: '100%',
                                    padding: 0, 
                                }}
                            />
                        </Stack>

                        {/* 2. Name Input (Flex Middle) */}
                        <TextInput
                            placeholder="Item Name"
                            value={item.name}
                            onChangeText={(val) => handleItemChange(index, 'name', val)}
                            style={{
                                flex: 1,
                                fontSize: 16,
                                color: themeColors.textPrimary,
                                paddingVertical: 4
                            }}
                            placeholderTextColor={themeColors.textMuted}
                        />

                        {/* 3. Price Input & Trash (Right) */}
                        <XStack alignItems="center" gap="$3">
                            <XStack alignItems="center">
                                <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>$</Text>
                                <TextInput
                                    placeholder="0.00"
                                    value={item.totalPrice}
                                    onChangeText={(val) => handleItemChange(index, 'totalPrice', val)}
                                    keyboardType="decimal-pad"
                                    style={{
                                        fontSize: 16,
                                        fontWeight: '600',
                                        color: themeColors.textPrimary,
                                        minWidth: 50,
                                        textAlign: 'right'
                                    }}
                                    placeholderTextColor={themeColors.textMuted}
                                />
                            </XStack>
                            
                            <Pressable 
                                onPress={() => handleRemoveItem(index)}
                                hitSlop={15}
                                style={{ opacity: 0.6 }}
                            >
                                <Trash2 size={18} color={themeColors.error} />
                            </Pressable>
                        </XStack>
                    </XStack>
                </Stack>
                ))}
            </Stack>
        </YStack>

        {/* Tax & Tip */}
        <Card variant="surface" marginBottom="$4">
            <YStack gap="$4">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={16} fontWeight="600" color={themeColors.textSecondary}>Subtotal</Text>
                <Text fontSize={18} fontWeight="700" color={themeColors.textPrimary}>
                  ${subtotal.toFixed(2)}
                </Text>
              </XStack>
              
              <Stack height={1} backgroundColor={themeColors.border} opacity={0.5} />

              {/* Tax */}
              <YStack gap="$2">
                  <XStack justifyContent="space-between" alignItems="center">
                      <Text fontSize={16} color={themeColors.textPrimary}>Tax</Text>
                      <XStack alignItems="center" backgroundColor={themeColors.background} borderRadius={8} paddingHorizontal="$3" borderWidth={1} borderColor={themeColors.border}>
                          <Text color={themeColors.textMuted}>$</Text>
                          <TextInput
                            placeholder="0.00"
                            value={tax}
                            onChangeText={(val) => { setTax(val); setHasChanges(true); }}
                            keyboardType="decimal-pad"
                            style={{
                                padding: 8,
                                minWidth: 60,
                                fontSize: 16,
                                textAlign: 'right',
                                color: themeColors.textPrimary
                            }}
                          />
                      </XStack>
                  </XStack>
                  {/* Tax Split Mode Selector */}
                  {parseFloat(tax) > 0 && (
                     <XStack backgroundColor={themeColors.background} padding="$1" borderRadius={8} borderWidth={1} borderColor={themeColors.border}>
                          {(['equal', 'proportional', 'custom'] as const).map((mode) => (
                            <Pressable 
                              key={`tax-${mode}`}
                              style={{ flex: 1 }}
                              onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  setTaxSplitMode(mode);
                                  setHasChanges(true);
                              }}
                            >
                              <Stack 
                                paddingVertical="$2" 
                                alignItems="center"
                                borderRadius={6}
                                backgroundColor={taxSplitMode === mode ? themeColors.primary : 'transparent'}
                              >
                                  <Text 
                                    fontSize={12} 
                                    fontWeight={taxSplitMode === mode ? '600' : '400'}
                                    color={taxSplitMode === mode ? 'white' : themeColors.textSecondary}
                                    textTransform="capitalize"
                                  >
                                    {mode}
                                  </Text>
                              </Stack>
                            </Pressable>
                          ))}
                     </XStack>
                  )}
              </YStack>

              {/* Tip */}
              <YStack gap="$2">
                  <XStack justifyContent="space-between" alignItems="center">
                      <Text fontSize={16} color={themeColors.textPrimary}>Tip</Text>
                      <XStack alignItems="center" backgroundColor={themeColors.background} borderRadius={8} paddingHorizontal="$3" borderWidth={1} borderColor={themeColors.border}>
                          <Text color={themeColors.textMuted}>$</Text>
                          <TextInput
                            placeholder="0.00"
                            value={tip}
                            onChangeText={(val) => { setTip(val); setHasChanges(true); }}
                            keyboardType="decimal-pad"
                            style={{
                                padding: 8,
                                minWidth: 60,
                                fontSize: 16,
                                textAlign: 'right',
                                color: themeColors.textPrimary
                            }}
                          />
                      </XStack>
                  </XStack>
                   {/* Tip Split Mode Selector */}
                   {parseFloat(tip) > 0 && (
                     <XStack backgroundColor={themeColors.background} padding="$1" borderRadius={8} borderWidth={1} borderColor={themeColors.border}>
                          {(['equal', 'proportional', 'custom'] as const).map((mode) => (
                            <Pressable 
                              key={`tip-${mode}`}
                              style={{ flex: 1 }}
                              onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  setTipSplitMode(mode);
                                  setHasChanges(true);
                              }}
                            >
                              <Stack 
                                paddingVertical="$2" 
                                alignItems="center"
                                borderRadius={6}
                                backgroundColor={tipSplitMode === mode ? themeColors.primary : 'transparent'}
                              >
                                  <Text 
                                    fontSize={12} 
                                    fontWeight={tipSplitMode === mode ? '600' : '400'}
                                    color={tipSplitMode === mode ? 'white' : themeColors.textSecondary}
                                    textTransform="capitalize"
                                  >
                                    {mode}
                                  </Text>
                              </Stack>
                            </Pressable>
                          ))}
                     </XStack>
                  )}
              </YStack>

              <Stack height={1} backgroundColor={themeColors.border} opacity={0.5} />

              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={18} fontWeight="700" color={themeColors.textPrimary}>Total</Text>
                <Text fontSize={24} fontWeight="800" color={themeColors.primary}>
                  ${total.toFixed(2)}
                </Text>
              </XStack>
            </YStack>
        </Card>

      </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={showConfirmDialog}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        onDismiss={() => setShowConfirmDialog(false)}
        buttons={[
          {
            text: "Keep Editing",
            onPress: () => setShowConfirmDialog(false),
            style: "default"
          },
          {
            text: "Discard",
            onPress: () => {
              setShowConfirmDialog(false);
              router.back();
            },
            style: "destructive"
          }
        ]}
      />
    </Screen>
  );
}
