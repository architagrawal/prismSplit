/**
 * PrismSplit Bill Detail / Self-Select Screen
 * 
 * Uses billsStore for selections.
 */

import { useState, useEffect } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, RefreshControl } from 'react-native';
import { ArrowLeft, Share2, Check, Settings2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { 
  Screen, 
  Card, 
  Avatar, 
  AvatarGroup,
  BalanceBadge,
  Button,
  SplitBar,
  CustomSplitModal
} from '@/components/ui';
import { colors } from '@/theme/tokens';
import { useBillsStore, useAuthStore, useUIStore } from '@/lib/store';
import { demoBillItems, currentUser, demoGroupMembers } from '@/lib/api/demo';
import type { BillItemWithSplits } from '@/types/models';

export default function BillDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { 
    currentBill, 
    selectedItems, 
    isLoading,
    fetchBillById, 
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
  const [selectedItem, setSelectedItem] = useState<BillItemWithSplits | null>(null);
  
  // Local storage for custom split overrides (until backend is connected)
  // Key: itemId, Value: array of split participants with their amounts
  const [customSplits, setCustomSplits] = useState<Map<string, Array<{
    userId: string;
    colorIndex: number;
    amount: number;
    percentage: number;
  }>>>(new Map());

  // Fetch bill on mount
  useEffect(() => {
    if (id) {
      fetchBillById(id);
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

  // Calculate user's share based on current selections and custom splits
  const calculateYourShare = () => {
    let total = 0;
    demoBillItems.forEach(item => {
      // Check if we have custom splits for this item (from modal)
      const customItemSplits = customSplits.get(item.id);
      
      if (customItemSplits && customItemSplits.length > 0) {
        // Use custom split amount from modal if available
        const userSplit = customItemSplits.find(s => s.userId === (user?.id || 'current-user'));
        if (userSplit) {
          total += userSplit.amount;
        }
      } else if (selectedItems.has(item.id)) {
        // Check if user has an existing split in demo data
        const existingUserSplit = item.splits.find(s => s.user_id === user?.id);
        if (existingUserSplit) {
          // Use the actual split amount from demo data
          total += existingUserSplit.amount;
        } else {
          // User just selected this item - calculate equal share
          const otherParticipants = item.splits.filter(s => s.user_id !== user?.id).length;
          const totalParticipants = otherParticipants + 1; // +1 for current user
          total += item.price / Math.max(totalParticipants, 1);
        }
      }
    });
    return total;
  };

  const yourShare = calculateYourShare();

  // Helper to check if splits are equal (all same percentage)
  const areAllSplitsEqual = (splits: Array<{percentage: number}>) => {
    if (splits.length <= 1) return true;
    const firstPercentage = splits[0].percentage;
    return splits.every(s => Math.abs(s.percentage - firstPercentage) < 1); // Allow 1% tolerance
  };

  const handleToggle = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const isCurrentlySelected = selectedItems.has(itemId);
    const item = demoBillItems.find(i => i.id === itemId);
    
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
      const existingSplits = customItemSplits || item.splits.map(s => ({
        userId: s.user_id,
        colorIndex: s.color_index,
        percentage: (s.amount / item.price) * 100,
        amount: s.amount,
      }));
      
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
          userId: user?.id || 'current-user',
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
  const handleLongPress = (item: BillItemWithSplits) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedItem(item);
    setShowSplitModal(true);
  };

  // Handle custom split confirmation
  const handleCustomSplitConfirm = (participants: any[]) => {
    if (selectedItem) {
      // Save custom splits to local state
      const newCustomSplits = new Map(customSplits);
      newCustomSplits.set(selectedItem.id, participants.map(p => ({
        userId: p.userId,
        colorIndex: p.colorIndex,
        amount: p.amount,
        percentage: p.percentage,
      })));
      setCustomSplits(newCustomSplits);
      
      // Select the item if not already selected and current user is in the split
      const currentUserInSplit = participants.some(p => p.userId === (user?.id || 'current-user'));
      if (currentUserInSplit && !selectedItems.has(selectedItem.id)) {
        toggleItemSelection(selectedItem.id);
      } else if (!currentUserInSplit && selectedItems.has(selectedItem.id)) {
        toggleItemSelection(selectedItem.id); // Deselect if removed from split
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
          <Text color={colors.light.textSecondary}>Loading...</Text>
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
            <ArrowLeft size={24} color={colors.light.textPrimary} />
          </Pressable>
          <YStack alignItems="center">
            <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
              {bill.title}
            </Text>
            <Text fontSize={12} color={colors.light.textSecondary}>
              Tap items to join split
            </Text>
          </YStack>
          <Pressable>
            <Share2 size={24} color={colors.light.textPrimary} />
          </Pressable>
        </XStack>
      </Stack>

      <ScrollView
        flex={1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Bill Summary */}
        <Stack paddingHorizontal="$4" marginBottom="$4">
          <Card variant="elevated">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack>
                <Text fontSize={14} color={colors.light.textSecondary}>Total</Text>
                <Text fontSize={24} fontWeight="700" color={colors.light.textPrimary}>
                  ${bill.total_amount.toFixed(2)}
                </Text>
              </YStack>
              <YStack alignItems="flex-end">
                <Text fontSize={14} color={colors.light.textSecondary}>Your Share</Text>
                <BalanceBadge amount={-yourShare} size="md" />
              </YStack>
            </XStack>
            
            <Stack height={1} backgroundColor={colors.light.border} marginVertical="$3" />
            
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap="$2">
                <Avatar name={bill.payer.full_name} colorIndex={0} size="sm" />
                <Text fontSize={14} color={colors.light.textSecondary}>
                  Paid by {bill.payer.full_name}
                </Text>
              </XStack>
            </XStack>
          </Card>
        </Stack>

        {/* Instructions */}
        <Stack paddingHorizontal="$4" marginBottom="$3">
          <XStack 
            backgroundColor={colors.light.infoBg}
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius={8}
            alignItems="center"
            gap="$2"
          >
            <Text fontSize={14}>💡</Text>
            <Text fontSize={13} color={colors.light.textSecondary} flex={1}>
              Tap to select items. Long-press for custom split options.
            </Text>
          </XStack>
        </Stack>

        {/* Items List */}
        <YStack paddingHorizontal="$4" gap="$3" paddingBottom="$4">
          {demoBillItems.map((item) => {
            const isSelected = selectedItems.has(item.id);
            
            // Check if we have custom splits for this item (from modal)
            const customItemSplits = customSplits.get(item.id);
            
            let segments: Array<{userId: string; colorIndex: number; percentage: number}>;
            let hasOtherParticipants: boolean;
            
            if (customItemSplits && customItemSplits.length > 0) {
              // Use custom splits from modal
              segments = customItemSplits.map(s => ({
                userId: s.userId,
                colorIndex: s.colorIndex,
                percentage: s.percentage,
              }));
              hasOtherParticipants = segments.some(s => s.userId !== (user?.id || 'current-user'));
            } else {
              // Fall back to demo data splits
              const otherParticipants = item.splits.filter(s => s.user_id !== user?.id);
              const currentUserSplit = item.splits.find(s => s.user_id === user?.id);
              hasOtherParticipants = otherParticipants.length > 0;
              
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

            return (
              <Pressable 
                key={item.id} 
                onPress={() => handleToggle(item.id)}
                onLongPress={() => handleLongPress(item)}
                delayLongPress={400}
              >
                <Card
                  variant={isSelected ? 'elevated' : 'surface'}
                  padding="$3"
                  borderWidth={isSelected ? 2 : 1}
                  borderColor={isSelected ? colors.light.primary : colors.light.border}
                >
                  <XStack alignItems="center" gap="$3">
                    <Stack
                      width={24}
                      height={24}
                      borderRadius={12}
                      backgroundColor={isSelected ? colors.light.primary : colors.light.border}
                      justifyContent="center"
                      alignItems="center"
                    >
                      {isSelected && <Check size={14} color="white" />}
                    </Stack>
                    
                    <YStack flex={1} gap="$1">
                      <XStack justifyContent="space-between" alignItems="center">
                        <Text 
                          fontSize={16} 
                          fontWeight="500" 
                          color={colors.light.textPrimary}
                        >
                          {item.name}
                        </Text>
                        <Text 
                          fontSize={16} 
                          fontWeight="600" 
                          color={isSelected ? colors.light.primary : colors.light.textPrimary}
                        >
                          ${item.price.toFixed(2)}
                        </Text>
                      </XStack>
                      
                      <XStack alignItems="center" gap="$2">
                        {segments.length > 0 ? (
                          <AvatarGroup
                            users={segments.map(s => ({
                              name: s.userId === (user?.id || 'current-user') 
                                ? (user?.full_name || 'You')
                                : `User`, // In real app, would look up user name
                              colorIndex: s.colorIndex,
                            }))}
                            size="sm"
                          />
                        ) : (
                          <Text fontSize={12} color={colors.light.warning}>
                            ⚠️ No one yet
                          </Text>
                        )}
                      </XStack>
                      
                      <Stack marginTop="$1">
                        <SplitBar
                          segments={segments}
                          height={4}
                          unclaimed={!hasOtherParticipants && !isSelected ? 100 : 0}
                        />
                      </Stack>
                    </YStack>
                  </XStack>
                </Card>
              </Pressable>
            );
          })}
        </YStack>
      </ScrollView>

      {/* Footer */}
      <Stack 
        paddingHorizontal="$4" 
        paddingVertical="$4"
        borderTopWidth={1}
        borderTopColor={colors.light.border}
        backgroundColor={colors.light.surface}
      >
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
          <Text fontSize={14} color={colors.light.textSecondary}>
            {selectedItems.size} items selected
          </Text>
          <YStack alignItems="flex-end">
            <Text fontSize={12} color={colors.light.textSecondary}>Your share</Text>
            <Text fontSize={20} fontWeight="700" color={colors.light.primary}>
              ${yourShare.toFixed(2)}
            </Text>
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
          itemPrice={selectedItem.price}
          currentParticipants={selectedItem.splits.map(s => ({
            userId: s.user_id,
            user: s.user,
            colorIndex: s.color_index,
            percentage: (s.amount / selectedItem.price) * 100,
            amount: s.amount,
          }))}
          allMembers={demoGroupMembers[bill.group_id] || []}
          currentUserId={user?.id || 'current-user'}
        />
      )}
    </Screen>
  );
}
