import { useState, useEffect, useRef } from 'react';
import { ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Stack, Text, XStack, YStack } from 'tamagui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Plus, Trash2, Save, ChevronDown, Users, CheckCircle2, User as UserIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { 
  Screen, 
  ScreenHeader,
  Button, 
  Input, 
  Card, 
  ConfirmDialog,
  CategoryBadge
} from '@/components/ui';
import { SimpleSplitModal, SimpleSplitType, SimpleSplitParticipant } from '@/components/bill/SimpleSplitModal';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBillsStore, useUIStore, useActivityStore, useAuthStore, useGroupsStore } from '@/lib/store';
import { categoryIcons, type Category, type Activity } from '@/types/models';

import { SplitModeSelector } from '@/components/bill/SplitModeSelector';

interface EditItem {
  id: string;
  name: string;
  unitPrice: string;
  discount: string;
  quantity: string;
  category?: string;
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
  const quantityRefs = useRef<(TextInput | null)[]>([]);
  const priceRefs = useRef<(TextInput | null)[]>([]);
  const discountRefs = useRef<(TextInput | null)[]>([]);
  
  const { currentBill, fetchBillById, billItems, fetchBillItems, updateBill, updateBillItems, isLoading } = useBillsStore();
  const { groups } = useGroupsStore();
  const { showToast } = useUIStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('groceries');
  const [items, setItems] = useState<EditItem[]>([]);
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');
  const [discount, setDiscount] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [taxSplitMode, setTaxSplitMode] = useState<'equal' | 'proportional' | 'custom'>('proportional');
  const [tipSplitMode, setTipSplitMode] = useState<'equal' | 'proportional' | 'custom'>('proportional');
  
  // Category Picker State
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [pickingCategoryFor, setPickingCategoryFor] = useState<string | null>(null);

