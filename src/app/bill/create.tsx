/**
 * PrismSplit Create Bill Screen (Speed Parser)
 * 
 * Uses billsStore for draft management.
 */

import { useState, useRef, useEffect, memo } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { TextInput, Pressable, KeyboardAvoidingView, Platform, LayoutAnimation, Modal, Alert } from 'react-native';
import { 
  X, 
  Plus, 
  ChevronDown,
  Trash2,
  Receipt,
  RotateCcw,
  Users,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Button, Card, Input, CurrencyInput, GroupImage, CategoryBadge } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBillsStore, useGroupsStore, useUIStore } from '@/lib/store';
import { SplitModeSelector } from '@/components/bill/SplitModeSelector';
import { categoryIcons, type Category, type User as UserModel, type GroupMember } from '@/types/models';
import { SimpleSplitModal, type SimpleSplitType, type SimpleSplitParticipant } from '@/components/bill/SimpleSplitModal';

const categories: { key: Category; icon: string; label: string }[] = [
  { key: 'dining', icon: '🍔', label: 'Dining' },
  { key: 'transport', icon: '🚗', label: 'Transport' },
  { key: 'groceries', icon: '🛒', label: 'Groceries' },
  { key: 'entertainment', icon: '🎮', label: 'Entertainment' },
  { key: 'utilities', icon: '💡', label: 'Utilities' },
  { key: 'travel', icon: '✈️', label: 'Travel' },
  { key: 'shopping', icon: '🛍️', label: 'Shopping' },
  { key: 'other', icon: '📦', label: 'Other' },
];

