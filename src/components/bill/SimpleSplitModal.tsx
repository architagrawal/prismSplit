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
  Users,
  CheckCircle2
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useThemeColors } from '@/hooks/useThemeColors';
import { Button, Avatar, Card, ConfirmDialog } from '@/components/ui';
import type { User, GroupMember } from '@/types/models';

export type SimpleSplitType = 'equal' | 'amount' | 'percentage' | 'shares';

export interface SimpleSplitParticipant {
  userId: string;
  user: User;
  colorIndex: number;
  percentage: number;
  amount: number;
  shares?: number;
  isSelected?: boolean; // For equal split (subset)
  locked?: boolean;
}

interface SimpleSplitModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (participants: SimpleSplitParticipant[], mode: SimpleSplitType) => void;
  totalAmount: number;
  currency: string;
  groupMembers: GroupMember[];
  currentUserId: string;
  initialParticipants?: SimpleSplitParticipant[]; // To resume state
  initialMode?: SimpleSplitType;
}

export function SimpleSplitModal({
  visible,
  onClose,
  onConfirm,
  totalAmount,
  currency,
  groupMembers,
  currentUserId,
  initialParticipants,
  initialMode = 'equal'
}: SimpleSplitModalProps) {
  const themeColors = useThemeColors();
  const [splitMode, setSplitMode] = useState<SimpleSplitType>(initialMode);
  const [participants, setParticipants] = useState<SimpleSplitParticipant[]>([]);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  console.log('SimpleSplitModal: Render, visible:', visible);

  // Initialize
  useEffect(() => {
    if (visible) {
      if (initialParticipants && initialParticipants.length > 0) {
        setParticipants(initialParticipants);
        setSplitMode(initialMode);
      } else {
        // Default: All selected for Equal
        const defaults = groupMembers.map(m => ({
          userId: m.user_id,
          user: m.user,
          colorIndex: m.color_index,
          percentage: 0,
          amount: 0,
          shares: 1,
          isSelected: true,
          locked: false
        }));
        setParticipants(recalculateEqualSplit(defaults, totalAmount));
        setSplitMode('equal');
      }
      setHasChanges(false);
    }
  }, [visible, totalAmount]);

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  // --- Logic Helpers ---

  const recalculateEqualSplit = (parts: SimpleSplitParticipant[], total: number) => {
    const selected = parts.filter(p => p.isSelected);
    if (selected.length === 0) return parts.map(p => ({ ...p, amount: 0, percentage: 0 }));
    
    const perPerson = total / selected.length;
    return parts.map(p => {
        if (!p.isSelected) return { ...p, amount: 0, percentage: 0 };
        return {
            ...p,
            amount: perPerson,
            percentage: (1 / selected.length) * 100
        };
    });
  };

  const recalculateSharesSplit = (parts: SimpleSplitParticipant[]) => {
    const totalShares = parts.reduce((sum, p) => sum + (p.shares || 1), 0);
    if (totalShares === 0) return parts;
    
    return parts.map(p => ({
      ...p,
      percentage: ((p.shares || 1) / totalShares) * 100,
      amount: ((p.shares || 1) / totalShares) * totalAmount,
      locked: false,
    }));
  };

  const distributeRemaining = (
    currentList: SimpleSplitParticipant[], 
    lockedUserId: string | null = null
  ) => {
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
          amount: (totalAmount * perPerson) / 100,
        };
      });
    } else if (splitMode === 'amount') {
      const lockedTotal = lockedParticipants.reduce((sum, p) => sum + p.amount, 0);
      const remaining = Math.max(0, totalAmount - lockedTotal);
      const perPerson = remaining / unlockedParticipants.length;
      
      return currentList.map(p => {
        if (p.locked || p.userId === lockedUserId) return p;
        return {
          ...p,
          amount: perPerson,
          percentage: totalAmount > 0 ? (perPerson / totalAmount) * 100 : 0,
        };
      });
    } else {
      return recalculateSharesSplit(currentList);
    }
  };

  // --- Handlers ---

  const handleToggleSelection = (userId: string) => {
      // Only for Equal Mode
      if (splitMode !== 'equal') return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const updated = participants.map(p => 
          p.userId === userId ? { ...p, isSelected: !p.isSelected } : p
      );
      setParticipants(recalculateEqualSplit(updated, totalAmount));
      setHasChanges(true);
  };

  const handleModeChange = (mode: SimpleSplitType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSplitMode(mode);
    setHasChanges(true);
    
    // Reset/Recalculate logic when switching
    if (mode === 'equal') {
        // preserve selection if returning? or reset? let's preserve `isSelected`
        setParticipants(recalculateEqualSplit(participants, totalAmount));
    } else if (mode === 'shares') {
        const updated = participants.map(p => ({ ...p, shares: p.shares || 1 }));
        setParticipants(recalculateSharesSplit(updated));
    } else {
        // Percentage/Amount: Start fresh or convert? 
        // Let's try to convert current amounts to fixed values
        // Actually, safer to reset amounts/percentages to equal initially to avoid validation hell
        const count = participants.length;
        const perPersonPct = 100 / count;
        const perPersonAmt = totalAmount / count;
        
        setParticipants(participants.map(p => ({
            ...p,
            percentage: perPersonPct,
            amount: perPersonAmt,
            locked: false
        })));
    }
  };

  // Input Handlers
  const handleQuantityChange = (userId: string, value: string) => {
    const newShares = parseFloat(value) || 0;
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
        ? { ...p, percentage: clampedPercentage, amount: (totalAmount * clampedPercentage) / 100, locked: true } 
        : p
    );
    
    setParticipants(distributeRemaining(updatedUserList, userId));
    setHasChanges(true);
  };

  const handleAmountChange = (userId: string, value: string) => {
    const newAmount = parseFloat(value) || 0;
    const clampedAmount = Math.min(totalAmount, Math.max(0, newAmount));
    const newPercentage = totalAmount > 0 ? (clampedAmount / totalAmount) * 100 : 0;
    
    const updatedUserList = participants.map(p => 
      p.userId === userId 
        ? { ...p, amount: clampedAmount, percentage: newPercentage, locked: true } 
        : p
    );
    setParticipants(distributeRemaining(updatedUserList, userId));
    setHasChanges(true);
  };

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(participants, splitMode);
    onClose();
  };

  // Validation
  const totalPercentage = participants.reduce((sum, p) => sum + p.percentage, 0);
  const totalAllocated = participants.reduce((sum, p) => sum + p.amount, 0);
  
  let isValid = true;
  if (splitMode === 'equal') {
      isValid = participants.some(p => p.isSelected);
  } else {
      isValid = Math.abs(totalAllocated - totalAmount) < 0.05; // tolerence
  }

  const remainingAmount = totalAmount - totalAllocated;

  return (
    <>
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      hardwareAccelerated={true}
      onRequestClose={handleClose}
    >
      <Stack flex={1} justifyContent="flex-end">
          {/* Backdrop */}
          <Pressable 
            style={StyleSheet.absoluteFill} 
            onPress={handleClose}
          >
             <Stack flex={1} backgroundColor="rgba(0,0,0,0.5)" />
          </Pressable>

          {/* Bottom Sheet Content */}
          <Stack 
            height="85%" 
            backgroundColor={themeColors.background} 
            borderTopLeftRadius={20} 
            borderTopRightRadius={20} 
            paddingHorizontal="$4"
            overflow="hidden"
          >
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
          <YStack alignItems="center" gap="$1">
            <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
              Customize Split
            </Text>
            <Text fontSize={14} color={themeColors.textSecondary}>
                Total: {currency} {totalAmount.toFixed(2)}
            </Text>
          </YStack>
          <Button variant="ghost" size="sm" onPress={() => handleModeChange('equal')}>
            Reset
          </Button>
        </XStack>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={{ flex: 1 }}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
            
          {/* Split Mode Selector */}
          <YStack marginTop="$4" marginBottom="$4">
            <XStack gap="$2" justifyContent="space-between">
               {/* Equal */}
               <Pressable style={{ flex: 1 }} onPress={() => handleModeChange('equal')}>
                <Card
                  variant={splitMode === 'equal' ? 'elevated' : 'outlined'}
                  padding="$3"
                  borderWidth={splitMode === 'equal' ? 2 : 1}
                  borderColor={splitMode === 'equal' ? themeColors.primary : themeColors.border}
                >
                  <YStack alignItems="center" gap="$1">
                    <CheckCircle2 size={20} color={splitMode === 'equal' ? themeColors.primary : themeColors.textMuted} />
                    <Text fontSize={12} fontWeight="500" color={splitMode === 'equal' ? themeColors.primary : themeColors.textSecondary}>
                      Equal
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
                    <Text fontSize={12} fontWeight="500" color={splitMode === 'amount' ? themeColors.primary : themeColors.textSecondary}>
                      Unequal
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
                    <Text fontSize={12} fontWeight="500" color={splitMode === 'percentage' ? themeColors.primary : themeColors.textSecondary}>
                      Percent
                    </Text>
                  </YStack>
                </Card>
              </Pressable>

               {/* Shares */}
               <Pressable style={{ flex: 1 }} onPress={() => handleModeChange('shares')}>
                <Card
                  variant={splitMode === 'shares' ? 'elevated' : 'outlined'}
                  padding="$3"
                  borderWidth={splitMode === 'shares' ? 2 : 1}
                  borderColor={splitMode === 'shares' ? themeColors.primary : themeColors.border}
                >
                  <YStack alignItems="center" gap="$1">
                    <Users size={20} color={splitMode === 'shares' ? themeColors.primary : themeColors.textMuted} />
                    <Text fontSize={12} fontWeight="500" color={splitMode === 'shares' ? themeColors.primary : themeColors.textSecondary}>
                      Shares
                    </Text>
                  </YStack>
                </Card>
              </Pressable>

            </XStack>
          </YStack>

          {/* Validation Status (Only for Unequal/Percentage if invalid) */}
          {splitMode !== 'equal' && !isValid && (
              <Card 
                variant="surface"
                marginBottom="$4"
                backgroundColor={isValid ? themeColors.successBg : themeColors.errorBg}
                borderWidth={1}
                borderColor={isValid ? themeColors.success : themeColors.error}
              >
                  <XStack justifyContent="space-between" alignItems="center">
                      <Text fontSize={14} color={themeColors.textPrimary} fontWeight="500">
                          {isValid ? 'Perfectly split!' : 'Amounts do not match total'}
                      </Text>
                      {!isValid && (
                         <Text fontSize={14} color={themeColors.error} fontWeight="700">
                             {remainingAmount > 0 ? `Left: $${remainingAmount.toFixed(2)}` : `Over: $${Math.abs(remainingAmount).toFixed(2)}`}
                         </Text>
                      )}
                  </XStack>
              </Card>
          )}

          {/* Participants List */}
          <Card variant="surface" marginBottom="$6">
            {participants.map((participant, index) => (
              <Pressable
                key={participant.userId}
                onPress={() => handleToggleSelection(participant.userId)}
                disabled={splitMode !== 'equal'}
              >
                <XStack 
                  alignItems="center" 
                  gap="$3"
                  paddingVertical="$3"
                  borderTopWidth={index > 0 ? 1 : 0}
                  borderTopColor={themeColors.border}
                >
                  {/* Selection Checkbox for Equal Mode */}
                  {splitMode === 'equal' && (
                      <Stack 
                        width={24} 
                        height={24} 
                        borderRadius={12} 
                        borderWidth={2} 
                        borderColor={participant.isSelected ? themeColors.primary : themeColors.textMuted}
                        alignItems="center" 
                        justifyContent="center"
                        backgroundColor={participant.isSelected ? themeColors.primary : 'transparent'}
                      >
                         {participant.isSelected && <Check size={14} color="white" />}
                      </Stack>
                  )}

                  <Avatar
                    name={participant.user.full_name}
                    colorIndex={participant.colorIndex}
                    size="md"
                  />
                  <YStack flex={1}>
                    <Text fontSize={16} color={themeColors.textPrimary}>
                      {participant.userId === currentUserId ? 'You' : participant.user.full_name}
                    </Text>
                    <Text fontSize={12} color={themeColors.textSecondary}>
                       {splitMode === 'shares' 
                         ? `${participant.shares ?? 1} share${(participant.shares ?? 1) !== 1 ? 's' : ''}` 
                         : splitMode === 'percentage' 
                           ? `${participant.percentage.toFixed(1)}%`
                           : ''
                       }
                    </Text>
                  </YStack>

                  {/* Input or Amount Display */}
                  <XStack alignItems="center" gap="$2">
                      {splitMode === 'equal' ? (
                          <Text fontSize={16} fontWeight={participant.isSelected ? "600" : "400"} color={participant.isSelected ? themeColors.textPrimary : themeColors.textMuted}>
                              {participant.isSelected ? `${currency}${participant.amount.toFixed(2)}` : '$0.00'}
                          </Text>
                      ) : (
                          // Inputs for others
                           <XStack alignItems="center" gap="$1">
                              <TextInput
                                style={{
                                  width: 70,
                                  height: 40,
                                  backgroundColor: themeColors.surfaceElevated,
                                  borderRadius: 8,
                                  paddingHorizontal: 8,
                                  textAlign: 'center',
                                  color: themeColors.textPrimary,
                                  fontWeight: '600'
                                }}
                                value={
                                    editingId === participant.userId
                                        ? editValue
                                        : splitMode === 'percentage'
                                            ? Number(participant.percentage.toFixed(2)).toString()
                                            : splitMode === 'amount'
                                                ? participant.amount.toFixed(2)
                                                : (participant.shares || 1).toString()
                                }
                                onChangeText={setEditValue}
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
                                    if (splitMode === 'percentage') handlePercentageChange(participant.userId, editValue);
                                    else if (splitMode === 'amount') handleAmountChange(participant.userId, editValue);
                                    else handleQuantityChange(participant.userId, editValue);
                                    setEditingId(null);
                                    setEditValue('');
                                }}
                                keyboardType="decimal-pad"
                              />
                              <Text fontSize={12} color={themeColors.textSecondary}>
                                  {splitMode === 'percentage' ? '%' : splitMode === 'amount' ? currency : ''}
                              </Text>
                           </XStack>
                      )}
                  </XStack>
                </XStack>
              </Pressable>
            ))}
          </Card>

        </ScrollView>

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
      </Stack>
    </Modal>

    <ConfirmDialog
      visible={showConfirmDialog}
      title="Unsaved Changes"
      message="You have changes that haven't been saved yet."
      buttons={[
        { text: 'Discard', style: 'destructive', onPress: () => { setShowConfirmDialog(false); onClose(); } },
        { text: 'Save', style: 'primary', onPress: () => { setShowConfirmDialog(false); handleConfirm(); } },
      ]}
      onDismiss={() => setShowConfirmDialog(false)}
    />
    </>
  );
}
