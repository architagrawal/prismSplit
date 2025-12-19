import React, { useRef } from 'react';
import { Stack, Text, YStack, XStack, ScrollView } from 'tamagui';
import { Pressable, Animated } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';

import { Card, ItemRow, AddItemModal, CustomSplitModal } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { BillItemWithSplits } from '@/types/models';

interface BillSelectionViewProps {
  items: (BillItemWithSplits & { isCollapsed?: boolean; collapsedIds?: string[] })[];
  selectedItems: Set<string>;
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string | string[]) => void;
  onAddItem: (name: string, price: number) => void;
  onLongPressItem: (item: BillItemWithSplits & { collapsedIds?: string[] }) => void;
  isLoading: boolean;
}

export function BillSelectionView({
  items,
  selectedItems,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onLongPressItem,
  isLoading
}: BillSelectionViewProps) {
  const themeColors = useThemeColors();
  
  // Track swipeable refs
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

  // Animated swipe action
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: BillItemWithSplits & { collapsedIds?: string[] }
  ) => {
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
          onPress={() => onDeleteItem(item.collapsedIds || item.id)}
        >
          <Trash2 size={20} color="white" />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Stack flex={1}>
        <ScrollView
            flex={1}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => closePrevOpenedRow()}
            paddingHorizontal="$4"
            paddingTop="$4"
        >
            <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary} marginBottom="$2">
                Select Your Items
            </Text>
            <Text fontSize={12} color={themeColors.textSecondary} marginBottom="$4">
                Tap to select items you shared. Long press for custom split.
            </Text>

            <YStack paddingBottom={100} gap="$2">
                {(items || []).map((item) => (
                    <Swipeable
                        key={item.id}
                        ref={(ref) => {
                        if (ref) swipeableRows.current.set(item.id, ref);
                        else swipeableRows.current.delete(item.id);
                        }}
                        overshootRight={false}
                        onSwipeableWillOpen={() => closePrevOpenedRow(item.id)}
                        renderRightActions={(progress, dragX) => 
                        renderRightActions(progress, dragX, item)
                        }
                    >
                        <ItemRow 
                            name={item.name}
                            price={item.price}
                            quantity={item.quantity}
                            participants={item.splits.map(s => ({
                                userId: s.user_id,
                                name: s.user.full_name,
                                colorIndex: s.color_index,
                                percentage: s.percentage || 0
                            }))}
                            isSelected={selectedItems.has(item.id)}
                            onPress={() => onToggleItem(item.id)}
                            onExpand={() => onLongPressItem(item)}
                        />
                    </Swipeable>
                ))}

                {/* Add Item Button */}
                <Pressable onPress={() => { /* Triggered via parent modal ref usually, but here we can expose prop or use inner state if modal passed down */ }}> 
                 {/* Parent handles modal visibility, we just need a trigger or UI hint? 
                     Actually, standard lists usually have a Floating Action Button or bottom row.
                     We'll rely on the existing "Add Item Modal" logic being triggered from parent or here.
                     Let's add a row at the bottom for "Add Item".
                  */}
                </Pressable>
            </YStack>
        </ScrollView>
    </Stack>
  );
}
