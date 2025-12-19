
import { useState, useEffect, useRef, useMemo } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, RefreshControl, Platform, UIManager, Animated, Dimensions } from 'react-native';
import { ArrowLeft, Share2, Settings2, Plus, Pencil, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

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

import { BillReceiptView } from '@/components/bill/BillReceiptView';
import { BillSelectionView } from '@/components/bill/BillSelectionView';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    // UIManager.setLayoutAnimationEnabledExperimental(true); // No-op in New Arch
  }
}

export default function BillDetailScreen() {
  const router = useRouter();
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId; 
  const themeColors = useThemeColors();
  const width = Dimensions.get('window').width;
  
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
  
  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Local storage for custom split overrides
  const [customSplits, setCustomSplits] = useState<Map<string, Array<{
    userId: string;
    colorIndex: number;
    amount: number;
    percentage: number;
  }>>>(new Map());

  // Handle add item locally
  const [customBillItems, setCustomBillItems] = useState<BillItemWithSplits[]>([]);

  // Synced from store
  const storeItems = id ? billItems[id] : undefined;
  const displayItems = (customBillItems.length > 0 ? customBillItems : (storeItems || [])) as BillItemWithSplits[];

  // Group items logic
  const groupedDisplayItems = useMemo(() => {
    const selectedGroups = new Map<string, BillItemWithSplits[]>();
    const normalizeName = (name: string) => name.replace(/\s\(\d+\/\d+\)$/, '');

    const getParticipantsKey = (item: BillItemWithSplits) => {
        const currentSplits = customSplits.get(item.id);
        let participants: string[] = [];
        if (currentSplits) {
            participants = currentSplits.map(s => s.userId);
        } else {
            participants = item.splits.map(s => s.user_id);
        }
        const otherParticipants = participants.filter(uid => uid !== (user?.id || 'current-user'));
        otherParticipants.sort();
        return otherParticipants.join(',');
    };

    displayItems.forEach(item => {
      if (selectedItems.has(item.id)) {
        const cleanName = normalizeName(item.name);
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
            result.push({
              ...item,
              id: `collapsed-${key}`,
              name: cleanName,
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
  }, [displayItems, selectedItems, customSplits]); 

  // --- Effects ---
  useEffect(() => {
    if (storeItems && storeItems.length > 0 && customBillItems.length === 0) {
      setCustomBillItems([...storeItems as BillItemWithSplits[]]);
    }
  }, [storeItems]);

  useEffect(() => {
    if (id) {
      fetchBillById(id);
      fetchBillItems(id);
    }
    return () => clearSelections();
  }, [id]);

  useEffect(() => {
    if (!initialized && user) {
      const preSelectedIds: string[] = [];
      demoBillItems.forEach(item => {
        const userAlreadyInSplit = item.splits.some(s => s.user_id === user.id);
        if (userAlreadyInSplit) preSelectedIds.push(item.id);
      });
      preSelectedIds.forEach(itemId => {
        if (!selectedItems.has(itemId)) toggleItemSelection(itemId);
      });
      setInitialized(true);
    }
  }, [user, initialized]);

  // --- Handlers ---

  const handleLocalAddItem = (name: string, price: number) => {
    // ... same as before
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
    setShowAddModal(false);
  };

  const handleLocalDeleteItem = (idsInput: string | string[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const idsToDelete = new Set(Array.isArray(idsInput) ? idsInput : [idsInput]);
    setCustomBillItems(prev => prev.filter(i => !idsToDelete.has(i.id)));
    idsToDelete.forEach(id => {
      if (selectedItems.has(id)) toggleItemSelection(id);
    });
    showToast({ type: 'success', message: idsToDelete.size > 1 ? 'Items deleted' : 'Item deleted' });
  };
  
  // Reusing existing logic for handleToggle, handleCustomSplit...
  const areAllSplitsEqual = (splits: Array<{percentage: number}>) => {
    if (splits.length <= 1) return true;
    const firstPercentage = splits[0].percentage;
    return splits.every(s => Math.abs(s.percentage - firstPercentage) < 1);
  };

  const handleToggle = (itemId: string) => {
      // ... Duplicate logic from previous file? 
      // It is large. Since I am replacing the file content, I must include it.
      // I'll copy the logic from the previous file content view.
      
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isCurrentlySelected = selectedItems.has(itemId);
    const item = displayItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    if (isCurrentlySelected) {
      const customItemSplits = customSplits.get(itemId);
      if (customItemSplits && customItemSplits.length > 0) {
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
            return { ...p, percentage: newPercentage, amount: (item.price * newPercentage) / 100 };
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
         const existingSplit = item.splits.find(s => s.user_id === user?.id);
         if (existingSplit) {
           const remaining = item.splits.filter(s => s.user_id !== user?.id);
           if (remaining.length > 0) {
             const remainingTotal = remaining.reduce((sum, s) => sum + s.amount, 0);
             const removedAmount = existingSplit.amount;
             const redistributed = remaining.map(s => {
               const additionalAmount = remainingTotal > 0 ? (s.amount / remainingTotal) * removedAmount : removedAmount / remaining.length;
               const newAmount = s.amount + additionalAmount;
               return { userId: s.user_id, colorIndex: s.color_index, percentage: (newAmount / item.price) * 100, amount: newAmount };
             });
             const newCustomSplits = new Map(customSplits);
             newCustomSplits.set(itemId, redistributed);
             setCustomSplits(newCustomSplits);
           }
         }
      }
      toggleItemSelection(itemId);
    } else {
      const customItemSplits = customSplits.get(itemId);
      const rawExistingSplits = customItemSplits || item.splits.map(s => ({
        userId: s.user_id, colorIndex: s.color_index, percentage: (s.amount / item.price) * 100, amount: s.amount,
      }));
      const userId = user?.id || 'current-user';
      const existingSplits = rawExistingSplits.filter(s => s.userId !== userId);
      const isEqualSplit = areAllSplitsEqual(existingSplits);
      
      if (existingSplits.length === 0 || isEqualSplit) {
         const newParticipantCount = existingSplits.length + 1;
         const equalPercentage = 100 / newParticipantCount;
         const equalAmount = item.price / newParticipantCount;
         const updatedSplits = existingSplits.map(p => ({ ...p, percentage: equalPercentage, amount: equalAmount }));
         updatedSplits.push({ userId: userId, colorIndex: user?.color_index || 0, percentage: equalPercentage, amount: equalAmount });
         
         const newCustomSplits = new Map(customSplits);
         newCustomSplits.set(itemId, updatedSplits);
         setCustomSplits(newCustomSplits);
         toggleItemSelection(itemId);
      } else {
         setSelectedItem(item);
         setShowSplitModal(true);
      }
    }
  };

  const handleCustomSplitConfirm = (participants: any[]) => {
      // Re-implement logic from previous file
      if (selectedItem) {
        const newCustomSplits = new Map(customSplits);
        const applySplitToId = (targetId: string, itemPrice: number) => {
             const splitData = participants.map(p => ({
                userId: p.userId, colorIndex: p.colorIndex, amount: (itemPrice * p.percentage) / 100, percentage: p.percentage,
             }));
             newCustomSplits.set(targetId, splitData);
        };
        if (selectedItem.collapsedIds) {
             selectedItem.collapsedIds.forEach(id => applySplitToId(id, selectedItem.price));
        } else {
             applySplitToId(selectedItem.id, selectedItem.price);
        }
        setCustomSplits(newCustomSplits);
        
        const currentUserInSplit = participants.some(p => p.userId === (user?.id || 'current-user'));
        const toggleLogic = (targetId: string) => {
              const isSel = selectedItems.has(targetId);
              if (currentUserInSplit && !isSel) toggleItemSelection(targetId);
              else if (!currentUserInSplit && isSel) toggleItemSelection(targetId);
        };
        if (selectedItem.collapsedIds) selectedItem.collapsedIds.forEach(id => toggleLogic(id));
        else toggleLogic(selectedItem.id);
      }
      setShowSplitModal(false);
      setSelectedItem(null);
      showToast({ type: 'success', message: 'Split updated!' });
  };
  
  const handleLongPress = (item: BillItemWithSplits) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedItem(item);
      setShowSplitModal(true);
  };

  const scrollViewRef = useRef<ScrollView>(null);
  
  // Page Indicator state
  const [activePage, setActivePage] = useState(0);

  const handleScroll = (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const page = Math.round(offsetX / width);
      if (page !== activePage) setActivePage(page);
  };
  
  const scrollToPage = (page: number) => {
      scrollViewRef.current?.scrollTo({ x: page * width, animated: true });
  };

  if (!currentBill) {
    return <Screen><Stack flex={1} justifyContent="center" alignItems="center"><Text>Loading...</Text></Stack></Screen>;
  }

  return (
    <Screen padded={false}>
      {/* Top Header Navigation */}
      <Stack paddingHorizontal="$4" paddingVertical="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={themeColors.textPrimary} />
          </Pressable>
          <XStack alignItems="center" gap="$2">
             {/* Page Indicators */}
             <Pressable onPress={() => scrollToPage(0)}>
                <Stack 
                    width={8} height={8} borderRadius={4} 
                    backgroundColor={activePage === 0 ? themeColors.primary : themeColors.border} 
                />
             </Pressable>
             <Pressable onPress={() => scrollToPage(1)}>
                <Stack 
                    width={8} height={8} borderRadius={4} 
                    backgroundColor={activePage === 1 ? themeColors.primary : themeColors.border} 
                />
             </Pressable>
          </XStack>
          <Pressable onPress={() => setShowAddModal(true)}>
             <Plus size={24} color={themeColors.primary} />
          </Pressable>
        </XStack>
      </Stack>

      {/* Horizontal Sliding Door */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        flex={1}
      >
        {/* PAGE 1: RECEIPT */}
        <Stack width={width} flex={1}>
            <BillReceiptView 
                bill={currentBill}
                items={displayItems}
                customSplits={customSplits}
                selectedItems={selectedItems}
                onEditPress={() => router.push(`/bill/edit?id=${id}`)}
                onSharePress={() => showToast({ type: 'success', message: 'Share feature coming soon!' })}
                onDownloadPress={() => showToast({ type: 'success', message: 'Download feature coming soon!' })}
            />
        </Stack>

        {/* PAGE 2: SELECTION */}
        <Stack width={width} flex={1}>
            <BillSelectionView
                items={groupedDisplayItems}
                selectedItems={selectedItems}
                onToggleItem={handleToggle}
                onDeleteItem={handleLocalDeleteItem}
                onAddItem={handleLocalAddItem}
                onLongPressItem={handleLongPress}
                isLoading={isLoading}
            />
        </Stack>      
      </ScrollView>
      
      {/* Floating Action / Bottom Bar for Page 2 Actions? 
          Actually Page 1 has actions inside BillReceiptView.
          Page 2 interactions are direct.
          But we need the "Confirm" button somewhere if it's not auto-save?
          The original code had confirm.
      */}
      {activePage === 1 && (
         <Stack position="absolute" bottom={30} left={20} right={20}>
            <Button variant="primary" size="lg" onPress={async () => {
                await confirmSelections(id);
                showToast({ type: 'success', message: 'Selections saved' });
                scrollToPage(0); // Go back to receipt
            }}>
                Done
            </Button>
         </Stack>
      )}

      {/* Modals */}
      {currentBill && (
        <CustomSplitModal 
          visible={showSplitModal}
          onClose={() => setShowSplitModal(false)}
          itemPrice={selectedItem?.price || 0}
          itemName={selectedItem?.name || ''}
          currentParticipants={(() => {
              if (!selectedItem) return [];
              const custom = customSplits.get(selectedItem.id);
              if (custom) return custom.map(s => ({ ...s, shares: 1, user: demoGroupMembers[currentBill.group_id]?.find(m => m.user_id === s.userId)?.user || { full_name: 'Unknown', id: s.userId } as any }));
              
              // We need to map existing splits to SplitParticipants which require 'user' object
              return selectedItem.splits.map(s => ({
                  userId: s.user_id,
                  user: s.user,
                  colorIndex: s.color_index,
                  percentage: (s.amount / selectedItem.price) * 100,
                  amount: s.amount,
                  shares: 1,
                  locked: false
              }));
          })()}
          allMembers={demoGroupMembers[currentBill.group_id] || []}
          currentUserId={user?.id || 'current-user'}
          onConfirm={handleCustomSplitConfirm}
        />
      )}
      
      <AddItemModal 
          visible={showAddModal} 
          onClose={() => setShowAddModal(false)}
          onAdd={handleLocalAddItem}
      />
    </Screen>
  );
}
