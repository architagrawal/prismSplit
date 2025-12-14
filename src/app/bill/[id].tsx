/**
 * PrismSplit Bill Detail / Self-Select Screen
 * 
 * Uses billsStore for selections.
 */

import { useState, useEffect } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, RefreshControl } from 'react-native';
import { ArrowLeft, Share2, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { 
  Screen, 
  Card, 
  Avatar, 
  AvatarGroup,
  BalanceBadge,
  Button,
  SplitBar,
  StatusBadge
} from '@/components/ui';
import { colors } from '@/theme/tokens';
import { useBillsStore, useAuthStore, useUIStore } from '@/lib/store';
import { demoBillItems, currentUser } from '@/lib/api/demo';

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

  // Calculate user's share based on current selections
  const calculateYourShare = () => {
    let total = 0;
    demoBillItems.forEach(item => {
      if (selectedItems.has(item.id)) {
        // Count other participants + current user
        const otherParticipants = item.splits.filter(s => s.user_id !== user?.id).length;
        const totalParticipants = otherParticipants + 1; // +1 for current user
        total += item.price / Math.max(totalParticipants, 1);
      }
    });
    return total;
  };

  const yourShare = calculateYourShare();

  const handleToggle = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleItemSelection(itemId);
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
              <StatusBadge status={bill.status} />
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
              Tap items you consumed. Others will see your selections in real-time.
            </Text>
          </XStack>
        </Stack>

        {/* Items List */}
        <YStack paddingHorizontal="$4" gap="$3" paddingBottom="$4">
          {demoBillItems.map((item) => {
            const isSelected = selectedItems.has(item.id);
            
            // Filter out current user from existing splits - we'll add them based on isSelected
            const otherParticipants = item.splits.filter(s => s.user_id !== user?.id);
            const hasOtherParticipants = otherParticipants.length > 0;
            
            // Build segments: other participants + current user (if selected)
            const segments = otherParticipants.map(s => ({
              userId: s.user_id,
              colorIndex: s.color_index,
              percentage: (s.amount / item.price) * 100,
            }));
            
            // Add current user to segments if they are selected
            if (isSelected) {
              const totalParticipants = otherParticipants.length + 1;
              segments.push({
                userId: user?.id || 'current-user',
                colorIndex: user?.color_index || 0,
                percentage: 100 / totalParticipants,
              });
              // Recalculate percentages to be equal
              const equalPercentage = 100 / totalParticipants;
              segments.forEach(s => s.percentage = equalPercentage);
            }

            return (
              <Pressable key={item.id} onPress={() => handleToggle(item.id)}>
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
                        {hasOtherParticipants || isSelected ? (
                          <AvatarGroup
                            users={[
                              // Other participants (excluding current user)
                              ...otherParticipants.map(s => ({
                                name: s.user.full_name,
                                colorIndex: s.color_index,
                              })),
                              // Add current user only if selected
                              ...(isSelected ? [{ 
                                name: user?.full_name || 'You', 
                                colorIndex: user?.color_index || 0 
                              }] : []),
                            ]}
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
    </Screen>
  );
}
