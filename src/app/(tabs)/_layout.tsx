/**
 * PrismSplit Tab Layout
 * 
 * 5-tab navigation: Home, Groups, FAB, Friends, Account
 * Center FAB with expandable menu
 */

import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Animated, View } from 'react-native';
import { Stack, Text, YStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Home, 
  Users, 
  Logs, 
  User,
  UserCircle,
  Plus,
  Receipt
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

import { useThemeColors } from '@/hooks/useThemeColors';

interface TabIconProps {
  Icon: React.ComponentType<{ size: number; color: string }>;
  focused: boolean;
}

function TabIcon({ Icon, focused }: TabIconProps) {
  const themeColors = useThemeColors();
  return (
    <Icon 
      size={24} 
      color={focused ? themeColors.primary : themeColors.textMuted} 
    />
  );
}

// Global Overlay Component for FAB and Menu
function FabOverlay() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const bottomPadding = Math.max(insets.bottom, 8);
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  
  const openMenu = () => {
    setIsOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  const closeMenu = (callback?: () => void) => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
      callback?.();
    });
  };

  const handleNewExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeMenu(() => router.push('/bill/create' as any));
  };

  const handleCreateGroup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeMenu(() => router.push('/group/create' as any));
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

  // Calculate FAB position to match tab bar hole
  // Tab bar height = 56 + bottomPadding
  // FAB sits on top, offset by -28 (half height)
  const fabBottomPosition = 28 + bottomPadding;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* 1. Backdrop Layer (only active when open) */}
      {isOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="auto">
           {/* Transparent Closer */}
           <Pressable style={StyleSheet.absoluteFill} onPress={() => closeMenu()} />
           
           {/* Localized Blur Backdrop */}
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

      {/* 2. Menu Items Layer */}
      <Animated.View 
        style={[
          styles.menuContainer,
          { 
            bottom: fabBottomPosition + 60, // Position above FAB
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
        pointerEvents={isOpen ? 'auto' : 'none'}
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

        {/* New Expense Option (Unified) */}
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

      {/* 3. FAB Button Layer (Top) */}
      <View 
        style={{
          position: 'absolute',
          bottom: fabBottomPosition,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
        pointerEvents="box-none"
      >
        <Pressable 
          onPress={isOpen ? () => closeMenu() : openMenu}
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

// Placeholder for the Tab Bar to reserve space
function TabPlaceholder() {
  return <View style={{ width: 56, height: 56 }} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const bottomPadding = Math.max(insets.bottom, 8);
  
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: themeColors.primary,
          tabBarInactiveTintColor: themeColors.textMuted,
          tabBarStyle: {
            backgroundColor: themeColors.surface,
            borderTopWidth: 1,
            borderTopColor: themeColors.border,
            height: 56 + bottomPadding,
            paddingTop: 8,
            paddingBottom: bottomPadding,
          },
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon Icon={Home} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="groups"
          options={{
            title: 'Groups',
            tabBarIcon: ({ focused }) => <TabIcon Icon={Users} focused={focused} />,
          }}
        />
        
        {/* Placeholder Tab */}
        <Tabs.Screen
          name="fab"
          options={{
            title: '',
            tabBarButton: () => <TabPlaceholder />,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
            },
          }}
        />
        
        <Tabs.Screen
          name="activity"
          options={{
            title: 'Activity',
            tabBarIcon: ({ focused }) => <TabIcon Icon={Logs} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            title: 'Friends',
            tabBarIcon: ({ focused }) => <TabIcon Icon={UserCircle} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Account',
            tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} />,
            href: null, // Hide from tab bar
          }}
        />
        
        <Tabs.Screen
          name="two"
          options={{
            href: null, // Hide from tab bar
          }}
        />
      </Tabs>

      {/* Global FAB Overlay */}
      <FabOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
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
    height: '39%', // Maintained same coverage
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