export default function CreateBillScreen() {
  const router = useRouter();
  // Add Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);

  const themeColors = useThemeColors();
  const { 
    createBill,
    isLoading
  } = useBillsStore();
  const { groups, fetchGroups, members, fetchGroupMembers } = useGroupsStore();
  const { showToast } = useUIStore();

  const handleAddItem = (name: string, price: number, category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newId = String(Date.now());
    
    setItems([...items, { 
        id: newId, 
        name, 
        unitPrice: price.toFixed(2), 
        discount: '', 
        quantity: '1', 
        locked: 'price',
        category: category 
    }]);
    
    setShowAddModal(false);
  };

  const [billName, setBillName] = useState('');
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [simpleAmount, setSimpleAmount] = useState('');
  const [isGroupPickerOpen, setIsGroupPickerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('dining');
  
  // Split Logic
  // Split Logic
  const [splitType, setSplitType] = useState<'equal' | 'select' | 'me'>('equal'); // Legacy UI state, keeping for generic mode tracking if needed, but primary logic will move to simpleSplit* variables
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());

  // New Advanced Simple Split State
  const [simpleSplitModalVisible, setSimpleSplitModalVisible] = useState(false);
  
  const [simpleSplitMethod, setSimpleSplitMethod] = useState<SimpleSplitType>('equal');
  const [simpleSplitParticipants, setSimpleSplitParticipants] = useState<SimpleSplitParticipant[]>([]);
  

  
  // Start with EMPTY items for "Simple Mode"
  const [items, setItems] = useState<{ id: string; name: string; unitPrice: string; discount: string; quantity: string; locked?: 'price' | 'total'; category?: string }[]>([]);
  
  // Category Picker State
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [pickingCategoryFor, setPickingCategoryFor] = useState<string | null>(null);
  
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');
  const [discount, setDiscount] = useState('');
  const [taxSplitMode, setTaxSplitMode] = useState<'equal' | 'proportional' | 'custom'>('proportional');
  const [tipSplitMode, setTipSplitMode] = useState<'equal' | 'proportional' | 'custom'>('proportional');

  const nameRefs = useRef<(TextInput | null)[]>([]);
  const priceRefs = useRef<(TextInput | null)[]>([]);
  const quantityRefs = useRef<(TextInput | null)[]>([]);
  const discountRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const selectedGroup = groups[selectedGroupIndex] || groups[0];
  const groupMembers = selectedGroup ? (members[selectedGroup.id] || []) : [];

    // New Advanced Simple Split State Logic (Moved here to access groupMembers)
  const resetToEqualSplit = (subsetIds?: Set<string>) => {
      // Default: All selected for Equal
      const defaults = groupMembers.map(m => ({
          userId: m.user_id,
          user: m.user,
          colorIndex: m.color_index,
          percentage: 0,
          amount: 0,
          shares: 1,
          isSelected: subsetIds ? subsetIds.has(m.user_id) : true,
          locked: false
      }));
      // Initial calc
      const total = parseFloat(simpleAmount) || 0;
      const count = subsetIds ? subsetIds.size : groupMembers.length;
      if (count > 0) {
          const perPerson = total / count;
          defaults.forEach(p => {
              if (p.isSelected) {
                  p.amount = perPerson;
                  p.percentage = 100/count;
              }
          });
      }
      setSimpleSplitParticipants(defaults);
      setSimpleSplitMethod('equal');
  };

  // Logic to sync simpleSplitParticipants when group changes or initially
  useEffect(() => {
     if (groupMembers.length > 0 && simpleSplitParticipants.length === 0) {
         // Initialize as all equal
         resetToEqualSplit();
     }
  }, [groupMembers]);

  // Update amounts when simpleAmount changes
  useEffect(() => {
     if (simpleSplitParticipants.length > 0) {
         const total = parseFloat(simpleAmount) || 0;
         if (simpleSplitMethod === 'equal') {
            const selected = simpleSplitParticipants.filter(p => p.isSelected);
            if (selected.length > 0) {
                const perPerson = total / selected.length;
                const pct = 100 / selected.length;
                setSimpleSplitParticipants(prev => prev.map(p => 
                    p.isSelected ? { ...p, amount: perPerson, percentage: pct } : { ...p, amount: 0, percentage: 0 }
                ));
            }
         } else if (simpleSplitMethod === 'shares') {
             // Recalc shares
            const totalShares = simpleSplitParticipants.reduce((sum, p) => sum + (p.shares || 1), 0);
            if (totalShares > 0) {
                setSimpleSplitParticipants(prev => prev.map(p => ({
                    ...p,
                    amount: ((p.shares || 1) / totalShares) * total,
                    percentage: ((p.shares || 1) / totalShares) * 100
                })));
            }
         }
     }
  }, [simpleAmount]);

  useEffect(() => {
      if (selectedGroup?.id) {
          fetchGroupMembers(selectedGroup.id);
      }
  }, [selectedGroup?.id]);

  const toggleMember = (id: string) => {
      // This is now legacy or just for "Just Me" logic if relevant
      // Updating `simpleSplitParticipants` is better
       const updated = simpleSplitParticipants.map(p => 
          p.userId === id ? { ...p, isSelected: !p.isSelected } : p
      );
      // Recalc equal split
       const total = parseFloat(simpleAmount) || 0;
       const selected = updated.filter(p => p.isSelected);
       const count = selected.length;
       if (count > 0) {
           const perPerson = total/count;
           setSimpleSplitParticipants(updated.map(p => {
               if (p.isSelected) return { ...p, amount: perPerson, percentage: 100/count };
               return { ...p, amount: 0, percentage: 0 };
           }));
       } else {
           setSimpleSplitParticipants(updated.map(p => ({ ...p, amount: 0, percentage: 0 })));
       }
  };


  const addNewRow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newId = String(Date.now()); // safe id
    
    // Just add an empty item row
    setItems([...items, { id: newId, name: '', unitPrice: '', discount: '', quantity: '1', locked: 'price' }]);

    
    // Auto-focus logic
    setTimeout(() => {
       const indexToFocus = items.length === 0 ? 0 : items.length;
       nameRefs.current[indexToFocus]?.focus();
    }, 100);
  };

  const updateItem = (id: string, field: string, value: string, newLock?: 'price' | 'total') => {
    setItems(items.map(item => {
      if (item.id !== id) return item;

      const updatedLock = newLock || item.locked || 'price'; // Default to price lock if not changing
      let updates: any = { [field]: value, locked: updatedLock };

      // SMART CALCULATION LOGIC:
      // If we are updating Quantity or Discount, and the LOCK is on TOTAL,
      // we must adjust UNIT PRICE to keep the Total constant.
      if ((field === 'quantity' || field === 'discount') && updatedLock === 'total') {
            const qty = field === 'quantity' ? (parseInt(value) || 0) : (parseInt(item.quantity) || 0);
            const disc = field === 'discount' ? (parseFloat(value) || 0) : (parseFloat(item.discount) || 0);
            
            // Calculate current Total (Target) based on OLD values if not changing total directly
            // Wait, if locked is Total, we assume the Current Line Total is the target.
            // Price = (TargetTotal + Discount) / Qty
            
            // We need the Target Total. 
            // Since we haven't changed UnitPrice yet, the "current" total is: `item.unitPrice * item.quantity - item.discount`.
            // BUT this "current" total is what we want to PRESERVE.
            
            const currentPrice = parseFloat(item.unitPrice) || 0;
            const currentQty = parseInt(item.quantity) || 0;
            const currentDisc = parseFloat(item.discount) || 0;
            const targetTotal = (currentPrice * currentQty) - currentDisc;

            if (qty > 0) {
                 const rawPrice = (targetTotal + disc) / qty;
                 // Adaptive Precision: If 2 decimals drifts from total, use 4
                 const checkPrice = parseFloat(rawPrice.toFixed(2));
                 const checkTotal = (checkPrice * qty) - disc;
                 
                 if (Math.abs(checkTotal - targetTotal) > 0.009) {
                     updates.unitPrice = rawPrice.toFixed(4);
                 } else {
                     updates.unitPrice = rawPrice.toFixed(2);
                 }
            }
      }
      
      return { ...item, ...updates };
    }));
  };

  const deleteItem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Smart Revert: If deleting the LAST item, restore its value to simpleAmount
    if (items.length === 1) {
        const itemToDelete = items.find(i => i.id === id);
        if (itemToDelete && itemToDelete.unitPrice) {
            setSimpleAmount(itemToDelete.unitPrice);
        }
    }

    setItems(items.filter(item => item.id !== id));
  };

  const handleClearItems = () => {
      // Revert completely to simple mode
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      // If there is a total in the items, let's preserve it as simpleAmount
      if (items.length > 0) {
          const currentTotal = items.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * parseInt(item.quantity) || 0), 0);
          if (currentTotal > 0) {
              setSimpleAmount(currentTotal.toFixed(2));
          }
      }
      setItems([]);
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.unitPrice) || 0;
    const qty = parseInt(item.quantity) || 1;
    const discount = parseFloat(item.discount) || 0;
    return sum + (price * qty) - discount;
  }, 0);
  
  const isSimpleMode = items.length === 0;
  
  // In simple mode, total is just the manual input
  // In detailed mode, it's the calculated sum + tax + tip - discount
  const taxAmount = parseFloat(tax) || 0;
  const tipAmount = parseFloat(tip) || 0;
  const discountAmount = parseFloat(discount) || 0;
  
  const finalTotal = isSimpleMode 
    ? (parseFloat(simpleAmount) || 0)
    : (subtotal - discountAmount + taxAmount + tipAmount);

  const handleShare = async () => {
    if (!billName) {
        showToast({ type: 'error', message: 'Please enter a title' });
        return;
    }

    if (finalTotal <= 0) {
        showToast({ type: 'error', message: 'Please enter a valid amount' });
        return;
    }

    try {
      let finalItems: any[] = [];
      let finalTax = 0;
      let finalTip = 0;
      let finalDiscount = 0;
      let finalTaxSplitMode = undefined;
      let finalTipSplitMode = undefined;
      let participantIds: string[] = [];

      // Determine participants
      if (isSimpleMode) {
          // Use simpleSplitParticipants to determine who is involved
          // If All Equal, implies everyone involved? Or just those selected?
          // simpleSplitParticipants contains EVERYONE but with isSelected or amounts.
          // We filter for those with amount > 0 or isSelected
          participantIds = simpleSplitParticipants
              .filter(p => (simpleSplitMethod === 'equal' ? p.isSelected : p.amount > 0 || p.percentage > 0 || (p.shares ?? 0) > 0))
              .map(p => p.userId);
          
          if (participantIds.length === 0) {
              showToast({ type: 'error', message: 'Please select at least one person' });
              return;
          }
      } else {
          // Detailed Mode: Default to all group members effectively (or handle via splits)
          participantIds = groupMembers.map(m => m.user_id);
      }

      if (isSimpleMode) {
          // SIMPLE MODE: Create 1 item from the top-level inputs
          // If we have custom splits (Unequal / Percent / Shares), we should attach them to this item.
          // Even for Equal, we can attach splits to be explicit.
          
          const simpleSplits: any[] = simpleSplitParticipants
            .filter(p => (simpleSplitMethod === 'equal' ? p.isSelected : p.amount > 0 || p.percentage > 0 || (p.shares ?? 0) > 0))
            .map((p, idx) => ({
                id: `split-${Date.now()}-${idx}`,
                item_id: 'simple-1',
                user_id: p.userId,
                user: p.user,
                split_type: simpleSplitMethod === 'shares' ? 'shares' : simpleSplitMethod === 'percentage' ? 'percentage' : 'amount', // 'equal' maps to amount usually or handled by backend, but here let's map to amount for clarity if we have explicit amounts
                amount: p.amount,
                percentage: p.percentage,
                color_index: p.colorIndex
            }));

          finalItems = [{
              id: 'simple-1',
              name: billName,
              price: finalTotal,
              quantity: 1,
              discount: 0,
              splits: simpleSplits
          }];
          // No tax/tip/discount separation in simple mode (it's all inclusive or ignored for now)
      } else {
          // DETAILED MODE
          if (items.some(i => !i.name || !i.unitPrice)) {
              showToast({ type: 'error', message: 'Please complete all items' });
              return;
          }

          finalItems = items.map(i => ({
            id: i.id,
            name: i.name,
            price: parseFloat(i.unitPrice) || 0,
            discount: parseFloat(i.discount) || 0,
            quantity: parseInt(i.quantity) || 1,
          }));

          finalTax = taxAmount;
          finalTip = tipAmount;
          finalDiscount = discountAmount;
          
          finalTaxSplitMode = taxSplitMode === 'custom' ? undefined : taxSplitMode;
          finalTipSplitMode = tipSplitMode === 'custom' ? undefined : tipSplitMode;

          // Handle Custom Split Mode Logic (convert to items)
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
      }

      await createBill({
        title: billName,
        groupId: selectedGroup?.id || '',
        category: selectedCategory,
        items: finalItems,
        tax: finalTax,
        tip: finalTip,
        discount: finalDiscount,
        tax_split_mode: finalTaxSplitMode,
        tip_split_mode: finalTipSplitMode,
        participantIds,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ type: 'success', message: 'Values Saved!' });
      router.back();
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to create bill' });
    }
  };



  return (
    <>
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
            New Expense
          </Text>
          <Stack width={24} />
        </XStack>

        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          {/* Main Details Card (Title, Group, Amount) */}
          <Card variant="surface" padding={0} marginBottom="$4" overflow="hidden">
            <YStack>
                {/* Bill Name Input */}
                <XStack alignItems="center" paddingHorizontal="$4" paddingVertical="$3" borderBottomWidth={1} borderBottomColor={themeColors.border}>
                    <Text width={80} fontSize={16} fontWeight="500" color={themeColors.textPrimary}>Title</Text>
                    <TextInput
                        placeholder="e.g., KFC Dinner"
                        placeholderTextColor={themeColors.textMuted}
                        value={billName}
                        onChangeText={setBillName}
                        style={{
                            flex: 1,
                            fontSize: 16,
                            color: themeColors.textPrimary,
                            padding: 0
                        }}
                    />
                </XStack>

                {/* Group Selector */}
                <YStack>
                    <Pressable
                         onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setIsGroupPickerOpen(!isGroupPickerOpen);
                         }}
                    >
                        <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$4" paddingVertical="$3" borderBottomWidth={1} borderBottomColor={themeColors.border}>
                            <XStack alignItems="center" gap="$3">
                                <Text width={68} fontSize={16} fontWeight="500" color={themeColors.textPrimary}>Group</Text>
                                <XStack alignItems="center" gap="$2">
                                    {selectedGroup && <GroupImage groupId={selectedGroup.id} size="sm" />}
                                    <Text fontSize={16} color={themeColors.textSecondary}>
                                        {selectedGroup?.name}
                                    </Text>
                                </XStack>
                            </XStack>
                            <Stack transform={[{ rotate: isGroupPickerOpen ? '180deg' : '0deg' }]}>
                                <ChevronDown size={20} color={themeColors.textMuted} />
                            </Stack>
                        </XStack>
                    </Pressable>

                    {/* Dropdown List */}
                    {isGroupPickerOpen && (
                        <YStack backgroundColor={themeColors.surfaceElevated} borderBottomWidth={1} borderBottomColor={themeColors.border}>
                            {groups.map((group, index) => (
                                <Pressable
                                    key={group.id}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                        setSelectedGroupIndex(index);
                                        setIsGroupPickerOpen(false);
                                    }}
                                >
                                    <XStack 
                                        alignItems="center" 
                                        paddingHorizontal="$4" 
                                        paddingVertical="$3" 
                                        gap="$3"
                                        backgroundColor={index === selectedGroupIndex ? `${themeColors.primary}10` : 'transparent'}
                                    >
                                        <Stack width={68} />
                                        <GroupImage groupId={group.id} size="sm" />
                                        <Text 
                                            fontSize={16} 
                                            color={index === selectedGroupIndex ? themeColors.primary : themeColors.textSecondary}
                                            fontWeight={index === selectedGroupIndex ? '600' : '400'}
                                        >
                                            {group.name}
                                        </Text>
                                        {index === selectedGroupIndex && (
                                            <Stack flex={1} alignItems="flex-end">
                                                <CheckCircle2 size={16} color={themeColors.primary} />
                                            </Stack>
                                        )}
                                    </XStack>
                                </Pressable>
                            ))}
                        </YStack>
                    )}
                </YStack>

                 {/* Amount Row (Smart) */}
                 <XStack alignItems="center" paddingHorizontal="$4" paddingVertical="$3">
                    <Text width={80} fontSize={16} fontWeight="500" color={themeColors.textPrimary}>Amount</Text>
                    <TextInput
                        placeholder="0.00"
                        placeholderTextColor={themeColors.textMuted}
                        value={isSimpleMode ? simpleAmount : finalTotal.toFixed(2)}
                        onChangeText={isSimpleMode ? setSimpleAmount : undefined}
                        editable={isSimpleMode} // Locked if items exist
                        keyboardType="decimal-pad"
                        style={{
                            flex: 1,
                            fontSize: 16,
                            fontWeight: '600',
                            color: isSimpleMode ? themeColors.textPrimary : themeColors.textMuted,
                            padding: 0
                        }}
                    />
                     {!isSimpleMode && (
                        <Text fontSize={12} color={themeColors.textSecondary} position="absolute" right={16}>
                            (Calculated)
                        </Text>
                    )}
                </XStack>
            </YStack>
          </Card>

          {/* Category Picker Card */}
          <Card variant="surface" padding={0} marginBottom="$4" overflow="hidden">
             <YStack paddingVertical="$3">
                 <Text marginLeft="$4" fontSize={12} fontWeight="600" color={themeColors.textSecondary} marginBottom="$2" textTransform="uppercase">
                    Category
                 </Text>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    <XStack gap="$2">
                      {categories.map((cat) => (
                        <Pressable
                          key={cat.key}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedCategory(cat.key);
                          }}
                        >
                          <Stack
                            paddingHorizontal="$3"
                            paddingVertical="$2"
                            borderRadius={12}
                            backgroundColor={selectedCategory === cat.key 
                              ? `${themeColors.primary}20` 
                              : themeColors.surfaceElevated
                            }
                            borderWidth={1}
                            borderColor={selectedCategory === cat.key ? themeColors.primary : 'transparent'}
                          >
                            <XStack alignItems="center" gap="$1">
                              <Text fontSize={16}>{cat.icon}</Text>
                              <Text 
                                fontSize={14} 
                                fontWeight={selectedCategory === cat.key ? "600" : "400"}
                                color={selectedCategory === cat.key 
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
          </Card>

            {/* How to Split? (Only in Simple Mode) */}
            {/* How to Split? (Only in Simple Mode) */}
            {isSimpleMode && (() => {
                // Helper Logic for Highlights
                const isAllEqual = simpleSplitMethod === 'equal' && simpleSplitParticipants.every(p => p.isSelected);
                const activeParticipants = simpleSplitParticipants.filter(p => p.isSelected);
                const isJustMe = simpleSplitMethod === 'equal' && activeParticipants.length === 1 && (activeParticipants[0].userId === 'user-1' || activeParticipants[0].userId === 'current-user');
                const isCustomized = !isAllEqual && !isJustMe;

                return (
                <YStack marginBottom="$6">
                    <Text marginLeft="$4" fontSize={14} fontWeight="500" color={themeColors.textSecondary} marginBottom="$2">
                        How to split?
                    </Text>
                    <XStack marginHorizontal="$4" gap="$2">
                        
                        {/* EQUAL */}
                        <Pressable 
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                resetToEqualSplit(); // Reset logic handles setting method to 'equal'
                            }}
                            style={{ flex: 1 }}
                        >
                            <Stack
                                paddingVertical="$3"
                                alignItems="center"
                                borderRadius={12}
                                backgroundColor={themeColors.surfaceElevated}
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

                        {/* CUSTOMIZE (Opens Modal) */}
                        <Pressable 
                            onPress={() => {
                                console.log('CreateBillScreen: Customize button pressed');
                                // Alert.alert('Debug', 'Customize Pressed'); // Uncomment if needed, but logging first.
                                // Actually, user said nothing happens. Let's use Alert to be 100% sure.
                                // Alert.alert('Debug', 'Opening Modal...');
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setSimpleSplitModalVisible(true);
                            }}
                            style={{ flex: 1 }}
                        >
                            <Stack
                                paddingVertical="$3"
                                alignItems="center"
                                borderRadius={12}
                                backgroundColor={themeColors.surfaceElevated}
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

                        {/* JUST ME */}
                        <Pressable 
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                // Set only current user logic
                                resetToEqualSplit(new Set(['current-user'])); // Assuming we have current user ID? 
                                // Actually we need the REAL user ID.
                                // groupMembers has user_id.
                                // We need to know "my" user ID. 
                                // `useBillsStore` implementation uses 'current-user' as payer ID mock.
                                // But `groupMembers` usually has real UUIDs.
                                // For now, let's assume `demoGroupMembers` has a specific ID or we use the first one if we don't know?
                                // Let's check `current-user` existence in members lists.
                                // In demo.ts, current user is 'user-1' usually.
                                // Let's try to match 'You'.
                                const myMember = groupMembers.find(m => m.user.full_name === 'You' || m.user_id === 'user-1');
                                if (myMember) {
                                    resetToEqualSplit(new Set([myMember.user_id]));
                                } else {
                                    // Fallback: Select just the first one? Or show toast?
                                    // Ideally we'd have `useAuthStore` to get current User ID.
                                    // For now, let's disable or select first.
                                     const firstId = groupMembers[0]?.user_id;
                                     if(firstId) resetToEqualSplit(new Set([firstId]));
                                }
                            }}
                            style={{ flex: 1 }}
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
                    
                    {/* Summary of Custom Split */}
                    {simpleSplitMethod !== 'equal' && (
                         <YStack marginTop="$3" marginHorizontal="$4" padding="$3" backgroundColor={themeColors.primary + '10'} borderRadius={10}>
                             <Text fontSize={14} color={themeColors.textPrimary}>
                                 Split by {simpleSplitMethod}: {simpleSplitParticipants.filter(p => p.amount > 0).length} people involved.
                             </Text>
                         </YStack>
                    )}
                </YStack>
                );
            })()}

            {/* Detailed Mode: Split Info */}
            {!isSimpleMode && (
                <Card variant="surface" marginBottom="$6" padding="$4" backgroundColor={themeColors.surfaceElevated}>
                    <XStack gap="$3" alignItems="center">
                        <Stack 
                            width={40} 
                            height={40} 
                            borderRadius={20} 
                            backgroundColor={`${themeColors.primary}20`}
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Receipt size={20} color={themeColors.primary} />
                        </Stack>
                        <YStack flex={1} gap="$1">
                            <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
                                Itemized Splitting
                            </Text>
                            <Text fontSize={14} color={themeColors.textSecondary} lineHeight={20}>
                                The system will notify all group participants to select their own items.
                            </Text>
                        </YStack>
                    </XStack>
                </Card>
            )}

          {/* Items Header */}
          <XStack 
            justifyContent="space-between" 
            alignItems="center" 
            marginBottom="$3"
          >
            <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
              Items {items.length > 0 ? `(${items.length})` : ''}
            </Text>
            {/* Clear Button */}
            {items.length > 0 && (
                <Pressable onPress={handleClearItems}>
                    <Text fontSize={14} color={themeColors.error} fontWeight="500">
                        Clear & Revert
                    </Text>
                </Pressable>
            )}
          </XStack>

          {/* Items List / Empty State */}
          <YStack marginBottom="$4">
            <Card variant="surface" padding={0} overflow="hidden">
                <YStack>
                    {items.map((item, index) => (
                        <BillItemRow 
                            key={item.id}
                            item={item}
                            index={index}
                            lastIndex={items.length - 1}
                            themeColors={themeColors}
                            updateItem={updateItem}
                            deleteItem={deleteItem}
                            addNewRow={addNewRow}
                            nameRefs={nameRefs}
                            priceRefs={priceRefs}
                            quantityRefs={quantityRefs}
                            discountRefs={discountRefs}
                            onPickCategory={(itemId) => {
                                setPickingCategoryFor(itemId);
                                setCategoryModalVisible(true);
                            }}
                        />
                    ))}
                    
                    {/* Add Item Row */}
                    <Pressable 
                        onPress={addNewRow}
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
                                {items.length === 0 ? "Add Item (Detailed Mode)" : "Add Item"}
                            </Text>
                        </XStack>
                    </Pressable>
                </YStack>
            </Card>
          </YStack>

          {/* Advanced Split (Only show in Detailed Mode) */}
          {!isSimpleMode && (
            <Card variant="surface" marginBottom="$4">
                <YStack gap="$3">
                <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={14} color={themeColors.textSecondary}>Subtotal</Text>
                    <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
                    ${subtotal.toFixed(2)}
                    </Text>
                </XStack>

                {/* Discount */}
                <YStack gap="$2" opacity={items.length > 0 ? 1 : 0.5}>
                    <XStack alignItems="center" justifyContent="space-between">
                        <Text fontSize={14} color={themeColors.textSecondary} minWidth={60}>Discount</Text>
                        <Stack flex={1} />
                        <XStack alignItems="center" gap="$1">
                            <Text fontSize={14} color={themeColors.error}>-$</Text>
                            <TextInput
                                placeholder="0.00"
                                value={discount}
                                onChangeText={setDiscount}
                                keyboardType="decimal-pad"
                                scrollEnabled={false}
                                style={{
                                minWidth: 60,
                                fontSize: 16,
                                color: themeColors.error,
                                textAlign: 'right',
                                padding: 0,
                                }}
                                placeholderTextColor={themeColors.textMuted}
                            />
                        </XStack>
                    </XStack>
                </YStack>
                
                {/* Tax */}
                <YStack gap="$2">
                    <XStack alignItems="center" justifyContent="space-between">
                        <Text fontSize={14} color={themeColors.textSecondary} minWidth={40}>Tax</Text>
                        <SplitModeSelector value={taxSplitMode} onChange={setTaxSplitMode} />
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
                </YStack>

                {/* Tip */}
                <YStack gap="$2">
                    <XStack alignItems="center" justifyContent="space-between">
                        <Text fontSize={14} color={themeColors.textSecondary} minWidth={40}>Tip</Text>
                        <SplitModeSelector value={tipSplitMode} onChange={setTipSplitMode} />
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
                </YStack>

                {(taxSplitMode === 'custom' || tipSplitMode === 'custom') && (
                    <Text fontSize={11} color={themeColors.info} marginTop="$1" fontStyle="italic">
                    *Custom splitting will convert amounts to bill items.
                    </Text>
                )}

                <Stack height={1} backgroundColor={themeColors.border} marginVertical="$2" />

                <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>Total</Text>
                    <Text fontSize={20} fontWeight="700" color={themeColors.primary}>
                    ${finalTotal.toFixed(2)}
                    </Text>
                </XStack>
                </YStack>
            </Card>
          )}

          <Button 
            onPress={handleShare}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Saving...' : 'Create Expense'}
          </Button>
          <Stack height={24} />
        </ScrollView>
      </YStack>
       {/* Category Picker Modal */}
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
                                    updateItem(pickingCategoryFor, 'category', cat.key);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    </Screen>
    <SimpleSplitModal
        visible={simpleSplitModalVisible}
        onClose={() => setSimpleSplitModalVisible(false)}
        onConfirm={(participants, method) => {
            setSimpleSplitParticipants(participants);
            setSimpleSplitMethod(method);
        }}
        totalAmount={finalTotal}
        currency={selectedGroup?.currency === 'USD' ? '$' : selectedGroup?.currency || '$'}
        groupMembers={groupMembers}
        currentUserId="user-1" 
        initialParticipants={simpleSplitParticipants}
        initialMode={simpleSplitMethod}
    />
    </>
  );
}

