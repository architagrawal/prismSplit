/**
 * PrismSplit Avatar Component
 * 
 * User avatar with color_index support for consistent colors per user.
 */

import { Stack, Text } from 'tamagui';
import { Image } from 'expo-image';

import { getAvatarColor, avatarColors } from '@/theme/tokens';
import { useThemeColors } from '@/hooks/useThemeColors';

interface AvatarProps {
  /** User's full name - used for initials */
  name: string;
  /** Optional image URL */
  imageUrl?: string | null;
  /** Color index (0-5) for consistent color per user in a group */
  colorIndex?: number;
  /** Size of the avatar */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show border (useful when overlapping) */
  bordered?: boolean;
}

const sizes = {
  sm: { container: 24, fontSize: 10, borderWidth: 1 },
  md: { container: 36, fontSize: 14, borderWidth: 2 },
  lg: { container: 48, fontSize: 18, borderWidth: 2 },
  xl: { container: 80, fontSize: 28, borderWidth: 3 },
};

export function Avatar({
  name,
  imageUrl,
  colorIndex = 0,
  size = 'md',
  bordered = false,
}: AvatarProps) {
  const sizeStyle = sizes[size];
  const backgroundColor = getAvatarColor(colorIndex);
  const themeColors = useThemeColors();
  
  // Get initials from name (first letter of first and last name)
  const initials = name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Stack
      width={sizeStyle.container}
      height={sizeStyle.container}
      borderRadius={sizeStyle.container / 2}
      backgroundColor={backgroundColor}
      justifyContent="center"
      alignItems="center"
      borderWidth={bordered ? sizeStyle.borderWidth : 0}
      borderColor={themeColors.background}
      overflow="hidden"
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: sizeStyle.container,
            height: sizeStyle.container,
          }}
          contentFit="cover"
        />
      ) : (
        <Text
          color="white"
          fontSize={sizeStyle.fontSize}
          fontWeight="600"
        >
          {initials}
        </Text>
      )}
    </Stack>
  );
}

/**
 * Stacked avatars for showing multiple participants
 * Shows max 3 avatars + overflow count
 */
interface AvatarGroupProps {
  users: Array<{
    name: string;
    imageUrl?: string | null;
    colorIndex: number;
  }>;
  max?: number;
  size?: 'sm' | 'md';
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: AvatarGroupProps) {
  const themeColors = useThemeColors();
  const displayed = users.slice(0, max);
  const overflow = users.length - max;
  const sizeStyle = sizes[size];
  const overlap = size === 'sm' ? -8 : -12;

  return (
    <Stack flexDirection="row" alignItems="center">
      {displayed.map((user, index) => (
        <Stack
          key={index}
          marginLeft={index === 0 ? 0 : overlap}
          zIndex={displayed.length - index}
        >
          <Avatar
            name={user.name}
            imageUrl={user.imageUrl}
            colorIndex={user.colorIndex}
            size={size}
            bordered
          />
        </Stack>
      ))}
      {overflow > 0 && (
        <Stack
          marginLeft={overlap}
          width={sizeStyle.container}
          height={sizeStyle.container}
          borderRadius={sizeStyle.container / 2}
          backgroundColor={themeColors.border}
          justifyContent="center"
          alignItems="center"
          borderWidth={size === 'sm' ? 1 : 2}
          borderColor={themeColors.background}
        >
          <Text
            color={themeColors.textSecondary}
            fontSize={sizeStyle.fontSize - 2}
            fontWeight="600"
          >
            +{overflow}
          </Text>
        </Stack>
      )}
    </Stack>
  );
}
