/**
 * PrismSplit Create Bill Screen (Speed Parser)
 * 
 * Uses billsStore for draft management.
 */

import { useState, useRef, useEffect } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  X, 
  Plus, 
  ChevronDown,
  Trash2
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Button, Card, Input, CurrencyInput, GroupImage } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBillsStore, useGroupsStore, useUIStore } from '@/lib/store';

export default function CreateBillScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { 
    createBill,
    isLoading
  } = useBillsStore();
  const { groups, fetchGroups } = useGroupsStore();
  const { showToast } = useUIStore();

  const [billName, setBillName] = useState('');
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [items, setItems] = useState([
    { id: '1', name: '', unitPrice: '', discount: '', quantity: '1' }
  ]);
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');
  const [taxSplitMode, setTaxSplitMode] = useState<'equal' | 'proportional' | 'custom'>('proportional');
  const [tipSplitMode, setTipSplitMode] = useState<'equal' | 'proportional' | 'custom'>('proportional');

  const nameRefs = useRef<(TextInput | null)[]>([]);
  const priceRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const selectedGroup = groups[selectedGroupIndex] || groups[0];

  const addNewRow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newId = String(items.length + 1);
    setItems([...items, { id: newId, name: '', unitPrice: '', discount: '', quantity: '1' }]);
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
    const price = parseFloat(item.unitPrice) || 0;
    const qty = parseInt(item.quantity) || 1;
    const discount = parseFloat(item.discount) || 0;
    return sum + (price * qty) - discount;
  }, 0);
  
  const taxAmount = parseFloat(tax) || 0;
  const tipAmount = parseFloat(tip) || 0;
  const total = subtotal + taxAmount + tipAmount;

  const handleShare = async () => {
    if (!billName || items.every(i => !i.name || !i.unitPrice)) {
      showToast({ type: 'error', message: 'Please add a name and at least one item' });
      return;
    }

    try {
      let finalItems = items.map(i => ({
        id: i.id,
        name: i.name,
        price: parseFloat(i.unitPrice) || 0,
        discount: parseFloat(i.discount) || 0,
        quantity: parseInt(i.quantity) || 1,
      }));
      let finalTax = taxAmount;
      let finalTip = tipAmount;
      
      let finalTaxSplitMode: 'equal' | 'proportional' | undefined = taxSplitMode === 'custom' ? undefined : taxSplitMode;
      let finalTipSplitMode: 'equal' | 'proportional' | undefined = tipSplitMode === 'custom' ? undefined : tipSplitMode;

      // Handle Custom Split Mode for Tax
      if (taxSplitMode === 'custom' && taxAmount > 0) {
        finalItems.push({
          id: `tax-${Date.now()}`,
          name: 'Tax',
          price: taxAmount,
          discount: 0,
          quantity: 1
        });
        finalTax = 0;
        finalTaxSplitMode = undefined;
      }

      // Handle Custom Split Mode for Tip
      if (tipSplitMode === 'custom' && tipAmount > 0) {
        finalItems.push({
          id: `tip-${Date.now()}`,
          name: 'Tip',
          price: tipAmount,
          discount: 0,
          quantity: 1
        });
        finalTip = 0;
        finalTipSplitMode = undefined;
      }

      await createBill({
        title: billName,
        groupId: selectedGroup?.id || '',
        category: 'groceries',
        items: finalItems,
        tax: finalTax,
        tip: finalTip,
        tax_split_mode: finalTaxSplitMode,
        tip_split_mode: finalTipSplitMode,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ type: 'success', message: 'Bill created!' });
      router.back();
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to create bill' });
    }
  };

  const renderItemRow = (item: typeof items[0], index: number) => {
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const qty = parseInt(item.quantity) || 0;
    const discount = parseFloat(item.discount) || 0;
    const lineTotal = (unitPrice * qty) - discount;

    return (
        <Card key={item.id} variant="surface" padding="$3">
            <XStack gap="$3">
                {/* COLUMN 1: Quantity */}
                <Stack width={40}>
                    <TextInput
                        placeholder="1"
                        value={item.quantity}
                        onChangeText={(v) => updateItem(item.id, 'quantity', v)}
                        keyboardType="number-pad"
                        scrollEnabled={false}
                        style={{
                            fontSize: 16,
                            color: themeColors.textSecondary,
                            textAlign: 'center',
                            padding: 0,
                            paddingBottom: 4,
                            borderBottomWidth: 1,
                            borderBottomColor: themeColors.border,
                            width: '100%'
                        }}
                    />
                </Stack>

                {/* COLUMN 2: Name & Details */}
                <YStack flex={1} gap="$2">
                    {/* ROW 1: Name | Trash */}
                    <XStack alignItems="center" gap="$2">
                        <TextInput
                            ref={(ref) => { nameRefs.current[index] = ref; }}
                            placeholder="Item Name"
                            placeholderTextColor={themeColors.textMuted}
                            value={item.name}
                            onChangeText={(v) => updateItem(item.id, 'name', v)}
                            returnKeyType="next"
                            scrollEnabled={false}
                            onSubmitEditing={() => priceRefs.current[index]?.focus()}
                            style={{
                                flex: 1,
                                fontSize: 16,
                                fontWeight: '500',
                                color: themeColors.textPrimary,
                                paddingVertical: 0
                            }}
                        />

                        <Pressable 
                            onPress={() => deleteItem(item.id)}
                            style={{ padding: 4, opacity: 0.6 }}
                        >
                            <Trash2 
                                size={18} 
                                color={items.length > 1 ? themeColors.error : themeColors.border} 
                            />
                        </Pressable>
                    </XStack>

                    {/* ROW 2: Unit Price | Discount | Total */}
                    <XStack alignItems="center" gap="$3">
                        {/* Unit Price */}
                        <XStack alignItems="center" gap="$1" flex={1}>
                            <Text fontSize={12} color={themeColors.textSecondary}>@</Text>
                            <TextInput
                                ref={(ref) => { priceRefs.current[index] = ref; }}
                                placeholder="0.00"
                                placeholderTextColor={themeColors.textMuted}
                                value={item.unitPrice}
                                onChangeText={(v) => updateItem(item.id, 'unitPrice', v)}
                                keyboardType="decimal-pad"
                                returnKeyType={index === items.length - 1 ? 'done' : 'next'}
                                scrollEnabled={false}
                                onSubmitEditing={() => {
                                    if (index === items.length - 1) {
                                        addNewRow();
                                    } else {
                                        nameRefs.current[index + 1]?.focus();
                                    }
                                }}
                                style={{
                                    fontSize: 14,
                                    color: themeColors.textPrimary,
                                    minWidth: 40,
                                    padding: 0
                                }}
                            />
                        </XStack>

                        {/* Discount */}
                        <XStack alignItems="center" gap="$1" flex={1}>
                            <Text fontSize={12} color={themeColors.textSecondary}>-</Text>
                            <TextInput
                                placeholder="Discount"
                                value={item.discount}
                                onChangeText={(v) => updateItem(item.id, 'discount', v)}
                                keyboardType="decimal-pad"
                                style={{
                                    fontSize: 14,
                                    color: themeColors.error, 
                                    minWidth: 40,
                                    padding: 0
                                }}
                                placeholderTextColor={themeColors.textMuted}
                            />
                        </XStack>

                        {/* Total Display */}
                        <XStack alignItems="center" gap="$1" minWidth={60} justifyContent="flex-end">
                            <Text fontSize={14} fontWeight="600" color={themeColors.textPrimary}>
                                ${lineTotal.toFixed(2)}
                            </Text>
                        </XStack>
                    </XStack>
                </YStack>
            </XStack>
        </Card>
    );
  };

  return (
    <Screen keyboardAvoiding>
      <YStack flex={1}>
        {/* Header */}
        <XStack 
          justifyContent="space-between" 
          alignItems="center" 
          paddingVertical="$3"
        >
          <Pressable onPress={() => router.back()}>
            <X size={24} color={themeColors.textPrimary} />
          </Pressable>
          <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
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
              <Text fontSize={14} fontWeight="500" color={themeColors.textSecondary}>
                Group
              </Text>
              <Pressable>
                <Card variant="surface">
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack alignItems="center" gap="$2">
                      {selectedGroup && <GroupImage groupId={selectedGroup.id} size="sm" />}
                      <Text fontSize={16} color={themeColors.textPrimary}>
                        {selectedGroup?.name}
                      </Text>
                    </XStack>
                    <ChevronDown size={20} color={themeColors.textMuted} />
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
            <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
              Items
            </Text>
            <Text fontSize={14} color={themeColors.textMuted}>
              {items.filter(i => i.name && i.unitPrice).length} items
            </Text>
          </XStack>

          {/* Items List */}
          <YStack gap="$2" marginBottom="$4">
            {items.map((item, index) => renderItemRow(item, index))}
            
            <Pressable onPress={addNewRow}>
              <Card variant="outlined">
                <XStack justifyContent="center" alignItems="center" gap="$2">
                  <Plus size={20} color={themeColors.primary} />
                  <Text fontSize={14} fontWeight="500" color={themeColors.primary}>
                    Add Item
                  </Text>
                </XStack>
              </Card>
            </Pressable>
          </YStack>

          {/* Tax & Tip & Split Selector */}
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
                    onChangeText={setTax}
                    keyboardType="decimal-pad"
                    scrollEnabled={false}
                    style={{
                      minWidth: 60,
                      fontSize: 16,
                      color: themeColors.textPrimary,
                      textAlign: 'right',
                      padding: 0,
                    }}
                    placeholderTextColor={themeColors.textMuted}
                  />
                </XStack>
              </XStack>
              
              {/* Tax Split Selector */}
              {parseFloat(tax) > 0 && (
                <XStack 
                  backgroundColor={themeColors.surfaceElevated} 
                  padding="$1" 
                  borderRadius={8}
                >
                  {(['equal', 'proportional', 'custom'] as const).map((mode) => (
                    <Pressable 
                      key={`tax-${mode}`}
                      style={{ flex: 1 }}
                      onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setTaxSplitMode(mode);
                      }}
                    >
                      <Stack 
                        paddingVertical="$2" 
                        alignItems="center"
                        borderRadius={6}
                        backgroundColor={taxSplitMode === mode ? themeColors.primary : 'transparent'}
                      >
                          <Text 
                            fontSize={11} 
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

              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color={themeColors.textSecondary}>Tip</Text>
                <XStack alignItems="center" gap="$1">
                  <Text fontSize={14} color={themeColors.textMuted}>$</Text>
                  <TextInput
                    placeholder="0.00"
                    value={tip}
                    onChangeText={setTip}
                    keyboardType="decimal-pad"
                    scrollEnabled={false}
                    style={{
                      minWidth: 60,
                      fontSize: 16,
                      color: themeColors.textPrimary,
                      textAlign: 'right',
                      padding: 0,
                    }}
                    placeholderTextColor={themeColors.textMuted}
                  />
                </XStack>
              </XStack>

              {/* Tip Split Selector */}
              {parseFloat(tip) > 0 && (
                <XStack 
                  backgroundColor={themeColors.surfaceElevated} 
                  padding="$1" 
                  borderRadius={8}
                >
                  {(['equal', 'proportional', 'custom'] as const).map((mode) => (
                    <Pressable 
                      key={`tip-${mode}`}
                      style={{ flex: 1 }}
                      onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setTipSplitMode(mode);
                      }}
                    >
                      <Stack 
                        paddingVertical="$2" 
                        alignItems="center"
                        borderRadius={6}
                        backgroundColor={tipSplitMode === mode ? themeColors.primary : 'transparent'}
                      >
                          <Text 
                            fontSize={11} 
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

              {(taxSplitMode === 'custom' || tipSplitMode === 'custom') && (
                 <Text fontSize={11} color={themeColors.info} marginTop="$1" fontStyle="italic">
                   *Custom splitting will convert amounts to bill items.
                 </Text>
              )}

              <Stack height={1} backgroundColor={themeColors.border} marginVertical="$2" />

              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>Total</Text>
                <Text fontSize={20} fontWeight="700" color={themeColors.primary}>
                  ${total.toFixed(2)}
                </Text>
              </XStack>
            </YStack>
          </Card>

          <Button 
            onPress={handleShare}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Creating...' : 'Create & Share'}
          </Button>
          <Stack height={24} />
        </ScrollView>
      </YStack>
    </Screen>
  );
}
