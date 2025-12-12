/**
 * PrismSplit Welcome/Onboarding Screen
 * 
 * First-time user experience with swipeable feature cards.
 */

import { useState, useRef } from 'react';
import { Stack, Text, XStack, YStack } from 'tamagui';
import { Dimensions, Animated, FlatList, ViewToken, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Receipt, 
  Users, 
  LayoutGrid, 
  CheckCircle 
} from 'lucide-react-native';

import { Button } from '@/components/ui';
import { colors } from '@/theme/tokens';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Split Any Bill',
    description: 'From groceries to group trips, split expenses fairly with item-level precision.',
    icon: <Receipt size={64} color={colors.light.primary} />,
    color: colors.light.primary,
  },
  {
    id: '2',
    title: 'Invite Your Group',
    description: 'Create groups for roommates, trips, or any shared expense. Invite via link or QR code.',
    icon: <Users size={64} color={colors.light.secondary} />,
    color: colors.light.secondary,
  },
  {
    id: '3',
    title: 'Self-Select Items',
    description: 'Participants choose what they\'re splitting. No more manual assignments.',
    icon: <LayoutGrid size={64} color={colors.light.success} />,
    color: colors.light.success,
  },
  {
    id: '4',
    title: 'Settle Up Easily',
    description: 'See who owes what at a glance. Mark payments as settled with one tap.',
    icon: <CheckCircle size={64} color={colors.light.primary} />,
    color: colors.light.primary,
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

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

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
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
        color={colors.light.textPrimary}
        textAlign="center"
        marginBottom="$4"
      >
        {item.title}
      </Text>
      
      <Text
        fontSize={16}
        color={colors.light.textSecondary}
        textAlign="center"
        lineHeight={24}
      >
        {item.description}
      </Text>
    </Stack>
  );

  return (
    <Stack flex={1} backgroundColor={colors.light.background}>
      {/* Skip button */}
      <Stack 
        position="absolute" 
        top={60} 
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
                ? colors.light.primary 
                : colors.light.border
            }
          />
        ))}
      </XStack>

      {/* Action buttons */}
      <Stack paddingHorizontal="$6" paddingBottom="$8" gap="$3">
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onPress={handleNext}
        >
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
        
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
      </Stack>
    </Stack>
  );
}
