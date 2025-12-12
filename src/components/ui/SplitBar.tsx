/**
 * PrismSplit SplitBar Component
 * 
 * Visual representation of how an item is split between users.
 * Shows proportional colored segments.
 */

import { Stack } from 'tamagui';
import { View, StyleSheet } from 'react-native';

import { getAvatarColor } from '@/theme/tokens';

interface SplitSegment {
  userId: string;
  colorIndex: number;
  percentage: number; // 0-100
}

interface SplitBarProps {
  segments: SplitSegment[];
  height?: number;
  unclaimed?: number; // Percentage unclaimed (0-100)
}

export function SplitBar({ 
  segments, 
  height = 4,
  unclaimed = 0,
}: SplitBarProps) {
  const totalClaimed = segments.reduce((sum, s) => sum + s.percentage, 0);
  const unclaimedPercent = unclaimed > 0 ? unclaimed : Math.max(0, 100 - totalClaimed);

  return (
    <Stack
      flexDirection="row"
      height={height}
      borderRadius={height / 2}
      overflow="hidden"
      backgroundColor="#E5E5E5"
    >
      {segments.map((segment, index) => (
        <View
          key={segment.userId}
          style={[
            styles.segment,
            {
              width: `${segment.percentage}%`,
              backgroundColor: getAvatarColor(segment.colorIndex),
            },
          ]}
        />
      ))}
      {unclaimedPercent > 0 && (
        <View
          style={[
            styles.segment,
            styles.unclaimed,
            { width: `${unclaimedPercent}%` },
          ]}
        />
      )}
    </Stack>
  );
}

/**
 * Animated split bar that updates smoothly
 */
interface AnimatedSplitBarProps extends SplitBarProps {
  animated?: boolean;
}

export function AnimatedSplitBar({
  segments,
  height = 4,
  unclaimed = 0,
  animated = true,
}: AnimatedSplitBarProps) {
  // For now, use the static version
  // Animation can be added with Reanimated later
  return (
    <SplitBar 
      segments={segments} 
      height={height} 
      unclaimed={unclaimed} 
    />
  );
}

const styles = StyleSheet.create({
  segment: {
    height: '100%',
  },
  unclaimed: {
    backgroundColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
});
