/**
 * PrismSplit Create Bill Screen (Speed Parser)
 * 
 * Uses billsStore for draft management.
 */

import { useState, useRef, useEffect, memo } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter } from 'expo-router';
import { TextInput, Pressable, KeyboardAvoidingView, Platform, LayoutAnimation, Modal } from 'react-native';
import { 
  X, 
  Plus, 
  ChevronDown,
  Trash2,
  Receipt,
  RotateCcw,
  Users,
  User,
  CheckCircle2
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Button, Card, Input, CurrencyInput, GroupImage, CategoryBadge } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBillsStore, useGroupsStore, useUIStore } from '@/lib/store';
import { SplitModeSelector } from '@/components/bill/SplitModeSelector';
import { categoryIcons, type Category } from '@/types/models';

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
  const [splitType, setSplitType] = useState<'equal' | 'select' | 'me'>('equal');
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  
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

  useEffect(() => {
    fetchGroups();
  }, []);

  const selectedGroup = groups[selectedGroupIndex] || groups[0];
  const groupMembers = selectedGroup ? (members[selectedGroup.id] || []) : [];

  useEffect(() => {
      if (selectedGroup?.id) {
          fetchGroupMembers(selectedGroup.id);
      }
  }, [selectedGroup?.id]);

  const toggleMember = (id: string) => {
      const newSet = new Set(selectedMemberIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedMemberIds(newSet);
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
          if (splitType === 'equal') {
              // All group members
              participantIds = groupMembers.map(m => m.user_id);
          } else if (splitType === 'select') {
              participantIds = Array.from(selectedMemberIds);
              if (participantIds.length === 0) {
                  showToast({ type: 'error', message: 'Please select at least one person' });
                  return;
              }
          } else if (splitType === 'me') {
              participantIds = ['current-user']; // Or get from auth store
          }
      } else {
          // Detailed Mode: Default to all group members effectively (or handle via splits)
          // The user specifically asked to IGNORE the simple split selection here.
          participantIds = groupMembers.map(m => m.user_id);
      }

      if (isSimpleMode) {
          // SIMPLE MODE: Create 1 item from the top-level inputs
          finalItems = [{
              id: 'simple-1',
              name: billName,
              price: finalTotal,
              quantity: 1,
              discount: 0
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
            {isSimpleMode && (
                <YStack marginBottom="$6">
                    <Text marginLeft="$4" fontSize={14} fontWeight="500" color={themeColors.textSecondary} marginBottom="$2">
                        How to split?
                    </Text>
                    <XStack marginHorizontal="$4" gap="$2">
                        
                        {/* EQUAL */}
                        <Pressable 
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setSplitType('equal');
                            }}
                            style={{ flex: 1 }}
                        >
                            <Stack
                                paddingVertical="$3"
                                alignItems="center"
                                borderRadius={12}
                                backgroundColor={themeColors.surfaceElevated}
                                borderWidth={2}
                                borderColor={splitType === 'equal' ? themeColors.primary : 'transparent'}
                            >
                                <Users size={24} color={splitType === 'equal' ? themeColors.primary : themeColors.textSecondary} />
                                <Text 
                                    marginTop="$2" 
                                    fontSize={14} 
                                    fontWeight={splitType === 'equal' ? '700' : '400'}
                                    color={splitType === 'equal' ? themeColors.primary : themeColors.textSecondary}
                                >
                                    Equal
                                </Text>
                            </Stack>
                        </Pressable>

                        {/* SELECT */}
                        <Pressable 
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setSplitType('select');
                            }}
                            style={{ flex: 1 }}
                        >
                            <Stack
                                paddingVertical="$3"
                                alignItems="center"
                                borderRadius={12}
                                backgroundColor={themeColors.surfaceElevated}
                                borderWidth={2}
                                borderColor={splitType === 'select' ? themeColors.primary : 'transparent'}
                            >
                                <CheckCircle2 size={24} color={splitType === 'select' ? themeColors.primary : themeColors.textSecondary} />
                                <Text 
                                    marginTop="$2" 
                                    fontSize={14} 
                                    fontWeight={splitType === 'select' ? '700' : '400'}
                                    color={splitType === 'select' ? themeColors.primary : themeColors.textSecondary}
                                >
                                    Select
                                </Text>
                            </Stack>
                        </Pressable>

                        {/* JUST ME */}
                        <Pressable 
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setSplitType('me');
                            }}
                            style={{ flex: 1 }}
                        >
                            <Stack
                                paddingVertical="$3"
                                alignItems="center"
                                borderRadius={12}
                                backgroundColor={themeColors.surfaceElevated}
                                borderWidth={2}
                                borderColor={splitType === 'me' ? themeColors.primary : 'transparent'}
                            >
                                <User size={24} color={splitType === 'me' ? themeColors.primary : themeColors.textSecondary} />
                                <Text 
                                    marginTop="$2" 
                                    fontSize={14} 
                                    fontWeight={splitType === 'me' ? '700' : '400'}
                                    color={splitType === 'me' ? themeColors.primary : themeColors.textSecondary}
                                >
                                    Just Me
                                </Text>
                            </Stack>
                        </Pressable>
                    </XStack>
                    
                    {/* Member Selection List */}
                    {splitType === 'select' && (
                        <YStack marginTop="$3" paddingHorizontal="$4" gap="$2">
                            <Text fontSize={14} fontWeight="600" color={themeColors.textPrimary}>
                                Select People
                            </Text>
                            <YStack backgroundColor={themeColors.surface} borderRadius={12} overflow="hidden">
                                {groupMembers.map((member, index) => {
                                    const isSelected = selectedMemberIds.has(member.user_id);
                                    return (
                                        <Pressable 
                                            key={member.id} 
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                toggleMember(member.user_id);
                                            }}
                                        >
                                            <XStack 
                                                alignItems="center" 
                                                padding="$3" 
                                                gap="$3"
                                                borderBottomWidth={index < groupMembers.length - 1 ? 1 : 0}
                                                borderBottomColor={themeColors.border}
                                                backgroundColor={isSelected ? `${themeColors.primary}10` : 'transparent'}
                                            >
                                                <Stack 
                                                    width={24} 
                                                    height={24} 
                                                    borderRadius={12} 
                                                    borderWidth={2} 
                                                    borderColor={isSelected ? themeColors.primary : themeColors.textMuted}
                                                    alignItems="center" 
                                                    justifyContent="center"
                                                    backgroundColor={isSelected ? themeColors.primary : 'transparent'}
                                                >
                                                    {isSelected && <CheckCircle2 size={16} color="white" />}
                                                </Stack>
                                                
                                                <Stack 
                                                    width={32} 
                                                    height={32} 
                                                    borderRadius={16} 
                                                    backgroundColor={themeColors.surfaceElevated} 
                                                    alignItems="center" 
                                                    justifyContent="center"
                                                    overflow="hidden"
                                                >
                                                    {/* In a real app, use Image component. Using emoji/text for demo if avatar missing */}
                                                    {member.user.avatar_url ? (
                                                        // This would be an Image, but for now just a placeholder logic or use user initials
                                                        <Text fontSize={14}>{member.user.full_name[0]}</Text>
                                                    ) : (
                                                         <User size={16} color={themeColors.textSecondary} />
                                                    )}
                                                </Stack>
                                                
                                                <Text fontSize={16} color={themeColors.textPrimary}>
                                                    {member.user.full_name}
                                                </Text>
                                            </XStack>
                                        </Pressable>
                                    );
                                })}
                            </YStack>
                        </YStack>
                    )}
                </YStack>
            )}

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
            paddingVertical="$3"
            paddingHorizontal="$3"
            backgroundColor={themeColors.surface}
        >
            <XStack gap="$3" alignItems="center">
                {/* COLUMN 1: Quantity */}
                <Stack width={30} justifyContent="center" alignItems="center">
                    <TextInput
                        placeholder="1"
                        value={item.quantity}
                        onChangeText={(v) => updateItem(item.id, 'quantity', v)}
                        keyboardType="number-pad"
                        scrollEnabled={false}
                        selectTextOnFocus={true}
                        style={{
                            fontSize: 18,
                            fontWeight: '600',
                            color: themeColors.primary,
                            textAlign: 'center',
                            padding: 0,
                            width: '100%'
                        }}
                    />
                </Stack>

                {/* COLUMN 2: Large Category Icon */}
                <Pressable onPress={() => onPickCategory(item.id)}>
                        <CategoryBadge category={item.category || 'other'} size="lg" iconOnly />
                </Pressable>

                {/* COLUMN 3: Name & Details */}
                <YStack flex={1} gap="$1">
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

                    {/* Inputs Row: Unit Price | Discount */}
                    <XStack alignItems="center" gap="$3">
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
                                    minWidth: 40,
                                    padding: 0
                                }}
                            />
                        </XStack>

                        <XStack alignItems="center" gap="$1">
                            <Text fontSize={12} color={themeColors.textSecondary}>-</Text>
                            <TextInput
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
                                    minWidth: 40,
                                    padding: 0
                                }}
                            />
                        </XStack>
                    </XStack>
                </YStack>

                {/* COLUMN 4: Actions & Total */}
                <YStack alignItems="flex-end" justifyContent="space-between" height={45}>
                    <Pressable 
                        onPress={() => deleteItem(item.id)}
                        hitSlop={15}
                        style={{ opacity: 0.6 }}
                    >
                         <Trash2 size={18} color={themeColors.error} />
                    </Pressable>

                    <XStack alignItems="center" gap="$1">
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
