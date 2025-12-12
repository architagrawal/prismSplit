/**
 * PrismSplit Tab Layout
 * 
 * 5-tab navigation: Home, Groups, FAB, Friends, Account
 * Center FAB with expandable menu
 */

import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Animated, Modal } from 'react-native';
import { Stack, Text, YStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Home, 
  Users, 
  Activity, 
  User,
  UserCircle,
  Plus,
  X,
  Zap,
  FileText
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { colors } from '@/theme/tokens';

interface TabIconProps {
  Icon: React.ComponentType<{ size: number; color: string }>;
  focused: boolean;
}

function TabIcon({ Icon, focused }: TabIconProps) {
  return (
    <Icon 
      size={24} 
      color={focused ? colors.light.primary : colors.light.textMuted} 
    />
  );
}

// Center FAB with menu
function CenterFAB() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  
  const toggleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isOpen) {
      Animated.spring(animation, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }).start(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      Animated.spring(animation, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleQuickBill = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleMenu();
    router.push('/bill/quick' as any);
  };

  const handleDetailedBill = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleMenu();
    router.push('/bill/create' as any);
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const menuScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <>
      {/* FAB Button */}
      <Pressable 
        onPress={toggleMenu}
        style={styles.fab}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          {isOpen ? (
            <X size={28} color="white" />
          ) : (
            <Plus size={28} color="white" />
          )}
        </Animated.View>
      </Pressable>

      {/* Menu Overlay */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={toggleMenu}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={toggleMenu}>
          <Animated.View 
            style={[
              styles.backdropInner,
              { opacity: backdropOpacity }
            ]} 
          />
        </Pressable>

        {/* Menu Items */}
        <Animated.View 
          style={[
            styles.menuContainer,
            { 
              transform: [{ scale: menuScale }],
              opacity: animation
            }
          ]}
        >
          {/* Quick Bill Option */}
          <Pressable onPress={handleQuickBill} style={styles.menuItem}>
            <Stack
              flexDirection="row"
              alignItems="center"
              gap="$3"
              backgroundColor={colors.light.surface}
              paddingHorizontal="$4"
              paddingVertical="$3"
              borderRadius={16}
              shadowColor="black"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={8}
            >
              <Stack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={colors.light.accent}
                justifyContent="center"
                alignItems="center"
              >
                <Zap size={20} color={colors.light.primary} />
              </Stack>
              <YStack>
                <Text fontSize={16} fontWeight="600" color={colors.light.textPrimary}>
                  Quick Bill
                </Text>
                <Text fontSize={12} color={colors.light.textSecondary}>
                  Simple expense, no items
                </Text>
              </YStack>
            </Stack>
          </Pressable>

          {/* Detailed Bill Option */}
          <Pressable onPress={handleDetailedBill} style={styles.menuItem}>
            <Stack
              flexDirection="row"
              alignItems="center"
              gap="$3"
              backgroundColor={colors.light.surface}
              paddingHorizontal="$4"
              paddingVertical="$3"
              borderRadius={16}
              shadowColor="black"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={8}
            >
              <Stack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={colors.light.primaryLight}
                justifyContent="center"
                alignItems="center"
              >
                <FileText size={20} color={colors.light.primary} />
              </Stack>
              <YStack>
                <Text fontSize={16} fontWeight="600" color={colors.light.textPrimary}>
                  Detailed Bill
                </Text>
                <Text fontSize={12} color={colors.light.textSecondary}>
                  Itemized with Speed Parser
                </Text>
              </YStack>
            </Stack>
          </Pressable>
        </Animated.View>
      </Modal>
    </>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.light.primary,
        tabBarInactiveTintColor: colors.light.textMuted,
        tabBarStyle: {
          backgroundColor: colors.light.surface,
          borderTopWidth: 1,
          borderTopColor: colors.light.border,
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
      
      {/* Center FAB placeholder - we use a blank tab and overlay FAB */}
      <Tabs.Screen
        name="fab"
        options={{
          title: '',
          tabBarButton: () => <CenterFAB />,
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
          tabBarIcon: ({ focused }) => <TabIcon Icon={Activity} focused={focused} />,
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
          href: null, // Hide from tab bar, access via Friends or other screens
        }}
      />
      
      {/* Hide the old two.tsx */}
      <Tabs.Screen
        name="two"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      
      {/* Hidden nested routes - these show with tab bar but aren't tab options */}
      <Tabs.Screen
        name="group/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="settle/[userId]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    height: 80,
    paddingTop: 8,
    paddingBottom: 24,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
    shadowColor: colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropInner: {
    flex: 1,
    backgroundColor: 'black',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    right: 24,
    alignItems: 'center',
    gap: 12,
  },
  menuItem: {
    width: '100%',
  },
});
