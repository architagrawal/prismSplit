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

import { colors } from '@/theme/tokens';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { Card } from './Card';
import type { User, GroupMember } from '@/types/models';

type SplitMode = 'equal' | 'percentage' | 'amount';

interface SplitParticipant {
  userId: string;
  user: User;
  colorIndex: number;
  percentage: number;
  amount: number;
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
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [participants, setParticipants] = useState<SplitParticipant[]>([]);

  useEffect(() => {
    if (visible) {
      setParticipants(currentParticipants);
      // Auto-detect mode from current data
      if (currentParticipants.length > 0) {
        const firstPercent = currentParticipants[0].percentage;
        const allEqual = currentParticipants.every(
          p => Math.abs(p.percentage - firstPercent) < 0.01
        );
        setSplitMode(allEqual ? 'equal' : 'percentage');
      }
    }
  }, [visible, currentParticipants]);

  const nonParticipants = allMembers.filter(
    m => !participants.some(p => p.userId === m.user_id)
  );

  const recalculateEqualSplit = (parts: SplitParticipant[]) => {
    if (parts.length === 0) return parts;
    const equalPercent = 100 / parts.length;
    const equalAmount = itemPrice / parts.length;
    return parts.map(p => ({
      ...p,
      percentage: equalPercent,
      amount: equalAmount,
    }));
  };

  const handleAddPerson = (member: GroupMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newParticipant: SplitParticipant = {
      userId: member.user_id,
      user: member.user,
      colorIndex: member.color_index,
      percentage: 0,
      amount: 0,
    };
    
    let updated = [...participants, newParticipant];
    if (splitMode === 'equal') {
      updated = recalculateEqualSplit(updated);
    }
    setParticipants(updated);
  };

  const handleRemovePerson = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Find the person being removed
    const removedPerson = participants.find(p => p.userId === userId);
    const remaining = participants.filter(p => p.userId !== userId);
    
    if (!removedPerson || remaining.length === 0) {
      setParticipants(remaining);
      return;
    }
    
