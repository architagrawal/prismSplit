/**
 * PrismSplit Group Image Component
 * 
 * Generates a consistent photo collage pattern for groups based on group ID.
 * Used instead of emojis for a cleaner, more modern look.
 */

import { View } from 'react-native';

// Color palettes for group collages
const groupPatterns = [
  ['#FFB4A2', '#E5989B', '#B5838D', '#6D6875'],
  ['#A2D2FF', '#BDE0FE', '#FFAFCC', '#FFC8DD'],
  ['#CCD5AE', '#E9EDC9', '#FEFAE0', '#FAEDCD'],
  ['#FFE5D9', '#FFD7BA', '#FEC89A', '#F9DCC4'],
  ['#D8E2DC', '#FFE5D9', '#FFCAD4', '#F4ACB7'],
  ['#E2E2DF', '#D2D2CF', '#E2CFC4', '#F7D9C4'],
  ['#B8E0D2', '#D6EADF', '#EAF2E3', '#F7E7CE'],
  ['#DDBDFF', '#E7C6FF', '#F3D5FF', '#FFE5F1'],
];

// Get a consistent pattern index from group ID
function getPatternIndex(groupId: string): number {
  let hash = 0;
  for (let i = 0; i < groupId.length; i++) {
    hash = ((hash << 5) - hash) + groupId.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % groupPatterns.length;
}

interface GroupImageProps {
  groupId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 40,
  md: 56,
  lg: 72,
  xl: 100,
};

export function GroupImage({ groupId, size = 'md' }: GroupImageProps) {
  const dimension = sizes[size];
  const cellSize = dimension / 2;
  const colors = groupPatterns[getPatternIndex(groupId)];
  const borderRadius = size === 'sm' ? 8 : size === 'md' ? 12 : 16;

  return (
    <View style={{ 
      width: dimension, 
      height: dimension, 
      borderRadius, 
      overflow: 'hidden',
      flexDirection: 'row',
      flexWrap: 'wrap',
    }}>
      {colors.map((color, i) => (
        <View 
          key={i}
          style={{ 
            width: cellSize, 
            height: cellSize, 
            backgroundColor: color,
          }} 
        />
      ))}
    </View>
  );
}
