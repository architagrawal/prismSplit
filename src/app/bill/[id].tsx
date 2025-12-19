/**
 * PrismSplit Bill Detail / Self-Select Screen
 * 
 * Uses billsStore for selections.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, RefreshControl, Platform, UIManager, Animated } from 'react-native';
import { ArrowLeft, Share2, Settings2, Plus, Pencil, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Reanimated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';


import { 
  Screen, 
  Card, 
  Avatar, 
  BalanceBadge,
  Button,
  CustomSplitModal,
  AddItemModal,
  ItemRow
} from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBillsStore, useAuthStore, useUIStore } from '@/lib/store';
import { demoBillItems, currentUser, demoGroupMembers, demoUsers } from '@/lib/api/demo';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import type { BillItemWithSplits } from '@/types/models';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function BillDetailScreen() {
  const router = useRouter();
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId; // Start with rawId
  const themeColors = useThemeColors();
  
  const { 
    currentBill, 
    billItems,
    selectedItems, 
    isLoading,
    fetchBillById, 
    fetchBillItems,
    toggleItemSelection, 
    confirmSelections,
    clearSelections
  } = useBillsStore();
  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Custom split modal state
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<(BillItemWithSplits & { collapsedIds?: string[] }) | null>(null);
  
  // Track swipeable refs to close others when one opens
  const swipeableRows = useRef<Map<string, Swipeable>>(new Map());
  const prevOpenedRow = useRef<Swipeable | null>(null);

  const closePrevOpenedRow = (currentId?: string) => {
    if (prevOpenedRow.current && prevOpenedRow.current !== swipeableRows.current.get(currentId || '')) {
      prevOpenedRow.current.close();
    }
    if (currentId) {
        prevOpenedRow.current = swipeableRows.current.get(currentId) || null;
    } else {
        prevOpenedRow.current = null;
    }
  };
  
  // Local storage for custom split overrides (until backend is connected)
  const [customSplits, setCustomSplits] = useState<Map<string, Array<{
    userId: string;
    colorIndex: number;
    amount: number;
    percentage: number;
  }>>>(new Map());

  // Handle add item locally
  const [customBillItems, setCustomBillItems] = useState<BillItemWithSplits[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Synced from store
  const storeItems = id ? billItems[id] : undefined;
  
  // Use custom items for rendering
  const displayItems = (customBillItems.length > 0 ? customBillItems : (storeItems || [])) as BillItemWithSplits[];

  // Group items for display: Collapse identical selected items
  const groupedDisplayItems = useMemo(() => {
    const selectedGroups = new Map<string, BillItemWithSplits[]>();
    
    // Helper to strip (1/3) suffix for grouping
    const normalizeName = (name: string) => name.replace(/\s\(\d+\/\d+\)$/, '');

    // Helper to generate key based on EXISTING participants (excluding current user)
    const getParticipantsKey = (item: BillItemWithSplits) => {
        // Check custom splits first, then fallback to item splits
        const currentSplits = customSplits.get(item.id);
        
        let participants: string[] = [];
        if (currentSplits) {
            participants = currentSplits.map(s => s.userId);
        } else {
            participants = item.splits.map(s => s.user_id);
        }

        // Filter out current user to find "other" participants
        const otherParticipants = participants.filter(uid => uid !== (user?.id || 'current-user'));
        
        // Sort to ensure consistency (UserA, UserB is same as UserB, UserA)
        otherParticipants.sort();
        return otherParticipants.join(',');
    };

    // First pass: collect all selected items into groups
    displayItems.forEach(item => {
      if (selectedItems.has(item.id)) {
        const cleanName = normalizeName(item.name);
        // Key now includes participants to prevent merging items with different existing splits
        const participantsKey = getParticipantsKey(item);
        const key = `${cleanName}-${item.price}-${participantsKey}`;
        
        if (!selectedGroups.has(key)) selectedGroups.set(key, []);
        selectedGroups.get(key)!.push(item);
      }
    });

    const result: (BillItemWithSplits & { isCollapsed?: boolean; collapsedIds?: string[] })[] = [];
    const processedGroupKeys = new Set<string>();

    displayItems.forEach(item => {
      if (selectedItems.has(item.id)) {
        const cleanName = normalizeName(item.name);
        const participantsKey = getParticipantsKey(item);
        const key = `${cleanName}-${item.price}-${participantsKey}`;
        
        if (!processedGroupKeys.has(key)) {
          const group = selectedGroups.get(key)!;
          if (group.length > 1) {
            // Create collapsed item
            result.push({
              ...item,
              id: `collapsed-${key}`,
              name: cleanName, // Use clean name for display
              quantity: group.reduce((sum, i) => sum + i.quantity, 0),
              isCollapsed: true,
              collapsedIds: group.map(i => i.id),
            });
          } else {
            result.push(item);
          }
          processedGroupKeys.add(key);
        }
      } else {
        result.push(item);
      }
    });
    
    return result;
  }, [displayItems, selectedItems, customSplits]); // Add customSplits dependency to re-group on changes



  // Initialize custom items with store data on load
  useEffect(() => {
    if (storeItems && storeItems.length > 0 && customBillItems.length === 0) {
      setCustomBillItems([...storeItems as BillItemWithSplits[]]);
    }
  }, [storeItems]);

  const handleLocalAddItem = (name: string, price: number) => {
    const newItem: BillItemWithSplits = {
      id: `new-${Date.now()}`,
      bill_id: id || 'bill-1',
      name,
      price,
      quantity: 1,
      sort_order: customBillItems.length,
      splits: [],
      total_claimed: 0,
      unclaimed: price,
    };
    setCustomBillItems(prev => [...prev, newItem]);
    showToast({ type: 'success', message: 'Item added!' });
  };

  // Handle deleting items (single or multiple)
  const handleLocalDeleteItem = (idsInput: string | string[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const idsToDelete = new Set(Array.isArray(idsInput) ? idsInput : [idsInput]);
    
    setCustomBillItems(prev => prev.filter(i => !idsToDelete.has(i.id)));
    
    // Also remove from selections if present
    idsToDelete.forEach(id => {
      if (selectedItems.has(id)) {
        toggleItemSelection(id);
      }
    });

    showToast({ type: 'success', message: idsToDelete.size > 1 ? 'Items deleted' : 'Item deleted' });
  };

  // Animated swipe action (Growth effect)
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: BillItemWithSplits & { collapsedIds?: string[] }
  ) => {
    // Grow from small (scale) as it expands
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1], 
      extrapolate: 'clamp'
    });

    return (
      <Animated.View
        style={{
          width: 56,
          justifyContent: 'center',
          alignItems: 'center',
          marginVertical: 4,
          marginLeft: 8,
          // Use transform to scale it up
          transform: [{ scale: scale }],
        }}
      >
        <Pressable 
          style={{ 
            backgroundColor: themeColors.error, 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%',
            height: '100%',
            borderRadius: 12,
          }}
          onPress={() => handleLocalDeleteItem(item.collapsedIds || item.id)}
        >
          <Trash2 size={20} color="white" />
        </Pressable>
      </Animated.View>
    );
  };

  // Fetch bill on mount
  useEffect(() => {
    if (id) {
      fetchBillById(id);
      fetchBillItems(id);
    }
    // Clear selections when leaving screen
    return () => {
      clearSelections();
    };
  }, [id]);

  // Pre-populate selections from existing splits where current user participates
  useEffect(() => {
    if (!initialized && user) {
      // Check each item to see if current user is already in the split
      const preSelectedIds: string[] = [];
      demoBillItems.forEach(item => {
        const userAlreadyInSplit = item.splits.some(s => s.user_id === user.id);
        if (userAlreadyInSplit) {
          preSelectedIds.push(item.id);
        }
      });
      
      // Add pre-selected items to store
      preSelectedIds.forEach(itemId => {
        if (!selectedItems.has(itemId)) {
          toggleItemSelection(itemId);
        }
      });
      
      setInitialized(true);
    }
  }, [user, initialized]);

  const bill = currentBill;
  const allMembers = bill ? (demoGroupMembers[bill.group_id] || []) : [];

  // Calculate user's share based on current selections and custom splits
  const calculateYourShare = () => {
    if (!bill) return { total: 0, items: 0, tax: 0, tip: 0 };
    
    let userItemShare = 0;
    let totalBillItemCost = 0;
    const billParticipants = new Set<string>();

    displayItems.forEach(item => {
      totalBillItemCost += item.price * item.quantity;
      
      // Determine who is participating in this item
      const customItemSplits = customSplits.get(item.id);
      let itemParticipants: string[] = [];

      if (customItemSplits && customItemSplits.length > 0) {
        itemParticipants = customItemSplits.map(s => s.userId);
        
        const userSplit = customItemSplits.find(s => s.userId === (user?.id || 'current-user'));
        if (userSplit) {
          userItemShare += userSplit.amount;
        }
      } else if (selectedItems.has(item.id)) {
        // Current user is selected
        // Check existing splits to finding other participants
        const existingSplits = item.splits || [];
        // All existing participants (excluding current user if they are already in there, to avoid double count logic below)
        const otherParticipants = existingSplits.filter(s => s.user_id !== user?.id).map(s => s.user_id);
        
        // If user ID is in existing splits, they are already counted in 'existingSplits' length usually, 
        // but here we are simulating the toggle.
        // Simplified: Participants = Others + Self
        itemParticipants = [...otherParticipants, (user?.id || 'current-user')];
        
        const existingUserSplit = existingSplits.find(s => s.user_id === user?.id);
        if (existingUserSplit) {
          userItemShare += existingUserSplit.amount;
        } else {
          // Equal split among all participants including self
          userItemShare += (item.price * item.quantity) / Math.max(itemParticipants.length, 1);
        }
      } else {
         // User not selected, check if others are
         const existingSplits = item.splits || [];
         itemParticipants = existingSplits.map(s => s.user_id);
      }
      
      // Add to bill participants
      itemParticipants.forEach(p => billParticipants.add(p));
    });

    // Add Tax and Tip independently
    const taxAmount = bill.tax_amount || 0;
    const tipAmount = bill.tip_amount || 0;
    const taxMode = bill.tax_split_mode || 'proportional';
    const tipMode = bill.tip_split_mode || 'proportional';
    const participantCount = Math.max(billParticipants.size, 1);
    const isUserParticipant = billParticipants.has(user?.id || 'current-user') || billParticipants.size === 0;

    // Base share before tax/tip
    const baseUserShare = userItemShare;

    // Calculate Tax Share
    if (taxAmount > 0 && isUserParticipant) {
      if (taxMode === 'proportional') {
         if (totalBillItemCost > 0) {
           const userRatio = baseUserShare / totalBillItemCost;
           userItemShare += taxAmount * userRatio;
         }
      } else {
        // Equal Split
        if (billParticipants.has(user?.id || 'current-user')) {
           userItemShare += taxAmount / participantCount;
        }
      }
    }

    // Calculate Tip Share
    if (tipAmount > 0 && isUserParticipant) {
      if (tipMode === 'proportional') {
         if (totalBillItemCost > 0) {
           const userRatio = baseUserShare / totalBillItemCost;
           userItemShare += tipAmount * userRatio; // This adds tip to the running total
         }
      } else {
        // Equal Split
         if (billParticipants.has(user?.id || 'current-user')) {
           userItemShare += tipAmount / participantCount;
        }
      }
    }

    // Recalculate discrete parts for breakdown display
    // Note: The above logic accumulated into userItemShare. To get clear breakdown, we should calculate parts separately.
    
    let finalItemShare = baseUserShare;
    let finalTaxShare = 0;
    let finalTipShare = 0;

    // Redo Tax Calc for Breakdown
    if (taxAmount > 0 && isUserParticipant) {
        if (taxMode === 'proportional' && totalBillItemCost > 0) {
            finalTaxShare = taxAmount * (baseUserShare / totalBillItemCost);
        } else if (taxMode === 'equal' && billParticipants.has(user?.id || 'current-user')) {
            finalTaxShare = taxAmount / participantCount;
        }
    }

    // Redo Tip Calc for Breakdown
    if (tipAmount > 0 && isUserParticipant) {
        if (tipMode === 'proportional' && totalBillItemCost > 0) {
            finalTipShare = tipAmount * (baseUserShare / totalBillItemCost);
        } else if (tipMode === 'equal' && billParticipants.has(user?.id || 'current-user')) {
             finalTipShare = tipAmount / participantCount;
        }
    }

    return {
        total: finalItemShare + finalTaxShare + finalTipShare,
        items: finalItemShare,
        tax: finalTaxShare,
        tip: finalTipShare
    };
  };

  const { total: yourShare, items: yourItemShare, tax: yourTaxShare, tip: yourTipShare } = calculateYourShare();

  // Helper to check if splits are equal (all same percentage)
  const areAllSplitsEqual = (splits: Array<{percentage: number}>) => {
    if (splits.length <= 1) return true;
    const firstPercentage = splits[0].percentage;
    return splits.every(s => Math.abs(s.percentage - firstPercentage) < 1); // Allow 1% tolerance
  };

  // ... (toggle logic remains same) ...

  const handleToggle = (itemId: string) => {
    // ... existing handleToggle logic ...
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const isCurrentlySelected = selectedItems.has(itemId);
    
    // Look up in displayItems (which includes exploded/fallback items)
    const item = displayItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    if (isCurrentlySelected) {
      // User is DESELECTING - redistribute their share
      const customItemSplits = customSplits.get(itemId);
      
      if (customItemSplits && customItemSplits.length > 0) {
        // Remove current user and redistribute proportionally
        const removedPerson = customItemSplits.find(p => p.userId === (user?.id || 'current-user'));
        const remaining = customItemSplits.filter(p => p.userId !== (user?.id || 'current-user'));
        
        if (removedPerson && remaining.length > 0) {
          const remainingTotal = remaining.reduce((sum, p) => sum + p.percentage, 0);
          const removedPercentage = removedPerson.percentage;
          
          const redistributed = remaining.map(p => {
            const additionalPercentage = remainingTotal > 0 
              ? (p.percentage / remainingTotal) * removedPercentage
              : removedPercentage / remaining.length;
            const newPercentage = p.percentage + additionalPercentage;
            return {
              ...p,
              percentage: newPercentage,
              amount: (item.price * newPercentage) / 100,
            };
          });
          
          const newCustomSplits = new Map(customSplits);
          newCustomSplits.set(itemId, redistributed);
          setCustomSplits(newCustomSplits);
        } else if (remaining.length === 0) {
          const newCustomSplits = new Map(customSplits);
          newCustomSplits.delete(itemId);
          setCustomSplits(newCustomSplits);
        }
      } else {
        // Handle demo data split
        const existingSplit = item.splits.find(s => s.user_id === user?.id);
        if (existingSplit) {
          const remaining = item.splits.filter(s => s.user_id !== user?.id);
          if (remaining.length > 0) {
            const remainingTotal = remaining.reduce((sum, s) => sum + s.amount, 0);
            const removedAmount = existingSplit.amount;
            
            const redistributed = remaining.map(s => {
              const additionalAmount = remainingTotal > 0 
                ? (s.amount / remainingTotal) * removedAmount
                : removedAmount / remaining.length;
              const newAmount = s.amount + additionalAmount;
              const newPercentage = (newAmount / item.price) * 100;
              return {
                userId: s.user_id,
                colorIndex: s.color_index,
                percentage: newPercentage,
                amount: newAmount,
              };
            });
            
            const newCustomSplits = new Map(customSplits);
            newCustomSplits.set(itemId, redistributed);
            setCustomSplits(newCustomSplits);
          }
        }
      }
      toggleItemSelection(itemId);
    } else {
      // User is SELECTING - add them to the split
      const customItemSplits = customSplits.get(itemId);
      // Ensure we don't have duplicates by filtering out current user from existing/demo splits first
      const rawExistingSplits = customItemSplits || item.splits.map(s => ({
        userId: s.user_id,
        colorIndex: s.color_index,
        percentage: (s.amount / item.price) * 100,
        amount: s.amount,
      }));
      
      const userId = user?.id || 'current-user';
      const existingSplits = rawExistingSplits.filter(s => s.userId !== userId);
      
      // Check if splits are equal or if this is a simple case
      const isEqualSplit = areAllSplitsEqual(existingSplits);
      const noExistingParticipants = existingSplits.length === 0;
      
      if (noExistingParticipants || isEqualSplit) {
        // Simple case: add user with equal share
        const newParticipantCount = existingSplits.length + 1;
        const equalPercentage = 100 / newParticipantCount;
        const equalAmount = item.price / newParticipantCount;
        
        // Recalculate all participants to equal
        const updatedSplits = existingSplits.map(p => ({
          ...p,
          percentage: equalPercentage,
          amount: equalAmount,
        }));
        
        // Add current user
        updatedSplits.push({
          userId: userId,
          colorIndex: user?.color_index || 0,
          percentage: equalPercentage,
          amount: equalAmount,
        });
        
        const newCustomSplits = new Map(customSplits);
        newCustomSplits.set(itemId, updatedSplits);
        setCustomSplits(newCustomSplits);
        toggleItemSelection(itemId);
      } else {
        // Unequal split - open custom split modal to let user decide
        setSelectedItem(item);
        setShowSplitModal(true);
        // Don't toggle yet - let modal handle it
      }
    }
  };

  // Long press to open custom split modal
  const handleLongPress = (item: BillItemWithSplits & { collapsedIds?: string[] }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedItem(item);
    setShowSplitModal(true);
  };

  // Handle custom split confirmation
  const handleCustomSplitConfirm = (participants: any[]) => {
    if (selectedItem) {
      const newCustomSplits = new Map(customSplits);
      
      // Define helper to apply split to a single item ID works for both single and bulk
      const applySplitToId = (targetId: string, itemPrice: number) => {
         const splitData = participants.map(p => ({
            userId: p.userId,
            colorIndex: p.colorIndex,
            // Recalculate amount based on item price to ensure precision if bulk edit has different totals
            // But here itemPrice is the UNIT price for single items.
            // If we have percentages from modal, use them.
            amount: (itemPrice * p.percentage) / 100, 
            percentage: p.percentage,
         }));
         newCustomSplits.set(targetId, splitData);
      };

      if (selectedItem.collapsedIds && selectedItem.collapsedIds.length > 0) {
        // Bulk apply to all collapsed items
        // We assume all items in the group have the same price (enforced by grouping logic)
        // selectedItem.price is the UNIT price in our grouping logic reference? 
        // Wait, in grouping logic: result.push({ ...item, quantity: sum }). item.price is unit price.
        // So selectedItem.price is correct.
        selectedItem.collapsedIds.forEach(id => {
            applySplitToId(id, selectedItem.price);
        });
      } else {
        // Single item apply
        applySplitToId(selectedItem.id, selectedItem.price);
      }
      
      setCustomSplits(newCustomSplits);
      
      // Logic to toggle selection state if needed
      // If bulk, toggle all if needed.
      const currentUserInSplit = participants.some(p => p.userId === (user?.id || 'current-user'));
      
      const toggleLogic = (targetId: string) => {
          const isSel = selectedItems.has(targetId);
          if (currentUserInSplit && !isSel) {
            toggleItemSelection(targetId);
          } else if (!currentUserInSplit && isSel) {
            toggleItemSelection(targetId);
          }
      };

      if (selectedItem.collapsedIds) {
          selectedItem.collapsedIds.forEach(id => toggleLogic(id));
      } else {
          toggleLogic(selectedItem.id);
      }
    }
    
    setShowSplitModal(false);
    setSelectedItem(null);
    showToast({ type: 'success', message: 'Split updated!' });
  };

  const handleConfirm = async () => {
    if (id) {
      await confirmSelections(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ type: 'success', message: 'Selections confirmed!' });
      router.back();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (id) {
      fetchBillById(id);
    }
    setTimeout(() => setRefreshing(false), 500);
  };

  if (!bill) {
    return (
      <Screen>
        <Stack flex={1} justifyContent="center" alignItems="center">
          <Text color={themeColors.textSecondary}>Loading...</Text>
        </Stack>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      {/* Header */}
      <Stack paddingHorizontal="$4" paddingVertical="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={themeColors.textPrimary} />
          </Pressable>
          <YStack alignItems="center">
            <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
              {bill.title}
            </Text>
            <XStack alignItems="center" gap="$2" marginTop="$1">
               {(() => {
                  const payerUser = demoUsers.find(u => u.id === bill.payer.id);
                  return (
                    <Avatar 
                      name={bill.payer.full_name} 
                      imageUrl={payerUser?.avatar_url}
                      colorIndex={payerUser?.color_index ?? 0} 
                      size="xs" 
                    />
                  );
                })()}
              <Text fontSize={12} color={themeColors.textSecondary}>
                Paid by {bill.payer.full_name}
              </Text>
            </XStack>
          </YStack>
          <Pressable onPress={() => router.push(`/bill/edit?id=${id}`)}>
            <Pencil size={24} color={themeColors.textPrimary} />
          </Pressable>
        </XStack>
      </Stack>

      <ScrollView
        flex={1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          // Close any open row on scroll
          closePrevOpenedRow();
        }}
      >
        {/* Bill Summary */}
        <Stack paddingHorizontal="$4" marginBottom="$4">
          <Card variant="elevated">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack>
                <Text fontSize={14} color={themeColors.textSecondary}>Total</Text>
                <Text fontSize={24} fontWeight="700" color={themeColors.textPrimary}>
                  ${bill.total_amount.toFixed(2)}
                </Text>
                {(bill.tax_amount > 0 || bill.tip_amount > 0) && (
                  <YStack marginTop="$1" paddingLeft={2}>
                    {bill.tax_amount > 0 && (
                      <XStack alignItems="center" gap={0} height={20}>
                        <Stack width={20} height="100%" position="relative">
                          {/* Vertical Line Part 1 (Top half) */}
                          <Stack 
                            width={1.0} 
                            backgroundColor={themeColors.primary} 
                            position="absolute" 
                            left={5} 
                            top={-2}
                            bottom="50%"
                          />
                           {/* Vertical Line Part 2 (Bottom half - only if not last) */}
                           {bill.tip_amount > 0 && (
                             <Stack 
                               width={1.0} 
                               backgroundColor={themeColors.primary} 
                               position="absolute" 
                               left={5} 
                               top="50%"
                               bottom={0}
                             />
                           )}
                          {/* Horizontal Line */}
                          <Stack 
                            height={1.0} 
                            backgroundColor={themeColors.primary} 
                            position="absolute" 
                            left={5} 
                            right={0} 
                            top="50%"
                          />
                        </Stack>
                        <XStack marginTop={-2} gap="$1" paddingLeft={4}>
                          <XStack width={28} justifyContent="space-between">
                            <Text fontSize={12} color={themeColors.textSecondary}>Tax</Text>
                            <Text fontSize={12} color={themeColors.textSecondary}>:</Text>
                          </XStack>
                          <Text fontSize={12} color={themeColors.textSecondary}>${bill.tax_amount.toFixed(2)}</Text>
                        </XStack>
                      </XStack>
                    )}
                    {bill.tip_amount > 0 && (
                      <XStack alignItems="center" gap={0} height={20}>
                         <Stack width={20} height="100%" position="relative">
                          {/* Vertical Line (Top to middle) */}
                          <Stack 
                            width={1.0} 
                            backgroundColor={themeColors.primary} 
                            position="absolute" 
                            left={5} 
                            top={-2} // Extend up to connect with previous sibling or parent
                            bottom="50%"
                          />
                          {/* Horizontal Line */}
                          <Stack 
                            height={1.0} 
                            backgroundColor={themeColors.primary} 
                            position="absolute" 
                            left={5} 
                            right={0} 
                            top="50%"
                          />
                        </Stack>
                        <XStack marginTop={-2} gap="$1" paddingLeft={4}>
                          <XStack width={28} justifyContent="space-between">
                            <Text fontSize={12} color={themeColors.textSecondary}>Tip</Text>
                            <Text fontSize={12} color={themeColors.textSecondary}>:</Text>
                          </XStack>
                          <Text fontSize={12} color={themeColors.textSecondary}>${bill.tip_amount.toFixed(2)}</Text>
                        </XStack>
                      </XStack>
                    )}
                  </YStack>
                )}
              </YStack>
              <YStack alignItems="flex-end">
                <Text fontSize={12} color={themeColors.textSecondary}>Your share</Text>
                <Text fontSize={20} fontWeight="700" color={themeColors.primary}>
                  ${yourShare.toFixed(2)}
                </Text>
              </YStack>
            </XStack>
            

          </Card>
        </Stack>
        
        {/* Add Item Button */}
        <Stack paddingHorizontal="$4" marginBottom="$3">
          <Button
            variant="outlined"
            icon={<Plus size={16} color={themeColors.primary} />}
            onPress={() => setShowAddModal(true)}
          >
            Add New Item
          </Button>
        </Stack>

        {/* Instructions */}
        <Stack paddingHorizontal="$4" marginBottom="$3">
          <XStack 
            backgroundColor={themeColors.infoBg}
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius={8}
            alignItems="center"
            gap="$2"
          >
            <Text fontSize={14}>💡</Text>
            <Text fontSize={13} color={themeColors.textSecondary} flex={1}>
              Tap to select items. Long-press for custom split options. Swipe left to delete.
            </Text>
          </XStack>
        </Stack>

        {/* Items List */}
        <Pressable 
            style={{ flex: 1 }} 
            onPress={() => closePrevOpenedRow()} // Close on tap outside
        >
            <YStack paddingHorizontal="$4" gap="$3" paddingBottom="$4">




            {groupedDisplayItems.map((item, index) => {
                const isSelected = item.isCollapsed ? true : selectedItems.has(item.id);
                
                // For collapsed items, we don't calculate complex segments yet, just show 'You'
                let segments: Array<{userId: string; colorIndex: number; percentage: number}> = [];

                if (item.isCollapsed) {
                     segments = [{
                        userId: user?.id || 'current-user',
                        colorIndex: user?.color_index || 0,
                        percentage: 100
                     }];
                } else {
                    // Check if we have custom splits for this item (from modal)
                    const customItemSplits = customSplits.get(item.id);
                    
                    if (customItemSplits && customItemSplits.length > 0) {
                    // Use custom splits from modal
                    segments = customItemSplits.map(s => ({
                        userId: s.userId,
                        colorIndex: s.colorIndex,
                        percentage: s.percentage,
                    }));
                    } else {
                    // Fall back to demo data splits
                    const otherParticipants = item.splits.filter(s => s.user_id !== user?.id);
                    const currentUserSplit = item.splits.find(s => s.user_id === user?.id);
                    
                    // Build segments from demo data
                    segments = otherParticipants.map(s => ({
                        userId: s.user_id,
                        colorIndex: s.color_index,
                        percentage: (s.amount / item.price) * 100,
                    }));
                    
                    // Add current user to segments if they are selected
                    if (isSelected) {
                        const userPercentage = currentUserSplit 
                        ? (currentUserSplit.amount / item.price) * 100
                        : 100 / (otherParticipants.length + 1);
                        
                        segments.push({
                        userId: user?.id || 'current-user',
                        colorIndex: user?.color_index || 0,
                        percentage: userPercentage,
                        });
                    }
                    }
                }

                return (
              <Reanimated.View 
                key={item.id}
                layout={LinearTransition}
                exiting={FadeOut}
              >
                <Swipeable
                  ref={ref => {
                      if (ref && !swipeableRows.current.has(item.id)) {
                           swipeableRows.current.set(item.id, ref);
                      }
                  }}
                  renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
                  overshootRight={false}
                  onSwipeableWillOpen={() => closePrevOpenedRow(item.id)}
                >
                    <ItemRow
                        name={item.name}
                        price={item.price}
                        quantity={item.quantity}
                        participants={segments.map(s => ({
                        userId: s.userId,
                        name: s.userId === (user?.id || 'current-user') 
                            ? (user?.full_name || 'You')
                            : `User`, // In real app, would look up user name
                        colorIndex: s.colorIndex,
                        percentage: s.percentage,
                        }))}
                        isSelected={isSelected}
                        onPress={() => {
                          if (item.isCollapsed && item.collapsedIds) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            item.collapsedIds.forEach(id => handleToggle(id));
                          } else {
                            handleToggle(item.id);
                          }
                        }}
                        onExpand={() => handleLongPress(item)}
                    />
                </Swipeable>
              </Reanimated.View>
            );
            })}
            </YStack>
        </Pressable>
      </ScrollView>

      {/* Footer */}
      <Stack 
        paddingHorizontal="$4" 
        paddingVertical="$4"
        borderTopWidth={1}
        borderTopColor={themeColors.border}
        backgroundColor={themeColors.surface}
      >
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
          <Text fontSize={14} color={themeColors.textSecondary}>
            {selectedItems.size} items selected
          </Text>
          <YStack alignItems="flex-start" gap="$1">
            <XStack gap="$3" alignItems="flex-end">
              <XStack width={40} justifyContent="space-between">
                <Text fontSize={14} fontWeight="600" color={themeColors.textPrimary}>Items</Text>
              </XStack>
              <Text fontSize={14} fontWeight="600" color={themeColors.textPrimary}>${yourItemShare.toFixed(2)}</Text>
            </XStack>
            {yourTaxShare > 0 && (
              <XStack gap="$3" alignItems="flex-end">
                <XStack width={40} justifyContent="space-between">
                  <Text fontSize={12} color={themeColors.textPrimary}>+ Tax</Text>
                </XStack>
                <Text fontSize={12} color={themeColors.textPrimary}>${yourTaxShare.toFixed(2)}</Text>
              </XStack>
            )}
            {yourTipShare > 0 && (
              <XStack gap="$3" alignItems="flex-end">
                <XStack width={40} justifyContent="space-between">
                  <Text fontSize={12} color={themeColors.textPrimary}>+ Tip</Text>
                </XStack>
                <Text fontSize={12} color={themeColors.textPrimary}>${yourTipShare.toFixed(2)}</Text>
              </XStack>
            )}
          </YStack>
        </XStack>
        
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          onPress={handleConfirm}
        >
          Confirm Selections
        </Button>
      </Stack>


      
      {/* Custom Split Modal */}
      {selectedItem && (
        <CustomSplitModal
          visible={showSplitModal}
          onClose={() => {
            setShowSplitModal(false);
            setSelectedItem(null);
          }}
          onConfirm={handleCustomSplitConfirm}
          itemName={selectedItem.name}
          itemPrice={selectedItem.price * (selectedItem.quantity || 1)}
          currentParticipants={(() => {
            // Determine which ID to look up in customSplits
            // If it's a collapsed item, look up the first constituent ID
            const lookupId = (selectedItem.collapsedIds && selectedItem.collapsedIds.length > 0)
              ? selectedItem.collapsedIds[0]
              : selectedItem.id;

            const localSplits = customSplits.get(lookupId);
            
            if (localSplits) {
              const totalEntityPrice = selectedItem.price * (selectedItem.quantity || 1);
              return localSplits.map(s => ({
                userId: s.userId,
                user: allMembers.find(m => m.user_id === s.userId)?.user || { 
                  id: s.userId, 
                  full_name: 'User', 
                  email: '', 
                  avatar_url: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                colorIndex: s.colorIndex,
                percentage: s.percentage,
                // Scale amount to the TOTAL price of the group
                amount: (totalEntityPrice * s.percentage) / 100,
                // Shares = proportion of total quantity
                shares: parseFloat(((s.percentage / 100) * (selectedItem.quantity || 1)).toFixed(2)),
                locked: false,
              }));
            }
            // Fallback to item.splits
            return selectedItem.splits.map(s => ({
              userId: s.user_id,
              user: s.user,
              colorIndex: s.color_index,
              percentage: (s.amount / selectedItem.price) * 100,
              amount: s.amount * (selectedItem.quantity || 1), // Scale demo amount too
              shares: parseFloat((((s.amount / selectedItem.price) * (selectedItem.quantity || 1))).toFixed(2)),
              locked: false,
            }));
          })()}
          allMembers={demoGroupMembers[bill.group_id] || []}
          currentUserId={user?.id || 'current-user'}
        />
      )}

      {/* Add Item Modal */}
      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleLocalAddItem}
      />
    </Screen>
  );
}