    if (splitMode === 'equal') {
      // For equal mode, just recalculate equal split
      setParticipants(recalculateEqualSplit(remaining));
    } else {
      // For percentage/amount modes, redistribute proportionally
      // Calculate total percentage/amount of remaining participants
      const remainingTotal = remaining.reduce((sum, p) => sum + p.percentage, 0);
      
      if (remainingTotal === 0) {
        // If remaining participants have 0%, distribute the removed share equally
        const equalShare = 100 / remaining.length;
        const updated = remaining.map(p => ({
          ...p,
          percentage: equalShare,
          amount: (itemPrice * equalShare) / 100,
        }));
        setParticipants(updated);
      } else {
        // Distribute the removed person's share proportionally among remaining
        const removedPercentage = removedPerson.percentage;
        const updated = remaining.map(p => {
          // Each person gets additional share based on their proportion of remaining total
          const additionalPercentage = (p.percentage / remainingTotal) * removedPercentage;
          const newPercentage = p.percentage + additionalPercentage;
          return {
            ...p,
            percentage: newPercentage,
            amount: (itemPrice * newPercentage) / 100,
          };
        });
        setParticipants(updated);
      }
    }
  };

  // Auto-rebalance: when one person changes their %, redistribute remaining to others proportionally
  const handlePercentageChange = (userId: string, value: string, autoRebalance: boolean = true) => {
    const newPercentage = parseFloat(value) || 0;
    const clampedPercentage = Math.min(100, Math.max(0, newPercentage));
    
    if (autoRebalance) {
      // Get current user's old percentage
      const currentUser = participants.find(p => p.userId === userId);
      const oldPercentage = currentUser?.percentage || 0;
      
      // Calculate the remaining percentage for others
      const othersOldTotal = participants
        .filter(p => p.userId !== userId)
        .reduce((sum, p) => sum + p.percentage, 0);
      
      const remainingForOthers = 100 - clampedPercentage;
      
      if (othersOldTotal > 0 && remainingForOthers >= 0) {
        // Redistribute remaining to others in their original ratios
        const updated = participants.map(p => {
          if (p.userId === userId) {
            return {
              ...p,
              percentage: clampedPercentage,
              amount: (itemPrice * clampedPercentage) / 100,
            };
          } else {
            // Calculate new percentage based on original ratio
            const ratio = p.percentage / othersOldTotal;
            const newPct = remainingForOthers * ratio;
            return {
              ...p,
              percentage: newPct,
              amount: (itemPrice * newPct) / 100,
            };
          }
        });
        setParticipants(updated);
      } else {
        // Fallback: just update the single user
        setParticipants(participants.map(p => 
          p.userId === userId 
            ? { ...p, percentage: clampedPercentage, amount: (itemPrice * clampedPercentage) / 100 } 
            : p
        ));
      }
    } else {
      // Manual mode: just update the single user without rebalancing
      const amount = (itemPrice * clampedPercentage) / 100;
      setParticipants(participants.map(p => 
        p.userId === userId ? { ...p, percentage: clampedPercentage, amount } : p
      ));
    }
  };

  const handleAmountChange = (userId: string, value: string, autoRebalance: boolean = true) => {
    const newAmount = parseFloat(value) || 0;
    const clampedAmount = Math.min(itemPrice, Math.max(0, newAmount));
    const newPercentage = itemPrice > 0 ? (clampedAmount / itemPrice) * 100 : 0;
    
    if (autoRebalance) {
      // Get others' old total
      const othersOldTotal = participants
        .filter(p => p.userId !== userId)
        .reduce((sum, p) => sum + p.amount, 0);
      
      const remainingForOthers = itemPrice - clampedAmount;
      
      if (othersOldTotal > 0 && remainingForOthers >= 0) {
        // Redistribute remaining to others proportionally
        const updated = participants.map(p => {
          if (p.userId === userId) {
            return {
              ...p,
              amount: clampedAmount,
              percentage: newPercentage,
            };
          } else {
            const ratio = p.amount / othersOldTotal;
            const newAmt = remainingForOthers * ratio;
            return {
              ...p,
              amount: newAmt,
              percentage: (newAmt / itemPrice) * 100,
            };
          }
        });
        setParticipants(updated);
      } else {
        setParticipants(participants.map(p => 
          p.userId === userId 
            ? { ...p, amount: clampedAmount, percentage: newPercentage } 
            : p
        ));
      }
    } else {
      setParticipants(participants.map(p => 
        p.userId === userId 
          ? { ...p, amount: clampedAmount, percentage: newPercentage } 
          : p
      ));
    }
  };

  const handleModeChange = (mode: SplitMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSplitMode(mode);
    if (mode === 'equal') {
      setParticipants(recalculateEqualSplit(participants));
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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Stack flex={1} backgroundColor={colors.light.background} paddingHorizontal="$4">
        {/* Header */}
        <XStack 
          justifyContent="space-between" 
          alignItems="center" 
          paddingVertical="$4"
          borderBottomWidth={1}
          borderBottomColor={colors.light.border}
        >
          <Pressable onPress={onClose}>
            <X size={24} color={colors.light.textPrimary} />
          </Pressable>
          <YStack alignItems="center">
            <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
              Custom Split
            </Text>
            <Text fontSize={14} color={colors.light.textSecondary}>
              {itemName}
            </Text>
          </YStack>
          <Stack width={24} />
        </XStack>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Item Price */}
          <Card variant="elevated" marginTop="$4" marginBottom="$4">
            <YStack alignItems="center" gap="$1">
              <Text fontSize={14} color={colors.light.textSecondary}>
                Item Total
              </Text>
              <Text fontSize={28} fontWeight="700" color={colors.light.primary}>
                ${itemPrice.toFixed(2)}
              </Text>
            </YStack>
          </Card>

          {/* Split Mode Selector */}
          <YStack marginBottom="$4">
            <Text fontSize={14} fontWeight="500" color={colors.light.textSecondary} marginBottom="$2">
              Split Type
            </Text>
            <XStack gap="$2">
              {/* Equal */}
              <Pressable style={{ flex: 1 }} onPress={() => handleModeChange('equal')}>
                <Card
                  variant={splitMode === 'equal' ? 'elevated' : 'outlined'}
                  padding="$3"
                  borderWidth={splitMode === 'equal' ? 2 : 1}
                  borderColor={splitMode === 'equal' ? colors.light.primary : colors.light.border}
                >
                  <YStack alignItems="center" gap="$1">
                    <Users size={20} color={splitMode === 'equal' ? colors.light.primary : colors.light.textMuted} />
                    <Text 
                      fontSize={12} 
                      fontWeight="500"
                      color={splitMode === 'equal' ? colors.light.primary : colors.light.textSecondary}
                    >
                      Equal
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
                  borderColor={splitMode === 'percentage' ? colors.light.primary : colors.light.border}
                >
                  <YStack alignItems="center" gap="$1">
                    <Percent size={20} color={splitMode === 'percentage' ? colors.light.primary : colors.light.textMuted} />
                    <Text 
                      fontSize={12} 
                      fontWeight="500"
                      color={splitMode === 'percentage' ? colors.light.primary : colors.light.textSecondary}
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
                  borderColor={splitMode === 'amount' ? colors.light.primary : colors.light.border}
                >
                  <YStack alignItems="center" gap="$1">
                    <DollarSign size={20} color={splitMode === 'amount' ? colors.light.primary : colors.light.textMuted} />
                    <Text 
                      fontSize={12} 
                      fontWeight="500"
                      color={splitMode === 'amount' ? colors.light.primary : colors.light.textSecondary}
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
            <Text fontSize={14} fontWeight="500" color={colors.light.textSecondary} marginBottom="$2">
              Splitting ({participants.length})
            </Text>
            
            {participants.length === 0 ? (
              <Card variant="surface">
                <Text fontSize={14} color={colors.light.textMuted} textAlign="center">
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
                    borderTopColor={colors.light.border}
                  >
                    <Avatar
                      name={participant.user.full_name}
                      colorIndex={participant.colorIndex}
                      size="md"
                    />
                    <YStack flex={1}>
                      <Text fontSize={16} color={colors.light.textPrimary}>
                        {participant.userId === currentUserId ? 'You' : participant.user.full_name}
                      </Text>
                      <Text fontSize={12} color={colors.light.textSecondary}>
                        ${participant.amount.toFixed(2)}
                      </Text>
                    </YStack>

                    {/* Input based on mode */}
                    {splitMode !== 'equal' && (
                      <XStack alignItems="center" gap="$1">
                        <TextInput
                          style={styles.input}
                          value={
                            splitMode === 'percentage' 
                              ? participant.percentage.toFixed(0)
                              : participant.amount.toFixed(2)
                          }
                          onChangeText={(value) => 
                            splitMode === 'percentage'
                              ? handlePercentageChange(participant.userId, value)
                              : handleAmountChange(participant.userId, value)
                          }
                          keyboardType="decimal-pad"
                          placeholder="0"
                        />
                        <Text fontSize={14} color={colors.light.textMuted}>
                          {splitMode === 'percentage' ? '%' : '$'}
                        </Text>
                      </XStack>
                    )}

                    {/* Equal mode: show calculated share */}
                    {splitMode === 'equal' && (
                      <Text fontSize={14} color={colors.light.textSecondary}>
                        {participant.percentage.toFixed(0)}%
                      </Text>
                    )}

                    {/* Remove button */}
                    <Pressable 
                      onPress={() => handleRemovePerson(participant.userId)}
                      hitSlop={8}
                    >
                      <Minus size={18} color={colors.light.error} />
                    </Pressable>
                  </XStack>
                ))}
              </Card>
            )}
          </YStack>

          {/* Add More People */}
          {nonParticipants.length > 0 && (
            <YStack marginBottom="$4">
              <Text fontSize={14} fontWeight="500" color={colors.light.textSecondary} marginBottom="$2">
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
                      borderTopColor={colors.light.border}
                    >
                      <Avatar
                        name={member.user.full_name}
                        colorIndex={member.color_index}
                        size="md"
                      />
                      <Text fontSize={16} color={colors.light.textPrimary} flex={1}>
                        {member.user_id === currentUserId ? 'You' : member.user.full_name}
                      </Text>
                      <Plus size={18} color={colors.light.primary} />
                    </XStack>
                  </Pressable>
                ))}
              </Card>
            </YStack>
          )}

          {/* Summary */}
          {participants.length > 0 && (
            <Card 
              variant="elevated" 
              marginBottom="$4"
              backgroundColor={isValid ? colors.light.successBg : colors.light.warningBg}
              borderWidth={1}
              borderColor={isValid ? colors.light.success : colors.light.warning}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                  <Text fontSize={14} color={colors.light.textSecondary}>
                    Total Allocated
                  </Text>
                  <Text fontSize={16} fontWeight="600" color={colors.light.textPrimary}>
                    ${totalAmount.toFixed(2)} ({totalPercentage.toFixed(0)}%)
                  </Text>
                </YStack>
                <Stack
                  width={32}
                  height={32}
                  borderRadius={16}
                  backgroundColor={isValid ? colors.light.success : colors.light.warning}
                  justifyContent="center"
                  alignItems="center"
                >
                  {isValid ? (
                    <Check size={18} color="white" />
                  ) : (
                    <Text fontSize={14} fontWeight="600" color="white">!</Text>
                  )}
                </Stack>
              </XStack>
            </Card>
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
  );
}

const styles = StyleSheet.create({
  input: {
    width: 60,
    height: 36,
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    textAlign: 'center',
    color: colors.light.textPrimary,
  },
});

export default CustomSplitModal;
