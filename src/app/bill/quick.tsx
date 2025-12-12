/**
 * PrismSplit Quick Bill Screen
 * 
 * Simple bill creation without itemization.
 * For quick expenses like taxi, coffee, dinner.
 */

import { useState, useEffect } from 'react';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, TextInput } from 'react-native';
import { X, ChevronDown, Check, Users, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Button, Input, Card, Avatar } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { useBillsStore, useGroupsStore, useUIStore } from '@/lib/store';
import { categoryIcons, type Category } from '@/types/models';
import { demoGroupMembers } from '@/lib/api/demo';

type SplitType = 'equal' | 'select' | 'just_me';

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

export default function QuickBillScreen() {
  const router = useRouter();
  const { createBill, isLoading } = useBillsStore();
  const { groups, fetchGroups } = useGroupsStore();
  const { showToast } = useUIStore();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category>('dining');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const selectedGroup = groups[selectedGroupIndex];
  const members = selectedGroup ? (demoGroupMembers[selectedGroup.id] || []) : [];

  const toggleMember = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleCreate = async () => {
    if (!description.trim()) {
      showToast({ type: 'error', message: 'Please enter a description' });
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      showToast({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }
    if (splitType === 'select' && selectedMembers.size === 0) {
      showToast({ type: 'error', message: 'Please select at least one person' });
      return;
    }

    try {
      await createBill({
        title: description,
        groupId: selectedGroup?.id || '',
        category: selectedCategory,
        items: [{ 
          id: '1', 
          name: description, 
          price: parseFloat(amount), 
          quantity: 1 
        }],
        tax: 0,
        tip: 0,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast({ type: 'success', message: 'Quick bill created!' });
      router.back();
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to create bill' });
    }
  };

  const getSplitSummary = () => {
    const total = parseFloat(amount) || 0;
    if (splitType === 'just_me') {
      return 'You\'ll pay the full amount';
    }
    if (splitType === 'equal') {
      const count = members.length || 1;
      return `Split equally: $${(total / count).toFixed(2)} each`;
    }
    if (splitType === 'select' && selectedMembers.size > 0) {
      return `Split among ${selectedMembers.size}: $${(total / selectedMembers.size).toFixed(2)} each`;
    }
    return 'Select split type';
  };

  return (
    <Screen keyboardAvoiding>
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
        <Pressable onPress={() => router.back()}>
          <X size={24} color={colors.light.textPrimary} />
        </Pressable>
        <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
          Quick Bill
        </Text>
        <Stack width={24} />
      </XStack>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Description */}
        <YStack marginBottom="$5">
          <Input
            label="What for?"
            placeholder="e.g., Uber to airport, Coffee"
            value={description}
            onChangeText={setDescription}
            autoFocus
          />
        </YStack>

        {/* Amount */}
        <YStack marginBottom="$5">
          <Text fontSize={14} fontWeight="500" color={colors.light.textSecondary} marginBottom="$2">
            Amount
          </Text>
          <Stack
            backgroundColor={colors.light.surface}
            borderWidth={1}
            borderColor={colors.light.border}
            borderRadius={12}
            paddingHorizontal="$4"
            paddingVertical="$3"
          >
            <XStack alignItems="center">
              <Text fontSize={32} fontWeight="700" color={colors.light.textPrimary}>$</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                style={{
                  fontSize: 32,
                  fontWeight: '700',
                  color: colors.light.textPrimary,
                  flex: 1,
                  marginLeft: 4,
                }}
                placeholderTextColor={colors.light.textMuted}
              />
            </XStack>
          </Stack>
        </YStack>

        {/* Group Selector */}
        <YStack marginBottom="$5">
          <Text fontSize={14} fontWeight="500" color={colors.light.textSecondary} marginBottom="$2">
            Group
          </Text>
          <Pressable onPress={() => setShowGroupPicker(!showGroupPicker)}>
            <Card variant="surface">
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" gap="$2">
                  <Text fontSize={20}>{selectedGroup?.emoji || '👥'}</Text>
                  <Text fontSize={16} color={colors.light.textPrimary}>
                    {selectedGroup?.name || 'Select Group'}
                  </Text>
                </XStack>
                <ChevronDown size={20} color={colors.light.textMuted} />
              </XStack>
            </Card>
          </Pressable>
          
          {showGroupPicker && (
            <Card variant="surface" marginTop="$2">
              {groups.map((group, index) => (
                <Pressable
                  key={group.id}
                  onPress={() => {
                    setSelectedGroupIndex(index);
                    setShowGroupPicker(false);
                    setSelectedMembers(new Set());
                  }}
                >
                  <XStack 
                    alignItems="center" 
                    gap="$3" 
                    paddingVertical="$2"
                    borderTopWidth={index > 0 ? 1 : 0}
                    borderTopColor={colors.light.border}
                  >
                    <Text fontSize={20}>{group.emoji}</Text>
                    <Text fontSize={16} color={colors.light.textPrimary} flex={1}>
                      {group.name}
                    </Text>
                    {index === selectedGroupIndex && (
                      <Check size={18} color={colors.light.primary} />
                    )}
                  </XStack>
                </Pressable>
              ))}
            </Card>
          )}
        </YStack>

        {/* Category */}
        <YStack marginBottom="$5">
          <Text fontSize={14} fontWeight="500" color={colors.light.textSecondary} marginBottom="$2">
            Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                    borderRadius={20}
                    backgroundColor={selectedCategory === cat.key 
                      ? `${colors.light.primary}20` 
                      : colors.light.surfaceElevated
                    }
                    borderWidth={selectedCategory === cat.key ? 2 : 0}
                    borderColor={colors.light.primary}
                  >
                    <XStack alignItems="center" gap="$1">
                      <Text fontSize={16}>{cat.icon}</Text>
                      <Text 
                        fontSize={14} 
                        color={selectedCategory === cat.key 
                          ? colors.light.primary 
                          : colors.light.textSecondary
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

        {/* Split Type */}
        <YStack marginBottom="$5">
          <Text fontSize={14} fontWeight="500" color={colors.light.textSecondary} marginBottom="$2">
            How to split?
          </Text>
          <XStack gap="$2">
            {/* Equal */}
            <Pressable 
              style={{ flex: 1 }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSplitType('equal');
                setShowMemberPicker(false);
              }}
            >
              <Card
                variant={splitType === 'equal' ? 'elevated' : 'outlined'}
                padding="$3"
                borderWidth={splitType === 'equal' ? 2 : 1}
                borderColor={splitType === 'equal' ? colors.light.primary : colors.light.border}
              >
                <YStack alignItems="center" gap="$1">
                  <Users size={24} color={splitType === 'equal' ? colors.light.primary : colors.light.textMuted} />
                  <Text 
                    fontSize={14} 
                    fontWeight="500"
                    color={splitType === 'equal' ? colors.light.primary : colors.light.textSecondary}
                  >
                    Equal
                  </Text>
                </YStack>
              </Card>
            </Pressable>

            {/* Select People */}
            <Pressable 
              style={{ flex: 1 }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSplitType('select');
                setShowMemberPicker(true);
              }}
            >
              <Card
                variant={splitType === 'select' ? 'elevated' : 'outlined'}
                padding="$3"
                borderWidth={splitType === 'select' ? 2 : 1}
                borderColor={splitType === 'select' ? colors.light.primary : colors.light.border}
              >
                <YStack alignItems="center" gap="$1">
                  <Stack position="relative">
                    <Users size={24} color={splitType === 'select' ? colors.light.primary : colors.light.textMuted} />
                    {selectedMembers.size > 0 && (
                      <Stack
                        position="absolute"
                        top={-4}
                        right={-8}
                        backgroundColor={colors.light.primary}
                        borderRadius={10}
                        width={18}
                        height={18}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Text fontSize={11} fontWeight="600" color="white">
                          {selectedMembers.size}
                        </Text>
                      </Stack>
                    )}
                  </Stack>
                  <Text 
                    fontSize={14} 
                    fontWeight="500"
                    color={splitType === 'select' ? colors.light.primary : colors.light.textSecondary}
                  >
                    Select
                  </Text>
                </YStack>
              </Card>
            </Pressable>

            {/* Just Me */}
            <Pressable 
              style={{ flex: 1 }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSplitType('just_me');
                setShowMemberPicker(false);
              }}
            >
              <Card
                variant={splitType === 'just_me' ? 'elevated' : 'outlined'}
                padding="$3"
                borderWidth={splitType === 'just_me' ? 2 : 1}
                borderColor={splitType === 'just_me' ? colors.light.primary : colors.light.border}
              >
                <YStack alignItems="center" gap="$1">
                  <User size={24} color={splitType === 'just_me' ? colors.light.primary : colors.light.textMuted} />
                  <Text 
                    fontSize={14} 
                    fontWeight="500"
                    color={splitType === 'just_me' ? colors.light.primary : colors.light.textSecondary}
                  >
                    Just Me
                  </Text>
                </YStack>
              </Card>
            </Pressable>
          </XStack>
        </YStack>

        {/* Member Picker (for Select type) */}
        {splitType === 'select' && showMemberPicker && (
          <YStack marginBottom="$5">
            <Text fontSize={14} fontWeight="500" color={colors.light.textSecondary} marginBottom="$2">
              Select people
            </Text>
            <Card variant="surface">
              {members.map((member, index) => (
                <Pressable
                  key={member.id}
                  onPress={() => toggleMember(member.user_id)}
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
                      {member.user.full_name}
                    </Text>
                    <Stack
                      width={24}
                      height={24}
                      borderRadius={12}
                      backgroundColor={selectedMembers.has(member.user_id) 
                        ? colors.light.primary 
                        : colors.light.border
                      }
                      justifyContent="center"
                      alignItems="center"
                    >
                      {selectedMembers.has(member.user_id) && (
                        <Check size={14} color="white" />
                      )}
                    </Stack>
                  </XStack>
                </Pressable>
              ))}
            </Card>
          </YStack>
        )}

        {/* Split Summary */}
        {amount && parseFloat(amount) > 0 && (
          <Card variant="elevated" marginBottom="$5">
            <YStack alignItems="center" gap="$1">
              <Text fontSize={14} color={colors.light.textSecondary}>
                {getSplitSummary()}
              </Text>
              <Text fontSize={24} fontWeight="700" color={colors.light.primary}>
                ${parseFloat(amount).toFixed(2)}
              </Text>
            </YStack>
          </Card>
        )}
      </ScrollView>

      {/* Create Button */}
      <Stack paddingTop="$4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={!description.trim() || !amount || parseFloat(amount) <= 0}
          onPress={handleCreate}
        >
          Create Quick Bill
        </Button>
      </Stack>
    </Screen>
  );
}