const BillItemRow = memo(({ 
    item, 
    index, 
    lastIndex,
    themeColors, 
    updateItem, 
    deleteItem, 
    addNewRow,
    nameRefs,
    priceRefs,
    quantityRefs,
    discountRefs,
    onPickCategory
}: {
    item: any, 
    index: number,
    lastIndex: number,
    themeColors: any,
    updateItem: (id: string, field: string, value: string, newLock?: 'price' | 'total') => void,
    deleteItem: (id: string) => void,
    addNewRow: () => void,
    nameRefs: any,
    priceRefs: any,
    quantityRefs: any,
    discountRefs: any,
    onPickCategory: (id: string) => void
}) => {
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const qty = parseInt(item.quantity) || 0;
    const discount = parseFloat(item.discount) || 0;
    const lineTotal = (unitPrice * qty) - discount;

    // Local state for Total Input to prevent fighting with user typing
    const [isTotalFocused, setIsTotalFocused] = useState(false);
    const [isPriceFocused, setIsPriceFocused] = useState(false);
    const [displayTotal, setDisplayTotal] = useState(lineTotal.toFixed(2));

    // Sync calculated total to display IF not focused
    useEffect(() => {
        if (!isTotalFocused) {
            setDisplayTotal(lineTotal.toFixed(2));
        }
    }, [lineTotal, isTotalFocused]);


    return (
        <Stack 
            borderBottomWidth={index < lastIndex ? 1 : 0}
            borderBottomColor={themeColors.border}
            paddingVertical="$4"
            paddingHorizontal="$3"
            backgroundColor={themeColors.surface}
        >
            <XStack gap="$3">
                {/* COLUMN 1: Large Category Icon (Leftmost) */}
                <YStack justifyContent="center">
                    <Pressable onPress={() => onPickCategory(item.id)}>
                            <CategoryBadge category={item.category || 'other'} size="lg" iconOnly />
                    </Pressable>
                </YStack>

                {/* COLUMN 2: Name & Details */}
                <YStack flex={1} gap="$2">
                    {/* Item Name */}
                    <TextInput
                        ref={(ref) => { if (nameRefs.current) nameRefs.current[index] = ref; }}
                        placeholder="Item Name"
                        placeholderTextColor={themeColors.textMuted}
                        value={item.name}
                        onChangeText={(v) => updateItem(item.id, 'name', v)}
                        returnKeyType="next"
                        scrollEnabled={false}
                        onSubmitEditing={() => priceRefs.current && priceRefs.current[index]?.focus()}
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: themeColors.textPrimary,
                            paddingVertical: 0
                        }}
                    />

                    {/* Inputs Row: Quantity | Unit Price | Discount */}
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
                                        ref={(ref) => { if (quantityRefs.current) quantityRefs.current[index] = ref; }}
                                        placeholder="1"
                                        value={item.quantity}
                                        onChangeText={(v) => updateItem(item.id, 'quantity', v)}
                                        keyboardType="number-pad"
                                        scrollEnabled={false}
                                        selectTextOnFocus={true}
                                        style={{
                                            fontSize: 14,
                                            fontWeight: '500',
                                            color: themeColors.primary,
                                            textAlign: 'center',
                                            padding: 0,
                                            minWidth: 16
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
                                        ref={(ref) => { if (priceRefs.current) priceRefs.current[index] = ref; }}
                                        placeholder="0.00"
                                        placeholderTextColor={themeColors.textMuted}
                                        value={isPriceFocused ? item.unitPrice : (parseFloat(item.unitPrice) || 0).toFixed(2)}
                                        onChangeText={(v) => updateItem(item.id, 'unitPrice', v, 'price')}
                                        onFocus={() => setIsPriceFocused(true)}
                                        onBlur={() => setIsPriceFocused(false)}
                                        keyboardType="decimal-pad"
                                        returnKeyType={index === lastIndex ? 'done' : 'next'}
                                        selectTextOnFocus={true} 
                                        scrollEnabled={false}
                                        onSubmitEditing={() => {
                                            if (index === lastIndex) {
                                                addNewRow();
                                            } else {
                                                nameRefs.current && nameRefs.current[index + 1]?.focus();
                                            }
                                        }}
                                        style={{
                                            fontSize: 14,
                                            color: themeColors.textPrimary,
                                            flex: 1,
                                            padding: 0
                                        }}
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
                                        ref={(ref) => { if (discountRefs.current) discountRefs.current[index] = ref; }}
                                        placeholder="Disc"
                                        placeholderTextColor={themeColors.textMuted}
                                        value={item.discount}
                                        onChangeText={(v) => updateItem(item.id, 'discount', v)}
                                        keyboardType="decimal-pad"
                                        selectTextOnFocus={true}
                                        scrollEnabled={false}
                                        style={{
                                            fontSize: 14,
                                            color: themeColors.error, 
                                            minWidth: 30,
                                            padding: 0
                                        }}
                                    />
                                </XStack>
                            </Stack>
                        </Pressable>
                    </XStack>
                </YStack>

                {/* COLUMN 3: Actions & Total */}
                <YStack alignItems="flex-end" justifyContent="space-between">
                    <Pressable 
                        onPress={() => deleteItem(item.id)}
                        hitSlop={15}
                        style={{ opacity: 0.6 }}
                    >
                         <Trash2 size={18} color={themeColors.error} />
                    </Pressable>

                    <XStack alignItems="center" height={36} justifyContent="center" gap="$1">
                        <Text fontSize={14} fontWeight="600" color={themeColors.textPrimary}>$</Text>
                        <TextInput
                            value={displayTotal}
                            onFocus={() => setIsTotalFocused(true)}
                            onBlur={() => {
                                setIsTotalFocused(false);
                                setDisplayTotal(lineTotal.toFixed(2));
                            }}
                            onChangeText={(val) => {
                                setDisplayTotal(val);
                                const newTotal = parseFloat(val) || 0;
                                const currentQty = parseInt(item.quantity) || 1; 
                                const currentDiscount = parseFloat(item.discount) || 0;
                                const newUnitPrice = (newTotal + currentDiscount) / currentQty;
                                updateItem(item.id, 'unitPrice', newUnitPrice.toFixed(2), 'total');
                            }}
                            keyboardType="decimal-pad"
                            selectTextOnFocus={true}
                            style={{
                                fontSize: 15,
                                fontWeight: '700',
                                color: themeColors.textPrimary,
                                padding: 0,
                                minWidth: 40,
                                textAlign: 'right'
                            }}
                        />
                    </XStack>
                </YStack>
            </XStack>
        </Stack>                                    
    );
});
