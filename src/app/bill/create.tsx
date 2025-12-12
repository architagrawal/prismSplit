/**
 * PrismSplit Create Bill Screen (Speed Parser)
 * 
 * Uses billsStore for draft management.
 */

import { useState, useRef, useEffect } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { TextInput, Pressable } from 'react-native';
import { 
  X, 
  Plus, 
  ChevronDown,
  Trash2
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Button, Card, Input, CurrencyInput } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { useBillsStore, useGroupsStore, useUIStore } from '@/lib/store';

export default function CreateBillScreen() {
  const router = useRouter();
  const { 
    draft, 
    isLoading,
    initDraft, 
    updateDraft, 
    addDraftItem, 
    updateDraftItem, 
    removeDraftItem,
    createBill,
    clearDraft 
  } = useBillsStore();
  const { groups, fetchGroups } = useGroupsStore();
  const { showToast } = useUIStore();

  const [billName, setBillName] = useState('');
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [items, setItems] = useState([
    { id: '1', name: '', price: '', quantity: '1' }
  ]);
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');

  const nameRefs = useRef<(TextInput | null)[]>([]);
  const priceRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const selectedGroup = groups[selectedGroupIndex] || groups[0];

  const addNewRow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newId = String(items.length + 1);
    setItems([...items, { id: newId, name: '', price: '', quantity: '1' }]);
    setTimeout(() => {
      nameRefs.current[items.length]?.focus();
    }, 100);
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const deleteItem = (id: string) => {
    if (items.length === 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems(items.filter(item => item.id !== id));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = parseInt(item.quantity) || 1;
    return sum + (price * qty);
  }, 0);
  const taxAmount = parseFloat(tax) || 0;
  const tipAmount = parseFloat(tip) || 0;
  const total = subtotal + taxAmount + tipAmount;

  const handleShare = async () => {
    if (!billName || items.every(i => !i.name || !i.price)) {
      showToast({ type: 'error', message: 'Please add a name and at least one item' });
      return;
    }

    try {
      await createBill({
        title: billName,
        groupId: selectedGroup?.id || '',
        category: 'groceries',
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          price: parseFloat(i.price) || 0,
          quantity: parseInt(i.quantity) || 1,
        })),
        tax: taxAmount,
        tip: tipAmount,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ type: 'success', message: 'Bill created!' });
      router.back();
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to create bill' });
    }
  };

  return (
    <Screen keyboardAvoiding backgroundColor={colors.light.background}>
      <YStack flex={1}>
        {/* Header */}
        <XStack 
          justifyContent="space-between" 
          alignItems="center" 
          paddingVertical="$3"
        >
          <Pressable onPress={() => router.back()}>
            <X size={24} color={colors.light.textPrimary} />
          </Pressable>
          <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
            New Bill
          </Text>
          <Stack width={24} />
        </XStack>

        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          {/* Bill Details */}
          <YStack gap="$4" marginBottom="$6">
            <Input
              label="Bill Name"
              placeholder="e.g., Costco Grocery"
              value={billName}
              onChangeText={setBillName}
            />

            <YStack gap="$1">
              <Text fontSize={14} fontWeight="500" color={colors.light.textSecondary}>
                Group
              </Text>
              <Pressable>
                <Card variant="surface">
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack alignItems="center" gap="$2">
                      <Text fontSize={20}>{selectedGroup?.emoji}</Text>
                      <Text fontSize={16} color={colors.light.textPrimary}>
                        {selectedGroup?.name}
                      </Text>
                    </XStack>
                    <ChevronDown size={20} color={colors.light.textMuted} />
                  </XStack>
                </Card>
              </Pressable>
            </YStack>
          </YStack>

          {/* Items Header */}
          <XStack 
            justifyContent="space-between" 
            alignItems="center" 
            marginBottom="$3"
          >
            <Text fontSize={16} fontWeight="600" color={colors.light.textPrimary}>
              Items
            </Text>
            <Text fontSize={14} color={colors.light.textMuted}>
              {items.filter(i => i.name && i.price).length} items
            </Text>
          </XStack>

          {/* Items List */}
          <YStack gap="$2" marginBottom="$4">
            {items.map((item, index) => (
              <Card key={item.id} variant="surface" padding="$3">
                <XStack alignItems="center" gap="$2">
                  <Stack flex={2}>
                    <TextInput
                      ref={(ref) => { nameRefs.current[index] = ref; }}
                      placeholder="Item name"
                      placeholderTextColor={colors.light.textMuted}
                      value={item.name}
                      onChangeText={(v) => updateItem(item.id, 'name', v)}
                      returnKeyType="next"
                      onSubmitEditing={() => priceRefs.current[index]?.focus()}
                      style={{
                        fontSize: 16,
                        color: colors.light.textPrimary,
                        paddingVertical: 8,
                      }}
                    />
                  </Stack>
                  
                  <Stack flex={1}>
                    <XStack alignItems="center">
                      <Text color={colors.light.textMuted}>$</Text>
                      <TextInput
                        ref={(ref) => { priceRefs.current[index] = ref; }}
                        placeholder="0.00"
                        placeholderTextColor={colors.light.textMuted}
                        value={item.price}
                        onChangeText={(v) => updateItem(item.id, 'price', v)}
                        keyboardType="decimal-pad"
                        returnKeyType={index === items.length - 1 ? 'done' : 'next'}
                        onSubmitEditing={() => {
                          if (index === items.length - 1) {
                            addNewRow();
                          } else {
                            nameRefs.current[index + 1]?.focus();
                          }
                        }}
                        style={{
                          fontSize: 16,
                          color: colors.light.textPrimary,
                          paddingVertical: 8,
                          paddingLeft: 4,
                        }}
                      />
                    </XStack>
                  </Stack>
                  
                  <Stack width={40}>
                    <TextInput
                      placeholder="1"
                      value={item.quantity}
                      onChangeText={(v) => updateItem(item.id, 'quantity', v)}
                      keyboardType="number-pad"
                      style={{
                        fontSize: 16,
                        color: colors.light.textSecondary,
                        textAlign: 'center',
                        paddingVertical: 8,
                      }}
                    />
                  </Stack>
                  
                  <Pressable 
                    onPress={() => deleteItem(item.id)}
                    style={{ padding: 4 }}
                  >
                    <Trash2 
                      size={18} 
                      color={items.length > 1 ? colors.light.error : colors.light.border} 
                    />
                  </Pressable>
                </XStack>
              </Card>
            ))}
            
            <Pressable onPress={addNewRow}>
              <Card variant="outlined">
                <XStack justifyContent="center" alignItems="center" gap="$2">
                  <Plus size={20} color={colors.light.primary} />
                  <Text fontSize={14} fontWeight="500" color={colors.light.primary}>
                    Add Item
                  </Text>
                </XStack>
              </Card>
            </Pressable>
          </YStack>

          {/* Tax & Tip */}
          <XStack gap="$3" marginBottom="$6">
            <Stack flex={1}>
              <CurrencyInput
                label="Tax"
                value={tax}
                onChangeText={setTax}
              />
            </Stack>
            <Stack flex={1}>
              <CurrencyInput
                label="Tip"
                value={tip}
                onChangeText={setTip}
              />
            </Stack>
          </XStack>

          {/* Totals */}
          <Card variant="elevated" marginBottom="$6">
            <YStack gap="$2">
              <XStack justifyContent="space-between">
                <Text color={colors.light.textSecondary}>Subtotal</Text>
                <Text color={colors.light.textPrimary}>${subtotal.toFixed(2)}</Text>
              </XStack>
              {taxAmount > 0 && (
                <XStack justifyContent="space-between">
                  <Text color={colors.light.textSecondary}>Tax</Text>
                  <Text color={colors.light.textPrimary}>${taxAmount.toFixed(2)}</Text>
                </XStack>
              )}
              {tipAmount > 0 && (
                <XStack justifyContent="space-between">
                  <Text color={colors.light.textSecondary}>Tip</Text>
                  <Text color={colors.light.textPrimary}>${tipAmount.toFixed(2)}</Text>
                </XStack>
              )}
              <Stack height={1} backgroundColor={colors.light.border} marginVertical="$2" />
              <XStack justifyContent="space-between">
                <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
                  Total
                </Text>
                <Text fontSize={18} fontWeight="700" color={colors.light.primary}>
                  ${total.toFixed(2)}
                </Text>
              </XStack>
            </YStack>
          </Card>
        </ScrollView>

        {/* Footer */}
        <Stack paddingVertical="$4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleShare}
            disabled={!billName || items.every(i => !i.name || !i.price)}
          >
            Share Bill
          </Button>
        </Stack>
      </YStack>
    </Screen>
  );
}
