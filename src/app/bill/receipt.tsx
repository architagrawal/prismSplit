/**
 * PrismSplit Bill Receipt Screen
 * 
 * Final split overview in receipt-style format.
 */

import { useEffect } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable } from 'react-native';
import { ArrowLeft, Download, Share2 } from 'lucide-react-native';

import { Screen, Card, Avatar, SplitBar } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBillsStore } from '@/lib/store';
import { colors } from '@/theme/tokens';
import type { BillItemWithSplits } from '@/types/models';

export default function BillReceiptScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { 
    currentBill, 
    billItems, 
    fetchBillById, 
    fetchBillItems 
  } = useBillsStore();

  // Fetch bill data on mount
  useEffect(() => {
    if (id) {
      fetchBillById(id);
      fetchBillItems(id);
    }
  }, [id]);

  const bill = currentBill;
  const items = (billItems[id || ''] || []) as BillItemWithSplits[];

  // Calculate shares per person from real bill items
  const shares: Record<string, { name: string; amount: number; colorIndex: number }> = {};
  
  items.forEach(item => {
    item.splits.forEach(split => {
      if (!shares[split.user_id]) {
        shares[split.user_id] = {
          name: split.user.full_name,
          amount: 0,
          colorIndex: split.color_index,
        };
      }
      shares[split.user_id].amount += split.amount;
    });
  });

  const sortedShares = Object.entries(shares).sort((a, b) => b[1].amount - a[1].amount);

  // Show loading state if bill not loaded yet
  if (!bill) {
    return (
      <Screen padded={false}>
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
          <Text fontSize={18} fontWeight="600" color={themeColors.textPrimary}>
            Receipt
          </Text>
          <Stack width={24} />
        </XStack>
      </Stack>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        {/* Receipt Card */}
        <Stack paddingHorizontal="$4" paddingBottom="$6">
          <Card variant="elevated" padding={0}>
            {/* Receipt Header */}
            <YStack 
              alignItems="center" 
              paddingVertical="$4"
              borderBottomWidth={1}
              borderBottomColor={themeColors.border}
              borderStyle="dashed"
            >
              <Text fontSize={24}>💎</Text>
              <Text fontSize={18} fontWeight="700" color={themeColors.textPrimary}>
                PrismSplit
              </Text>
              <Text fontSize={12} color={themeColors.textMuted}>
                ─ ─ ─ ─ ─ ─ ─ ─ ─
              </Text>
            </YStack>

            {/* Bill Info */}
            <YStack paddingHorizontal="$4" paddingTop="$4">
              <XStack justifyContent="space-between" marginBottom="$2">
                <Text fontSize={14} color={themeColors.textSecondary}>Bill</Text>
                <Text fontSize={14} fontWeight="500" color={themeColors.textPrimary}>
                  {bill.title}
                </Text>
              </XStack>
              <XStack justifyContent="space-between" marginBottom="$2">
                <Text fontSize={14} color={themeColors.textSecondary}>Date</Text>
                <Text fontSize={14} color={themeColors.textPrimary}>
                  {new Date(bill.bill_date).toLocaleDateString()}
                </Text>
              </XStack>
              <XStack justifyContent="space-between" marginBottom="$4">
                <Text fontSize={14} color={themeColors.textSecondary}>Paid by</Text>
                <Text fontSize={14} color={themeColors.textPrimary}>
                  {bill.payer.full_name}
                </Text>
              </XStack>
            </YStack>

            {/* Items */}
            <Stack 
              borderTopWidth={1} 
              borderTopColor={themeColors.border}
              paddingHorizontal="$4"
              paddingVertical="$3"
            >
              <Text fontSize={12} fontWeight="600" color={themeColors.textMuted} marginBottom="$2">
                ITEMS
              </Text>
              
              {items.map((item) => (
                <YStack key={item.id} marginBottom="$3">
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <YStack flex={1} marginRight="$2">
                      <Text fontSize={14} color={themeColors.textPrimary}>
                        {item.name}
                      </Text>
                      <XStack flexWrap="wrap" gap="$1" marginTop="$1">
                        {item.splits.map((split) => (
                          <Stack
                            key={split.id}
                            width={20}
                            height={20}
                            borderRadius={10}
                            backgroundColor={colors.avatar[Object.keys(colors.avatar)[split.color_index] as keyof typeof colors.avatar]}
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Text fontSize={10} color="white" fontWeight="600">
                              {split.user.full_name[0]}
                            </Text>
                          </Stack>
                        ))}
                      </XStack>
                    </YStack>
                    <Text fontSize={14} fontWeight="500" color={themeColors.textPrimary}>
                      ${item.price.toFixed(2)}
                    </Text>
                  </XStack>
                  
                  <Stack marginTop="$2">
                    <SplitBar
                      segments={item.splits.map(s => ({
                        userId: s.user_id,
                        colorIndex: s.color_index,
                        percentage: (s.amount / item.price) * 100,
                      }))}
                      height={3}
                      unclaimed={item.unclaimed > 0 ? (item.unclaimed / item.price) * 100 : 0}
                    />
                  </Stack>
                </YStack>
              ))}
            </Stack>

            {/* Totals */}
            <Stack 
              borderTopWidth={1} 
              borderTopColor={themeColors.border}
              paddingHorizontal="$4"
              paddingVertical="$3"
            >
              <XStack justifyContent="space-between" marginBottom="$1">
                <Text fontSize={14} color={themeColors.textSecondary}>Subtotal</Text>
                <Text fontSize={14} color={themeColors.textPrimary}>
                  ${(bill.total_amount - bill.tax_amount - bill.tip_amount).toFixed(2)}
                </Text>
              </XStack>
              {bill.tax_amount > 0 && (
                <XStack justifyContent="space-between" marginBottom="$1">
                  <Text fontSize={14} color={themeColors.textSecondary}>Tax</Text>
                  <Text fontSize={14} color={themeColors.textPrimary}>
                    ${bill.tax_amount.toFixed(2)}
                  </Text>
                </XStack>
              )}
              {bill.tip_amount > 0 && (
                <XStack justifyContent="space-between" marginBottom="$1">
                  <Text fontSize={14} color={themeColors.textSecondary}>Tip</Text>
                  <Text fontSize={14} color={themeColors.textPrimary}>
                    ${bill.tip_amount.toFixed(2)}
                  </Text>
                </XStack>
              )}
              <Stack height={1} backgroundColor={themeColors.border} marginVertical="$2" />
              <XStack justifyContent="space-between">
                <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
                  Total
                </Text>
                <Text fontSize={16} fontWeight="700" color={themeColors.primary}>
                  ${bill.total_amount.toFixed(2)}
                </Text>
              </XStack>
            </Stack>

            {/* Per-Person Breakdown */}
            <Stack 
              borderTopWidth={1} 
              borderTopColor={themeColors.border}
              borderStyle="dashed"
              paddingHorizontal="$4"
              paddingVertical="$3"
            >
              <Text fontSize={12} fontWeight="600" color={themeColors.textMuted} marginBottom="$3">
                SPLIT BREAKDOWN
              </Text>
              
              {sortedShares.length > 0 ? (
                sortedShares.map(([userId, share]) => (
                  <XStack 
                    key={userId} 
                    justifyContent="space-between" 
                    alignItems="center"
                    marginBottom="$2"
                  >
                    <XStack alignItems="center" gap="$2">
                      <Avatar name={share.name} colorIndex={share.colorIndex} size="sm" />
                      <Text fontSize={14} color={themeColors.textPrimary}>
                        {share.name}
                      </Text>
                    </XStack>
                    <Text fontSize={14} fontWeight="600" color={themeColors.textPrimary}>
                      ${share.amount.toFixed(2)}
                    </Text>
                  </XStack>
                ))
              ) : (
                <Text fontSize={14} color={themeColors.textSecondary} textAlign="center">
                  No splits assigned yet
                </Text>
              )}
            </Stack>

            {/* Footer */}
            <YStack 
              alignItems="center" 
              paddingVertical="$4"
              borderTopWidth={1}
              borderTopColor={themeColors.border}
            >
              <Text fontSize={12} color={themeColors.textMuted}>
                Thank you for using PrismSplit!
              </Text>
              <Text fontSize={10} color={themeColors.textMuted} marginTop="$1">
                ═══════════════════
              </Text>
            </YStack>
          </Card>
        </Stack>

        {/* Action Buttons */}
        <XStack paddingHorizontal="$4" paddingBottom="$8" gap="$3">
          <Pressable style={{ flex: 1 }}>
            <Card variant="outlined" padding="$3">
              <XStack justifyContent="center" alignItems="center" gap="$2">
                <Share2 size={18} color={themeColors.primary} />
                <Text fontSize={14} fontWeight="500" color={themeColors.primary}>
                  Share
                </Text>
              </XStack>
            </Card>
          </Pressable>
          <Pressable style={{ flex: 1 }}>
            <Card variant="outlined" padding="$3">
              <XStack justifyContent="center" alignItems="center" gap="$2">
                <Download size={18} color={themeColors.primary} />
                <Text fontSize={14} fontWeight="500" color={themeColors.primary}>
                  Download
                </Text>
              </XStack>
            </Card>
          </Pressable>
        </XStack>
      </ScrollView>
    </Screen>
  );
}
