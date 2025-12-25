/**
 * Tab Bar Overlay Component
 * 
 * A standalone tab bar that can be overlaid on any screen to provide
 * consistent navigation while maintaining correct back behavior.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Animated } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Home, 
  Users, 
  Logs, 
  UserCircle,
  Plus,
  Receipt
} from 'lucide-react-native';
import { Stack, Text, YStack } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

import { useThemeColors } from '@/hooks/useThemeColors';

interface TabBarOverlayProps {
  /** Which tab should appear selected (optional, auto-detects if not provided) */
  activeTab?: 'home' | 'groups' | 'activity' | 'friends';
}

export function TabBarOverlay({ activeTab }: TabBarOverlayProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const bottomPadding = Math.max(insets.bottom, 8);
  
  const [fabOpen, setFabOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Determine active tab from route if not provided
  const resolvedActiveTab = activeTab || (() => {
    if (pathname.includes('/group')) return 'groups';
    if (pathname.includes('/activity')) return 'activity';
    if (pathname.includes('/friends')) return 'friends';
    return 'home';
  })();

  const openFabMenu = () => {
    setFabOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeFabMenu = (callback?: () => void) => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setFabOpen(false);
      callback?.();
    });
  };

  const handleTabPress = (tab: string) => {
    Haptics.selectionAsync();
    switch (tab) {
      case 'home':
        router.replace('/(tabs)');
        break;
      case 'groups':
        router.replace('/(tabs)/groups');
        break;
      case 'activity':
        router.replace('/(tabs)/activity');
        break;
      case 'friends':
        router.replace('/(tabs)/friends');
        break;
    }
  };

  const handleNewExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeFabMenu(() => router.push('/bill/create' as any));
  };

  const handleCreateGroup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeFabMenu(() => router.push('/group/create' as any));
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const menuScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const menuOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const tabs = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'groups', label: 'Groups', Icon: Users },
    { id: 'fab', label: '', Icon: Plus }, // Placeholder for FAB
    { id: 'activity', label: 'Activity', Icon: Logs },
    { id: 'friends', label: 'Friends', Icon: UserCircle },
  ];

  const fabBottomPosition = 28 + bottomPadding;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* FAB Menu Backdrop */}
      {fabOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="auto">
          <Pressable style={StyleSheet.absoluteFill} onPress={() => closeFabMenu()} />
          <Animated.View 
            style={[
              styles.blurLayer,
              { opacity: backdropOpacity }
            ]}
            pointerEvents="none"
          >
            <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
      )}

      {/* FAB Menu */}
      <Animated.View 
        style={[
          styles.menuContainer,
          { 
            bottom: fabBottomPosition + 60,
            transform: [{ scale: menuScale }],
            opacity: menuOpacity,
            backgroundColor: themeColors.surface,
            borderRadius: 24,
            overflow: 'hidden',
            shadowColor: "black",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }
        ]}
        pointerEvents={fabOpen ? 'auto' : 'none'}
      >
        {/* Create Group Option */}
        <Pressable 
          onPress={handleCreateGroup} 
          style={({pressed}) => [
            styles.menuItem, 
            { backgroundColor: pressed ? themeColors.surfaceElevated : 'transparent' }
          ]}
        >
          <Stack
            flexDirection="row"
            alignItems="center"
            gap="$3"
            paddingHorizontal="$4"
            paddingVertical="$3"
            borderBottomWidth={1}
            borderColor={themeColors.border}
          >
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={themeColors.tertiaryLight || themeColors.tertiary}
              justifyContent="center"
              alignItems="center"
            >
              <Users size={20} color={themeColors.tertiary || themeColors.primary} />
            </Stack>
            <YStack>
              <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
                Create Group
              </Text>
              <Text fontSize={12} color={themeColors.textSecondary}>
                Start a new expense group
              </Text>
            </YStack>
          </Stack>
        </Pressable>

        {/* New Expense Option */}
        <Pressable 
          onPress={handleNewExpense} 
          style={({pressed}) => [
            styles.menuItem, 
            { backgroundColor: pressed ? themeColors.surfaceElevated : 'transparent' }
          ]}
        >
          <Stack
            flexDirection="row"
            alignItems="center"
            gap="$3"
            paddingHorizontal="$4"
            paddingVertical="$3"
          >
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={themeColors.primaryLight}
              justifyContent="center"
              alignItems="center"
            >
              <Receipt size={20} color={themeColors.primary} />
            </Stack>
            <YStack>
              <Text fontSize={16} fontWeight="600" color={themeColors.textPrimary}>
                New Expense
              </Text>
              <Text fontSize={12} color={themeColors.textSecondary}>
                Smart bill creation
              </Text>
            </YStack>
          </Stack>
        </Pressable>
      </Animated.View>

      {/* Tab Bar - rendered first so FAB appears on top */}
      <View 
        style={[
          styles.tabBar, 
          { 
            backgroundColor: themeColors.surface,
            borderTopColor: themeColors.border,
            height: 56 + bottomPadding,
            paddingBottom: bottomPadding,
          }
        ]}
      >
        {tabs.map((tab) => {
          if (tab.id === 'fab') {
            // Spacer for FAB
            return <View key={tab.id} style={{ width: 56, height: 56 }} />;
          }
          
          const isActive = resolvedActiveTab === tab.id;
          const Icon = tab.Icon;
          
          return (
            <Pressable 
              key={tab.id} 
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.id)}
            >
              <Icon 
                size={24} 
                color={isActive ? themeColors.primary : themeColors.textMuted} 
              />
              <Text 
                style={[
                  styles.tabLabel, 
                  { color: isActive ? themeColors.primary : themeColors.textMuted }
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* FAB Button - rendered last to appear on top */}
      <View 
        style={{
          position: 'absolute',
          bottom: fabBottomPosition,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 10,
        }}
        pointerEvents="box-none"
      >
        <Pressable 
          onPress={fabOpen ? () => closeFabMenu() : openFabMenu}
          style={[styles.fab, { backgroundColor: themeColors.primary, shadowColor: themeColors.primary }]}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Plus size={28} color="white" />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  blurLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '39%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  menuContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  menuItem: {
    width: '100%',
  },
});
