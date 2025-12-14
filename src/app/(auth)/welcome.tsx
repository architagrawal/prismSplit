/**
 * PrismSplit Welcome/Onboarding Screen
 * 
 * First-time user experience with swipeable feature cards.
 */

import { useState, useRef } from 'react';
import { Stack, Text, XStack, YStack } from 'tamagui';
import { Dimensions, Animated, FlatList, ViewToken, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Receipt, 
  Users, 
  LayoutGrid, 
  CheckCircle 
} from 'lucide-react-native';

import { Button } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  iconType: 'receipt' | 'users' | 'grid' | 'check';
  colorKey: 'primary' | 'secondary' | 'success';
}

const slidesData: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Split Any Bill',
    description: 'From groceries to group trips, split expenses fairly with item-level precision.',
    iconType: 'receipt',
    colorKey: 'primary',
  },
  {
    id: '2',
    title: 'Invite Your Group',
    description: 'Create groups for roommates, trips, or any shared expense. Invite via link or QR code.',
    iconType: 'users',
    colorKey: 'secondary',
  },
  {
    id: '3',
    title: 'Self-Select Items',
    description: 'Participants choose what they\'re splitting. No more manual assignments.',
    iconType: 'grid',
    colorKey: 'success',
  },
  {
    id: '4',
    title: 'Settle Up Easily',
    description: 'See who owes what at a glance. Mark payments as settled with one tap.',
    iconType: 'check',
    colorKey: 'primary',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Build slides with themed colors
  const slides = slidesData.map(slide => ({
    ...slide,
    color: themeColors[slide.colorKey],
    icon: (() => {
      const iconProps = { size: 64, color: themeColors[slide.colorKey] };
      switch (slide.iconType) {
        case 'receipt': return <Receipt {...iconProps} />;
        case 'users': return <Users {...iconProps} />;
        case 'grid': return <LayoutGrid {...iconProps} />;
        case 'check': return <CheckCircle {...iconProps} />;
      }
    })(),
  }));

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setCurrentIndex(Number(viewableItems[0].index));
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/(auth)/signup' as any);
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/login' as any);
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <Stack width={width} alignItems="center" paddingHorizontal="$6" paddingTop="$12">
      <Stack
        width={160}
        height={160}
        borderRadius={80}
        backgroundColor={`${item.color}15`}
        justifyContent="center"
        alignItems="center"
        marginBottom="$8"
      >
        {item.icon}
      </Stack>
      
      <Text
        fontSize={28}
        fontWeight="700"
        color={themeColors.textPrimary}
        textAlign="center"
        marginBottom="$4"
      >
        {item.title}
      </Text>
      
      <Text
        fontSize={16}
        color={themeColors.textSecondary}
        textAlign="center"
        lineHeight={24}
      >
        {item.description}
      </Text>
    </Stack>
  );

  return (
    <View 
      style={{ 
        flex: 1,
        backgroundColor: themeColors.background,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {/* Skip button */}
      <Stack 
        position="absolute" 
        top={insets.top + 16} 
        right={20} 
        zIndex={10}
      >
        <Button variant="ghost" size="sm" onPress={handleSkip}>
          Skip
        </Button>
      </Stack>

      {/* Slides */}
      <Stack flex={1} justifyContent="center">
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
        />
      </Stack>

      {/* Pagination dots */}
      <XStack justifyContent="center" gap="$2" marginBottom="$6">
        {slides.map((_, index) => (
          <Stack
            key={index}
            width={index === currentIndex ? 24 : 8}
            height={8}
            borderRadius={4}
            backgroundColor={
              index === currentIndex 
                ? themeColors.primary 
                : themeColors.border
            }
          />
        ))}
      </XStack>

      {/* Action buttons */}
      <Stack paddingHorizontal="$6" paddingBottom="$8" gap="$3">
        {currentIndex === slides.length - 1 && (
          <Button 
            variant="ghost" 
            size="md" 
            fullWidth 
            onPress={handleSkip}
          >
            Already have an account? Log in
          </Button>
        )}
        
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onPress={handleNext}
        >
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </Stack>
    </View>
  );
}
