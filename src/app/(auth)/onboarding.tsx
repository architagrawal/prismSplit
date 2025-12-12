/**
 * PrismSplit Onboarding Screen
 * 
 * Swipeable welcome cards explaining key features.
 */

import { useState, useRef } from 'react';
import { 
  Dimensions, 
  FlatList, 
  Animated, 
  Pressable, 
  StyleSheet,
  ViewToken
} from 'react-native';
import { Stack, Text, YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { 
  Receipt, 
  Users, 
  Sparkles, 
  PieChart,
  ArrowRight
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Screen, Button } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { useAuthStore } from '@/lib/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: <Receipt size={80} color={colors.light.primary} />,
    title: 'Split Bills Easily',
    description: 'Add items, select what you\'re paying for, and let PrismSplit calculate everyone\'s share automatically.',
    color: colors.light.accent,
  },
  {
    id: '2',
    icon: <Users size={80} color={colors.light.secondary} />,
    title: 'Create Groups',
    description: 'Organize expenses with roommates, trip buddies, or dinner friends. Share via link or QR code.',
    color: colors.light.secondaryLight,
  },
  {
    id: '3',
    icon: <Sparkles size={80} color={colors.light.tertiary} />,
    title: 'Self-Select Items',
    description: 'Tap items you\'re splitting. See who else joined each item with colorful avatars.',
    color: colors.light.tertiaryLight,
  },
  {
    id: '4',
    icon: <PieChart size={80} color={colors.light.success} />,
    title: 'Track Balances',
    description: 'See who owes who at a glance. Settle up with a tap and keep friendships balanced.',
    color: colors.light.successBg,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboarded } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleGetStarted();
  };

  const handleGetStarted = () => {
    setOnboarded();
    router.replace('/(auth)/login' as any);
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={[
          styles.slide,
          { 
            transform: [{ scale }],
            opacity 
          }
        ]}
      >
        <YStack alignItems="center" gap="$8" paddingHorizontal="$6">
          {/* Icon Container */}
          <Stack
            width={160}
            height={160}
            borderRadius={80}
            backgroundColor={item.color}
            justifyContent="center"
            alignItems="center"
          >
            {item.icon}
          </Stack>

          {/* Text Content */}
          <YStack alignItems="center" gap="$4">
            <Text 
              fontSize={28} 
              fontWeight="700" 
              color={colors.light.textPrimary}
              textAlign="center"
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
          </YStack>
        </YStack>
      </Animated.View>
    );
  };

  const renderDots = () => (
    <XStack gap="$2" justifyContent="center" marginVertical="$6">
      {slides.map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const dotOpacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity: dotOpacity,
                backgroundColor: colors.light.primary,
              },
            ]}
          />
        );
      })}
    </XStack>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <Screen>
      {/* Skip Button */}
      <XStack justifyContent="flex-end" paddingTop="$2">
        <Pressable onPress={handleSkip}>
          <Text fontSize={16} color={colors.light.textMuted} paddingVertical="$2">
            Skip
          </Text>
        </Pressable>
      </XStack>

      {/* Slides */}
      <Stack flex={1} justifyContent="center">
        <Animated.FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
        />

        {/* Dots */}
        {renderDots()}
      </Stack>

      {/* Bottom Actions */}
      <YStack gap="$3" paddingBottom="$4">
        {isLastSlide ? (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleGetStarted}
          >
            Get Started
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleNext}
            icon={<ArrowRight size={20} color="white" />}
          >
            Next
          </Button>
        )}

        {!isLastSlide && (
          <Pressable onPress={handleGetStarted}>
            <Text 
              fontSize={14} 
              color={colors.light.textSecondary} 
              textAlign="center"
              paddingVertical="$2"
            >
              Already have an account? Sign in
            </Text>
          </Pressable>
        )}
      </YStack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