  // Simple Split State
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [simpleAmount, setSimpleAmount] = useState('');
  const [simpleSplitModalVisible, setSimpleSplitModalVisible] = useState(false);
  const [simpleSplitMethod, setSimpleSplitMethod] = useState<SimpleSplitType>('equal');
  const [simpleSplitParticipants, setSimpleSplitParticipants] = useState<SimpleSplitParticipant[]>([]);


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
      setDiscount((currentBill.discount_amount || 0).toString() === '0' ? '' : (currentBill.discount_amount || 0).toString());
      setTaxSplitMode(currentBill.tax_split_mode || 'proportional');
      setTipSplitMode(currentBill.tip_split_mode || 'proportional');
    }
  }, [currentBill]);

  // Populate items and handle autoAdd
  useEffect(() => {
    if (id && billItems[id] && currentBill) {
      const rawItems = billItems[id];
      const selectedGroup = groups.find(g => g.id === currentBill.group_id);
      const groupMembers = selectedGroup?.members || [];
      const currentUserId = useAuthStore.getState().user?.id;

      // DETECT SIMPLE MODE
      // Logic: Explicit flag OR (1 item AND no tax/tip/discount separation in basic usage)
      // For now, allow checking is_itemized from DB or infer
      const isSimple = currentBill.is_itemized === false || (rawItems.length === 1 && rawItems[0].name === currentBill.title);
      setIsSimpleMode(isSimple);

      if (isSimple && rawItems.length > 0) {
          // SIMPLE MODE INITIALIZATION
          const simpleItem = rawItems[0];
          setSimpleAmount(simpleItem.price.toFixed(2));
          
          // Reconstruct Participants from Splits
          const existingSplits = simpleItem.splits || [];
          
          // Determine Split Method from splits
          // If all equal type -> 'equal'
          // If percentage -> 'percentage'
          // If shares -> 'shares'
          // If amount -> 'unequal' (unless clear pattern?)
          // actually, store doesn't save user input method explicitly on item, only strict splits. 
          // We can infer:
          // 1. If any split has percentage -> 'percentage'
          // 2. If all splits are type 'equal' -> 'equal'
          // 3. Else 'unequal' (or 'shares' if we could track it, but for now map back to amounts or keep generic?)
          // Let's look at the first split's type to guess?
          
          // Better approach: defaults.
          let detectedMethod: SimpleSplitType = 'equal';
          if (existingSplits.some(s => s.split_type === 'percentage')) detectedMethod = 'percentage';
          else if (existingSplits.some(s => s.split_type === 'shares' || s.split_type === 'amount')) detectedMethod = 'unequal'; // simplifies to Unequal for editing usually unless it was simple equal

           // Map group members to SimpleSplitParticipant
           const participants: SimpleSplitParticipant[] = groupMembers.map(member => {
              const split = existingSplits.find(s => s.user_id === member.user_id);
              const isSelected = !!split;
              
              return {
                  userId: member.user_id,
                  user: member.user,
                  avatarUrl: member.user.avatar_url,
                  isSelected: isSelected, // If they have a split, they are "selected"
                  amount: split ? split.amount : 0,
                  percentage: split ? (split.percentage || 0) : 0,
                  shares: 1, // Default, can't easily reverse shares from amount without total context sometimes
                  colorIndex: member.color_index
              };
           });
           
           // Refine method detection
           const selectedParts = participants.filter(p => p.isSelected);
           if (selectedParts.length === groupMembers.length && selectedParts.every(p => p.amount === selectedParts[0].amount)) {
               detectedMethod = 'equal';
           } else if (existingSplits.some(s => s.split_type === 'percentage')) {
                detectedMethod = 'percentage';
           } else if (existingSplits.some(s => s.split_type === 'amount')) {
               detectedMethod = 'unequal';
           }

           setSimpleSplitMethod(detectedMethod);
           setSimpleSplitParticipants(participants);
           setItems([]); // Clear detailed items

      } else {
        // DETAILED MODE (Existing Logic)
        
        // Aggregate items for display (reversing the explosion from store)
        // Group by name + price + discount + category
        const aggregatedMap = new Map<string, { id: string, name: string, unitPrice: number, quantity: number, discount: number, category?: Category }>();
        
        // Helper to strip (1/3) suffix
        const normalizeName = (name: string) => name.replace(/\s\(\d+\/\d+\)$/, '');
  
        rawItems.forEach(item => {
          const cleanName = normalizeName(item.name);
          // Round price to 2 decimals to ensure key matching works for float variations
          const priceKey = item.price.toFixed(2);
          // Include discount in key to group identical items with same discount
          const discountKey = (item.discount || 0).toFixed(2);
          // Include category (items with different categories shouldn't be merged even if name is same)
          const categoryKey = item.category || 'none';
          
          const key = `${cleanName}-${priceKey}-${discountKey}-${categoryKey}`;
          
          if (aggregatedMap.has(key)) {
              const existing = aggregatedMap.get(key)!;
              aggregatedMap.set(key, { 
                  ...existing, 
                  quantity: existing.quantity + item.quantity,
                  discount: existing.discount + (item.discount || 0)
              });
          } else {
              aggregatedMap.set(key, {
                  id: item.id.split('-')[0] === 'collapsed' ? item.id : `agg-${key}`, // Use reliable temporary ID for editing
                  name: cleanName,
                  unitPrice: item.price,
                  quantity: item.quantity,
                  discount: item.discount || 0,
                  category: item.category,
              });
          }
        });
  
        const loadedItems: EditItem[] = Array.from(aggregatedMap.values()).map(i => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity.toString(),
            unitPrice: i.unitPrice.toFixed(2),
            discount: i.discount.toFixed(2) === '0.00' ? '' : i.discount.toFixed(2),
            category: i.category,
        }));
        setItems(loadedItems);
  
        // Handle autoAdd if requested and not yet processed
        if (autoAdd === 'true' && !autoAddProcessed.current) {
          autoAddProcessed.current = true;
          setTimeout(() => {
              const newItem = { 
                  id: `new-${Date.now()}`, 
                  name: '', 
                  unitPrice: '', 
                  discount: '', 
                  quantity: '1',
                  category: currentBill?.category // default to bill category
              };
              // If we have items, append. If empty, just set it.
              setItems(prev => [...prev, newItem]);
              setHasChanges(true); 
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }, 100);
        }
      }
    }
  }, [id, billItems, currentBill, groups, autoAdd]);

  // Subtotal calculation
  const subtotal = items.reduce((sum, item) => {
      const price = parseFloat(item.unitPrice) || 0;
      const qty = parseInt(item.quantity) || 0;
      const discount = parseFloat(item.discount) || 0;
      return sum + (price * qty) - discount;
  }, 0);

  const total = isSimpleMode 
    ? (parseFloat(simpleAmount) || 0)
    : (subtotal - (parseFloat(discount) || 0) + (parseFloat(tax) || 0) + (parseFloat(tip) || 0));

  // Helper for "Just Me" logic
  const resetToEqualSplit = (selectedUserIds?: string[]) => {
      const selectedGroup = groups.find(g => g.id === currentBill?.group_id);
      const groupMembers = selectedGroup?.members || [];
      const updated = simpleSplitParticipants.map(p => ({
          ...p,
          isSelected: selectedUserIds ? selectedUserIds.includes(p.userId) : true,
          amount: 0,
          percentage: 0,
          shares: 1
      }));
      setSimpleSplitParticipants(updated);
      setSimpleSplitMethod('equal');
      setHasChanges(true);
  };

  const handleItemChange = (index: number, field: keyof EditItem, value: string) => {
    setHasChanges(true);
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddItem = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasChanges(true);
    setItems(prev => [
      ...prev,
      { 
          id: `new-${Date.now()}`, 
          name: '', 
          unitPrice: '', 
          discount: '', 
          quantity: '1',
          category: category // default to current bill category
      }
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

    // Filter and transform to store format
    const validItems: { name: string, price: number, quantity: number, discount?: number, category?: Category }[] = [];
    
    items.forEach(item => {
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const qty = parseInt(item.quantity) || 0;
        const discount = parseFloat(item.discount) || 0;
        
        if (item.name.trim() && unitPrice > 0 && qty > 0) {
            validItems.push({
                name: item.name,
                price: unitPrice,
                quantity: qty,
                discount: discount > 0 ? discount : undefined,
                category: item.category as Category // Pass category
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
        let finalDiscount = parseFloat(discount) || 0;
        let finalTaxSplitMode: 'equal' | 'proportional' | undefined = taxSplitMode === 'custom' ? undefined : taxSplitMode;
        let finalTipSplitMode: 'equal' | 'proportional' | undefined = tipSplitMode === 'custom' ? undefined : tipSplitMode;
        
        // 1. Update Bill Metadata
        await updateBill(id!, {
          title,
          category,
          tax_amount: finalTax,
          tip_amount: finalTip,
          discount_amount: finalDiscount,
          total_amount: total, // Recalculated total
          tax_split_mode: finalTaxSplitMode,
          tip_split_mode: finalTipSplitMode,
          is_itemized: !isSimpleMode // Update flag if needed
        });

      // 2. Update Bill Items
      await updateBillItems(id!, validItems.map(i => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        discount: i.discount,
        category: i.category as Category // Pass category
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

  const renderItemRow = (item: EditItem, index: number) => {
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const qty = parseInt(item.quantity) || 0;
    const discount = parseFloat(item.discount) || 0;
    const lineTotal = (unitPrice * qty) - discount;

    

    
    return (
        <Stack 
            key={item.id} 
            borderBottomWidth={index < items.length - 1 ? 1 : 0}
            borderBottomColor={themeColors.border}
            paddingHorizontal="$3"
            paddingVertical="$4"
            backgroundColor={themeColors.surface}
        >
            <XStack gap="$3">
                {/* COLUMN 1: Large Category Icon (Leftmost) */}
                <YStack justifyContent="center">
                    <Pressable onPress={() => {
                        setPickingCategoryFor(item.id);
                        setCategoryModalVisible(true);
                        }}>
                        <CategoryBadge category={item.category || 'other'} size="lg" iconOnly />
                    </Pressable>
                </YStack>

                {/* COLUMN 2: Name & Details (Stacked) */}
                <YStack flex={1} gap="$2">
                    {/* Row 1: Item Name */}
                    <TextInput
                        placeholder="Item Name"
                        value={item.name}
                        onChangeText={(val) => handleItemChange(index, 'name', val)}
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: themeColors.textPrimary,
                            paddingVertical: 0
                        }}
                        placeholderTextColor={themeColors.textMuted}
                    />

                    {/* Row 2: Stats (Qty | Price | Discount) */}
                    <XStack alignItems="center" gap="$2">
                        {/* Quantity Pill */}
                        <Pressable onPress={() => quantityRefs.current[index]?.focus()}>
                            <Stack 
                                backgroundColor={themeColors.surfaceElevated} 
                                borderRadius={8}
                                paddingHorizontal={8}
                                height={36}
                                justifyContent="center"
                                borderWidth={1}
                                borderColor="transparent"
                            >
                                <XStack alignItems="center" gap="$1">
                                    <Text fontSize={12} color={themeColors.textSecondary}>x</Text>
                                    <TextInput
                                        ref={(el) => { quantityRefs.current[index] = el; }}
                                        value={item.quantity}
                                        onChangeText={(val) => handleItemChange(index, 'quantity', val)}
                                        keyboardType="number-pad"
                                        selectTextOnFocus={true}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '500',
                                            color: themeColors.primary,
                                            minWidth: 16,
                                            padding: 0,
                                            textAlign: 'center'
                                        }}
                                    />
                                </XStack>
                            </Stack>
                        </Pressable>

                        {/* Unit Price Pill */}
                        <Pressable style={{ flex: 1 }} onPress={() => priceRefs.current[index]?.focus()}>
                            <Stack 
                                backgroundColor={themeColors.surfaceElevated} 
                                borderRadius={8}
                                paddingHorizontal={8}
                                height={36}
                                justifyContent="center"
                                width="100%"
                            >
                                <XStack alignItems="center" gap="$1">
                                    <Text fontSize={12} color={themeColors.textSecondary}>@</Text>
                                    <TextInput
                                        ref={(el) => { priceRefs.current[index] = el; }}
                                        placeholder="0.00"
                                        value={item.unitPrice}
                                        onChangeText={(val) => handleItemChange(index, 'unitPrice', val)}
                                        keyboardType="decimal-pad"
                                        selectTextOnFocus={true}
                                        style={{
                                            fontSize: 14,
                                            color: themeColors.textPrimary,
                                            flex: 1,
                                            padding: 0
                                        }}
                                        placeholderTextColor={themeColors.textMuted}
                                    />
                                </XStack>
                            </Stack>
                        </Pressable>

                        {/* Discount Pill */}
                        <Pressable onPress={() => discountRefs.current[index]?.focus()}>
                            <Stack 
                                backgroundColor={themeColors.surfaceElevated} 
                                borderRadius={8}
                                paddingHorizontal={8}
                                height={36}
                                justifyContent="center"
                            >
                                <XStack alignItems="center" gap="$1">
                                        <Text fontSize={12} color={themeColors.textSecondary}>-</Text>
                                        <TextInput
                                        ref={(el) => { discountRefs.current[index] = el; }}
                                        placeholder="Disc"
                                        value={item.discount}
                                        onChangeText={(val) => handleItemChange(index, 'discount', val)}
                                        keyboardType="decimal-pad"
                                        selectTextOnFocus={true}
                                        style={{
                                            fontSize: 14,
                                            color: themeColors.error, 
                                            minWidth: 30,
                                            padding: 0
                                        }}
                                        placeholderTextColor={themeColors.error}
                                    />
                                </XStack>
                            </Stack>
                        </Pressable>
                    </XStack>
                </YStack>

                {/* COLUMN 3: Actions & Total */}
                <YStack alignItems="flex-end" justifyContent="space-between">
                    <Pressable 
                        onPress={() => handleRemoveItem(index)}
                        hitSlop={15}
                        style={{ opacity: 0.6 }}
                    >
                        <Trash2 size={18} color={themeColors.error} />
                    </Pressable>

                    <XStack height={36} justifyContent="center" alignItems="center">
                        <Text fontSize={15} fontWeight="700" color={themeColors.textPrimary}>
                            ${lineTotal.toFixed(2)}
                        </Text>
                    </XStack>
                </YStack>
            </XStack>
        </Stack>
    );

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
          {/* Bill Details Card */}
          <Card variant="surface" padding={0} marginBottom="$6" overflow="hidden">
            <YStack>
                {/* Bill Title Input */}
                <XStack alignItems="center" paddingHorizontal="$4" paddingVertical="$3" borderBottomWidth={1} borderBottomColor={themeColors.border}>
                    <Text width={80} fontSize={16} fontWeight="500" color={themeColors.textPrimary}>Title</Text>
                    <TextInput
                        placeholder="e.g., Costco Trip"
                        value={title}
                        onChangeText={(val) => { setTitle(val); setHasChanges(true); }}
                        placeholderTextColor={themeColors.textMuted}
                        style={{
                            flex: 1,
                            fontSize: 16,
                            color: themeColors.textPrimary,
                            padding: 0
                        }}
                    />
                </XStack>

                {/* Category Selector */}
                <YStack paddingVertical="$3">
                    <Text fontSize={16} fontWeight="500" color={themeColors.textPrimary} paddingHorizontal="$4" marginBottom="$3">
                      Category
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
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
                              borderRadius={12}
                              backgroundColor={category === cat.key 
                                ? `${themeColors.primary}20` 
                                : themeColors.surfaceElevated
                              }
                              borderWidth={1}
                              borderColor={category === cat.key ? themeColors.primary : 'transparent'}
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
            </YStack>
          </Card>

          {/* Items (Only in Detailed Mode) */}
          {!isSimpleMode && (
          <YStack marginBottom="$4">
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$2" paddingHorizontal="$1">
              <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
                Items
              </Text>
              <Text fontSize={14} color={themeColors.textMuted}>
                {items.length} items
               </Text>
            </XStack>
            
            {/* List Row Style Container */}
            <Card variant="surface" padding={0} overflow="hidden">
                <YStack>
                    {items.map((item, index) => renderItemRow(item, index))}
                    
                    {/* Add Item Row - Integrated */}
                    <Pressable 
                        onPress={handleAddItem}
                        hitSlop={10}
                        style={({ pressed }) => ({
                            backgroundColor: pressed ? themeColors.surfaceElevated : 'transparent',
                        })}
                    >
                        <XStack 
                            paddingVertical="$4" 
                            paddingHorizontal="$4" 
                            alignItems="center" 
                            justifyContent="center"
                            gap="$2"
                            borderTopWidth={items.length > 0 ? 1 : 0}
                            borderTopColor={themeColors.border}
                        >
                            <Plus size={18} color={themeColors.primary} />
                            <Text fontSize={16} fontWeight="500" color={themeColors.primary}>
                                Add Item
                            </Text>
                        </XStack>
                    </Pressable>
                </YStack>
            </Card>
        </YStack>
        )}

        {/* AMOUNT INPUT (Only in Simple Mode) */}
        {isSimpleMode && (
            <Card variant="surface" padding="$4" marginBottom="$4">
                <YStack gap="$2">
                    <Text fontSize={14} fontWeight="500" color={themeColors.textSecondary}>Total Amount</Text>
                    <XStack alignItems="center" gap="$2">
                        <Text fontSize={32} fontWeight="700" color={themeColors.textPrimary}>$</Text>
                        <TextInput
                            placeholder="0.00"
                            value={simpleAmount}
                            onChangeText={(v) => {
                                setSimpleAmount(v);
                                setHasChanges(true);
                            }}
                            keyboardType="decimal-pad"
                            style={{
                                fontSize: 32,
                                fontWeight: '700',
                                color: themeColors.primary,
                                flex: 1,
                                height: 50
                            }}
                        />
                    </XStack>
                </YStack>
            </Card>
        )}

        {/* HOW TO SPLIT (Only in Simple Mode) */}
        {isSimpleMode && (() => {
                // Helper Logic for Highlights
                const isAllEqual = simpleSplitMethod === 'equal' && simpleSplitParticipants.every(p => p.isSelected);
                const activeParticipants = simpleSplitParticipants.filter(p => p.isSelected);
                const currentUserId = useAuthStore.getState().user?.id;
                const isJustMe = simpleSplitMethod === 'equal' && activeParticipants.length === 1 && (activeParticipants[0].userId === currentUserId || activeParticipants[0].userId === 'user-1');
                const isCustomized = !isAllEqual && !isJustMe;

                return (
                <YStack marginBottom="$6">
                    <Text marginLeft="$4" fontSize={14} fontWeight="500" color={themeColors.textSecondary} marginBottom="$2">
                        How to split?
                    </Text>
                    <XStack gap="$3" paddingHorizontal="$1">
                        {/* Equal Button */}
                        <Pressable 
                            style={{ flex: 1 }} 
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                resetToEqualSplit(); // Resets to all selected
                            }}
                        >
                            <Stack 
                                paddingVertical="$3" 
                                alignItems="center" 
                                borderRadius={12} 
                                backgroundColor={themeColors.surfaceElevated}
                                borderWidth={2}
                                borderColor={isAllEqual ? themeColors.primary : 'transparent'}
                            >
                                <Users size={24} color={isAllEqual ? themeColors.primary : themeColors.textSecondary} />
                                <Text 
                                    marginTop="$2" 
                                    fontSize={14} 
                                    fontWeight={isAllEqual ? '700' : '400'}
                                    color={isAllEqual ? themeColors.primary : themeColors.textSecondary}
                                >
                                    Equal
                                </Text>
                            </Stack>
                        </Pressable>

                        {/* Customize Button */}
                        <Pressable 
                            style={{ flex: 1 }} 
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setSimpleSplitModalVisible(true);
                            }}
                        >
                            <Stack 
                                paddingVertical="$3" 
                                alignItems="center" 
                                borderRadius={12} 
                                backgroundColor={themeColors.surfaceElevated}
                                borderWidth={2}
                                borderColor={isCustomized ? themeColors.primary : 'transparent'}
                            >
                                <CheckCircle2 size={24} color={isCustomized ? themeColors.primary : themeColors.textSecondary} />
                                <Text 
                                    marginTop="$2" 
                                    fontSize={14} 
                                    fontWeight={isCustomized ? '700' : '400'}
                                    color={isCustomized ? themeColors.primary : themeColors.textSecondary}
                                >
                                    Customize
                                </Text>
                            </Stack>
                        </Pressable>

                        {/* Just Me Button */}
                        <Pressable 
                            style={{ flex: 1 }} 
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                const myId = useAuthStore.getState().user?.id || 'user-1';
                                resetToEqualSplit([myId]);
                            }}
                        >
                            <Stack 
                                paddingVertical="$3" 
                                alignItems="center" 
                                borderRadius={12} 
                                backgroundColor={themeColors.surfaceElevated}
                                borderWidth={2}
                                borderColor={isJustMe ? themeColors.primary : 'transparent'}
                            >
                                <UserIcon size={24} color={isJustMe ? themeColors.primary : themeColors.textSecondary} />
                                <Text 
                                    marginTop="$2" 
                                    fontSize={14} 
                                    fontWeight={isJustMe ? '700' : '400'}
                                    color={isJustMe ? themeColors.primary : themeColors.textSecondary}
                                >
                                    Just Me
                                </Text>
                            </Stack>
                        </Pressable>
                         </XStack>
                    </YStack>
                );
            })()}


        {/* Tax & Tip (Only Detailed Mode) */}
        {!isSimpleMode && (
        <Card variant="surface" marginBottom="$4">
            <YStack gap="$4">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={16} fontWeight="600" color={themeColors.textSecondary}>Subtotal</Text>
                <Text fontSize={18} fontWeight="700" color={themeColors.textPrimary}>
                  ${subtotal.toFixed(2)}
                </Text>
              </XStack>
              
              <Stack height={1} backgroundColor={themeColors.border} opacity={0.5} />

              {/* Discount - Overall */}
              <YStack gap="$2">
                  <XStack alignItems="center" justifyContent="space-between">
                      <Text fontSize={16} color={themeColors.textPrimary} minWidth={60}>Discount</Text>
                      
                       <Stack flex={1} />

                      <XStack alignItems="center" backgroundColor={themeColors.background} borderRadius={8} paddingHorizontal="$3" borderWidth={1} borderColor={themeColors.border}>
                          <Text color={themeColors.error}>-$</Text>
                          <TextInput
                            placeholder="0.00"
                            value={discount}
                            onChangeText={(val) => { setDiscount(val); setHasChanges(true); }}
                            keyboardType="decimal-pad"
                            selectTextOnFocus={true}
                            style={{
                                padding: 8,
                                minWidth: 60,
                                fontSize: 16,
                                textAlign: 'right',
                                color: themeColors.error
                            }}
                          />
                      </XStack>
                  </XStack>
              </YStack>





              {/* Tax */}
              <YStack gap="$2">
                  <XStack alignItems="center" justifyContent="space-between">
                      <Text fontSize={16} color={themeColors.textPrimary} minWidth={40}>Tax</Text>
                      
                       <SplitModeSelector 
                            value={taxSplitMode} 
                            onChange={(mode) => {
                                setTaxSplitMode(mode);
                                setHasChanges(true);
                            }} 
                        />

                      <XStack alignItems="center" backgroundColor={themeColors.background} borderRadius={8} paddingHorizontal="$3" borderWidth={1} borderColor={themeColors.border}>
                          <Text color={themeColors.textMuted}>$</Text>
                          <TextInput
                            placeholder="0.00"
                            value={tax}
                            onChangeText={(val) => { setTax(val); setHasChanges(true); }}
                            keyboardType="decimal-pad"
                            selectTextOnFocus={true}
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
              </YStack>

              {/* Tip */}
              <YStack gap="$2">
                  <XStack alignItems="center" justifyContent="space-between">
                      <Text fontSize={16} color={themeColors.textPrimary} minWidth={40}>Tip</Text>
                      
                      <SplitModeSelector 
                            value={tipSplitMode} 
                            onChange={(mode) => {
                                setTipSplitMode(mode);
                                setHasChanges(true);
                            }} 
                        />

                      <XStack alignItems="center" backgroundColor={themeColors.background} borderRadius={8} paddingHorizontal="$3" borderWidth={1} borderColor={themeColors.border}>
                          <Text color={themeColors.textMuted}>$</Text>
                          <TextInput
                            placeholder="0.00"
                            value={tip}
                            onChangeText={(val) => { setTip(val); setHasChanges(true); }}
                            keyboardType="decimal-pad"
                            selectTextOnFocus={true}
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
        )}

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

        <Modal
         animationType="fade"
         transparent={true}
         visible={categoryModalVisible}
         onRequestClose={() => setCategoryModalVisible(false)}
       >
         <Pressable 
             style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
             onPress={() => setCategoryModalVisible(false)}
         >
             <Stack 
                 backgroundColor={themeColors.surface} 
                 borderTopLeftRadius={20} 
                 borderTopRightRadius={20}
                 paddingVertical="$5"
                 paddingHorizontal="$4"
                 gap="$4"
                 paddingBottom={Platform.OS === 'ios' ? 40 : 20}
             >
                 <XStack justifyContent="space-between" alignItems="center">
                     <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>Select Category</Text>
                     <Pressable onPress={() => setCategoryModalVisible(false)}>
                         <X size={24} color={themeColors.textSecondary} />
                     </Pressable>
                 </XStack>
                 
                 <XStack flexWrap="wrap" gap="$3" justifyContent="space-between">
                     {categories.map((cat) => (
                         <Pressable
                             key={cat.key}
                             style={{ width: '30%', marginBottom: 8 }}
                             onPress={() => {
                                 if (pickingCategoryFor) {
                                   // Update item category
                                   const idx = items.findIndex(i => i.id === pickingCategoryFor);
                                   if (idx !== -1) {
                                       handleItemChange(idx, 'category', cat.key);
                                       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                   }
                                   setCategoryModalVisible(false);
                                 }
                             }}
                         >
                              <Stack
                                 paddingVertical="$3"
                                 alignItems="center"
                                 borderRadius={12}
                                 backgroundColor={themeColors.surfaceElevated}
                                 borderWidth={1}
                                 borderColor={themeColors.border}
                             >
                                 <Text fontSize={24} marginBottom="$1">{cat.icon}</Text>
                                 <Text fontSize={12} color={themeColors.textPrimary} fontWeight="500">{cat.label}</Text>
                             </Stack>
                         </Pressable>
                     ))}
                 </XStack>
             </Stack>
         </Pressable>
       </Modal>
       
    <SimpleSplitModal 
        visible={simpleSplitModalVisible}
        onClose={() => setSimpleSplitModalVisible(false)}
        onConfirm={(participants, method) => {
            setSimpleSplitParticipants(participants);
            setSimpleSplitMethod(method);
            setHasChanges(true); // Ensure save button activates
        }}
        totalAmount={total}
        currency={currentBill?.group_id ? (groups.find(g => g.id === currentBill.group_id)?.currency === 'USD' ? '$' : groups.find(g => g.id === currentBill.group_id)?.currency || '$') : '$'}
        groupMembers={groups.find(g => g.id === currentBill?.group_id)?.members || []}
        currentUserId={useAuthStore.getState().user?.id || 'user-1'}
        initialParticipants={simpleSplitParticipants}
        initialMode={simpleSplitMethod}
    />
    </Screen>
  );
}
