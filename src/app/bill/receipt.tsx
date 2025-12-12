/**
 * PrismSplit Bill Receipt Screen
 * 
 * Final split overview in receipt-style format.
 */

import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable } from 'react-native';
import { ArrowLeft, Download, Share2 } from 'lucide-react-native';

import { Screen, Card, Avatar, SplitBar } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { demoBills, demoBillItems, demoUsers } from '@/lib/api/demo';

export default function BillReceiptScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Get bill data
  const bill = demoBills.find(b => b.id === id) || demoBills[0];

  // Calculate shares per person
  const shares: Record<string, { name: string; amount: number; colorIndex: number }> = {};
  
  demoBillItems.forEach(item => {
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

  return (
    <Screen padded={false}>
      {/* Header */}
      <Stack paddingHorizontal="$4" paddingVertical="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.light.textPrimary} />
          </Pressable>
          <Text fontSize={18} fontWeight="600" color={colors.light.textPrimary}>
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
              borderBottomColor={colors.light.border}
              borderStyle="dashed"
            >
              <Text fontSize={24}>💎</Text>
              <Text fontSize={18} fontWeight="700" color={colors.light.textPrimary}>
                PrismSplit
              </Text>
              <Text fontSize={12} color={colors.light.textMuted}>
                ─ ─ ─ ─ ─ ─ ─ ─ ─
              </Text>
            </YStack>

            {/* Bill Info */}
            <YStack paddingHorizontal="$4" paddingTop="$4">
              <XStack justifyContent="space-between" marginBottom="$2">
                <Text fontSize={14} color={colors.light.textSecondary}>Bill</Text>
                <Text fontSize={14} fontWeight="500" color={colors.light.textPrimary}>
                  {bill.title}
                </Text>
              </XStack>
              <XStack justifyContent="space-between" marginBottom="$2">
                <Text fontSize={14} color={colors.light.textSecondary}>Date</Text>
                <Text fontSize={14} color={colors.light.textPrimary}>
                  {new Date(bill.bill_date).toLocaleDateString()}
                </Text>
              </XStack>
              <XStack justifyContent="space-between" marginBottom="$4">
                <Text fontSize={14} color={colors.light.textSecondary}>Paid by</Text>
                <Text fontSize={14} color={colors.light.textPrimary}>
                  {bill.payer.full_name}
                </Text>
              </XStack>
            </YStack>

            {/* Items */}
            <Stack 
              borderTopWidth={1} 
              borderTopColor={colors.light.border}
              paddingHorizontal="$4"
              paddingVertical="$3"
            >
              <Text fontSize={12} fontWeight="600" color={colors.light.textMuted} marginBottom="$2">
                ITEMS
              </Text>
              
              {demoBillItems.map((item) => (
                <YStack key={item.id} marginBottom="$3">
                  <XStack justifyContent="space-between" alignItems="flex-start">
                    <YStack flex={1} marginRight="$2">
                      <Text fontSize={14} color={colors.light.textPrimary}>
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
                    <Text fontSize={14} fontWeight="500" color={colors.light.textPrimary}>
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
              borderTopColor={colors.light.border}
              paddingHorizontal="$4"
              paddingVertical="$3"
            >
              <XStack justifyContent="space-between" marginBottom="$1">
                <Text fontSize={14} color={colors.light.textSecondary}>Subtotal</Text>
                <Text fontSize={14} color={colors.light.textPrimary}>
                  ${(bill.total_amount - bill.tax_amount - bill.tip_amount).toFixed(2)}
                </Text>
              </XStack>
              {bill.tax_amount > 0 && (
                <XStack justifyContent="space-between" marginBottom="$1">
                  <Text fontSize={14} color={colors.light.textSecondary}>Tax</Text>
                  <Text fontSize={14} color={colors.light.textPrimary}>
                    ${bill.tax_amount.toFixed(2)}
                  </Text>
                </XStack>
              )}
              {bill.tip_amount > 0 && (
                <XStack justifyContent="space-between" marginBottom="$1">
                  <Text fontSize={14} color={colors.light.textSecondary}>Tip</Text>
                  <Text fontSize={14} color={colors.light.textPrimary}>
                    ${bill.tip_amount.toFixed(2)}
                  </Text>
                </XStack>
              )}
              <Stack height={1} backgroundColor={colors.light.border} marginVertical="$2" />
              <XStack justifyContent="space-between">
                <Text fontSize={16} fontWeight="600" color={colors.light.textPrimary}>
                  Total
                </Text>
                <Text fontSize={16} fontWeight="700" color={colors.light.primary}>
                  ${bill.total_amount.toFixed(2)}
                </Text>
              </XStack>
            </Stack>

            {/* Per-Person Breakdown */}
            <Stack 
              borderTopWidth={1} 
              borderTopColor={colors.light.border}
              borderStyle="dashed"
              paddingHorizontal="$4"
              paddingVertical="$3"
            >
              <Text fontSize={12} fontWeight="600" color={colors.light.textMuted} marginBottom="$3">
                SPLIT BREAKDOWN
              </Text>
              
              {sortedShares.map(([userId, share]) => (
                <XStack 
                  key={userId} 
                  justifyContent="space-between" 
                  alignItems="center"
                  marginBottom="$2"
                >
                  <XStack alignItems="center" gap="$2">
                    <Avatar name={share.name} colorIndex={share.colorIndex} size="sm" />
                    <Text fontSize={14} color={colors.light.textPrimary}>
                      {share.name}
                    </Text>
                  </XStack>
                  <Text fontSize={14} fontWeight="600" color={colors.light.textPrimary}>
                    ${share.amount.toFixed(2)}
                  </Text>
                </XStack>
              ))}
            </Stack>

            {/* Footer */}
            <YStack 
              alignItems="center" 
              paddingVertical="$4"
              borderTopWidth={1}
              borderTopColor={colors.light.border}
            >
              <Text fontSize={12} color={colors.light.textMuted}>
                Thank you for using PrismSplit!
              </Text>
              <Text fontSize={10} color={colors.light.textMuted} marginTop="$1">
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
                <Share2 size={18} color={colors.light.primary} />
                <Text fontSize={14} fontWeight="500" color={colors.light.primary}>
                  Share
                </Text>
              </XStack>
            </Card>
          </Pressable>
          <Pressable style={{ flex: 1 }}>
            <Card variant="outlined" padding="$3">
              <XStack justifyContent="center" alignItems="center" gap="$2">
                <Download size={18} color={colors.light.primary} />
                <Text fontSize={14} fontWeight="500" color={colors.light.primary}>
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
