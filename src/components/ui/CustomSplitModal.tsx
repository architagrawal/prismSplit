/**
 * PrismSplit Custom Split Modal
 * 
 * Modal for customizing item splits: equal, percentage, or fixed amount.
 * Also allows adding/removing people from a split.
 */

import { useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { 
  X, 
  Check, 
  Plus, 
  Minus, 
  Percent, 
  DollarSign, 
  Users
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useThemeColors } from '@/hooks/useThemeColors';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { Card } from './Card';
import { ConfirmDialog } from './ConfirmDialog';
import type { User, GroupMember } from '@/types/models';

type SplitMode = 'quantity' | 'percentage' | 'amount';

interface SplitParticipant {
  userId: string;
  user: User;
  colorIndex: number;
  percentage: number;
  amount: number;
  shares?: number;
  locked?: boolean;
}

interface CustomSplitModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (participants: SplitParticipant[]) => void;
  itemName: string;
  itemPrice: number;
  currentParticipants: SplitParticipant[];
  allMembers: GroupMember[];
  currentUserId: string;
}

export function CustomSplitModal({
  visible,
  onClose,
  onConfirm,
  itemName,
  itemPrice,
  currentParticipants,
  allMembers,
  currentUserId,
}: CustomSplitModalProps) {
  const themeColors = useThemeColors();
  const [splitMode, setSplitMode] = useState<SplitMode>('quantity');
  const [participants, setParticipants] = useState<SplitParticipant[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    if (visible) {
      // Initialize with shares = 1 if not present
      setParticipants(currentParticipants.map(p => ({ 
        ...p, 
        shares: p.shares || 1,
        locked: false 
      })));
      setHasChanges(false); // Reset on open
      
      // Auto-detect mode from current data
      if (currentParticipants.length > 0) {
        const firstPercent = currentParticipants[0].percentage;
        const allEqual = currentParticipants.every(
          p => Math.abs(p.percentage - firstPercent) < 0.01
        );
        setSplitMode(allEqual ? 'quantity' : 'percentage');
      }
    }
  }, [visible, currentParticipants]);

  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const nonParticipants = allMembers.filter(
    m => !participants.some(p => p.userId === m.user_id)
  );

  const recalculateSharesSplit = (parts: SplitParticipant[]) => {
    const totalShares = parts.reduce((sum, p) => sum + (p.shares || 1), 0);
    if (totalShares === 0) return parts;
    
    return parts.map(p => ({
      ...p,
      percentage: ((p.shares || 1) / totalShares) * 100,
      amount: ((p.shares || 1) / totalShares) * itemPrice,
      locked: false,
    }));
  };

  const handleResetEqual = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = participants.map(p => ({ ...p, shares: 1 }));
    setParticipants(recalculateSharesSplit(updated));
    setSplitMode('quantity');
    setHasChanges(true);
  };

  const handleAddPerson = (member: GroupMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newParticipant: SplitParticipant = {
      userId: member.user_id,
      user: member.user,
      colorIndex: member.color_index,
      percentage: 0,
      amount: 0,
      shares: 1,
      locked: false,
    };
    
    let updated = [...participants, newParticipant];
    if (splitMode === 'quantity') {
      updated = recalculateSharesSplit(updated);
    }
    setParticipants(updated);
    setHasChanges(true);
  };

  // Helper to rebalance remaining amount among unlocked participants
  const distributeRemaining = (
    currentList: SplitParticipant[], 
    lockedUserId: string | null = null
  ) => {
    // Calculate total locked amount/percentage
    const lockedParticipants = currentList.filter(p => p.locked || p.userId === lockedUserId);
    const unlockedParticipants = currentList.filter(p => !p.locked && p.userId !== lockedUserId);
    
    if (unlockedParticipants.length === 0) {
      return currentList;
    }

    if (splitMode === 'percentage') {
      const lockedTotal = lockedParticipants.reduce((sum, p) => sum + p.percentage, 0);
      const remaining = Math.max(0, 100 - lockedTotal);
      const perPerson = remaining / unlockedParticipants.length;
      
      return currentList.map(p => {
        if (p.locked || p.userId === lockedUserId) return p;
        return {
          ...p,
          percentage: perPerson,
          amount: (itemPrice * perPerson) / 100,
        };
      });
    } else if (splitMode === 'amount') {
      const lockedTotal = lockedParticipants.reduce((sum, p) => sum + p.amount, 0);
      const remaining = Math.max(0, itemPrice - lockedTotal);
      const perPerson = remaining / unlockedParticipants.length;
      
      return currentList.map(p => {
        if (p.locked || p.userId === lockedUserId) return p;
        return {
          ...p,
          amount: perPerson,
          percentage: itemPrice > 0 ? (perPerson / itemPrice) * 100 : 0,
        };
      });
    } else {
      // Quantity mode logic is handled by recalculateSharesSplit usually
      // But if we're here, it implies rebalancing.
      // In quantity mode, we usually recalculate everything based on shares.
      return recalculateSharesSplit(currentList);
    }
  };

  const handleRemovePerson = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const remaining = participants.filter(p => p.userId !== userId);
    
    if (remaining.length === 0) {
      setParticipants(remaining);
      return;
    }
    
    if (splitMode === 'quantity') {
      setParticipants(recalculateSharesSplit(remaining));
    } else {
      const updated = distributeRemaining(remaining);
      setParticipants(updated);
    }
    setHasChanges(true);
  };

  const handleQuantityChange = (userId: string, value: string) => {
    const newShares = parseFloat(value) || 0;
    // Update shares and recalculate all
    const updated = participants.map(p => 
      p.userId === userId ? { ...p, shares: newShares } : p
    );
    setParticipants(recalculateSharesSplit(updated));
    setHasChanges(true);
  };

  const handlePercentageChange = (userId: string, value: string) => {
    const newPercentage = parseFloat(value) || 0;
    const clampedPercentage = Math.min(100, Math.max(0, newPercentage));
    
    const updatedUserList = participants.map(p => 
      p.userId === userId 
        ? { ...p, percentage: clampedPercentage, amount: (itemPrice * clampedPercentage) / 100, locked: true } 
        : p
    );
    
    setParticipants(distributeRemaining(updatedUserList, userId));
  };

  const handleAmountChange = (userId: string, value: string) => {
    const newAmount = parseFloat(value) || 0;
    const clampedAmount = Math.min(itemPrice, Math.max(0, newAmount));
    const newPercentage = itemPrice > 0 ? (clampedAmount / itemPrice) * 100 : 0;
    
    const updatedUserList = participants.map(p => 
      p.userId === userId 
        ? { ...p, amount: clampedAmount, percentage: newPercentage, locked: true } 
        : p
    );

    setParticipants(distributeRemaining(updatedUserList, userId));
  };

  const handleModeChange = (mode: SplitMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSplitMode(mode);
    // If switching to quantity, recalculate based on current shares (or default 1)
    if (mode === 'quantity') {
       const updated = participants.map(p => ({ ...p, shares: p.shares || 1 }));
       setParticipants(recalculateSharesSplit(updated));
    }
  };

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(participants);
    onClose();
  };

  const totalPercentage = participants.reduce((sum, p) => sum + p.percentage, 0);
  const totalAmount = participants.reduce((sum, p) => sum + p.amount, 0);
  const isValid = participants.length > 0 && Math.abs(totalPercentage - 100) < 0.1;

  return (
    <>
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <Stack flex={1} backgroundColor={themeColors.background} paddingHorizontal="$4">
        {/* Header */}
        <XStack 
          justifyContent="space-between" 
          alignItems="center" 
          paddingVertical="$4"
          borderBottomWidth={1}
          borderBottomColor={themeColors.border}
        >
          <Pressable onPress={handleClose}>
            <X size={24} color={themeColors.textPrimary} />
          </Pressable>
          <YStack alignItems="center">
            <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
              Custom Split
            </Text>
            <Text fontSize={14} color={themeColors.textSecondary}>
              {itemName}
            </Text>
          </YStack>
          <Button variant="ghost" size="sm" onPress={handleResetEqual}>
            Split Equally
          </Button>
        </XStack>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={{ flex: 1 }}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          {/* Unified Split Status Card */}
          <Card 
            variant="elevated" 
            marginTop="$4" 
            marginBottom="$4"
            backgroundColor={isValid ? themeColors.successBg : themeColors.surfaceElevated}
            borderWidth={1}
            borderColor={isValid ? themeColors.success : themeColors.border}
          >
            <YStack gap="$2">
              {/* Row 1: Item Total */}
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color={themeColors.textSecondary}>Item Total</Text>
                <Text fontSize={18} fontWeight="700" color={themeColors.primary}>
                  ${itemPrice.toFixed(2)}
                </Text>
              </XStack>
              
              <Stack height={1} backgroundColor={themeColors.border} opacity={0.5} />
              
              {/* Row 2: Allocated */}
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" gap="$2">
                  <Text fontSize={14} color={themeColors.textSecondary}>Allocated</Text>
                  {isValid && <Check size={14} color={themeColors.success} />}
                </XStack>
                <Text 
                  fontSize={14} 
                  fontWeight="600" 
                  color={isValid ? themeColors.success : themeColors.textPrimary}
                >
                  ${totalAmount.toFixed(2)} ({totalPercentage.toFixed(1)}%)
                </Text>
              </XStack>

              {/* Row 3: Remaining (only if not valid) */}
              {!isValid && (
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={14} color={themeColors.warning}>Remaining</Text>
                  <Text fontSize={14} fontWeight="600" color={themeColors.warning}>
                    ${Math.abs(itemPrice - totalAmount).toFixed(2)} ({Math.abs(100 - totalPercentage).toFixed(1)}%)
                  </Text>
                </XStack>
              )}
            </YStack>
          </Card>

          {/* Split Mode Selector */}
          <YStack marginBottom="$4">
            <Text fontSize={14} fontWeight="500" color={themeColors.textSecondary} marginBottom="$2">
              Split Type
            </Text>
            <XStack gap="$2">
              {/* Quantity */}
              <Pressable style={{ flex: 1 }} onPress={() => handleModeChange('quantity')}>
                <Card
                  variant={splitMode === 'quantity' ? 'elevated' : 'outlined'}
                  padding="$3"
                  borderWidth={splitMode === 'quantity' ? 2 : 1}
                  borderColor={splitMode === 'quantity' ? themeColors.primary : themeColors.border}
                >
                  <YStack alignItems="center" gap="$1">
                    <Users size={20} color={splitMode === 'quantity' ? themeColors.primary : themeColors.textMuted} />
                    <Text 
                      fontSize={12} 
                      fontWeight="500"
                      color={splitMode === 'quantity' ? themeColors.primary : themeColors.textSecondary}
                    >
                      Quantity
                    </Text>
                  </YStack>
                </Card>
              </Pressable>

              {/* Percentage */}
              <Pressable style={{ flex: 1 }} onPress={() => handleModeChange('percentage')}>
                <Card
                  variant={splitMode === 'percentage' ? 'elevated' : 'outlined'}
                  padding="$3"
                  borderWidth={splitMode === 'percentage' ? 2 : 1}
                  borderColor={splitMode === 'percentage' ? themeColors.primary : themeColors.border}
                >
                  <YStack alignItems="center" gap="$1">
                    <Percent size={20} color={splitMode === 'percentage' ? themeColors.primary : themeColors.textMuted} />
                    <Text 
                      fontSize={12} 
                      fontWeight="500"
                      color={splitMode === 'percentage' ? themeColors.primary : themeColors.textSecondary}
                    >
                      Percent
                    </Text>
                  </YStack>
                </Card>
              </Pressable>

              {/* Amount */}
              <Pressable style={{ flex: 1 }} onPress={() => handleModeChange('amount')}>
                <Card
                  variant={splitMode === 'amount' ? 'elevated' : 'outlined'}
                  padding="$3"
                  borderWidth={splitMode === 'amount' ? 2 : 1}
                  borderColor={splitMode === 'amount' ? themeColors.primary : themeColors.border}
                >
                  <YStack alignItems="center" gap="$1">
                    <DollarSign size={20} color={splitMode === 'amount' ? themeColors.primary : themeColors.textMuted} />
                    <Text 
                      fontSize={12} 
                      fontWeight="500"
                      color={splitMode === 'amount' ? themeColors.primary : themeColors.textSecondary}
                    >
                      Amount
                    </Text>
                  </YStack>
                </Card>
              </Pressable>
            </XStack>
          </YStack>

          {/* Current Participants */}
          <YStack marginBottom="$4">
            <Text fontSize={14} fontWeight="500" color={themeColors.textSecondary} marginBottom="$2">
              Splitting ({participants.length})
            </Text>
            
            {participants.length === 0 ? (
              <Card variant="surface">
                <Text fontSize={14} color={themeColors.textMuted} textAlign="center">
                  No one is splitting this item yet
                </Text>
              </Card>
            ) : (
              <Card variant="surface">
                {participants.map((participant, index) => (
                  <XStack 
                    key={participant.userId}
                    alignItems="center" 
                    gap="$3"
                    paddingVertical="$3"
                    borderTopWidth={index > 0 ? 1 : 0}
                    borderTopColor={themeColors.border}
                  >
                    <Avatar
                      name={participant.user.full_name}
                      colorIndex={participant.colorIndex}
                      size="md"
                    />
                    <YStack flex={1}>
                      <XStack alignItems="center" gap="$2">
                        <Text fontSize={16} color={themeColors.textPrimary}>
                          {participant.userId === currentUserId ? 'You' : participant.user.full_name}
                        </Text>
                      </XStack>
                      <Text fontSize={12} color={themeColors.textSecondary}>
                        {splitMode === 'amount' 
                          ? `${participant.percentage.toFixed(1)}%`
                          : `$${participant.amount.toFixed(2)}`
                        }
                      </Text>
                    </YStack>

                    {/* Input based on mode */}
                    <XStack alignItems="center" gap="$1">
                      <TextInput
                        style={{
                          width: 60,
                          height: 36,
                          backgroundColor: themeColors.surfaceElevated,
                          borderRadius: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 0,
                          fontSize: 14,
                          textAlign: 'center',
                          textAlignVertical: 'center',
                          color: themeColors.textPrimary,
                        }}
                        multiline={false}
                        scrollEnabled={false}
                        value={
                          editingId === participant.userId
                            ? editValue
                            : splitMode === 'percentage' 
                              ? Number(participant.percentage.toFixed(2)).toString()
                              : splitMode === 'amount'
                                ? participant.amount.toFixed(2)
                                : (participant.shares || 1).toString()
                        }
                        onChangeText={(value) => {
                          setEditValue(value);
                        }}
                        onFocus={() => {
                          setEditingId(participant.userId);
                          const val = splitMode === 'percentage'
                            ? Number(participant.percentage.toFixed(2)).toString()
                            : splitMode === 'amount'
                              ? participant.amount.toFixed(2)
                              : (participant.shares || 1).toString();
                          setEditValue(val === '0.00' || val === '0' ? '' : val);
                        }}
                        onBlur={() => {
                          if (splitMode === 'percentage') {
                             handlePercentageChange(participant.userId, editValue);
                          } else if (splitMode === 'amount') {
                             handleAmountChange(participant.userId, editValue);
                          } else {
                             handleQuantityChange(participant.userId, editValue);
                          }
                          setEditingId(null);
                          setEditValue('');
                        }}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={themeColors.textMuted}
                      />
                      <Text fontSize={14} color={themeColors.textMuted}>
                        {splitMode === 'percentage' ? '%' : splitMode === 'amount' ? '$' : 'qty'}
                      </Text>
                    </XStack>

                    {/* Remove button */}
                    <Pressable 
                      onPress={() => handleRemovePerson(participant.userId)}
                      hitSlop={8}
                    >
                      <Minus size={18} color={themeColors.error} />
                    </Pressable>
                  </XStack>
                ))}
              </Card>
            )}
          </YStack>

          {/* Add More People */}
          {nonParticipants.length > 0 && (
            <YStack marginBottom="$4">
              <Text fontSize={14} fontWeight="500" color={themeColors.textSecondary} marginBottom="$2">
                Add People
              </Text>
              <Card variant="surface">
                {nonParticipants.map((member, index) => (
                  <Pressable
                    key={member.id}
                    onPress={() => handleAddPerson(member)}
                  >
                    <XStack 
                      alignItems="center" 
                      gap="$3"
                      paddingVertical="$3"
                      borderTopWidth={index > 0 ? 1 : 0}
                      borderTopColor={themeColors.border}
                    >
                      <Avatar
                        name={member.user.full_name}
                        colorIndex={member.color_index}
                        size="md"
                      />
                      <Text fontSize={16} color={themeColors.textPrimary} flex={1}>
                        {member.user_id === currentUserId ? 'You' : member.user.full_name}
                      </Text>
                      <Plus size={18} color={themeColors.primary} />
                    </XStack>
                  </Pressable>
                ))}
              </Card>
            </YStack>
          )}

        </ScrollView>

        {/* Confirm Button */}
        <Stack paddingVertical="$4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isValid}
            onPress={handleConfirm}
          >
            Confirm Split
          </Button>
        </Stack>
      </Stack>
    </Modal>

    <ConfirmDialog
      visible={showConfirmDialog}
      title="Unsaved Changes"
      message="You have changes that haven't been saved yet."
      buttons={[
        { text: 'Discard Changes', style: 'destructive', onPress: () => { setShowConfirmDialog(false); onClose(); } },
        { text: 'Save', style: 'primary', onPress: () => { setShowConfirmDialog(false); handleConfirm(); } },
      ]}
      onDismiss={() => setShowConfirmDialog(false)}
    />
    </>
  );
}

export default CustomSplitModal;
